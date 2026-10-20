const { app, BrowserWindow, ipcMain, screen } = require("electron");
const path = require("path");
const fs = require("fs");

app.setAppUserModelId("com.todostickers.app");

// Notes and window position live in %APPDATA%\TodoStickers
const DATA_DIR = path.join(app.getPath("appData"), "TodoStickers");
const NOTES_FILE = path.join(DATA_DIR, "notes.json");
const BOUNDS_FILE = path.join(DATA_DIR, "window.json");
fs.mkdirSync(DATA_DIR, { recursive: true });
app.setPath("userData", path.join(DATA_DIR, "electron"));

// Bring over notes from the earlier "Notlarim" version, once
const OLD_NOTES = path.join(app.getPath("appData"), "Notlarim", "notlar.json");
if (!fs.existsSync(NOTES_FILE) && fs.existsSync(OLD_NOTES)) {
  try { fs.copyFileSync(OLD_NOTES, NOTES_FILE); } catch {}
}

// Only one window at a time
if (!app.requestSingleInstanceLock()) {
  app.quit();
}

let win;

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return null; }
}

// Write to a temp file first so a crash mid-write can't corrupt the notes
function writeAtomic(file, text) {
  const tmp = file + ".tmp";
  fs.writeFileSync(tmp, text, "utf8");
  fs.renameSync(tmp, file);
}

function savedBounds() {
  const b = readJson(BOUNDS_FILE);
  // First start: open maximized so the notes fill the screen
  if (!b) return { width: 1200, height: 800, maximized: true };
  // If the saved spot is on a monitor that's no longer connected, just center it
  const visible = screen.getAllDisplays().some(d => {
    const a = d.workArea;
    return b.x < a.x + a.width && b.x + b.width > a.x && b.y < a.y + a.height && b.y + 40 > a.y;
  });
  return visible ? b : { width: b.width, height: b.height, maximized: b.maximized };
}

function createWindow() {
  const { maximized, ...b } = savedBounds();
  win = new BrowserWindow({
    ...b,
    minWidth: 520,
    minHeight: 300,
    frame: false,
    backgroundColor: "#2b2d31",
    icon: path.join(__dirname, "icon.ico"),
    title: "TodoStickers",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.setMenu(null);
  if (maximized) win.maximize();
  win.loadFile(path.join(__dirname, "index.html"));
  win.once("ready-to-show", () => win.show());

  const sendState = () => win.webContents.send("win:maximized", win.isMaximized());
  win.on("maximize", sendState);
  win.on("unmaximize", sendState);
  win.webContents.on("did-finish-load", sendState);

  win.on("close", () => {
    const nb = win.getNormalBounds();
    try { writeAtomic(BOUNDS_FILE, JSON.stringify({ ...nb, maximized: win.isMaximized() })); } catch {}
  });
}

ipcMain.on("store:load", (e) => {
  try { e.returnValue = fs.readFileSync(NOTES_FILE, "utf8"); } catch { e.returnValue = null; }
});
ipcMain.on("store:save", (e, text) => {
  try { writeAtomic(NOTES_FILE, text); e.returnValue = true; } catch { e.returnValue = false; }
});
ipcMain.on("win:minimize", () => win.minimize());
ipcMain.on("win:toggleMaximize", () => (win.isMaximized() ? win.unmaximize() : win.maximize()));
ipcMain.on("win:close", () => win.close());

app.on("second-instance", () => {
  if (!win) return;
  if (win.isMinimized()) win.restore();
  win.focus();
});

app.whenReady().then(createWindow);
app.on("window-all-closed", () => app.quit());
