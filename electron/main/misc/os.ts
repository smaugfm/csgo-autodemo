import { execSync } from 'child_process';
import log from 'electron-log';

export function isDev() {
  return process.env.NODE_ENV !== 'production';
}

export function checkSteamRunning(): boolean {
  let steamRunning: boolean;

  switch (process.platform) {
    case 'darwin': {
      const result = execSync('pgrep steam_osx', {
        encoding: 'utf-8',
      });
      steamRunning = result.length > 0;
      break;
    }
    case 'linux':
      throw new Error('Linux is not supported!');
    case 'win32':
      throw new Error('Win32 is not supported!');
    default:
      throw new Error(`Platform ${process.platform} is not supported`);
  }

  log.info('Steam running: ', steamRunning);

  return steamRunning;
}
