# TodoStickers

Sticky notes for your Windows desktop. See all your notes at once on one board.

![TodoStickers](icon.png)

## Download

Get **`TodoStickers-Setup-x.y.z.exe`** from the [Releases](../../releases) page and run it.
It installs in a few seconds, adds a **TodoStickers** icon to your desktop and Start menu, and opens the app.

> The installer isn't code-signed, so Windows SmartScreen may say *"Windows protected your PC"*.
> Click **More info → Run anyway**.

To uninstall: **Settings → Apps → Installed apps → TodoStickers → Uninstall**.

## Features

- A board of sticky notes (3 × 4 by default) that scales with the window
- Add / delete notes, rename them, pick a color per note
- Bold, italic, underline and bullet lists
- Font and size for the selected text, plus A− / A+ for a whole note
- Drag notes anywhere by their top strip; resize from the edge or corner
- Scrolls when the board is full
- Saves automatically on every change, no Ctrl+S needed

Notes are stored per user in `%APPDATA%\TodoStickers\notes.json`.

## Run from source

Requires [Node.js](https://nodejs.org) 18+.

```bash
npm install
npm start
```

## Build the installer

```bash
npm run dist
```

The installer is written to `dist/TodoStickers-Setup-<version>.exe`. Upload it to a GitHub Release.
