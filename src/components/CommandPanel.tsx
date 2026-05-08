import { useMemo } from 'react';
import { PLASTICITY_COMMANDS, type PlasticityCommand } from '../data/plasticityCommands';
import { selectActiveMenu, useStore } from '../store';
import { defaultIconFor, iconFromCommand } from '../lib/icon';
import { toast } from '../lib/toast';
import CommandItem from './CommandItem';
import SubmenuTile from './SubmenuTile';

interface SectionGroup {
  section: string;
  items: Array<{ id: string; label: string; iconName: string; isSubmenu: boolean }>;
}

export default function CommandPanel() {
  const search = useStore((s) => s.searchQuery);
  const setSearch = useStore((s) => s.setSearch);
  const setDrag = useStore((s) => s.setDrag);
  const setSocket = useStore((s) => s.setSocket);
  const menus = useStore((s) => s.menus);
  const activeMenu = useStore(selectActiveMenu);

  const submenuEntries = useMemo(() => {
    if (!activeMenu) return [];
    return menus
      .filter((m) => m.id !== activeMenu.id)
      .map((m) => ({
        id: `view:radial:${m.command}`,
        label: `↳ ${m.name} (submenu)`,
        iconName: 'submenu',
        isSubmenu: true,
      }));
  }, [menus, activeMenu]);

  const grouped = useMemo<SectionGroup[]>(() => {
    const q = search.trim().toLowerCase();
    const matchesQuery = (id: string, label: string) => {
      if (!q) return true;
      return id.toLowerCase().includes(q) || label.toLowerCase().includes(q);
    };

    const sections = new Map<string, SectionGroup['items']>();

    if (submenuEntries.length > 0) {
      const filtered = submenuEntries.filter((e) => matchesQuery(e.id, e.label));
      if (filtered.length) sections.set('Submenus', filtered);
    }

    for (const cmd of PLASTICITY_COMMANDS as PlasticityCommand[]) {
      if (!matchesQuery(cmd.id, cmd.label)) continue;
      const arr = sections.get(cmd.section) ?? [];
      arr.push({ id: cmd.id, label: cmd.label, iconName: iconFromCommand(cmd.id), isSubmenu: false });
      sections.set(cmd.section, arr);
    }

    return Array.from(sections, ([section, items]) => ({ section, items }));
  }, [search, submenuEntries]);

  const totalShown = grouped.reduce((sum, g) => sum + g.items.length, 0);

  function handleDragStart(commandId: string, label: string) {
    setDrag({ kind: 'command', commandId, label });
  }
  function handleDragEnd() {
    setTimeout(() => setDrag(null), 50);
  }

  function handleDoubleClick(commandId: string, label: string) {
    if (!activeMenu) return;
    const idx = activeMenu.items.findIndex((i) => i === null);
    if (idx === -1) {
      toast('error', 'No empty sockets');
      return;
    }
    setSocket(idx, {
      command: commandId,
      icon: defaultIconFor(commandId),
      label,
    });
  }

  return (
    <aside data-tour="command-list" className="w-[280px] shrink-0 bg-bg-2 border-r border-line flex flex-col min-h-0">
      <SubmenuTile />
      <div className="p-3 border-b border-line shrink-0">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search commands…"
          className="w-full h-8 px-2 text-[12px] bg-bg-3 border border-line rounded outline-none focus:border-accent text-ink placeholder:text-ink-3"
        />
        <div className="text-[10px] uppercase tracking-wider text-ink-3 mt-2">
          {search ? `${totalShown} match${totalShown === 1 ? '' : 'es'}` : `${PLASTICITY_COMMANDS.length} commands`}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {grouped.length === 0 ? (
          <div className="text-ink-3 text-[12px] italic px-2 py-3">No matches</div>
        ) : (
          grouped.map((g) => (
            <section key={g.section} className="mb-3">
              <div className="text-[10px] uppercase tracking-wider text-ink-3 px-2 pt-1 pb-1.5">
                {g.section}
              </div>
              <div className="flex flex-col gap-0.5">
                {g.items.map((item) => (
                  <CommandItem
                    key={item.id}
                    commandId={item.id}
                    label={item.label}
                    iconName={item.iconName}
                    accent={item.isSubmenu}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDoubleClick={handleDoubleClick}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </aside>
  );
}
