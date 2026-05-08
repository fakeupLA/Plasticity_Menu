import type { RadialMenu } from '../types';
import { downloadFile, menuToExportJSON, menuToFilename } from '../lib/json';
import { toast } from '../lib/toast';
import Modal from './Modal';

interface Props {
  open: boolean;
  menu: RadialMenu | undefined;
  onClose: () => void;
}

export default function JsonModal({ open, menu, onClose }: Props) {
  const json = menu ? JSON.stringify(menuToExportJSON(menu), null, 2) : '';

  async function copy() {
    if (!json) return;
    try {
      await navigator.clipboard.writeText(json);
      toast('success', 'Copied to clipboard');
    } catch {
      toast('error', 'Copy failed');
    }
  }

  function download() {
    if (!menu) return;
    downloadFile(menuToFilename(menu), json);
  }

  return (
    <Modal open={open} onClose={onClose} title={menu ? `JSON — ${menu.name}` : 'JSON'} width={640}>
      <div className="p-4 flex flex-col gap-3">
        <pre className="bg-bg-3 border border-line rounded p-3 text-[11px] font-mono text-ink overflow-auto max-h-[55vh] leading-relaxed">
{json}
        </pre>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={copy}
            className="h-7 px-3 text-[12px] rounded bg-bg-3 hover:bg-bg-4 border border-line text-ink"
          >
            Copy
          </button>
          <button
            type="button"
            onClick={download}
            className="h-7 px-3 text-[12px] rounded bg-accent hover:bg-accent-2 text-white"
          >
            Download
          </button>
        </div>
      </div>
    </Modal>
  );
}
