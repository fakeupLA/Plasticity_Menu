import { useRef, useState } from 'react';
import { selectActiveMenu, useStore } from '../store';
import { downloadMenus, validateForExport } from '../lib/export';
import { toast } from '../lib/toast';
import { ONBOARDING_KEYS, getFlag, requestReplay, setFlag } from '../lib/onboarding';
import {
  FEATURE_FLAGS,
  getFlag as getFeatureFlag,
  setFlag as setFeatureFlag,
} from '../lib/featureFlags';
import { useFeatureFlag } from '../lib/useFeatureFlag';
import { projectMenus, projectRootIdFor } from '../lib/projects';
import JsonModal from './JsonModal';
import ExportInfoModal from './ExportInfoModal';

export default function TopBar() {
  const fileInput = useRef<HTMLInputElement>(null);
  const importMenuJSON = useStore((s) => s.importMenuJSON);
  const activeMenu = useStore(selectActiveMenu);
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const canUndo = useStore((s) => s.undoStack.length > 0);
  const canRedo = useStore((s) => s.redoStack.length > 0);
  const projectsView = useFeatureFlag(FEATURE_FLAGS.projectsView);
  const [jsonOpen, setJsonOpen] = useState(false);
  const [exportInfoOpen, setExportInfoOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  function onImportClick() {
    fileInput.current?.click();
  }

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    let added = 0;
    for (const file of files) {
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        const result = importMenuJSON(parsed);
        if (result.ok) {
          added += 1;
        } else {
          toast('error', `${file.name}: ${result.error}`);
        }
      } catch (err) {
        toast('error', `${file.name}: failed to parse JSON`);
      }
    }
    if (added > 0) {
      toast('success', `Imported ${added} menu${added === 1 ? '' : 's'}`);
    }
    if (fileInput.current) fileInput.current.value = '';
  }

  function runExport(scope: 'current' | 'all') {
    const { menus, activeMenuId } = useStore.getState();
    let toExport = menus;
    if (scope === 'current') {
      const rootId = projectRootIdFor(activeMenuId, menus);
      const tree = projectMenus(rootId, menus);
      toExport = tree.map((t) => t.menu);
    }
    const v = validateForExport(toExport);
    if (!v.ok) {
      v.errors.forEach((err) => toast('error', err));
      return;
    }
    if (v.warnings.length > 0) {
      v.warnings.forEach((w) => toast('error', w));
    }
    downloadMenus(toExport);
    toast(
      'success',
      `Exported ${toExport.length} file${toExport.length === 1 ? '' : 's'}`,
    );
    if (!getFlag(ONBOARDING_KEYS.exportPathHelp)) {
      setExportInfoOpen(true);
    }
  }

  function onExportClick() {
    runExport(projectsView ? 'current' : 'all');
  }

  function closeExportInfo() {
    setFlag(ONBOARDING_KEYS.exportPathHelp, true);
    setExportInfoOpen(false);
  }

  return (
    <header className="h-11 shrink-0 flex items-center justify-between px-4 bg-bg-2 border-b border-line">
      <div className="flex items-center gap-2 text-[13px]">
        <span className="text-accent text-base leading-none">◐</span>
        <span className="text-ink">Plasticity Radial Menu Generator</span>
      </div>
      <div className="flex items-center gap-2">
        <input
          ref={fileInput}
          type="file"
          accept=".json,.radial.json,application/json"
          multiple
          onChange={onFiles}
          className="hidden"
        />
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          className="w-7 h-7 inline-flex items-center justify-center text-[14px] rounded bg-bg-3 hover:bg-bg-4 border border-line text-ink-2 hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-bg-3 disabled:hover:text-ink-2"
          title="Undo (⌘Z)"
          aria-label="Undo"
        >
          ↶
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={!canRedo}
          className="w-7 h-7 inline-flex items-center justify-center text-[14px] rounded bg-bg-3 hover:bg-bg-4 border border-line text-ink-2 hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-bg-3 disabled:hover:text-ink-2"
          title="Redo (⌘⇧Z)"
          aria-label="Redo"
        >
          ↷
        </button>
        <div className="w-px h-5 bg-line mx-1" />
        <button
          type="button"
          onClick={() => {
            setFlag(ONBOARDING_KEYS.tourSeen, false);
            requestReplay();
          }}
          className="w-7 h-7 inline-flex items-center justify-center text-[13px] rounded bg-bg-3 hover:bg-bg-4 border border-line text-ink-2 hover:text-ink"
          title="Replay onboarding tour"
          aria-label="Replay onboarding tour"
        >
          ?
        </button>
        <button
          type="button"
          onClick={onImportClick}
          className="h-7 px-3 text-[12px] rounded bg-bg-3 hover:bg-bg-4 border border-line text-ink"
        >
          Import
        </button>
        <button
          type="button"
          onClick={() => setJsonOpen(true)}
          className="h-7 px-3 text-[12px] rounded bg-bg-3 hover:bg-bg-4 border border-line text-ink"
        >
          View JSON
        </button>
        <div className="relative inline-flex">
          <button
            type="button"
            data-tour="export"
            onClick={onExportClick}
            className="h-7 px-3 text-[12px] rounded bg-accent hover:bg-accent-2 text-white"
            title={projectsView ? 'Export current project' : 'Export all menus'}
          >
            {projectsView ? 'Export Project' : 'Export'}
          </button>
          {projectsView && (
            <>
              <button
                type="button"
                onClick={() => setExportMenuOpen((v) => !v)}
                className="h-7 px-1.5 text-[10px] rounded ml-1 bg-bg-3 hover:bg-bg-4 border border-line text-ink-2 hover:text-ink"
                aria-label="Export options"
                title="Export options"
              >
                ▾
              </button>
              {exportMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setExportMenuOpen(false)}
                  />
                  <div className="absolute top-full right-0 mt-1 w-[200px] bg-bg-2 border border-line rounded-md shadow-xl z-40 py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setExportMenuOpen(false);
                        runExport('current');
                      }}
                      className="w-full text-left px-3 py-1.5 text-[12px] text-ink hover:bg-bg-3"
                    >
                      Export current project
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setExportMenuOpen(false);
                        runExport('all');
                      }}
                      className="w-full text-left px-3 py-1.5 text-[12px] text-ink hover:bg-bg-3"
                    >
                      Export all projects
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => setExportInfoOpen(true)}
          className="w-6 h-7 inline-flex items-center justify-center text-[11px] rounded text-ink-3 hover:text-ink hover:bg-bg-3"
          title="Where to put exported files"
          aria-label="Where to put exported files"
        >
          i
        </button>
        <div className="w-px h-5 bg-line mx-1" />
        <button
          type="button"
          onClick={() => {
            const next = !getFeatureFlag(FEATURE_FLAGS.projectsView);
            setFeatureFlag(FEATURE_FLAGS.projectsView, next);
            toast('success', next ? 'Projects view ON' : 'Projects view OFF');
          }}
          className={`w-7 h-7 inline-flex items-center justify-center text-[11px] rounded border ${
            projectsView
              ? 'bg-accent/15 border-accent/50 text-accent'
              : 'bg-bg-3 hover:bg-bg-4 border-line text-ink-3 hover:text-ink'
          }`}
          title={`Toggle Projects view (currently ${projectsView ? 'ON' : 'OFF'})`}
          aria-label="Toggle projects view"
        >
          ⌗
        </button>
      </div>
      <JsonModal open={jsonOpen} menu={activeMenu} onClose={() => setJsonOpen(false)} />
      <ExportInfoModal open={exportInfoOpen} onClose={closeExportInfo} />
    </header>
  );
}
