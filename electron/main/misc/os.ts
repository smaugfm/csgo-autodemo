import { execSync } from 'child_process';
import log from 'electron-log';
import * as os from 'os';

export function isDev() {
  return process.env.NODE_ENV !== 'production';
}

export async function checkSteamRunning(): Promise<boolean> {
  let steamRunning: boolean;

  switch (process.platform) {
    case 'darwin': {
      try {
        const result = execSync('pgrep steam_osx', {
          encoding: 'utf-8',
        });
        steamRunning = result.length > 0;
      } catch (e) {
        steamRunning = false;
      }
      break;
    }
    case 'win32': {
      try {
        const steamPid = Number(
          windowsTryGetRegistryValue(
            'HKEY_CURRENT_USER\\SOFTWARE\\Valve\\Steam\\ActiveProcess',
            'pid',
          ),
        );
        steamRunning = steamPid !== 0;
        break;
      } catch (e) {
        log.error(e);
        steamRunning = true;
        break;
      }
    }
    default:
      throw new Error(`Platform ${process.platform} is not supported`);
  }

  log.info('Steam running: ', steamRunning);

  return steamRunning;
}

export function windowsTryGetRegistryValue(
  path: string,
  value: string,
): string | undefined {
  try {
    return execSync(`REG QUERY ${path}`, {
      encoding: 'utf-8',
    })
      .split(os.EOL)
      .map(x => x.trim())
      .find(x => x.startsWith(value))
      ?.split(/\s+/)?.[2];
  } catch (e) {
    log.error(e);
    return undefined;
  }
}
