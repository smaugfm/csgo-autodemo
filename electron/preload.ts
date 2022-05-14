import { contextBridge } from 'electron';
import { theming } from './renderer/theming';
import { config } from './renderer/config';
import { setupIpcRenderer } from './renderer/ipc';

export const api = {
  theming,
  config,
  ipc: setupIpcRenderer(),
  gsiInstalled: process.argv.includes('gsiInstalled'),
  netConPortNeedToCloseSteam: process.argv.includes(
    'netConPortNeedToCloseSteam',
  ),
  netConPortFailed: process.argv.includes('netContPortFailed'),
};
contextBridge.exposeInMainWorld('Main', api);
