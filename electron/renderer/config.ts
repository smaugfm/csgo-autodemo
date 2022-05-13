import { ipcRenderer } from 'electron';
import log from 'electron-log';
import { Config } from '../common/types/config';

async function invokeWithLog(request: string, ...args: any[]): Promise<any> {
  log.info(`${request}: `, args);
  const result = await ipcRenderer.invoke(request, ...args);
  log.info(`End of ${request} `, args, ': ', result);

  return result;
}

export const config: Config = {
  read: key => invokeWithLog('store-read', key),
  write: (key, value) => invokeWithLog('store-write', key, value),
  reset: () => invokeWithLog('store-reset'),
};
