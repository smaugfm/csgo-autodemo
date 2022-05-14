import { findSteamLocation } from './steam-folders';
import { ensureGsiFile } from './gsi';
import {
  checkNetconportAlreadyPresent,
  getLastLoggedInUserId,
  getLocalConfigFilePath,
  patchLocalConfig,
  readCurrentCsgoLaunchOptions,
  verifyLocalConfig,
} from './netconport';
import { netConPort } from '../../../common/types/misc';
import { checkSteamRunning } from '../../os';
import { MainWindowArg } from '../../../common/types/config';

export function ensureSteamPrerequisites(): MainWindowArg[] {
  const mainWindowArgs: MainWindowArg[] = [];

  const steamLocation = findSteamLocation();
  if (steamLocation) {
    if (ensureGsiFile(steamLocation)) {
      mainWindowArgs.push('gsiInstalled');
    }
    const lastLoggedInUser = getLastLoggedInUserId(steamLocation);
    if (lastLoggedInUser) {
      const localConfigFilePath = getLocalConfigFilePath(
        steamLocation,
        lastLoggedInUser,
      );
      if (localConfigFilePath) {
        const currentOptions =
          readCurrentCsgoLaunchOptions(localConfigFilePath);
        if (!checkNetconportAlreadyPresent(currentOptions, netConPort)) {
          if (checkSteamRunning()) {
            mainWindowArgs.push('netConPortNeedToCloseSteam');
          } else {
            if (patchLocalConfig(localConfigFilePath, netConPort)) {
              if (!verifyLocalConfig(localConfigFilePath, netConPort)) {
                mainWindowArgs.push('netConPortFailed');
              }
            } else {
              mainWindowArgs.push('netConPortFailed');
            }
          }
        }
      }
    }
  }

  return mainWindowArgs;
}
