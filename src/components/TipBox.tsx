export default function TipBox() {
  return (
    <div className="px-3 py-3 border-t border-line bg-bg-2 text-[11px] text-ink-2 leading-relaxed">
      <div className="text-[10px] uppercase tracking-wider text-ink-3 mb-1.5">
        How to use in Plasticity
      </div>
      <ol className="space-y-0.5 list-decimal list-inside marker:text-ink-3">
        <li>
          Click <span className="text-accent">Export</span> to download <span className="font-mono">.radial.json</span>
        </li>
        <li>Drag the file into Plasticity's 3D viewport</li>
        <li>
          Press <kbd className="px-1.5 py-0.5 bg-bg-3 border border-line rounded text-[10px] font-mono">F</kbd>, type "menu", right-click and assign a shortcut
        </li>
      </ol>
    </div>
  );
}
