import { BrowserWindow, shell } from 'electron';
import { MainWindowArg } from '../../common/types/config';
import isDev from 'electron-is-dev';

export function createdDummyWindow() {
  return new BrowserWindow({
    width: 300,
    height: 450,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    transparent: true,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // Prevents renderer process code from not running when window is hidden
      backgroundThrottling: true,
    },
  });
}

export async function createErrorWindow(
  errors: MainWindowArg[],
  preload: string,
  url: string,
) {
  const window = new BrowserWindow({
    width: 800,
    height: 400,
    resizable: false,
    show: true,
    useContentSize: true,
    webPreferences: {
      devTools: isDev,
      nodeIntegration: false,
      contextIsolation: true,
      additionalArguments: errors,
      preload,
    },
  });
  await window.loadURL(url);

  window.webContents.setWindowOpenHandler(details => {
    void shell.openExternal(details.url);
    return {
      action: 'deny',
    };
  });
  return window;
}
