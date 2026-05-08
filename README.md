# Plasticity Radial Menu Generator

A free, local-first visual editor for designing [Plasticity](https://www.plasticity.xyz) radial (pie) menus and exporting `.radial.json` files that drag-and-drop into Plasticity's viewport.

![Preview](docs/preview.png)

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
```

## Usage

### Designing a menu

- Drag a command from the **Commands** panel onto a socket in the radial preview.
- Double-click a command to drop it into the next empty socket.
- Drag a filled socket onto another to **swap**.
- Drag a filled socket onto the **center disc** to clear it.
- Use the slider (or the mouse wheel over the stage) to change the socket count between 3 and 12.
- Click a socket to edit its **label**, **command**, or **icon** in the right panel.
- Manage multiple menus from the right panel — switch, duplicate, delete, or create new ones.
- A **Submenus** section at the top of the command list lets you wire one menu to open another with one drag.

### Installing a menu in Plasticity

1. Click **Export** to download a `.radial.json` file (one per menu in your workspace).
2. Drag the `.radial.json` file into Plasticity's 3D viewport.
3. Press <kbd>F</kbd> to open the command palette, type `menu`, right-click the entry, and assign a keyboard shortcut.

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| <kbd>Delete</kbd> / <kbd>Backspace</kbd> | Clear the selected socket |
| <kbd>Esc</kbd> | Deselect socket / close modal |
| <kbd>Cmd</kbd>/<kbd>Ctrl</kbd> + <kbd>S</kbd> | Export all menus |

## Persistence

Your workspace is saved to `localStorage` under `plasticity-radial:v1` and restored on reload. Nothing leaves your browser.

## License

MIT. Bundled toolbar icons retain their original LGPL-3.0 license — see `NOTICE.md`.
