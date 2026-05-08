import { useCallback, useEffect, useState } from 'react';
import Modal from '../Modal';
import Spotlight from './Spotlight';
import Hint from './Hint';
import { selectActiveMenu, useStore } from '../../store';
import {
  ONBOARDING_KEYS,
  TOUR_STEPS,
  getFlag,
  onReplayRequest,
  setFlag,
} from '../../lib/onboarding';

type Phase = 'idle' | 'welcome' | 'tour' | 'done';

export default function OnboardingTour() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [stepIndex, setStepIndex] = useState(0);
  const [hintVisible, setHintVisible] = useState(false);

  const filledCount = useStore((s) => {
    const menu = selectActiveMenu(s);
    if (!menu) return 0;
    return menu.items.reduce((n, i) => n + (i ? 1 : 0), 0);
  });

  // First-run: open welcome modal if not seen
  useEffect(() => {
    if (!getFlag(ONBOARDING_KEYS.tourSeen)) {
      setPhase('welcome');
    } else {
      setPhase('done');
    }
  }, []);

  // Replay listener — wired via TopBar "?" button
  useEffect(() => {
    return onReplayRequest(() => {
      setStepIndex(0);
      setPhase('welcome');
    });
  }, []);

  const finishTour = useCallback(() => {
    setFlag(ONBOARDING_KEYS.tourSeen, true);
    setPhase('done');
    setStepIndex(0);
  }, []);

  const startTour = useCallback(() => {
    setStepIndex(0);
    setPhase('tour');
  }, []);

  const next = useCallback(() => {
    if (stepIndex >= TOUR_STEPS.length - 1) {
      finishTour();
    } else {
      setStepIndex(stepIndex + 1);
    }
  }, [stepIndex, finishTour]);

  const back = useCallback(() => {
    if (stepIndex === 0) return;
    setStepIndex(stepIndex - 1);
  }, [stepIndex]);

  // Contextual reorder hint: show after tour is done, when 3+ wedges filled, once.
  useEffect(() => {
    if (phase !== 'done') return;
    if (hintVisible) return;
    if (getFlag(ONBOARDING_KEYS.hintReorder)) return;
    if (filledCount < 3) return;
    setHintVisible(true);
  }, [phase, filledCount, hintVisible]);

  const dismissHint = useCallback(() => {
    setFlag(ONBOARDING_KEYS.hintReorder, true);
    setHintVisible(false);
  }, []);

  return (
    <>
      <Modal
        open={phase === 'welcome'}
        onClose={finishTour}
        title="Welcome"
        width={460}
      >
        <div className="px-5 py-5 space-y-4">
          <div className="text-[14px] leading-relaxed text-ink">
            Build radial menus for Plasticity. Drag commands onto wedges, nest
            submenus, then export a <span className="font-mono text-ink-2">.radial.json</span> ready to drop in.
          </div>
          <div className="text-[12px] leading-relaxed text-ink-2">
            Want a quick tour of the basics?
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={finishTour}
              className="h-8 px-3 text-[12px] rounded text-ink-2 hover:text-ink hover:bg-bg-3"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={startTour}
              className="h-8 px-3 text-[12px] rounded bg-accent hover:bg-accent-2 text-white"
            >
              Take the tour
            </button>
          </div>
        </div>
      </Modal>

      {phase === 'tour' && (
        <Spotlight
          key={TOUR_STEPS[stepIndex].id}
          selector={TOUR_STEPS[stepIndex].selector}
          caption={TOUR_STEPS[stepIndex].caption}
          preferredPlacement={TOUR_STEPS[stepIndex].preferredPlacement}
          stepIndex={stepIndex}
          totalSteps={TOUR_STEPS.length}
          onNext={next}
          onBack={back}
          onSkip={finishTour}
        />
      )}

      {hintVisible && (
        <Hint
          selector="wheel"
          message="Tip: drag a filled wedge onto another to swap them, or onto the center to remove it."
          onDismiss={dismissHint}
        />
      )}
    </>
  );
}
