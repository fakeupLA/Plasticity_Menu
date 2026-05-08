import { miniIconSVG } from '../lib/icon';

interface Props {
  commandId: string;
  label: string;
  iconName: string;
  hint?: string;
  accent?: boolean;
  onDragStart: (commandId: string, label: string) => void;
  onDragEnd: () => void;
  onDoubleClick: (commandId: string, label: string) => void;
}

export default function CommandItem({
  commandId,
  label,
  iconName,
  hint,
  accent,
  onDragStart,
  onDragEnd,
  onDoubleClick,
}: Props) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        try {
          e.dataTransfer.setData('text/plain', `command:${commandId}`);
        } catch {
          // ignore
        }
        e.dataTransfer.effectAllowed = 'copy';
        onDragStart(commandId, label);
      }}
      onDragEnd={onDragEnd}
      onDoubleClick={() => onDoubleClick(commandId, label)}
      className={`group flex items-center gap-2 px-2 py-1.5 rounded text-[12px] cursor-grab active:cursor-grabbing select-none border border-transparent hover:bg-bg-3 hover:border-line ${
        accent ? 'border-accent/30 hover:border-accent' : ''
      }`}
      title={commandId}
    >
      <span
        className="shrink-0 w-4 h-4 inline-flex items-center justify-center"
        dangerouslySetInnerHTML={{ __html: miniIconSVG(iconName, 16) }}
      />
      <span className="truncate flex-1">{label}</span>
      {hint && <span className="text-ink-3 text-[10px] shrink-0">{hint}</span>}
    </div>
  );
}
