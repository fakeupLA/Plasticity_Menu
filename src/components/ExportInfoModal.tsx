import { useState } from 'react';
import Modal from './Modal';
import { toast } from '../lib/toast';

interface Props {
  open: boolean;
  onClose: () => void;
}

type OS = 'mac' | 'windows' | 'linux';

function detectOS(): OS {
  if (typeof navigator === 'undefined') return 'mac';
  const platform = (navigator.platform || '').toLowerCase();
  const ua = navigator.userAgent.toLowerCase();
  if (platform.includes('mac') || ua.includes('mac os')) return 'mac';
  if (platform.includes('win') || ua.includes('windows')) return 'windows';
  return 'linux';
}

const PATHS: Record<OS, { label: string; path: string }> = {
  mac: { label: 'macOS', path: '~/.plasticity/radials/' },
  linux: { label: 'Linux', path: '~/.plasticity/radials/' },
  windows: { label: 'Windows', path: '%USERPROFILE%\\.plasticity\\radials\\' },
};

export default function ExportInfoModal({ open, onClose }: Props) {
  const [detected] = useState<OS>(() => detectOS());

  async function copy(path: string) {
    try {
      await navigator.clipboard.writeText(path);
      toast('success', 'Path copied');
    } catch {
      toast('error', 'Copy failed');
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Where to put the file" width={520}>
      <div className="px-5 py-5 space-y-4 text-[13px] text-ink leading-relaxed">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-ink-3 mb-1.5">
            Easiest way
          </div>
          <div>
            Drag the downloaded <span className="font-mono text-ink-2">.radial.json</span> file
            directly into Plasticity's 3D viewport. The menu loads immediately.
          </div>
        </div>

        <div className="border-t border-line" />

        <div>
          <div className="text-[10px] uppercase tracking-wider text-ink-3 mb-1.5">
            Auto-load on launch
          </div>
          <div className="mb-2">
            Place the file in Plasticity's radials folder and it loads every time Plasticity opens.
          </div>
          <div className="space-y-1.5">
            {(['mac', 'windows', 'linux'] as OS[]).map((os) => {
              const isMine = os === detected;
              const entry = PATHS[os];
              return (
                <div
                  key={os}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded border ${
                    isMine ? 'border-accent/40 bg-accent/[0.06]' : 'border-line bg-bg-3'
                  }`}
                >
                  <span
                    className={`text-[10px] uppercase tracking-wider w-14 shrink-0 ${
                      isMine ? 'text-accent' : 'text-ink-3'
                    }`}
                  >
                    {entry.label}
                    {isMine && ' •'}
                  </span>
                  <code className="flex-1 text-[12px] font-mono text-ink-2 truncate">
                    {entry.path}
                  </code>
                  <button
                    type="button"
                    onClick={() => copy(entry.path)}
                    className="text-[10px] uppercase tracking-wider px-2 py-1 rounded text-ink-2 hover:text-ink hover:bg-bg-4"
                  >
                    Copy
                  </button>
                </div>
              );
            })}
          </div>
          <div className="text-[11px] text-ink-3 mt-2">
            Create the <span className="font-mono">radials</span> subfolder if it doesn't exist.
          </div>
        </div>

        <div className="flex items-center justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-4 text-[12px] rounded bg-accent hover:bg-accent-2 text-white"
          >
            Got it
          </button>
        </div>
      </div>
    </Modal>
  );
}
