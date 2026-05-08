import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../store';
import { projectRootIdFor, projectRoots } from '../lib/projects';
import { MENU_TEMPLATES, templateToItems } from '../data/templates';

export default function ProjectTabs() {
  const menus = useStore((s) => s.menus);
  const activeMenuId = useStore((s) => s.activeMenuId);
  const setActiveMenu = useStore((s) => s.setActiveMenu);
  const newMenu = useStore((s) => s.newMenu);
  const newMenuFromTemplate = useStore((s) => s.newMenuFromTemplate);

  const roots = useMemo(() => projectRoots(menus), [menus]);
  const activeRootId = useMemo(
    () => projectRootIdFor(activeMenuId, menus),
    [activeMenuId, menus],
  );

  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

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
    <div className="h-9 shrink-0 flex items-stretch border-b border-line bg-bg-2">
      <div className="flex-1 flex items-stretch overflow-x-auto">
        {roots.map((root) => {
          const isActive = root.id === activeRootId;
          const filled = root.items.some((it) => it && it.command);
          return (
            <button
              key={root.id}
              type="button"
              onClick={() => setActiveMenu(root.id, { source: 'direct' })}
              className={`group shrink-0 px-4 inline-flex items-center gap-2 text-[12px] border-r border-line transition-colors relative ${
                isActive
                  ? 'bg-bg text-ink'
                  : 'bg-bg-2 text-ink-2 hover:bg-bg-3 hover:text-ink'
              }`}
              title={root.command}
            >
              <span className="truncate max-w-[160px]">
                {root.name || 'Untitled'}
              </span>
              {!filled && (
                <span className="text-[9px] uppercase tracking-wider text-warn">empty</span>
              )}
              {isActive && (
                <span
                  aria-hidden
                  className="absolute left-0 right-0 bottom-0 h-[2px] bg-accent"
                />
              )}
            </button>
          );
        })}
      </div>
      <div ref={pickerRef} className="relative flex items-stretch border-l border-line">
        <button
          type="button"
          onClick={() => newMenu()}
          className="px-3 text-[12px] text-ink-2 hover:text-ink hover:bg-bg-3"
          title="New project (top-level menu)"
        >
          + New project
        </button>
        <button
          type="button"
          onClick={() => setPickerOpen((v) => !v)}
          className="px-2 text-[11px] text-ink-3 hover:text-ink hover:bg-bg-3 border-l border-line"
          aria-label="New project from template"
          title="New project from template"
        >
          ▾
        </button>
        {pickerOpen && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setPickerOpen(false)}
            />
            <div className="absolute top-full right-0 mt-0 w-[260px] bg-bg-2 border border-line rounded-md shadow-xl z-40 py-1">
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-ink-3 border-b border-line">
                New project from template
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
                  <div className="text-[10px] text-ink-3 mt-0.5 leading-snug">
                    {tpl.description}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
