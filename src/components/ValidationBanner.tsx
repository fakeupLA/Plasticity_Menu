import { useMemo, useState } from 'react';
import { useStore } from '../store';
import { validateForExport } from '../lib/export';

export default function ValidationBanner() {
  const menus = useStore((s) => s.menus);
  const setActiveMenu = useStore((s) => s.setActiveMenu);
  const [collapsed, setCollapsed] = useState(false);

  const result = useMemo(() => validateForExport(menus), [menus]);
  const hasErrors = result.errors.length > 0;
  const hasWarnings = result.warnings.length > 0;

  if (!hasErrors && !hasWarnings) return null;
  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        className={`shrink-0 w-full text-left px-4 py-1 text-[11px] border-b ${
          hasErrors
            ? 'bg-danger/15 border-danger/30 text-danger'
            : 'bg-warn/10 border-warn/30 text-warn'
        }`}
      >
        {hasErrors
          ? `${result.errors.length} export error${result.errors.length === 1 ? '' : 's'}`
          : `${result.warnings.length} warning${result.warnings.length === 1 ? '' : 's'}`}{' '}
        — click to expand
      </button>
    );
  }

  function jumpToMenu(name: string) {
    const m = menus.find((mm) => mm.name === name);
    if (m) setActiveMenu(m.id);
  }

  return (
    <div
      className={`shrink-0 border-b px-4 py-2 text-[12px] flex items-start gap-3 ${
        hasErrors
          ? 'bg-danger/15 border-danger/30 text-danger'
          : 'bg-warn/10 border-warn/30 text-warn'
      }`}
    >
      <span className="font-mono text-[10px] mt-0.5 shrink-0 uppercase tracking-wider opacity-70">
        {hasErrors ? 'Errors' : 'Warnings'}
      </span>
      <ul className="flex-1 space-y-0.5">
        {result.errors.map((msg, i) => (
          <li key={`e-${i}`} className="leading-snug">
            <Issue msg={msg} onJump={jumpToMenu} />
          </li>
        ))}
        {result.warnings.map((msg, i) => (
          <li key={`w-${i}`} className="leading-snug">
            <Issue msg={msg} onJump={jumpToMenu} />
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => setCollapsed(true)}
        className="text-[10px] uppercase tracking-wider opacity-70 hover:opacity-100"
        aria-label="Collapse"
      >
        Hide
      </button>
    </div>
  );
}

function Issue({ msg, onJump }: { msg: string; onJump: (name: string) => void }) {
  // Find quoted menu names like "My Menu" and make them clickable
  const parts: Array<string | { name: string }> = [];
  const re = /"([^"]+)"/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(msg)) !== null) {
    if (match.index > lastIdx) parts.push(msg.slice(lastIdx, match.index));
    parts.push({ name: match[1] });
    lastIdx = match.index + match[0].length;
  }
  if (lastIdx < msg.length) parts.push(msg.slice(lastIdx));

  return (
    <>
      {parts.map((p, i) =>
        typeof p === 'string' ? (
          <span key={i}>{p}</span>
        ) : (
          <button
            key={i}
            type="button"
            onClick={() => onJump(p.name)}
            className="underline underline-offset-2 hover:opacity-80"
          >
            "{p.name}"
          </button>
        ),
      )}
    </>
  );
}
