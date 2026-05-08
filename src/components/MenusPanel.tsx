import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../store';
import { MENU_TEMPLATES, templateToItems } from '../data/templates';
import MenuRow from './MenuRow';
import Modal from './Modal';
import SelectedSocketPanel from './SelectedSocketPanel';
import TipBox from './TipBox';

export default function MenusPanel() {
  const menus = useStore((s) => s.menus);
  const activeMenuId = useStore((s) => s.activeMenuId);
  const setActiveMenu = useStore((s) => s.setActiveMenu);
  const newMenu = useStore((s) => s.newMenu);
  const newMenuFromTemplate = useStore((s) => s.newMenuFromTemplate);
  const duplicateMenu = useStore((s) => s.duplicateMenu);
  const deleteMenu = useStore((s) => s.deleteMenu);

  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const pendingDelete = pendingDeleteId
    ? menus.find((m) => m.id === pendingDeleteId)
    : undefined;

  // Count inbound references — wedges in OTHER menus that link to this one
  const inboundCount = useMemo(() => {
    if (!pendingDelete) return 0;
    const ref = `view:radial:${pendingDelete.command}`;
    let n = 0;
    for (const m of menus) {
      if (m.id === pendingDelete.id) continue;
      for (const it of m.items) {
        if (it && it.command === ref) n += 1;
      }
    }
    return n;
  }, [pendingDelete, menus]);

  function confirmDelete() {
    if (!pendingDeleteId) return;
    deleteMenu(pendingDeleteId);
    setPendingDeleteId(null);
  }

  useEffect(() => {
    if (!pickerOpen) return;
    function onDown(e: MouseEvent) {
      if (!pickerRef.current) return;
      if (!pickerRef.current.contains(e.target as Node)) setPickerOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setPickerOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [pickerOpen]);

  return (
    <aside className="w-[320px] shrink-0 bg-bg-2 border-l border-line flex flex-col min-h-0">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-line">
        <div className="text-[10px] uppercase tracking-wider text-ink-3">
          Menus <span className="font-mono text-ink-2 ml-1">{menus.length}</span>
        </div>
        <div ref={pickerRef} className="relative flex items-center gap-1">
          <button
            type="button"
            onClick={() => newMenu()}
            className="h-6 px-2 text-[11px] rounded bg-bg-3 hover:bg-bg-4 border border-line text-ink"
          >
            + New
          </button>
          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            className="h-6 px-1.5 text-[11px] rounded bg-bg-3 hover:bg-bg-4 border border-line text-ink-2 hover:text-ink"
            aria-label="New from template"
            title="New from template"
          >
            ▾
          </button>
          {pickerOpen && (
            <div className="absolute top-full right-0 mt-1 w-[260px] bg-bg-2 border border-line rounded-md shadow-xl z-30 py-1">
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-ink-3 border-b border-line">
                New from template
              </div>
              {MENU_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => {
                    newMenuFromTemplate({
                      name: tpl.name,
                      command: tpl.command,
                      items: templateToItems(tpl),
                    });
                    setPickerOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-bg-3"
                >
                  <div className="text-[12px] text-ink">{tpl.name}</div>
                  <div className="text-[10px] text-ink-3 mt-0.5 leading-snug">{tpl.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="overflow-y-auto px-2 py-2 space-y-1 max-h-[40vh]">
        {menus.map((m) => (
          <MenuRow
            key={m.id}
            menu={m}
            active={m.id === activeMenuId}
            onSelect={() => setActiveMenu(m.id)}
            onDuplicate={() => duplicateMenu(m.id)}
            onDelete={() => setPendingDeleteId(m.id)}
          />
        ))}
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
              Delete <span className="text-accent">"{pendingDelete.name || 'Untitled'}"</span>?
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
