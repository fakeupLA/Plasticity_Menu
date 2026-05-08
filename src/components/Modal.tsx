import { useEffect } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: number;
}

export default function Modal({ open, onClose, title, children, width = 560 }: Props) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-bg-2 border border-line rounded-md shadow-2xl flex flex-col max-h-[80vh] overflow-hidden"
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-10 shrink-0 flex items-center justify-between px-4 border-b border-line">
          <div className="text-[12px] text-ink">{title}</div>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 inline-flex items-center justify-center rounded text-ink-2 hover:text-ink hover:bg-bg-3"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 min-h-0">{children}</div>
      </div>
    </div>
  );
}
