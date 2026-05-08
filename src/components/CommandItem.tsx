import { miniIconSVG } from '../lib/icon';
import EditableLabel from './EditableLabel';

interface Props {
  commandId: string;
  label: string;
  iconName: string;
  hint?: string;
  accent?: boolean;
  iconColor?: string;
  // When provided, the label is split into "↳ <editable> (submenu)" and
  // double-click on the editable name renames the underlying menu instead
  // of inserting the command. Drag still places the link as before.
  editableName?: string;
  onRenameSubmenu?: (next: string) => void;
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
  iconColor,
  editableName,
  onRenameSubmenu,
  onDragStart,
  onDragEnd,
  onDoubleClick,
}: Props) {
  const isRenamable = onRenameSubmenu !== undefined && editableName !== undefined;

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
      onDoubleClick={() => {
        if (isRenamable) return;
        onDoubleClick(commandId, label);
      }}
      className={`group flex items-center gap-2 px-2 py-1.5 rounded text-[12px] cursor-grab active:cursor-grabbing select-none border border-transparent hover:bg-bg-3 hover:border-line ${
        accent ? 'border-accent/30 hover:border-accent' : ''
      }`}
      title={commandId}
    >
      <span
        className="shrink-0 w-4 h-4 inline-flex items-center justify-center"
        style={iconColor ? { color: iconColor } : undefined}
        dangerouslySetInnerHTML={{ __html: miniIconSVG(iconName, 16) }}
      />
      {isRenamable ? (
        <span className="truncate flex-1 inline-flex items-center gap-1 min-w-0">
          <span className="text-ink-3 shrink-0">↳</span>
          <EditableLabel
            value={editableName!}
            onCommit={onRenameSubmenu!}
            className="truncate text-ink cursor-text"
            inputClassName="bg-bg-3 border border-accent rounded px-1 py-0 outline-none text-[12px] text-ink min-w-0 flex-1"
            placeholder="Untitled"
            title="Double-click to rename"
          />
          <span className="text-ink-3 shrink-0">(submenu)</span>
        </span>
      ) : (
        <span className="truncate flex-1">{label}</span>
      )}
      {hint && <span className="text-ink-3 text-[10px] shrink-0">{hint}</span>}
    </div>
  );
}
