import type { RadialMenu } from '../types';

interface Props {
  menu: RadialMenu;
  active: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export default function MenuRow({ menu, active, onSelect, onDuplicate, onDelete }: Props) {
  const filled = menu.items.filter((i) => i !== null && i.command).length;
  const total = menu.items.length;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group w-full flex items-center gap-2 px-2.5 py-2 rounded text-left border ${
        active
          ? 'bg-bg-3 border-accent'
          : 'bg-bg-2 border-line hover:bg-bg-3 hover:border-line-2'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="text-[12px] text-ink truncate">{menu.name}</div>
        <div className="text-[10px] text-ink-3 font-mono truncate">{menu.command}</div>
      </div>
      <span className="font-mono text-[11px] text-ink-2 shrink-0">
        {filled}/{total}
      </span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <span
          role="button"
          tabIndex={-1}
          aria-label="Duplicate menu"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="w-5 h-5 inline-flex items-center justify-center rounded text-ink-2 hover:text-ink hover:bg-bg-4 text-[12px] cursor-pointer"
          title="Duplicate"
        >
          ⎘
        </span>
        <span
          role="button"
          tabIndex={-1}
          aria-label="Delete menu"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="w-5 h-5 inline-flex items-center justify-center rounded text-ink-2 hover:text-danger hover:bg-bg-4 text-[12px] cursor-pointer"
          title="Delete"
        >
          ✕
        </span>
      </div>
    </button>
  );
}
