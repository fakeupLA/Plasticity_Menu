import { useEffect } from 'react';
import TopBar from './components/TopBar';
import CommandPanel from './components/CommandPanel';
import Stage from './components/Stage';
import MenusPanel from './components/MenusPanel';
import ProjectsPanel from './components/ProjectsPanel';
import Toast from './components/Toast';
import ValidationBanner from './components/ValidationBanner';
import OnboardingTour from './components/onboarding/OnboardingTour';
import { FEATURE_FLAGS } from './lib/featureFlags';
import { useFeatureFlag } from './lib/useFeatureFlag';
import { useStore } from './store';
import { downloadMenus, validateForExport } from './lib/export';
import { toast } from './lib/toast';

function isEditableTarget(t: EventTarget | null): boolean {
  if (!t || !(t instanceof HTMLElement)) return false;
  const tag = t.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (t.isContentEditable) return true;
  return false;
}

export default function App() {
  const projectsView = useFeatureFlag(FEATURE_FLAGS.projectsView);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const editable = isEditableTarget(e.target);

      // Esc always works
      if (e.key === 'Escape') {
        useStore.getState().selectSocket(null);
        return;
      }

      // Undo / Redo always work, even inside text inputs
      if ((e.metaKey || e.ctrlKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) useStore.getState().redo();
        else useStore.getState().undo();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        useStore.getState().redo();
        return;
      }

      if (editable) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        const { selectedSocket, setSocket, selectSocket } = useStore.getState();
        if (selectedSocket !== null) {
          e.preventDefault();
          setSocket(selectedSocket, null);
          selectSocket(null);
        }
        return;
      }

      if ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        const { menus } = useStore.getState();
        const v = validateForExport(menus);
        if (!v.ok) {
          v.errors.forEach((err) => toast('error', err));
          return;
        }
        v.warnings.forEach((w) => toast('error', w));
        downloadMenus(menus);
        toast('success', `Exported ${menus.length} file${menus.length === 1 ? '' : 's'}`);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-bg text-ink">
      <TopBar />
      <ValidationBanner />
      <div className="flex-1 flex min-h-0">
        <CommandPanel />
        <Stage />
        {projectsView ? <ProjectsPanel /> : <MenusPanel />}
      </div>
      <Toast />
      <OnboardingTour />
    </div>
  );
}
