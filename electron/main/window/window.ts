import { BrowserWindow, shell } from 'electron';
import { MainWindowArg } from '../../common/types/config';
import { isDev } from '../../common/util';

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

export function createErrorWindow(errors: MainWindowArg[], preload: string) {
  const window = new BrowserWindow({
    width: 900,
    height: 400,
    minWidth: 450,
    minHeight: 200,
    show: true,
    useContentSize: true,
    webPreferences: {
      devTools: isDev(),
      nodeIntegration: false,
      contextIsolation: true,
      additionalArguments: errors,
      preload,
    },
  });
  window.webContents.setWindowOpenHandler(details => {
    void shell.openExternal(details.url);
    return {
      action: 'deny',
    };
  });
  return window;
}
