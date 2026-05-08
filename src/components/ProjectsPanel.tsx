import { useMemo, useState } from 'react';
import { useStore } from '../store';
import { projectMenus, projectRootIdFor } from '../lib/projects';
import Modal from './Modal';
import SelectedSocketPanel from './SelectedSocketPanel';
import TipBox from './TipBox';

export default function ProjectsPanel() {
  const menus = useStore((s) => s.menus);
  const activeMenuId = useStore((s) => s.activeMenuId);
  const setActiveMenu = useStore((s) => s.setActiveMenu);
  const duplicateMenu = useStore((s) => s.duplicateMenu);
  const deleteMenu = useStore((s) => s.deleteMenu);

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const activeRootId = useMemo(
    () => projectRootIdFor(activeMenuId, menus),
    [activeMenuId, menus],
  );
  const activeRoot = menus.find((m) => m.id === activeRootId);

  const tree = useMemo(() => projectMenus(activeRootId, menus), [activeRootId, menus]);

  const pendingDelete = pendingDeleteId
    ? menus.find((m) => m.id === pendingDeleteId)
    : undefined;

  const inboundCount = useMemo(() => {
    if (!pendingDelete) return 0;
    const ref = `view:radial:${pendingDelete.command}`;
    let n = 0;
    for (const m of menus) {
      if (m.id === pendingDelete.id) continue;
      for (const it of m.items) if (it && it.command === ref) n += 1;
    }
    return n;
  }, [pendingDelete, menus]);

  function confirmDelete() {
    if (!pendingDeleteId) return;
    deleteMenu(pendingDeleteId);
    setPendingDeleteId(null);
  }

  return (
    <aside className="w-[320px] shrink-0 bg-bg-2 border-l border-line flex flex-col min-h-0">
      <div className="px-3 py-2 border-b border-line shrink-0">
        <div className="text-[10px] uppercase tracking-wider text-ink-3">
          Project
        </div>
        <div className="text-[13px] text-ink mt-0.5 truncate" title={activeRoot?.command}>
          {activeRoot?.name || 'Untitled'}
        </div>
        <div className="text-[10px] font-mono text-ink-3 truncate">
          {tree.length} menu{tree.length === 1 ? '' : 's'}
        </div>
      </div>

      <div className="overflow-y-auto px-2 py-2 max-h-[40vh]">
        {tree.length === 0 ? (
          <div className="text-[12px] text-ink-3 italic px-2 py-3">
            No menus in this project.
          </div>
        ) : (
          tree.map(({ menu, depth }) => {
            const filled = menu.items.filter((i) => i !== null && i.command).length;
            const isActive = menu.id === activeMenuId;
            const isRoot = depth === 0;
            return (
              <div
                key={menu.id}
                className={`group flex items-center gap-2 px-2 py-1.5 rounded text-[12px] cursor-pointer border ${
                  isActive
                    ? 'bg-bg-3 border-accent'
                    : 'bg-bg-2 border-transparent hover:bg-bg-3'
                }`}
                style={{ paddingLeft: 8 + depth * 14 }}
                onClick={() => setActiveMenu(menu.id, { source: 'direct' })}
              >
                {!isRoot && (
                  <span className="text-ink-3 text-[10px] shrink-0" aria-hidden>
                    ↳
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <div
                    className={`truncate ${isRoot ? 'text-ink font-medium' : 'text-ink'}`}
                  >
                    {menu.name || 'Untitled'}
                  </div>
                  <div className="text-[10px] text-ink-3 font-mono truncate">
                    {menu.command}
                  </div>
                </div>
                <span className="font-mono text-[10px] text-ink-2 shrink-0">
                  {filled}/{menu.items.length}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <span
                    role="button"
                    tabIndex={-1}
                    aria-label="Duplicate menu"
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateMenu(menu.id);
                    }}
                    className="w-5 h-5 inline-flex items-center justify-center rounded text-ink-2 hover:text-ink hover:bg-bg-4 cursor-pointer"
                    title="Duplicate"
                  >
                    ⎘
                  </span>
                  <span
                    role="button"
                    tabIndex={-1}
                    aria-label="Delete menu"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPendingDeleteId(menu.id);
                    }}
                    className="w-5 h-5 inline-flex items-center justify-center rounded text-ink-2 hover:text-danger hover:bg-bg-4 cursor-pointer"
                    title="Delete"
                  >
                    ✕
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-line flex-1 overflow-y-auto min-h-0">
        <SelectedSocketPanel />
      </div>

      <TipBox />

      <Modal
        open={!!pendingDelete}
        onClose={() => setPendingDeleteId(null)}
        title="Delete menu"
        width={420}
      >
        {pendingDelete && (
          <div className="px-5 py-5 space-y-4">
            <div className="text-[14px] leading-relaxed text-ink">
              Delete <span className="text-accent">"{pendingDelete.name || 'Untitled'}"</span>
              {pendingDelete.id === activeRootId && (
                <span className="text-ink-3"> (the whole project)</span>
              )}
              ?
            </div>
            {inboundCount > 0 && (
              <div className="text-[12px] leading-relaxed text-warn bg-warn/10 border border-warn/30 rounded px-3 py-2">
                {inboundCount} {inboundCount === 1 ? 'wedge' : 'wedges'} in other menus link to this submenu. Those links will be cleared.
              </div>
            )}
            <div className="text-[11px] text-ink-3">This can be undone with ⌘Z.</div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPendingDeleteId(null)}
                className="h-8 px-3 text-[12px] rounded text-ink-2 hover:text-ink hover:bg-bg-3"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="h-8 px-3 text-[12px] rounded bg-danger hover:bg-danger/80 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </aside>
  );
}
