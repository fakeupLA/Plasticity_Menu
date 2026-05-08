import type { RadialMenu, SocketItem } from '../types';
import { defaultIconFor, iconFromCommand } from './icon';

export function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'menu'
  );
}

export function uid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `m-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

export function menuToExportJSON(menu: RadialMenu): {
  name: string;
  command: string;
  items: Array<{ command: string; icon: string; label: string }>;
} {
  const items = menu.items
    .filter((i): i is SocketItem => !!i && typeof i.command === 'string' && i.command.trim().length > 0)
    .map((i) => ({
      command: i.command,
      icon: i.icon || iconFromCommand(i.command),
      label: i.label || '',
    }));
  return { name: menu.name, command: menu.command, items };
}

export function menuToFilename(menu: RadialMenu): string {
  return `${slugify(menu.name)}.radial.json`;
}

export interface RawMenuJSON {
  name: string;
  command?: string;
  items: Array<unknown>;
}

export function isValidMenuJSON(raw: unknown): raw is RawMenuJSON {
  return (
    !!raw &&
    typeof raw === 'object' &&
    typeof (raw as RawMenuJSON).name === 'string' &&
    Array.isArray((raw as RawMenuJSON).items)
  );
}

export function coerceImportedMenu(raw: RawMenuJSON): RadialMenu {
  const items = raw.items.map((entry): SocketItem | null => {
    if (!entry || typeof entry !== 'object') return null;
    const e = entry as Partial<SocketItem>;
    const command = typeof e.command === 'string' ? e.command : '';
    if (!command) return null;
    return {
      command,
      icon: typeof e.icon === 'string' && e.icon ? e.icon : defaultIconFor(command),
      label: typeof e.label === 'string' ? e.label : '',
    };
  });
  const name = raw.name || 'Imported Menu';
  const command =
    typeof raw.command === 'string' && raw.command.trim().length > 0
      ? raw.command
      : `your-name:${slugify(name)}`;
  return {
    id: uid(),
    name,
    command,
    items,
  };
}

export function downloadFile(filename: string, content: string, mime = 'application/json') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
