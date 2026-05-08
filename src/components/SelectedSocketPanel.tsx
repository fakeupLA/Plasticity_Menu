import { selectActiveMenu, useStore } from '../store';
import { defaultIconFor } from '../lib/icon';

export default function SelectedSocketPanel() {
  const activeMenu = useStore(selectActiveMenu);
  const selectedSocket = useStore((s) => s.selectedSocket);
  const updateSocket = useStore((s) => s.updateSocket);
  const setSocket = useStore((s) => s.setSocket);
  const menus = useStore((s) => s.menus);
  const setActiveMenu = useStore((s) => s.setActiveMenu);

  if (!activeMenu) return null;

  if (selectedSocket === null) {
    return (
      <div className="px-3 py-3">
        <div className="text-[10px] uppercase tracking-wider text-ink-3 mb-2">Selected Socket</div>
        <div className="text-ink-3 italic text-[12px]">Click a socket to edit it.</div>
      </div>
    );
  }

  const item = activeMenu.items[selectedSocket];

  if (!item) {
    return (
      <div className="px-3 py-3">
        <div className="text-[10px] uppercase tracking-wider text-ink-3 mb-2">
          Socket {selectedSocket + 1}
        </div>
        <div className="text-ink-3 italic text-[12px]">
          Empty. Drag a command onto this socket to fill it.
        </div>
      </div>
    );
  }

  const isSubmenu = item.command.startsWith('view:radial:');
  const submenuTargetCmd = isSubmenu ? item.command.slice('view:radial:'.length) : null;
  const submenuTarget = submenuTargetCmd
    ? menus.find((m) => m.command === submenuTargetCmd)
    : undefined;

  return (
    <div className="px-3 py-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-wider text-ink-3">
          Socket {selectedSocket + 1}
        </div>
        <button
          type="button"
          onClick={() => setSocket(selectedSocket, null)}
          className="text-[10px] uppercase tracking-wider text-ink-3 hover:text-danger"
        >
          Clear
        </button>
      </div>

      {isSubmenu && (
        <div className="flex items-center justify-between bg-accent/10 border border-accent/30 rounded px-2 py-1.5">
          <div className="text-[11px] text-ink truncate">
            {submenuTarget ? (
              <>
                <span className="text-ink-3 mr-1">→</span>
                {submenuTarget.name}
              </>
            ) : (
              <span className="text-danger">Submenu not found: {submenuTargetCmd}</span>
            )}
          </div>
          {submenuTarget && (
            <button
              type="button"
              onClick={() => setActiveMenu(submenuTarget.id, { source: 'wedge' })}
              className="shrink-0 text-[10px] uppercase tracking-wider text-accent hover:text-accent-2 ml-2"
            >
              Open
            </button>
          )}
        </div>
      )}

      <Field label="Label">
        <input
          type="text"
          value={item.label}
          onChange={(e) => updateSocket(selectedSocket, { label: e.target.value })}
          className="w-full h-7 px-2 text-[12px] bg-bg-3 border border-line rounded outline-none focus:border-accent text-ink"
        />
      </Field>

      <Field label="Command">
        <input
          type="text"
          value={item.command}
          onChange={(e) => {
            const next = e.target.value;
            const patch: { command: string; icon?: string } = { command: next };
            const wasDerived = !item.icon || item.icon === defaultIconFor(item.command);
            if (wasDerived) {
              patch.icon = defaultIconFor(next);
            } else if (next.startsWith('view:radial:')) {
              patch.icon = 'submenu';
            }
            updateSocket(selectedSocket, patch);
          }}
          className="w-full h-7 px-2 text-[12px] font-mono bg-bg-3 border border-line rounded outline-none focus:border-accent text-ink"
        />
      </Field>

      <Field
        label="Icon"
        action={
          !isSubmenu && (
            <button
              type="button"
              onClick={() => updateSocket(selectedSocket, { icon: defaultIconFor(item.command) })}
              className="text-[10px] uppercase tracking-wider text-ink-3 hover:text-ink"
            >
              Reset
            </button>
          )
        }
      >
        <input
          type="text"
          value={item.icon}
          disabled={isSubmenu}
          onChange={(e) => updateSocket(selectedSocket, { icon: e.target.value })}
          className="w-full h-7 px-2 text-[12px] font-mono bg-bg-3 border border-line rounded outline-none focus:border-accent text-ink disabled:opacity-50"
        />
        {isSubmenu && (
          <div className="text-[10px] text-ink-3 mt-1">(submenu — derived)</div>
        )}
      </Field>
    </div>
  );
}

function Field({
  label,
  action,
  children,
}: {
  label: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-[10px] uppercase tracking-wider text-ink-3">{label}</label>
        {action}
      </div>
      {children}
    </div>
  );
}
