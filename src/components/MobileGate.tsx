import { useEffect, useState } from 'react';

const QUERY = '(max-width: 900px), (pointer: coarse) and (max-width: 1100px)';
const STORAGE_KEY = 'mobile_gate_dismissed_v1';

function isDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function setDismissed() {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // ignore quota / private mode
  }
}

export default function MobileGate() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isDismissed()) return;
    const mq = window.matchMedia(QUERY);
    const update = () => setShown(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  if (!shown) return null;

  function continueAnyway() {
    setDismissed();
    setShown(false);
  }

  return (
    <div className="fixed inset-0 z-[200] bg-bg flex items-center justify-center px-6 py-8 overflow-y-auto">
      <div className="w-full max-w-[420px] bg-bg-2 border border-line rounded-md shadow-2xl px-6 py-7 text-center">
        <div className="flex justify-center mb-4">
          <svg
            width="56"
            height="45"
            viewBox="0 0 41 33"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Fake-Up logo"
            className="text-ink"
          >
            <path d="M7.44058 0H0V4.02376L0.00671879 8.5438L12.0487 20.5376H28.0567L7.44058 0Z" />
            <path d="M25.9748 5.56901H20.5508V8.50173L20.5565 11.7959L29.3322 20.5376H40.9999L25.9748 5.56901Z" />
            <path d="M9.38492 33H5.08105V30.6726L5.08585 28.0583L12.0504 21.12H21.3089L9.38492 33Z" />
            <path d="M20.295 28.8462H17.4961V27.3335L17.499 25.6324L22.0284 21.12H28.0513L20.295 28.8462Z" />
          </svg>
        </div>
        <div className="text-[16px] text-ink font-medium mb-2">
          Best on a desktop
        </div>
        <p className="text-[13px] text-ink-2 leading-relaxed mb-5">
          This editor relies on drag-and-drop, hover affordances, and a dense
          multi-panel layout that don't work well on small or touch screens.
          Open it on a desktop or laptop browser for the intended experience.
        </p>
        <div className="text-[11px] text-ink-3 leading-relaxed">
          Bookmark this page and come back later from a computer. The link is
          the same.
        </div>
        <button
          type="button"
          onClick={continueAnyway}
          className="mt-5 text-[11px] uppercase tracking-wider text-ink-3 hover:text-ink underline underline-offset-2"
        >
          Continue anyway
        </button>
      </div>
    </div>
  );
}
