import { contextBridge } from 'electron';
import { theming } from './renderer/theming';
import { config } from './renderer/config';

export const api = {
  theming,
  config,
};
contextBridge.exposeInMainWorld('Main', api);
