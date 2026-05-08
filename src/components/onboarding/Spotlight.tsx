import { useEffect, useLayoutEffect, useRef, useState } from 'react';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Props {
  selector: string;
  caption: string;
  preferredPlacement?: 'top' | 'bottom' | 'left' | 'right';
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const PADDING = 8;
const GAP = 14;
const VIEWPORT_MARGIN = 16;
const TOOLTIP_MAX_WIDTH = 320;

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function readTargetRect(selector: string): Rect | null {
  const el = document.querySelector(`[data-tour="${selector}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, width: r.width, height: r.height };
}

export default function Spotlight({
  selector,
  caption,
  preferredPlacement = 'bottom',
  stepIndex,
  totalSteps,
  onNext,
  onBack,
  onSkip,
}: Props) {
  const [target, setTarget] = useState<Rect | null>(null);
  const [tipPos, setTipPos] = useState<{ x: number; y: number } | null>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  // Recompute target rect on selector change, resize, scroll
  useLayoutEffect(() => {
    function recompute() {
      setTarget(readTargetRect(selector));
    }
    recompute();
    window.addEventListener('resize', recompute);
    window.addEventListener('scroll', recompute, true);
    const id = window.setInterval(recompute, 250); // catch layout drift (e.g. font load)
    return () => {
      window.removeEventListener('resize', recompute);
      window.removeEventListener('scroll', recompute, true);
      window.clearInterval(id);
    };
  }, [selector]);

  // Position tooltip after measuring its rendered size
  useLayoutEffect(() => {
    if (!target || !tipRef.current) {
      setTipPos(null);
      return;
    }
    const tip = tipRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const tipW = tip.width;
    const tipH = tip.height;

    const tryBelow = () => ({
      x: clamp(target.x + target.width / 2 - tipW / 2, VIEWPORT_MARGIN, vw - tipW - VIEWPORT_MARGIN),
      y: target.y + target.height + GAP,
      ok: target.y + target.height + GAP + tipH + VIEWPORT_MARGIN <= vh,
    });
    const tryAbove = () => ({
      x: clamp(target.x + target.width / 2 - tipW / 2, VIEWPORT_MARGIN, vw - tipW - VIEWPORT_MARGIN),
      y: target.y - GAP - tipH,
      ok: target.y - GAP - tipH >= VIEWPORT_MARGIN,
    });
    const tryRight = () => ({
      x: target.x + target.width + GAP,
      y: clamp(target.y + target.height / 2 - tipH / 2, VIEWPORT_MARGIN, vh - tipH - VIEWPORT_MARGIN),
      ok: target.x + target.width + GAP + tipW + VIEWPORT_MARGIN <= vw,
    });
    const tryLeft = () => ({
      x: target.x - GAP - tipW,
      y: clamp(target.y + target.height / 2 - tipH / 2, VIEWPORT_MARGIN, vh - tipH - VIEWPORT_MARGIN),
      ok: target.x - GAP - tipW >= VIEWPORT_MARGIN,
    });

    const order =
      preferredPlacement === 'top'
        ? [tryAbove, tryBelow, tryRight, tryLeft]
        : preferredPlacement === 'left'
          ? [tryLeft, tryRight, tryBelow, tryAbove]
          : preferredPlacement === 'right'
            ? [tryRight, tryLeft, tryBelow, tryAbove]
            : [tryBelow, tryAbove, tryRight, tryLeft];

    for (const fn of order) {
      const r = fn();
      if (r.ok) {
        setTipPos({ x: r.x, y: r.y });
        return;
      }
    }
    // Fallback to viewport center
    setTipPos({ x: (vw - tipW) / 2, y: (vh - tipH) / 2 });
  }, [target, preferredPlacement, caption]);

  // Keyboard handling
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onSkip();
      } else if (e.key === 'Enter' || e.key === 'ArrowRight') {
        e.preventDefault();
        onNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onBack();
      }
    }
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onNext, onBack, onSkip]);

  if (!target) return null;

  const cutout = {
    x: target.x - PADDING,
    y: target.y - PADDING,
    w: target.width + PADDING * 2,
    h: target.height + PADDING * 2,
  };

  return (
    <div className="fixed inset-0 z-[100]">
      <svg className="absolute inset-0 w-full h-full pointer-events-auto">
        <defs>
          <mask id="onboarding-spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              x={cutout.x}
              y={cutout.y}
              width={cutout.w}
              height={cutout.h}
              rx={8}
              fill="black"
              style={{ transition: 'all 240ms ease' }}
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="black"
          fillOpacity={0.65}
          mask="url(#onboarding-spotlight-mask)"
        />
        <rect
          x={cutout.x}
          y={cutout.y}
          width={cutout.w}
          height={cutout.h}
          rx={8}
          fill="none"
          stroke="#ff6b35"
          strokeWidth={1.5}
          style={{ transition: 'all 240ms ease' }}
        />
      </svg>

      <div
        ref={tipRef}
        className="absolute bg-bg-2 border border-line rounded-md shadow-2xl text-ink"
        style={{
          left: tipPos?.x ?? -9999,
          top: tipPos?.y ?? -9999,
          maxWidth: TOOLTIP_MAX_WIDTH,
          opacity: tipPos ? 1 : 0,
          transition: 'left 240ms ease, top 240ms ease, opacity 120ms ease',
        }}
      >
        <div className="px-4 pt-3 pb-2 text-[13px] leading-snug">{caption}</div>
        <div className="px-4 pb-3 pt-1 flex items-center gap-2 justify-between">
          <div className="text-[10px] uppercase tracking-wider text-ink-3">
            {stepIndex + 1} / {totalSteps}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onSkip}
              className="text-[11px] px-2 py-1 rounded text-ink-3 hover:text-ink"
            >
              Skip
            </button>
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={onBack}
                className="text-[11px] px-2.5 py-1 rounded bg-bg-3 hover:bg-bg-4 border border-line text-ink"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={onNext}
              className="text-[11px] px-2.5 py-1 rounded bg-accent hover:bg-accent-2 text-white"
            >
              {stepIndex === totalSteps - 1 ? 'Done' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
