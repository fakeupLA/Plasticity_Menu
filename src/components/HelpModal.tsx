import { useEffect, useRef, useState } from 'react';
import Modal from './Modal';

interface Props {
  open: boolean;
  onClose: () => void;
}

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'building', label: 'Building a menu' },
  { id: 'submenus', label: 'Submenus & nesting' },
  { id: 'shortcuts', label: 'Keyboard shortcuts' },
  { id: 'exporting', label: 'Exporting & installing' },
  { id: 'templates', label: 'Templates & validation' },
  { id: 'format', label: 'The .radial.json format' },
  { id: 'faq', label: 'FAQ' },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

export default function HelpModal({ open, onClose }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<SectionId>('overview');

  // Reset to top when re-opened
  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0 });
      setActiveId('overview');
    }
  }, [open]);

  // Track which section is in view to highlight the TOC
  useEffect(() => {
    if (!open) return;
    const root = scrollRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id as SectionId);
          }
        }
      },
      { root, rootMargin: '-20% 0px -70% 0px', threshold: 0 },
    );
    SECTIONS.forEach(({ id }) => {
      const el = root.querySelector(`#${id}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [open]);

  function jump(id: SectionId) {
    const root = scrollRef.current;
    if (!root) return;
    const el = root.querySelector(`#${id}`);
    if (el) (el as HTMLElement).scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  return (
    <Modal open={open} onClose={onClose} title="Help" width={780}>
      <div className="flex h-[calc(80vh-40px)] min-h-0">
        <nav className="w-[180px] shrink-0 border-r border-line py-3 px-2 overflow-y-auto">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => jump(s.id)}
              className={`w-full text-left px-2.5 py-1.5 rounded text-[12px] mb-0.5 ${
                activeId === s.id
                  ? 'bg-bg-3 text-ink'
                  : 'text-ink-2 hover:text-ink hover:bg-bg-3/60'
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>

        <div ref={scrollRef} className="help-content flex-1 overflow-y-auto px-7 py-6 text-[13px] leading-relaxed text-ink space-y-8">
          <Section id="overview" title="Overview">
            <p>
              Fake-Up is a visual editor for Plasticity's radial (pie) menus. You
              arrange wedges in your browser and export <code>.radial.json</code>
              {' '}files that drop straight into Plasticity. Everything is
              local-first — nothing leaves your browser.
            </p>
            <p className="text-ink-2">
              Each top-level menu is one radial wheel that you'll bind to a hotkey
              in Plasticity. Submenus are extra menus referenced by a wedge in
              the parent — they export as additional <code>.radial.json</code>{' '}
              files alongside it.
            </p>
          </Section>

          <Section id="building" title="Building a menu">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Drag a command</strong> from the left rail onto a wedge
                to fill it. Or double-click a command to drop it into the next
                empty slot.
              </li>
              <li>
                <strong>Click a wedge</strong> to select it. The right inspector
                shows its label, command id, and icon — all editable.
              </li>
              <li>
                <strong>Hover a filled wedge</strong> to reveal an{' '}
                <code className="text-danger">×</code> button that clears it. Or
                press <kbd className="kbd">Delete</kbd> /{' '}
                <kbd className="kbd">Backspace</kbd> with a wedge selected.
              </li>
              <li>
                <strong>Drag a filled wedge onto another</strong> to swap their
                positions. Drag onto the wheel's <strong>center disc</strong> to
                clear that wedge.
              </li>
              <li>
                <strong>Change socket count</strong> (3–12) using the slider at
                the bottom of the stage, or scroll the mouse wheel anywhere over
                the wheel.
              </li>
              <li>
                <strong>Rename anything</strong> by double-clicking its name —
                works in the right outliner, breadcrumb, wheel labels, and the
                left rail's submenu rows.
              </li>
            </ul>
          </Section>

          <Section id="submenus" title="Submenus & nesting">
            <p>
              The orange <strong>+ Submenu</strong> tile pinned at the top of the
              left rail is the fast path to nest a menu inside another:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Drag it onto any wedge of the active wheel. A new empty submenu
                is created, the wedge becomes a link to it, and the editor jumps
                you into the new submenu so you can fill it.
              </li>
              <li>
                The previous wheel stays visible on the left at smaller scale
                with the linking wedge highlighted in accent — both wheels are
                fully editable; drop commands on either.
              </li>
              <li>
                Navigate the chain by clicking any ancestor wheel, clicking a
                breadcrumb crumb above the stage, or double-clicking a submenu
                wedge in the active wheel.
              </li>
              <li>
                Up to three ancestor wheels render at once. Beyond that, an{' '}
                <code>↑ N more</code> button takes you back to the root.
              </li>
              <li>
                Deleting a menu cascades: any wedge that linked to it gets
                cleared automatically, with a confirmation modal first.
              </li>
            </ul>
          </Section>

          <Section id="shortcuts" title="Keyboard shortcuts">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-left text-ink-3 uppercase tracking-wider text-[10px]">
                  <th className="pb-2 font-normal">Shortcut</th>
                  <th className="pb-2 font-normal">Action</th>
                </tr>
              </thead>
              <tbody className="text-ink">
                <Shortcut keys={['Delete']} alt="Backspace" action="Clear the selected wedge" />
                <Shortcut keys={['⌘', 'Z']} alt="Ctrl+Z" action="Undo" />
                <Shortcut keys={['⌘', '⇧', 'Z']} alt="Ctrl+Y" action="Redo" />
                <Shortcut keys={['⌘', 'S']} alt="Ctrl+S" action="Export all menus" />
                <Shortcut keys={['Esc']} action="Deselect wedge / close modal / cancel rename" />
                <Shortcut keys={['Enter']} action="Confirm rename" />
                <Shortcut keys={['F2']} action="Start rename on the focused label" />
                <Shortcut keys={['→']} alt="Tour-only" action="Next step (during onboarding)" />
                <Shortcut keys={['←']} alt="Tour-only" action="Previous step (during onboarding)" />
              </tbody>
            </table>
          </Section>

          <Section id="exporting" title="Exporting & installing">
            <p>Two ways to load a menu into Plasticity:</p>
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>
                <strong>Drag-and-drop into the viewport.</strong> Click{' '}
                <strong>Export</strong> to download a <code>.radial.json</code>{' '}
                file per menu, then drag those files onto Plasticity's 3D
                viewport. The menu loads immediately.
              </li>
              <li>
                <strong>Auto-load from the radials folder.</strong> Place the
                files in:
                <ul className="list-disc pl-5 mt-1 text-ink-2">
                  <li>
                    macOS / Linux: <code>~/.plasticity/radials/</code>
                  </li>
                  <li>
                    Windows: <code>%USERPROFILE%\.plasticity\radials\</code>
                  </li>
                </ul>
                Plasticity loads them on launch.
              </li>
            </ol>
            <p className="text-ink-2">
              Once loaded, bind the menu to a hotkey: in Plasticity press{' '}
              <kbd className="kbd">F</kbd>, type your menu name, right-click the
              entry, and assign a shortcut. The <strong>i</strong> button next
              to Export reopens this path info any time.
            </p>
          </Section>

          <Section id="templates" title="Templates & validation">
            <p>
              The <code>▾</code> next to <strong>+ New</strong> in the right
              rail starts a menu from a template — Modeling, Curves & Sketch,
              Modify Tools, Transform — pre-filled with sensible defaults.
            </p>
            <p>
              The validation banner under the top bar flags issues live as you
              edit:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong className="text-danger">Errors</strong> (red): duplicate
                command IDs, empty command IDs — these block export.
              </li>
              <li>
                <strong className="text-warn">Warnings</strong> (yellow): empty
                menus, broken submenu references — export still works but
                Plasticity may show empty wedges.
              </li>
            </ul>
            <p className="text-ink-2">
              Click any quoted menu name in the banner to jump to that menu.
            </p>
          </Section>

          <Section id="format" title="The .radial.json format">
            <p>
              Each export is a single menu with this shape:
            </p>
            <pre className="bg-bg-3 border border-line rounded p-3 text-[11px] font-mono text-ink overflow-auto">{`{
  "name": "Modeling",
  "command": "your-name:modeling",
  "items": [
    { "command": "command:fillet",  "icon": "fillet",  "label": "Fillet" },
    { "command": "command:extrude", "icon": "extrude", "label": "Extrude" },
    { "command": "view:radial:your-name:sub-tools", "icon": "submenu", "label": "Sub-tools" },
    null
  ]
}`}</pre>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <code>command</code> is what Plasticity invokes when the wedge
                is clicked. Regular commands use the{' '}
                <code>command:&lt;id&gt;</code> namespace.
              </li>
              <li>
                <code>view:radial:&lt;other-menu-command&gt;</code> turns a
                wedge into a submenu opener — Plasticity navigates to that
                menu's <code>command</code> field.
              </li>
              <li>
                <code>icon</code> is the SVG name of a Plasticity toolbar icon.
                Unknown icon names fall back to a generic shape.
              </li>
              <li>
                <code>null</code> entries in <code>items</code> are empty slots.
              </li>
            </ul>
            <p className="text-ink-2">
              Click <strong>View JSON</strong> in the top bar to see the live
              JSON for the currently active menu.
            </p>
          </Section>

          <Section id="faq" title="FAQ">
            <Faq q="My menu doesn't show up in Plasticity. What did I miss?">
              You probably haven't bound it to a hotkey yet. In Plasticity press{' '}
              <kbd className="kbd">F</kbd>, search for your menu's name,
              right-click the entry in the command palette, and assign a
              shortcut.
            </Faq>
            <Faq q="Can I share a menu I built with someone else?">
              Yes. Export to download the <code>.radial.json</code> file(s) and
              send them. The recipient drops them into Plasticity's viewport
              (or their radials folder) and binds a hotkey on their end.
            </Faq>
            <Faq q="Is anything I do uploaded anywhere?">
              No. Everything is local — your workspace lives in your browser's{' '}
              <code>localStorage</code> under <code>plasticity-radial:v1</code>.
              Closing or reopening the tab keeps your work; clearing site data
              wipes it.
            </Faq>
            <Faq q="Why do some icons look different from Plasticity's?">
              About 30 commands ship with first-party Plasticity SVG icons that
              this editor bundles directly. For commands without an upstream
              icon, a stylistic stroke-based fallback is used. The exported{' '}
              <code>icon</code> field is the same name either way; Plasticity
              renders its own version once the file is loaded.
            </Faq>
            <Faq q="How do I undo a mistake?">
              <kbd className="kbd">⌘Z</kbd> /{' '}
              <kbd className="kbd">Ctrl+Z</kbd>. Up to 100 steps, including
              creating / deleting menus, inline renames, and submenu nesting.
            </Faq>
            <Faq q="Can I import an existing .radial.json?">
              Yes — click <strong>Import</strong> in the top bar and pick the
              file. It's added to your workspace as a new menu.
            </Faq>
            <Faq q="I have feedback or a feature request.">
              Email{' '}
              <a
                href="mailto:jefflevine.fakeup@gmail.com"
                className="text-accent hover:text-accent-2 underline underline-offset-2"
              >
                jefflevine.fakeup@gmail.com
              </a>
              . I read everything.
            </Faq>
          </Section>
        </div>
      </div>
    </Modal>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="space-y-3 scroll-mt-4">
      <h2 className="text-[15px] text-ink font-medium">{title}</h2>
      {children}
    </section>
  );
}

function Shortcut({ keys, alt, action }: { keys: string[]; alt?: string; action: string }) {
  return (
    <tr className="border-t border-line/60">
      <td className="py-1.5 pr-4">
        <span className="inline-flex items-center gap-1">
          {keys.map((k, i) => (
            <kbd key={i} className="kbd">
              {k}
            </kbd>
          ))}
          {alt && <span className="text-ink-3 ml-2 text-[11px]">{alt}</span>}
        </span>
      </td>
      <td className="py-1.5 text-ink-2">{action}</td>
    </tr>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-line/60 pt-3 first:border-t-0 first:pt-0">
      <div className="text-ink font-medium mb-1">{q}</div>
      <div className="text-ink-2">{children}</div>
    </div>
  );
}
