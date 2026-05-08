import type { RadialMenu } from '../types';

const SUBMENU_PREFIX = 'view:radial:';

/**
 * Walk inbound `view:radial:` refs to find the topmost ancestor of a menu.
 * Cycle-safe; for shared submenus, picks the first parent found.
 * Returns the menu id itself if it has no parents.
 */
export function projectRootIdFor(menuId: string, menus: RadialMenu[]): string {
  const visited = new Set<string>([menuId]);
  const start = menus.find((m) => m.id === menuId);
  if (!start) return menuId;
  let current: RadialMenu = start;
  while (true) {
    const ref = `${SUBMENU_PREFIX}${current.command}`;
    const parent: RadialMenu | undefined = menus.find(
      (m) => !visited.has(m.id) && m.items.some((it) => it !== null && it.command === ref),
    );
    if (!parent) return current.id;
    visited.add(parent.id);
    current = parent;
  }
}

/**
 * Returns the set of project root menus (top-level menus with no inbound refs)
 * in the order they appear in the menus array. The active project's root
 * is included even if it would otherwise be merged with another root.
 */
export function projectRoots(menus: RadialMenu[]): RadialMenu[] {
  const seen = new Set<string>();
  const roots: RadialMenu[] = [];
  for (const m of menus) {
    const rootId = projectRootIdFor(m.id, menus);
    if (seen.has(rootId)) continue;
    const root = menus.find((mm) => mm.id === rootId);
    if (!root) continue;
    seen.add(rootId);
    roots.push(root);
  }
  return roots;
}

interface DescendantNode {
  menu: RadialMenu;
  depth: number;
  parentId?: string;
}

/**
 * Walk outbound `view:radial:` refs from a root menu and return its full
 * descendant tree as a depth-first ordered list. Cycle-safe: a menu visited
 * earlier in the walk is not re-emitted.
 */
export function projectMenus(rootId: string, menus: RadialMenu[]): DescendantNode[] {
  const out: DescendantNode[] = [];
  const visited = new Set<string>();

  function walk(menuId: string, depth: number, parentId?: string) {
    if (visited.has(menuId)) return;
    visited.add(menuId);
    const m = menus.find((mm) => mm.id === menuId);
    if (!m) return;
    out.push({ menu: m, depth, parentId });
    for (const it of m.items) {
      if (!it) continue;
      if (!it.command.startsWith(SUBMENU_PREFIX)) continue;
      const targetCmd = it.command.slice(SUBMENU_PREFIX.length);
      const target = menus.find((mm) => mm.command === targetCmd);
      if (target) walk(target.id, depth + 1, menuId);
    }
  }
  walk(rootId, 0);
  return out;
}
