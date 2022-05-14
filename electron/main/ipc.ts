import { ipcMain, dialog } from 'electron';
import path from 'path';
import { gsiFileName, installGsiFileTo } from './steam/prerequisites/gsi';

export function setupIpcMain() {
  ipcMain.handle('saveGsiFileDialog', async () => {
    const result = await dialog.showSaveDialog({
      title: gsiFileName,
      defaultPath: gsiFileName,
      filters: [
        {
          name: path.parse(gsiFileName).name,
          extensions: [path.parse(gsiFileName).ext],
        },
      ],
    });
    if (result.filePath) installGsiFileTo(result.filePath);
  });
}
