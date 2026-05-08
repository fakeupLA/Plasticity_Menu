// Plasticity's first-party toolbar icons (LGPL-3.0 — see NOTICE.md).
// These ship as part of `nkallen/plasticity` at src/components/toolbar/img/.
const PLASTICITY_RAW_ICONS = import.meta.glob('../assets/plasticity-icons/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

interface ParsedIcon {
  viewBox: string;
  inner: string;
}

const PLASTICITY_ICONS: Record<string, ParsedIcon> = {};
for (const [path, raw] of Object.entries(PLASTICITY_RAW_ICONS)) {
  const nameMatch = path.match(/([^/\\]+)\.svg$/);
  if (!nameMatch) continue;
  const name = nameMatch[1];
  const vb = raw.match(/viewBox="([^"]+)"/);
  const inner = raw.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
  // Some upstream Plasticity SVGs hard-code colors. Two formats:
  //   1. attribute: fill="#000" / stroke="#FFF"
  //   2. CSS in <style> block: .st0{fill:none;stroke:#000000;...}
  // Rewrite any explicit color on fill/stroke (in either form) to currentColor
  // so every shape inherits the wrapper color. Preserves fill="none" and
  // stroke-width / stroke-miterlimit so outline-style icons stay outlined.
  const cleanInner = (inner ? inner[1] : '')
    .replace(/\b(fill|stroke)="(?:#[0-9a-fA-F]+|black|white|gray|grey)"/gi, '$1="currentColor"')
    .replace(/\b(fill|stroke)\s*:\s*(?:#[0-9a-fA-F]+|black|white|gray|grey)/gi, '$1:currentColor');
  PLASTICITY_ICONS[name] = {
    viewBox: vb ? vb[1] : '0 0 32 32',
    inner: cleanInner,
  };
}

// Map our command-derived icon names to Plasticity's actual SVG filenames
// when they don't match exactly (variants, plurals, defaults).
const PLASTICITY_ALIASES: Record<string, string> = {
  // Box variants — Plasticity ships a single box icon
  'center-box': 'box',
  'corner-box': 'box',
  'three-point-box': 'box',
  // Rectangles
  'square': 'corner-rectangle',
  // Polygons
  'polygon': 'regular-polygon',
  // Ellipses
  'ellipse': 'center-ellipse',
  // Circles — tangent fallback
  'tangent-circle': 'three-point-circle',
  // Arcs — tangent fallback
  'tangent-arc': 'three-point-arc',
  // Curves
  'control-point-curve': 'curve',
  // Fillet variants
  'fillet-shell': 'fillet',
  'remove-fillets-from-shell': 'fillet',
  // Loft variants
  'loft-guide': 'loft',
  // Offset
  'offset': 'offset-face',
  // Boolean default → union
  'boolean': 'union',
};

function plasticityIconSVG(name: string, size: number): string | null {
  const direct = PLASTICITY_ICONS[name];
  const aliased = PLASTICITY_ALIASES[name]
    ? PLASTICITY_ICONS[PLASTICITY_ALIASES[name]]
    : undefined;
  const lookup = direct ?? aliased;
  if (!lookup) return null;
  return `<svg viewBox="${lookup.viewBox}" width="${size}" height="${size}" fill="currentColor" xmlns="http://www.w3.org/2000/svg">${lookup.inner}</svg>`;
}

export function iconFromCommand(cmdId: string): string {
  if (!cmdId) return '';
  if (cmdId.startsWith('command:')) return cmdId.slice('command:'.length);
  const parts = cmdId.split(':');
  return parts[parts.length - 1] || '';
}

export function defaultIconFor(command: string): string {
  if (command.startsWith('view:radial:')) return 'submenu';
  return iconFromCommand(command);
}

export function miniIconSVG(iconName: string, size = 16): string {
  const fromPlasticity = plasticityIconSVG(iconName, size);
  if (fromPlasticity) return fromPlasticity;
  return fallbackIconSVG(iconName, size);
}

// Hand-drawn fallback icons for commands Plasticity doesn't ship a toolbar SVG for
// (revolve, sweep, hollow, thicken, hide, isolate, lock, group, select-*, etc.).
function fallbackIconSVG(iconName: string, size = 16): string {
  const s = size, c = s / 2, sw = 1.4, stroke = 'currentColor';
  const wrap = (inner: string) =>
    `<svg viewBox="0 0 ${s} ${s}" width="${s}" height="${s}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  if (!iconName) return `<svg viewBox="0 0 ${s} ${s}" width="${s}" height="${s}"><circle cx="${c}" cy="${c}" r="${s * 0.32}" fill="none" stroke="${stroke}" stroke-width="${sw}"/></svg>`;
  const n = iconName;
  if (n.includes('arc')) return wrap(`<path d="M ${s * 0.2} ${s * 0.7} A ${s * 0.4} ${s * 0.4} 0 0 1 ${s * 0.8} ${s * 0.7}"/>`);
  if (n === 'curve' || n.includes('control-point') || n.includes('polysplines')) return wrap(`<path d="M ${s * 0.15} ${s * 0.7} Q ${s * 0.4} ${s * 0.2} ${s * 0.6} ${s * 0.55} T ${s * 0.85} ${s * 0.3}"/>`);
  if (n.includes('revolve')) return wrap(`<line x1="${c}" y1="${s * 0.15}" x2="${c}" y2="${s * 0.85}" stroke-dasharray="2 2"/><path d="M ${c} ${s * 0.25} Q ${s * 0.85} ${c} ${c} ${s * 0.75}"/>`);
  if (n.includes('sweep') || n === 'pipe') return wrap(`<ellipse cx="${s * 0.28}" cy="${c}" rx="${s * 0.1}" ry="${s * 0.18}"/><ellipse cx="${s * 0.72}" cy="${c}" rx="${s * 0.16}" ry="${s * 0.24}"/><path d="M ${s * 0.28} ${c - s * 0.18} Q ${c} ${s * 0.18} ${s * 0.72} ${c - s * 0.24}"/><path d="M ${s * 0.28} ${c + s * 0.18} Q ${c} ${s * 0.82} ${s * 0.72} ${c + s * 0.24}"/>`);
  if (n.includes('bridge')) return wrap(`<path d="M ${s * 0.15} ${s * 0.7} Q ${c} ${s * 0.25} ${s * 0.85} ${s * 0.7}"/><line x1="${s * 0.15}" y1="${s * 0.7}" x2="${s * 0.15}" y2="${s * 0.85}"/><line x1="${s * 0.85}" y1="${s * 0.7}" x2="${s * 0.85}" y2="${s * 0.85}"/>`);
  if (n.includes('thicken') || n.includes('hollow')) return wrap(`<rect x="${s * 0.2}" y="${s * 0.2}" width="${s * 0.6}" height="${s * 0.6}"/><rect x="${s * 0.32}" y="${s * 0.32}" width="${s * 0.36}" height="${s * 0.36}" stroke-dasharray="2 2"/>`);
  if (n.includes('array')) return wrap(`<rect x="${s * 0.15}" y="${s * 0.15}" width="${s * 0.2}" height="${s * 0.2}"/><rect x="${s * 0.4}" y="${s * 0.15}" width="${s * 0.2}" height="${s * 0.2}"/><rect x="${s * 0.65}" y="${s * 0.15}" width="${s * 0.2}" height="${s * 0.2}"/><rect x="${s * 0.15}" y="${s * 0.65}" width="${s * 0.2}" height="${s * 0.2}"/><rect x="${s * 0.4}" y="${s * 0.65}" width="${s * 0.2}" height="${s * 0.2}"/><rect x="${s * 0.65}" y="${s * 0.65}" width="${s * 0.2}" height="${s * 0.2}"/>`);
  if (n === 'delete' || n.includes('delete-')) return wrap(`<line x1="${s * 0.25}" y1="${s * 0.25}" x2="${s * 0.75}" y2="${s * 0.75}"/><line x1="${s * 0.75}" y1="${s * 0.25}" x2="${s * 0.25}" y2="${s * 0.75}"/>`);
  if (n.includes('hide')) return wrap(`<path d="M ${s * 0.15} ${c} Q ${c} ${s * 0.3} ${s * 0.85} ${c} Q ${c} ${s * 0.7} ${s * 0.15} ${c}"/><circle cx="${c}" cy="${c}" r="${s * 0.12}"/><line x1="${s * 0.2}" y1="${s * 0.2}" x2="${s * 0.8}" y2="${s * 0.8}"/>`);
  if (n.includes('isolate')) return wrap(`<rect x="${s * 0.18}" y="${s * 0.18}" width="${s * 0.64}" height="${s * 0.64}" stroke-dasharray="3 2"/><circle cx="${c}" cy="${c}" r="${s * 0.16}"/>`);
  if (n.includes('lock')) return wrap(`<rect x="${s * 0.28}" y="${s * 0.45}" width="${s * 0.44}" height="${s * 0.32}"/><path d="M ${s * 0.36} ${s * 0.45} L ${s * 0.36} ${s * 0.32} A ${s * 0.14} ${s * 0.14} 0 0 1 ${s * 0.64} ${s * 0.32} L ${s * 0.64} ${s * 0.45}"/>`);
  if (n.includes('group')) return wrap(`<rect x="${s * 0.18}" y="${s * 0.18}" width="${s * 0.64}" height="${s * 0.64}" stroke-dasharray="3 2"/><rect x="${s * 0.3}" y="${s * 0.3}" width="${s * 0.18}" height="${s * 0.18}"/><rect x="${s * 0.52}" y="${s * 0.52}" width="${s * 0.18}" height="${s * 0.18}"/>`);
  if (n.includes('select')) return wrap(`<polygon points="${s * 0.25},${s * 0.2} ${s * 0.7},${s * 0.55} ${s * 0.5},${s * 0.6} ${s * 0.6},${s * 0.78} ${s * 0.5},${s * 0.82} ${s * 0.4},${s * 0.65} ${s * 0.25},${s * 0.78}"/>`);
  if (n.includes('measure') || n.includes('dimension')) return wrap(`<line x1="${s * 0.2}" y1="${s * 0.5}" x2="${s * 0.8}" y2="${s * 0.5}"/><line x1="${s * 0.2}" y1="${s * 0.4}" x2="${s * 0.2}" y2="${s * 0.6}"/><line x1="${s * 0.8}" y1="${s * 0.4}" x2="${s * 0.8}" y2="${s * 0.6}"/>`);
  if (n === 'check' || n.includes('section-analysis')) return wrap(`<polyline points="${s * 0.2},${c} ${s * 0.42},${s * 0.7} ${s * 0.8},${s * 0.28}"/>`);
  if (n.includes('export')) return wrap(`<path d="M ${c} ${s * 0.18} L ${c} ${s * 0.6}"/><polyline points="${s * 0.38},${s * 0.42} ${c},${s * 0.6} ${s * 0.62},${s * 0.42}"/><line x1="${s * 0.2}" y1="${s * 0.78}" x2="${s * 0.8}" y2="${s * 0.78}"/>`);
  if (n.includes('material')) return wrap(`<circle cx="${c}" cy="${c}" r="${s * 0.32}"/><path d="M ${s * 0.3} ${s * 0.65} Q ${c} ${s * 0.4} ${s * 0.7} ${s * 0.65}"/>`);
  if (n.includes('text')) return wrap(`<line x1="${s * 0.25}" y1="${s * 0.25}" x2="${s * 0.75}" y2="${s * 0.25}"/><line x1="${c}" y1="${s * 0.25}" x2="${c}" y2="${s * 0.78}"/>`);
  if (n.includes('untrim')) return wrap(`<path d="M ${s * 0.18} ${s * 0.4} L ${s * 0.5} ${c} L ${s * 0.18} ${s * 0.6}"/><path d="M ${s * 0.82} ${s * 0.4} L ${s * 0.5} ${c} L ${s * 0.82} ${s * 0.6}"/>`);
  if (n.includes('project') || n.includes('outline')) return wrap(`<rect x="${s * 0.2}" y="${s * 0.2}" width="${s * 0.6}" height="${s * 0.4}"/><polyline points="${s * 0.2},${s * 0.75} ${s * 0.8},${s * 0.75}" stroke-dasharray="2 2"/>`);
  if (n.includes('construction-plane')) return wrap(`<polygon points="${s * 0.18},${s * 0.6} ${s * 0.5},${s * 0.4} ${s * 0.82},${s * 0.6} ${s * 0.5},${s * 0.8}"/>`);
  if (n.includes('viewport') || n.includes('navigate')) return wrap(`<rect x="${s * 0.2}" y="${s * 0.25}" width="${s * 0.6}" height="${s * 0.5}"/><circle cx="${c}" cy="${c}" r="${s * 0.1}"/>`);
  if (n === 'submenu' || n.startsWith('selection') || n.includes('mode')) return wrap(`<polygon points="${s * 0.25},${s * 0.2} ${s * 0.7},${s * 0.55} ${s * 0.5},${s * 0.6} ${s * 0.6},${s * 0.78} ${s * 0.5},${s * 0.82} ${s * 0.4},${s * 0.65} ${s * 0.25},${s * 0.78}"/>`);
  return wrap(`<circle cx="${c}" cy="${c}" r="${s * 0.18}"/>`);
}
