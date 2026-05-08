import { create } from 'zustand';
import type { DragPayload, PersistedState, RadialMenu, SocketItem } from './types';
import { PLASTICITY_COMMANDS } from './data/plasticityCommands';
import { iconFromCommand } from './lib/icon';
import { coerceImportedMenu, isValidMenuJSON, slugify, uid } from './lib/json';
import { loadPersisted, schedulePersist } from './lib/persistence';

const SEED_COMMAND_IDS = [
  'command:fillet',
  'command:extrude',
  'command:boolean',
  'command:mirror',
  'command:move',
  'command:cylinder',
  'command:bridge',
  'command:lock-selected',
];

function buildSeedItem(commandId: string): SocketItem {
  const def = PLASTICITY_COMMANDS.find((c) => c.id === commandId);
  return {
    command: commandId,
    icon: iconFromCommand(commandId),
    label: def?.label ?? commandId,
  };
}

function buildSeed(): PersistedState {
  const items = SEED_COMMAND_IDS.map(buildSeedItem);
  const seedMenu: RadialMenu = {
    id: uid(),
    name: 'My Menu',
    command: 'your-name:my-menu',
    items,
  };
  return { menus: [seedMenu], activeMenuId: seedMenu.id, slotCount: items.length };
}

function makeEmptyMenu(name: string, slotCount: number): RadialMenu {
  return {
    id: uid(),
    name,
    command: `your-name:${slugify(name)}`,
    items: Array(slotCount).fill(null),
  };
}

function resizeItems(items: (SocketItem | null)[], n: number): (SocketItem | null)[] {
  if (items.length === n) return items;
  if (items.length < n) return [...items, ...Array(n - items.length).fill(null)];
  return items.slice(0, n);
}

interface Snapshot {
  menus: RadialMenu[];
  activeMenuId: string;
  slotCount: number;
  breadcrumb: string[];
}

interface HistoryEntry {
  snap: Snapshot;
  opKey?: string;
  at: number;
}

const HISTORY_LIMIT = 100;
const COALESCE_MS = 500;

export type ActiveMenuSource = 'direct' | 'wedge' | 'breadcrumb';

interface RadialState {
  menus: RadialMenu[];
  activeMenuId: string;
  slotCount: number;
  selectedSocket: number | null;
  searchQuery: string;
  drag: DragPayload | null;
  breadcrumb: string[];

  undoStack: HistoryEntry[];
  redoStack: HistoryEntry[];

  setActiveMenu: (id: string, opts?: { source?: ActiveMenuSource }) => void;
  newMenu: (name?: string) => void;
  newMenuFromTemplate: (template: { name: string; command: string; items: (SocketItem | null)[] }) => void;
  duplicateMenu: (id: string) => void;
  deleteMenu: (id: string) => void;
  renameMenu: (id: string, name: string) => void;
  setMenuCommand: (id: string, command: string) => { ok: boolean; error?: string };

  setSlotCount: (n: number) => void;

  // Active-menu convenience wrappers (existing API)
  setSocket: (index: number, item: SocketItem | null) => void;
  swapSockets: (a: number, b: number) => void;
  updateSocket: (index: number, patch: Partial<SocketItem>) => void;

  // Per-menu variants (used when editing a non-active wheel, e.g. parent context wheel)
  setSocketIn: (menuId: string, index: number, item: SocketItem | null) => void;
  swapSocketsIn: (menuId: string, a: number, b: number) => void;
  updateSocketIn: (menuId: string, index: number, patch: Partial<SocketItem>) => void;

  // Atomic "drag the Submenu tile onto a wedge" action
  createSubmenuFromWedge: (parentMenuId: string, wedgeIndex: number) => { newMenuId: string };

  selectSocket: (index: number | null) => void;
  setSearch: (q: string) => void;
  setDrag: (d: DragPayload | null) => void;

  undo: () => void;
  redo: () => void;

  importMenuJSON: (raw: unknown) => { ok: boolean; error?: string };
}

const initial: PersistedState = loadPersisted() ?? buildSeed();

if (!initial.menus.find((m) => m.id === initial.activeMenuId)) {
  if (initial.menus.length > 0) {
    initial.activeMenuId = initial.menus[0].id;
    initial.slotCount = initial.menus[0].items.length;
  } else {
    const seed = buildSeed();
    initial.menus = seed.menus;
    initial.activeMenuId = seed.activeMenuId;
    initial.slotCount = seed.slotCount;
  }
}

function snapOf(s: {
  menus: RadialMenu[];
  activeMenuId: string;
  slotCount: number;
  breadcrumb: string[];
}): Snapshot {
  return {
    menus: s.menus,
    activeMenuId: s.activeMenuId,
    slotCount: s.slotCount,
    breadcrumb: s.breadcrumb,
  };
}

// Walk inbound `view:radial:` references back to a root, picking the first
// parent at each step. Cycle-safe via a visited set. Returns ancestors
// ordered root → immediate parent.
function computeAncestorChain(targetId: string, menus: RadialMenu[]): string[] {
  const target = menus.find((m) => m.id === targetId);
  if (!target) return [];
  const chain: string[] = [];
  const visited = new Set<string>([targetId]);
  let current: RadialMenu = target;
  while (true) {
    const ref = `view:radial:${current.command}`;
    const parent = menus.find(
      (m) =>
        !visited.has(m.id) &&
        m.items.some((it) => it !== null && it.command === ref),
    );
    if (!parent) break;
    chain.unshift(parent.id);
    visited.add(parent.id);
    current = parent;
  }
  return chain;
}

function pushSnap(stack: HistoryEntry[], snap: Snapshot, opKey?: string): HistoryEntry[] {
  const now = Date.now();
  const last = stack[stack.length - 1];
  if (opKey && last && last.opKey === opKey && now - last.at < COALESCE_MS) {
    const next = stack.slice();
    next[next.length - 1] = { ...last, at: now };
    return next;
  }
  const next = stack.concat({ snap, opKey, at: now });
  if (next.length > HISTORY_LIMIT) next.shift();
  return next;
}

export const useStore = create<RadialState>((set, get) => ({
  menus: initial.menus,
  activeMenuId: initial.activeMenuId,
  slotCount: initial.slotCount,
  selectedSocket: null,
  searchQuery: '',
  drag: null,
  breadcrumb: [],

  undoStack: [],
  redoStack: [],

  setActiveMenu: (id, opts) =>
    set((s) => {
      const target = s.menus.find((m) => m.id === id);
      if (!target) return s;
      const source = opts?.source ?? 'direct';
      let breadcrumb = s.breadcrumb;
      if (source === 'direct') {
        // Auto-discover the ancestor chain so the user sees the hierarchy
        breadcrumb = computeAncestorChain(id, s.menus);
      } else if (source === 'wedge') {
        // Push current active onto the trail, switch to new
        if (s.activeMenuId !== id) breadcrumb = s.breadcrumb.concat(s.activeMenuId);
      } else if (source === 'breadcrumb') {
        // Pop until target id is at the top of breadcrumb (or trail is empty)
        const idx = s.breadcrumb.lastIndexOf(id);
        breadcrumb = idx >= 0 ? s.breadcrumb.slice(0, idx) : s.breadcrumb;
      }
      return {
        activeMenuId: id,
        slotCount: target.items.length,
        selectedSocket: null,
        breadcrumb,
      };
    }),

  newMenu: (name) =>
    set((s) => {
      const next = name ?? `Menu ${s.menus.length + 1}`;
      const m = makeEmptyMenu(next, 8);
      return {
        menus: [...s.menus, m],
        activeMenuId: m.id,
        slotCount: m.items.length,
        selectedSocket: null,
        breadcrumb: [],
        undoStack: pushSnap(s.undoStack, snapOf(s)),
        redoStack: [],
      };
    }),

  newMenuFromTemplate: (template) =>
    set((s) => {
      let unique = template.command;
      let n = 1;
      while (s.menus.some((m) => m.command === unique)) {
        n += 1;
        unique = `${template.command}-${n}`;
      }
      const m: RadialMenu = {
        id: uid(),
        name: template.name,
        command: unique,
        items: template.items.map((i) => (i ? { ...i } : null)),
      };
      return {
        menus: [...s.menus, m],
        activeMenuId: m.id,
        slotCount: m.items.length,
        selectedSocket: null,
        breadcrumb: [],
        undoStack: pushSnap(s.undoStack, snapOf(s)),
        redoStack: [],
      };
    }),

  duplicateMenu: (id) =>
    set((s) => {
      const src = s.menus.find((m) => m.id === id);
      if (!src) return s;
      const dup: RadialMenu = {
        id: uid(),
        name: `${src.name} Copy`,
        command: `${src.command}-copy`,
        items: src.items.map((i) => (i ? { ...i } : null)),
      };
      return {
        menus: [...s.menus, dup],
        activeMenuId: dup.id,
        slotCount: dup.items.length,
        selectedSocket: null,
        breadcrumb: [],
        undoStack: pushSnap(s.undoStack, snapOf(s)),
        redoStack: [],
      };
    }),

  deleteMenu: (id) =>
    set((s) => {
      const target = s.menus.find((m) => m.id === id);
      const undoStack = pushSnap(s.undoStack, snapOf(s));
      // Sweep dead links: any wedge in any other menu pointing to the deleted menu's command
      const linkRef = target ? `view:radial:${target.command}` : null;
      const sweptMenus = s.menus
        .filter((m) => m.id !== id)
        .map((m) => {
          if (!linkRef) return m;
          let changed = false;
          const items = m.items.map((it) => {
            if (it && it.command === linkRef) {
              changed = true;
              return null;
            }
            return it;
          });
          return changed ? { ...m, items } : m;
        });
      if (sweptMenus.length === 0) {
        const seed = buildSeed();
        return {
          menus: seed.menus,
          activeMenuId: seed.activeMenuId,
          slotCount: seed.slotCount,
          selectedSocket: null,
          breadcrumb: [],
          undoStack,
          redoStack: [],
        };
      }
      const nextActive = s.activeMenuId === id ? sweptMenus[0].id : s.activeMenuId;
      const nextActiveMenu = sweptMenus.find((m) => m.id === nextActive)!;
      // Clean breadcrumb: drop the deleted ID, and never let breadcrumb contain the active id
      const cleanedBreadcrumb = s.breadcrumb.filter(
        (bid) => bid !== id && bid !== nextActive,
      );
      return {
        menus: sweptMenus,
        activeMenuId: nextActive,
        slotCount: nextActiveMenu.items.length,
        selectedSocket: null,
        breadcrumb: cleanedBreadcrumb,
        undoStack,
        redoStack: [],
      };
    }),

  renameMenu: (id, name) =>
    set((s) => ({
      menus: s.menus.map((m) => (m.id === id ? { ...m, name } : m)),
      undoStack: pushSnap(s.undoStack, snapOf(s), `rename:${id}`),
      redoStack: [],
    })),

  setMenuCommand: (id, command) => {
    const trimmed = command.trim();
    if (!trimmed) return { ok: false, error: 'Command ID cannot be empty' };
    if (/\s/.test(trimmed)) return { ok: false, error: 'Command ID cannot contain whitespace' };
    const state = get();
    const collision = state.menus.find((m) => m.id !== id && m.command === trimmed);
    if (collision) return { ok: false, error: `Command ID already used by "${collision.name}"` };
    set((s) => ({
      menus: s.menus.map((m) => (m.id === id ? { ...m, command: trimmed } : m)),
      undoStack: pushSnap(s.undoStack, snapOf(s), `cmd:${id}`),
      redoStack: [],
    }));
    return { ok: true };
  },

  setSlotCount: (n) => {
    const clamped = Math.max(3, Math.min(12, Math.round(n)));
    set((s) => {
      if (clamped === s.slotCount) return s;
      const menus = s.menus.map((m) =>
        m.id === s.activeMenuId ? { ...m, items: resizeItems(m.items, clamped) } : m,
      );
      const sel = s.selectedSocket !== null && s.selectedSocket >= clamped ? null : s.selectedSocket;
      return {
        slotCount: clamped,
        menus,
        selectedSocket: sel,
        undoStack: pushSnap(s.undoStack, snapOf(s), `slot:${s.activeMenuId}`),
        redoStack: [],
      };
    });
  },

  setSocketIn: (menuId, index, item) =>
    set((s) => {
      const target = s.menus.find((m) => m.id === menuId);
      if (!target) return s;
      return {
        menus: s.menus.map((m) => {
          if (m.id !== menuId) return m;
          const items = m.items.slice();
          items[index] = item;
          return { ...m, items };
        }),
        undoStack: pushSnap(s.undoStack, snapOf(s)),
        redoStack: [],
      };
    }),

  swapSocketsIn: (menuId, a, b) =>
    set((s) => {
      const m = s.menus.find((mm) => mm.id === menuId);
      if (!m) return s;
      if (a < 0 || b < 0 || a >= m.items.length || b >= m.items.length || a === b) return s;
      return {
        menus: s.menus.map((mm) => {
          if (mm.id !== menuId) return mm;
          const items = mm.items.slice();
          const tmp = items[a];
          items[a] = items[b];
          items[b] = tmp;
          return { ...mm, items };
        }),
        undoStack: pushSnap(s.undoStack, snapOf(s)),
        redoStack: [],
      };
    }),

  updateSocketIn: (menuId, index, patch) =>
    set((s) => {
      const m = s.menus.find((mm) => mm.id === menuId);
      if (!m) return s;
      const cur = m.items[index];
      if (!cur) return s;
      return {
        menus: s.menus.map((mm) => {
          if (mm.id !== menuId) return mm;
          const items = mm.items.slice();
          items[index] = { ...cur, ...patch };
          return { ...mm, items };
        }),
        undoStack: pushSnap(s.undoStack, snapOf(s), `update:${menuId}:${index}`),
        redoStack: [],
      };
    }),

  setSocket: (index, item) => get().setSocketIn(get().activeMenuId, index, item),
  swapSockets: (a, b) => get().swapSocketsIn(get().activeMenuId, a, b),
  updateSocket: (index, patch) => get().updateSocketIn(get().activeMenuId, index, patch),

  createSubmenuFromWedge: (parentMenuId, wedgeIndex) => {
    const state = get();
    let n = state.menus.filter((m) => m.name === 'Submenu' || /^Submenu \d+$/.test(m.name)).length;
    let name = n === 0 ? 'Submenu' : `Submenu ${n}`;
    while (state.menus.some((m) => m.name === name)) {
      n += 1;
      name = `Submenu ${n}`;
    }
    let cmd = `your-name:${slugify(name)}`;
    let bump = 1;
    while (state.menus.some((m) => m.command === cmd)) {
      bump += 1;
      cmd = `your-name:${slugify(name)}-${bump}`;
    }
    const newMenu: RadialMenu = {
      id: uid(),
      name,
      command: cmd,
      items: Array(8).fill(null),
    };
    const linkItem: SocketItem = {
      command: `view:radial:${cmd}`,
      icon: 'submenu',
      label: name,
    };
    set((s) => {
      const parent = s.menus.find((m) => m.id === parentMenuId);
      if (!parent) return s;
      const updatedParent: RadialMenu = {
        ...parent,
        items: parent.items.map((it, i) => (i === wedgeIndex ? linkItem : it)),
      };
      const menus = s.menus
        .map((m) => (m.id === parentMenuId ? updatedParent : m))
        .concat(newMenu);

      // Breadcrumb = ancestors of new active. Three cases:
      //  1. Nesting under the current active — extend the trail by appending it.
      //  2. Nesting under a menu already on the trail — truncate to (and include) that menu.
      //  3. Nesting under an unrelated menu — start fresh at that menu.
      let nextBreadcrumb: string[];
      if (parentMenuId === s.activeMenuId) {
        nextBreadcrumb = s.breadcrumb.concat(parentMenuId);
      } else {
        const idx = s.breadcrumb.indexOf(parentMenuId);
        nextBreadcrumb = idx >= 0 ? s.breadcrumb.slice(0, idx + 1) : [parentMenuId];
      }

      return {
        menus,
        activeMenuId: newMenu.id,
        slotCount: newMenu.items.length,
        selectedSocket: null,
        breadcrumb: nextBreadcrumb,
        undoStack: pushSnap(s.undoStack, snapOf(s)),
        redoStack: [],
      };
    });
    return { newMenuId: newMenu.id };
  },

  selectSocket: (index) => set({ selectedSocket: index }),
  setSearch: (q) => set({ searchQuery: q }),
  setDrag: (d) => set({ drag: d }),

  undo: () =>
    set((s) => {
      if (s.undoStack.length === 0) return s;
      const next = s.undoStack.slice();
      const entry = next.pop()!;
      const r = entry.snap;
      const nextActiveMenu = r.menus.find((m) => m.id === r.activeMenuId);
      const sel =
        s.selectedSocket !== null &&
        nextActiveMenu &&
        s.selectedSocket < nextActiveMenu.items.length
          ? s.selectedSocket
          : null;
      return {
        menus: r.menus,
        activeMenuId: r.activeMenuId,
        slotCount: r.slotCount,
        breadcrumb: r.breadcrumb,
        selectedSocket: sel,
        undoStack: next,
        redoStack: s.redoStack.concat({ snap: snapOf(s), at: Date.now() }),
      };
    }),

  redo: () =>
    set((s) => {
      if (s.redoStack.length === 0) return s;
      const next = s.redoStack.slice();
      const entry = next.pop()!;
      const r = entry.snap;
      const nextActiveMenu = r.menus.find((m) => m.id === r.activeMenuId);
      const sel =
        s.selectedSocket !== null &&
        nextActiveMenu &&
        s.selectedSocket < nextActiveMenu.items.length
          ? s.selectedSocket
          : null;
      return {
        menus: r.menus,
        activeMenuId: r.activeMenuId,
        slotCount: r.slotCount,
        breadcrumb: r.breadcrumb,
        selectedSocket: sel,
        redoStack: next,
        undoStack: s.undoStack.concat({ snap: snapOf(s), at: Date.now() }),
      };
    }),

  importMenuJSON: (raw) => {
    if (!isValidMenuJSON(raw)) {
      return { ok: false, error: 'Not a valid Plasticity radial menu JSON' };
    }
    const menu = coerceImportedMenu(raw);
    set((s) => {
      let unique = menu.command;
      let n = 1;
      while (s.menus.some((m) => m.command === unique)) {
        n += 1;
        unique = `${menu.command}-${n}`;
      }
      menu.command = unique;
      return {
        menus: [...s.menus, menu],
        activeMenuId: menu.id,
        slotCount: menu.items.length,
        selectedSocket: null,
        breadcrumb: [],
        undoStack: pushSnap(s.undoStack, snapOf(s)),
        redoStack: [],
      };
    });
    return { ok: true };
  },
}));

useStore.subscribe((state) => {
  schedulePersist({
    menus: state.menus,
    activeMenuId: state.activeMenuId,
    slotCount: state.slotCount,
  });
});

export const selectActiveMenu = (s: RadialState): RadialMenu | undefined =>
  s.menus.find((m) => m.id === s.activeMenuId);
