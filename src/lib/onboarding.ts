export const ONBOARDING_KEYS = {
  tourSeen: 'onboarding_tour_v2',
  hintReorder: 'onboarding_hint_reorder_v1',
  exportPathHelp: 'onboarding_export_path_help_v1',
} as const;

export type OnboardingFlagKey = (typeof ONBOARDING_KEYS)[keyof typeof ONBOARDING_KEYS];

export function getFlag(key: OnboardingFlagKey): boolean {
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

export function setFlag(key: OnboardingFlagKey, value: boolean) {
  try {
    if (value) localStorage.setItem(key, '1');
    else localStorage.removeItem(key);
  } catch {
    // ignore quota / private mode
  }
}

export interface TourStep {
  id: string;
  selector: string;
  caption: string;
  preferredPlacement?: 'top' | 'bottom' | 'left' | 'right';
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'commands',
    selector: 'command-list',
    caption: 'Drag any command onto a wedge to fill it. Or double-click to drop it into the next empty slot.',
    preferredPlacement: 'right',
  },
  {
    id: 'submenu-tile',
    selector: 'submenu-tile',
    caption: 'Drag the + Submenu tile onto a wedge to nest a new menu inside the current one. The parent stays visible as you edit; click any ancestor wheel or breadcrumb to jump back.',
    preferredPlacement: 'right',
  },
  {
    id: 'wheel',
    selector: 'wheel',
    caption: 'Click a wedge to edit it. Hover a filled wedge to reveal ×, or hit Delete / Backspace to clear. Double-click a submenu wedge to drill in.',
    preferredPlacement: 'right',
  },
  {
    id: 'slot-slider',
    selector: 'slot-slider',
    caption: 'Set how many slots the menu has — drag the slider, or scroll the mouse wheel anywhere over the wheel.',
    preferredPlacement: 'top',
  },
  {
    id: 'export',
    selector: 'export',
    caption: 'Export downloads a .radial.json file ready to drop into Plasticity. You\'re set.',
    preferredPlacement: 'bottom',
  },
];

const replayTarget = new EventTarget();

export function onReplayRequest(handler: () => void): () => void {
  const listener = () => handler();
  replayTarget.addEventListener('replay', listener);
  return () => replayTarget.removeEventListener('replay', listener);
}

export function requestReplay() {
  replayTarget.dispatchEvent(new Event('replay'));
}
