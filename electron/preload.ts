import { shell, contextBridge } from 'electron';
import { theming } from './renderer/theming';
import { config } from './renderer/config';
import { setupIpcRenderer } from './renderer/ipc';

export const api = {
  theming,
  config,
  ipc: setupIpcRenderer(),
  openExternal: (url: string) => shell.openExternal(url),
  gsiNotInstalled: process.argv.includes('gsiNotInstalled'),
  netConPortNeedToCloseSteam: process.argv.includes(
    'netConPortNeedToCloseSteam',
  ),
  netConPortAlreadyPresent: process.argv
    .find(x => x.startsWith('netConPortAlreadyPresent'))
    ?.split(':')?.[1] as string | undefined,
  netConPortFailed: process.argv.includes('netContPortFailed'),
};
contextBridge.exposeInMainWorld('Main', api);
