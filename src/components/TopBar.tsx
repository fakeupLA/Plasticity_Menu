import { useRef, useState } from 'react';
import { selectActiveMenu, useStore } from '../store';
import { downloadMenus, validateForExport } from '../lib/export';
import { toast } from '../lib/toast';
import { ONBOARDING_KEYS, getFlag, setFlag } from '../lib/onboarding';
import JsonModal from './JsonModal';
import ExportInfoModal from './ExportInfoModal';
import AboutModal from './AboutModal';

export default function TopBar() {
  const fileInput = useRef<HTMLInputElement>(null);
  const importMenuJSON = useStore((s) => s.importMenuJSON);
  const activeMenu = useStore(selectActiveMenu);
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const canUndo = useStore((s) => s.undoStack.length > 0);
  const canRedo = useStore((s) => s.redoStack.length > 0);
  const [jsonOpen, setJsonOpen] = useState(false);
  const [exportInfoOpen, setExportInfoOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

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

  function onExportClick() {
    const { menus } = useStore.getState();
    const v = validateForExport(menus);
    if (!v.ok) {
      v.errors.forEach((err) => toast('error', err));
      return;
    }
    if (v.warnings.length > 0) {
      v.warnings.forEach((w) => toast('error', w));
    }
    downloadMenus(menus);
    toast(
      'success',
      `Exported ${menus.length} file${menus.length === 1 ? '' : 's'}`,
    );
    if (!getFlag(ONBOARDING_KEYS.exportPathHelp)) {
      setExportInfoOpen(true);
    }
  }

  function closeExportInfo() {
    setFlag(ONBOARDING_KEYS.exportPathHelp, true);
    setExportInfoOpen(false);
  }

  return (
    <header className="h-11 shrink-0 flex items-center justify-between px-4 bg-bg-2 border-b border-line">
      <div className="flex items-center gap-2.5 text-[13px] text-ink">
        <svg
          width="22"
          height="18"
          viewBox="0 0 41 33"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Fake-Up logo"
          className="shrink-0"
        >
          <path d="M7.44058 0H0V4.02376L0.00671879 8.5438L12.0487 20.5376H28.0567L7.44058 0Z" />
          <path d="M25.9748 5.56901H20.5508V8.50173L20.5565 11.7959L29.3322 20.5376H40.9999L25.9748 5.56901Z" />
          <path d="M9.38492 33H5.08105V30.6726L5.08585 28.0583L12.0504 21.12H21.3089L9.38492 33Z" />
          <path d="M20.295 28.8462H17.4961V27.3335L17.499 25.6324L22.0284 21.12H28.0513L20.295 28.8462Z" />
        </svg>
        <span>
          <span className="font-semibold">Fake-Up</span>
          <span className="text-ink-2">: Plasticity Radial Menu Generator</span>
        </span>
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
          onClick={() => setAboutOpen(true)}
          className="w-7 h-7 inline-flex items-center justify-center text-[13px] rounded bg-bg-3 hover:bg-bg-4 border border-line text-ink-2 hover:text-ink"
          title="About"
          aria-label="About"
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
        <button
          type="button"
          data-tour="export"
          onClick={onExportClick}
          className="h-7 px-3 text-[12px] rounded bg-accent hover:bg-accent-2 text-white"
        >
          Export
        </button>
        <button
          type="button"
          onClick={() => setExportInfoOpen(true)}
          className="w-6 h-7 inline-flex items-center justify-center text-[11px] rounded text-ink-3 hover:text-ink hover:bg-bg-3"
          title="Where to put exported files"
          aria-label="Where to put exported files"
        >
          i
        </button>
      </div>
      <JsonModal open={jsonOpen} menu={activeMenu} onClose={() => setJsonOpen(false)} />
      <ExportInfoModal open={exportInfoOpen} onClose={closeExportInfo} />
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </header>
  );
}
