import { app, BrowserWindow } from "electron";
import { setupThemeChangedEvent } from "./main/themeChangedEvent";
import log from "electron-log";

let mainWindow: BrowserWindow | null;

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    minWidth: 900,
    minHeight: 600,
    height: 700,
    webPreferences: {
      devTools: true,
      nodeIntegration: false,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
    }
  });

  void mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app
.on("ready", createWindow)
.whenReady()
.then(() => {
  if (mainWindow) {
    setupThemeChangedEvent(mainWindow);
  }
  log.info("Main ready");
})
.catch(e => log.error(e));

app.on("window-all-closed", () => {
  app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
