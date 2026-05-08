import Modal from './Modal';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AboutModal({ open, onClose }: Props) {
  return (
    <Modal open={open} onClose={onClose} title="About" width={480}>
      <div className="px-5 py-5 text-[13px] leading-relaxed text-ink space-y-4">
        <p>
          I made this because I wanted a tool I could use myself. There are
          great paid options out there, but I thought a free, browser-based
          version with a cleaner layout might be useful to other folks too. No
          native app, just export the JSON and drop it in.
        </p>
        <p className="text-ink-2">
          Got feedback, feature requests, or something broken? I'd genuinely
          love to hear it. Reach me at{' '}
          <a
            href="mailto:jefflevine.fakeup@gmail.com"
            className="text-accent hover:text-accent-2 underline underline-offset-2"
          >
            jefflevine.fakeup@gmail.com
          </a>
          .
        </p>
        <div className="pt-2 text-[11px] text-ink-3">
          Made with <span aria-label="love">♥️</span> in Los Angeles
        </div>
      </div>
    </Modal>
  );
}
