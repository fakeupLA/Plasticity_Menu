import { miniIconSVG } from '../lib/icon';
import { selectActiveMenu, useStore } from '../store';
import { toast } from '../lib/toast';

export default function SubmenuTile() {
  const setDrag = useStore((s) => s.setDrag);
  const activeMenu = useStore(selectActiveMenu);
  const createSubmenuFromWedge = useStore((s) => s.createSubmenuFromWedge);

  function onClickInsert() {
    if (!activeMenu) return;
    const idx = activeMenu.items.findIndex((it) => it === null);
    if (idx === -1) {
      toast('error', 'No empty sockets — drag onto a wedge instead');
      return;
    }
    createSubmenuFromWedge(activeMenu.id, idx);
  }

  return (
    <div className="px-3 py-3 border-b border-line shrink-0" data-tour="submenu-tile">
      <div
        draggable
        onDragStart={(e) => {
          try {
            e.dataTransfer.setData('text/plain', 'new-submenu');
          } catch {
            // ignore
          }
          e.dataTransfer.effectAllowed = 'copy';
          setDrag({ kind: 'new-submenu' });
        }}
        onDragEnd={() => setTimeout(() => setDrag(null), 50)}
        onClick={onClickInsert}
        className="group flex items-center gap-3 px-3 py-2.5 rounded border border-accent/40 bg-accent/[0.06] hover:bg-accent/[0.12] hover:border-accent cursor-grab active:cursor-grabbing select-none"
        title="Drag onto a wedge to create a new submenu"
      >
        <span
          className="shrink-0 w-6 h-6 inline-flex items-center justify-center text-accent"
          dangerouslySetInnerHTML={{ __html: miniIconSVG('submenu', 22) }}
        />
        <div className="flex-1 min-w-0">
          <div className="text-[12px] text-ink font-medium leading-tight">+ Submenu</div>
          <div className="text-[10px] text-ink-3 leading-tight mt-0.5">
            Drag onto a wedge to nest a new menu
          </div>
        </div>
      </div>
    </div>
  );
}
