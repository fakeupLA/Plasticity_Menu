import { useEffect, useState } from 'react';
import type { ToastDetail } from '../lib/toast';

interface Item extends ToastDetail {
  id: number;
}

let nextId = 1;

export default function Toast() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    function onToast(e: Event) {
      const detail = (e as CustomEvent<ToastDetail>).detail;
      if (!detail) return;
      const id = nextId++;
      setItems((prev) => [...prev, { id, ...detail }]);
      setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== id));
      }, 2200);
    }
    window.addEventListener('toast', onToast);
    return () => window.removeEventListener('toast', onToast);
  }, []);

  if (items.length === 0) return null;
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {items.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto bg-bg-2 border border-line rounded shadow-lg pl-3 pr-4 py-2 text-[12px] text-ink min-w-[180px] max-w-[360px] border-l-4 ${
            t.kind === 'error' ? 'border-l-danger' : 'border-l-ok'
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
