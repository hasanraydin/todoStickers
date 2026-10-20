const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("todostickers", {
  load: () => ipcRenderer.sendSync("store:load"),
  save: (text) => ipcRenderer.sendSync("store:save", text),
  minimize: () => ipcRenderer.send("win:minimize"),
  toggleMaximize: () => ipcRenderer.send("win:toggleMaximize"),
  close: () => ipcRenderer.send("win:close"),
  onMaximized: (cb) => ipcRenderer.on("win:maximized", (_e, v) => cb(v)),
});
