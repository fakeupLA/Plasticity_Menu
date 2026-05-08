import { useEffect, useLayoutEffect, useRef, useState } from 'react';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Props {
  selector: string;
  message: string;
  onDismiss: () => void;
  autoDismissMs?: number;
}

const GAP = 12;
const VIEWPORT_MARGIN = 16;
const HINT_MAX_WIDTH = 280;

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function readTargetRect(selector: string): Rect | null {
  const el = document.querySelector(`[data-tour="${selector}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, width: r.width, height: r.height };
}

export default function Hint({ selector, message, onDismiss, autoDismissMs = 8000 }: Props) {
  const [target, setTarget] = useState<Rect | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    function recompute() {
      setTarget(readTargetRect(selector));
    }
    recompute();
    window.addEventListener('resize', recompute);
    window.addEventListener('scroll', recompute, true);
    return () => {
      window.removeEventListener('resize', recompute);
      window.removeEventListener('scroll', recompute, true);
    };
  }, [selector]);

  useLayoutEffect(() => {
    if (!target || !ref.current) return;
    const tip = ref.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Prefer above, fall back to below
    const above = target.y - GAP - tip.height >= VIEWPORT_MARGIN;
    const x = clamp(
      target.x + target.width / 2 - tip.width / 2,
      VIEWPORT_MARGIN,
      vw - tip.width - VIEWPORT_MARGIN,
    );
    const y = above
      ? target.y - GAP - tip.height
      : clamp(target.y + target.height + GAP, VIEWPORT_MARGIN, vh - tip.height - VIEWPORT_MARGIN);
    setPos({ x, y });
  }, [target, message]);

  useEffect(() => {
    if (!autoDismissMs) return;
    const id = window.setTimeout(onDismiss, autoDismissMs);
    return () => window.clearTimeout(id);
  }, [autoDismissMs, onDismiss]);

  if (!target) return null;

  return (
    <div
      ref={ref}
      className="fixed z-[90] bg-bg-2 border border-accent/60 rounded-md shadow-xl text-ink flex items-start gap-2 px-3 py-2"
      style={{
        left: pos?.x ?? -9999,
        top: pos?.y ?? -9999,
        maxWidth: HINT_MAX_WIDTH,
        opacity: pos ? 1 : 0,
        transition: 'left 200ms ease, top 200ms ease, opacity 120ms ease',
      }}
      role="status"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" aria-hidden />
      <span className="text-[12px] leading-snug flex-1">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="w-5 h-5 -mr-1 inline-flex items-center justify-center rounded text-ink-3 hover:text-ink hover:bg-bg-3"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
