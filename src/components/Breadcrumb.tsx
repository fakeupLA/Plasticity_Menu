import { selectActiveMenu, useStore } from '../store';

export default function Breadcrumb() {
  const menus = useStore((s) => s.menus);
  const breadcrumb = useStore((s) => s.breadcrumb);
  const setActiveMenu = useStore((s) => s.setActiveMenu);
  const active = useStore(selectActiveMenu);

  if (breadcrumb.length === 0) return null;

  const trail = breadcrumb.map((id) => menus.find((m) => m.id === id)).filter(Boolean) as {
    id: string;
    name: string;
  }[];

  return (
    <div className="flex items-center gap-1.5 px-4 py-1.5 text-[11px] text-ink-2 border-b border-line bg-bg-2/40 shrink-0">
      <span className="uppercase tracking-wider text-[10px] text-ink-3 mr-1">Path</span>
      {trail.map((m, i) => (
        <span key={m.id} className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveMenu(m.id, { source: 'breadcrumb' })}
            className="hover:text-ink hover:underline underline-offset-2"
          >
            {m.name || 'Untitled'}
          </button>
          <span className="text-ink-3" aria-hidden>
            ›
          </span>
          {i === trail.length - 1 && (
            <span className="text-ink font-medium">{active?.name || 'Untitled'}</span>
          )}
        </span>
      ))}
    </div>
  );
}
