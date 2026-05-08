import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { selectActiveMenu, useStore } from '../store';
import { toast } from '../lib/toast';
import type { RadialMenu } from '../types';
import WheelView from './WheelView';
import Breadcrumb from './Breadcrumb';

const ACTIVE_MIN = 320;
const ACTIVE_MAX = 820;
const CHAIN_ACTIVE_MIN = 240;
const CHAIN_ACTIVE_MAX = 720;
const HORIZ_PADDING = 64;
const VERT_PADDING_SINGLE = 90;
const VERT_PADDING_CHAIN = 110;
const CHAIN_GAP = 24;
const ANCESTOR_RATIO = 0.6;
const MAX_VISIBLE_ANCESTORS = 3;

function findLinkingIndex(parent: RadialMenu, child: RadialMenu): number | undefined {
  const target = `view:radial:${child.command}`;
  const idx = parent.items.findIndex((it) => it && it.command === target);
  return idx >= 0 ? idx : undefined;
}

export default function Stage() {
  const activeMenu = useStore(selectActiveMenu);
  const slotCount = useStore((s) => s.slotCount);
  const setSlotCount = useStore((s) => s.setSlotCount);
  const renameMenu = useStore((s) => s.renameMenu);
  const setMenuCommand = useStore((s) => s.setMenuCommand);
  const selectedSocket = useStore((s) => s.selectedSocket);
  const setSocket = useStore((s) => s.setSocket);
  const breadcrumb = useStore((s) => s.breadcrumb);
  const menus = useStore((s) => s.menus);
  const setActiveMenu = useStore((s) => s.setActiveMenu);

  const [editingName, setEditingName] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const [stageRect, setStageRect] = useState({ w: 1200, h: 800 });

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const e = entries[0];
      setStageRect({ w: e.contentRect.width, h: e.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Resolve all ancestors (root → immediate parent), then trim to most-recent visible.
  const ancestors = useMemo(() => {
    return breadcrumb
      .map((id) => menus.find((m) => m.id === id))
      .filter(Boolean) as RadialMenu[];
  }, [breadcrumb, menus]);

  const visibleAncestors = useMemo(
    () => ancestors.slice(-MAX_VISIBLE_ANCESTORS),
    [ancestors],
  );
  const hiddenAncestorCount = ancestors.length - visibleAncestors.length;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      if (selectedSocket === null) return;
      const t = e.target as HTMLElement | null;
      if (t) {
        const tag = t.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable) return;
      }
      const item = activeMenu?.items[selectedSocket];
      if (!item) return;
      e.preventDefault();
      setSocket(selectedSocket, null);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedSocket, activeMenu, setSocket]);

  const showChain = visibleAncestors.length > 0;

  const wheelSizes = useMemo(() => {
    const usableW = Math.max(0, stageRect.w - HORIZ_PADDING);
    const usableH = Math.max(
      0,
      stageRect.h - (showChain ? VERT_PADDING_CHAIN : VERT_PADDING_SINGLE),
    );
    if (!showChain) {
      const single = Math.max(
        ACTIVE_MIN,
        Math.min(ACTIVE_MAX, Math.floor(Math.min(usableW, usableH) * 0.95)),
      );
      return { active: single, ancestors: [] as number[] };
    }
    const N = visibleAncestors.length + 1;
    let totalScale = 0;
    for (let i = 0; i < N; i++) totalScale += Math.pow(ANCESTOR_RATIO, N - 1 - i);
    const widthLimited = (usableW - (N - 1) * CHAIN_GAP) / totalScale;
    const heightLimited = usableH;
    const active = Math.max(
      CHAIN_ACTIVE_MIN,
      Math.min(CHAIN_ACTIVE_MAX, Math.floor(Math.min(widthLimited, heightLimited))),
    );
    const ancestorSizes = visibleAncestors.map((_, i) => {
      // i = 0 (oldest visible) … visibleAncestors.length - 1 (immediate parent)
      const depth = visibleAncestors.length - i; // 1 = immediate parent, larger = older
      return Math.max(80, Math.floor(active * Math.pow(ANCESTOR_RATIO, depth)));
    });
    return { active, ancestors: ancestorSizes };
  }, [stageRect.w, stageRect.h, showChain, visibleAncestors]);

  if (!activeMenu) return null;

  const filled = activeMenu.items.filter((i) => i !== null && i.command).length;

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    setSlotCount(slotCount + delta);
  }

  function handleEditId() {
    if (!activeMenu) return;
    const next = window.prompt('Menu command ID (namespace:slug)', activeMenu.command);
    if (next === null) return;
    const result = setMenuCommand(activeMenu.id, next);
    if (!result.ok) {
      toast('error', result.error || 'Invalid ID');
    }
  }

  return (
    <main className="flex-1 relative overflow-hidden flex flex-col min-w-0">
      <div className="h-11 shrink-0 flex items-center px-4 border-b border-line bg-bg gap-3">
        <input
          type="text"
          value={activeMenu.name}
          onChange={(e) => renameMenu(activeMenu.id, e.target.value)}
          onFocus={() => setEditingName(true)}
          onBlur={() => setEditingName(false)}
          className={`bg-transparent text-[14px] text-ink outline-none px-2 py-1 rounded border ${
            editingName ? 'border-accent' : 'border-transparent hover:border-line'
          } min-w-0 flex-1 max-w-[280px]`}
        />
        <button
          type="button"
          onClick={handleEditId}
          className="text-[11px] px-2 py-1 rounded text-ink-2 hover:text-ink hover:bg-bg-3 border border-transparent hover:border-line"
          title={activeMenu.command}
        >
          Edit ID <span className="text-ink-3 font-mono ml-1">{activeMenu.command}</span>
        </button>
        <div className="ml-auto text-[11px] text-ink-3 font-mono">
          {filled}/{slotCount}
        </div>
      </div>
      <Breadcrumb />
      <div
        ref={stageRef}
        className="flex-1 relative flex items-center justify-center stage-bg overflow-hidden"
        onWheel={onWheel}
      >
        <div
          className="flex items-center justify-center w-full h-full px-8"
          style={{ gap: showChain ? CHAIN_GAP : 0 }}
        >
          {visibleAncestors.map((ancestor, i) => {
            const isOldestVisible = i === 0;
            const next = i < visibleAncestors.length - 1 ? visibleAncestors[i + 1] : activeMenu;
            const linkIdx = next ? findLinkingIndex(ancestor, next) : undefined;
            const size = wheelSizes.ancestors[i];
            return (
              <div key={ancestor.id} className="flex flex-col items-center gap-1 shrink-0">
                {isOldestVisible && hiddenAncestorCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const rootId = breadcrumb[0];
                      if (rootId) setActiveMenu(rootId, { source: 'breadcrumb' });
                    }}
                    className="text-[10px] uppercase tracking-wider text-ink-3 hover:text-ink px-2 py-0.5 rounded hover:bg-bg-3"
                    title="Jump to top of chain"
                  >
                    ↑ {hiddenAncestorCount} more
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveMenu(ancestor.id, { source: 'breadcrumb' })}
                  className="text-[10px] uppercase tracking-wider text-ink-2 hover:text-ink px-2 py-1 rounded hover:bg-bg-3 transition-colors"
                  title={`Jump to ${ancestor.name || 'menu'}`}
                >
                  {ancestor.name || 'Untitled'}
                </button>
                <WheelView
                  menu={ancestor}
                  isActive={false}
                  highlightedIndex={linkIdx}
                  sizePx={size}
                />
              </div>
            );
          })}
          <div className="flex flex-col items-center gap-1 shrink-0">
            {showChain && (
              <div className="text-[10px] uppercase tracking-wider text-accent px-2 py-1">
                {activeMenu.name || 'Submenu'}
              </div>
            )}
            <WheelView menu={activeMenu} isActive sizePx={wheelSizes.active} />
          </div>
        </div>

        <div
          data-tour="slot-slider"
          className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-bg-2/90 backdrop-blur-sm border border-line rounded-md px-3 py-2 flex items-center gap-3 shadow-lg"
        >
          <span className="text-[10px] uppercase tracking-wider text-ink-3">Sockets</span>
          <input
            type="range"
            min={3}
            max={12}
            step={1}
            value={slotCount}
            onChange={(e) => setSlotCount(Number(e.target.value))}
            className="w-32 accent-accent"
          />
          <span className="font-mono text-[12px] text-accent w-5 text-right">{slotCount}</span>
        </div>
      </div>
    </main>
  );
}
