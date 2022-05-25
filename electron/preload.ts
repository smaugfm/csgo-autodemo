import { contextBridge } from 'electron';
import { theming } from './renderer/theming';
import { config } from './renderer/config';
import { setupIpcRenderer } from './renderer/ipc';

export const api = {
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
    ?.split(':')?.[1] as string | undefined,
  netConPortFailed: process.argv.includes('netConPortFailed'),
};
contextBridge.exposeInMainWorld('Main', api);
