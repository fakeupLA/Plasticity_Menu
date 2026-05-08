import Modal from './Modal';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AboutModal({ open, onClose }: Props) {
  return (
    <Modal open={open} onClose={onClose} title="About" width={520}>
      <div className="px-6 pt-6 pb-6 text-[14px] leading-relaxed text-ink space-y-5">
        <svg
          width="56"
          height="45"
          viewBox="0 0 41 33"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Fake-Up logo"
          className="text-ink"
        >
          <path d="M7.44058 0H0V4.02376L0.00671879 8.5438L12.0487 20.5376H28.0567L7.44058 0Z" />
          <path d="M25.9748 5.56901H20.5508V8.50173L20.5565 11.7959L29.3322 20.5376H40.9999L25.9748 5.56901Z" />
          <path d="M9.38492 33H5.08105V30.6726L5.08585 28.0583L12.0504 21.12H21.3089L9.38492 33Z" />
          <path d="M20.295 28.8462H17.4961V27.3335L17.499 25.6324L22.0284 21.12H28.0513L20.295 28.8462Z" />
        </svg>
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
        <div className="pt-1 text-[12px] text-ink-3">
          Made with <span aria-label="love">❤️</span> in Los Angeles
        </div>
      </div>
    </Modal>
  );
}
