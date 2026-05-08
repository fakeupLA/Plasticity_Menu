import type { RadialMenu } from '../types';
import { downloadFile, menuToExportJSON, menuToFilename } from './json';

export interface ExportValidation {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

export function validateForExport(menus: RadialMenu[]): ExportValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const seen = new Map<string, string>();
  const knownCommands = new Set<string>();
  for (const m of menus) {
    const cmd = m.command.trim();
    if (cmd) knownCommands.add(cmd);
  }
  for (const m of menus) {
    const cmd = m.command.trim();
    if (!cmd) {
      errors.push(`Menu "${m.name}" has an empty command ID`);
      continue;
    }
    if (seen.has(cmd)) {
      errors.push(`Duplicate command ID "${cmd}" — used by "${seen.get(cmd)}" and "${m.name}"`);
    } else {
      seen.set(cmd, m.name);
    }
    const filled = m.items.filter((i) => !!i && i.command.trim().length > 0).length;
    if (filled === 0) {
      warnings.push(`Menu "${m.name}" has no filled sockets`);
    }
    for (const item of m.items) {
      if (!item) continue;
      const prefix = 'view:radial:';
      if (item.command.startsWith(prefix)) {
        const target = item.command.slice(prefix.length);
        if (!knownCommands.has(target)) {
          warnings.push(
            `Menu "${m.name}" has a wedge linking to missing submenu "${target}"`,
          );
        }
      }
    }
  }
  return { ok: errors.length === 0, errors, warnings };
}

export function downloadMenus(menus: RadialMenu[]) {
  menus.forEach((m, i) => {
    setTimeout(() => {
      const payload = menuToExportJSON(m);
      downloadFile(menuToFilename(m), JSON.stringify(payload, null, 2));
    }, i * 250);
  });
}
