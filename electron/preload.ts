import { contextBridge } from 'electron';
import { theming } from './renderer/theming';
import { config } from './renderer/config';
import { setupIpcRenderer } from './renderer/ipc';
import log from 'electron-log';

function apiObject() {
  try {
    return {
      theming,
      config,
      ipc: setupIpcRenderer(),
      failedToFindSteam: process.argv.includes('failedToFindSteam'),
      failedToFindCsGo: process.argv.includes('failedToFindCsGo'),
      gsiNotInstalled: process.argv.includes('gsiNotInstalled'),
      netConPortNeedToCloseSteam: process.argv.includes(
        'netConPortNeedToCloseSteam',
      ),
      netConPortAlreadyPresent: process.argv
        .find(x => x.startsWith('netConPortAlreadyPresent'))
        ?.substring('netConPortAlreadyPresent'.length) as string | undefined,
      netConPortFailed: process.argv.includes('netConPortFailed'),
    };
  } catch (e) {
    log.error('Preload script error');
    log.error(e);
    process.exit(1);
  }
}

export const api = apiObject();
contextBridge.exposeInMainWorld('Main', api);
