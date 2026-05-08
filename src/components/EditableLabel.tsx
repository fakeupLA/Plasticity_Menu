import { useEffect, useLayoutEffect, useRef, useState } from 'react';

interface Props {
  value: string;
  onCommit: (next: string) => void;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  disabled?: boolean;
  // Only edit on double-click; single-click is consumed by the parent
  // (e.g. for selection / navigation).
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
  ariaLabel?: string;
}

export default function EditableLabel({
  value,
  onCommit,
  className,
  inputClassName,
  placeholder,
  disabled,
  onClick,
  title,
  ariaLabel,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep draft in sync if the canonical value changes while not editing.
  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useLayoutEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  function commit() {
    const trimmed = draft.trim();
    setEditing(false);
    if (trimmed && trimmed !== value) onCommit(trimmed);
    else setDraft(value);
  }

  function cancel() {
    setDraft(value);
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            cancel();
          }
          e.stopPropagation();
        }}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
        placeholder={placeholder}
        className={
          inputClassName ??
          'bg-bg-3 border border-accent rounded px-1 py-0 outline-none text-ink min-w-0'
        }
        aria-label={ariaLabel}
      />
    );
  }

  return (
    <span
      role="textbox"
      tabIndex={disabled ? -1 : 0}
      onClick={onClick}
      onDoubleClick={(e) => {
        if (disabled) return;
        e.stopPropagation();
        setEditing(true);
      }}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === 'F2') {
          e.preventDefault();
          setEditing(true);
        }
      }}
      className={className}
      title={title ?? 'Double-click to rename'}
      aria-label={ariaLabel}
    >
      {value || placeholder || ''}
    </span>
  );
}
