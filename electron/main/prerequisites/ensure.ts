import { findSteamLocation, locateCsgoFolder } from './steam-folders';
import { ensureGsiFile } from './gsi';
import {
  checkNetconportAlreadyPresent,
  getLastLoggedInUserId,
  getLocalConfigFilePath,
  patchLocalConfig,
  readCurrentCsgoLaunchOptions,
  verifyLocalConfig,
} from './netconport';
import { netConPort } from '../../common/types/misc';
import { checkSteamRunning } from '../misc/os';
import { MainWindowArg } from '../../common/types/config';

export function ensureSteamPrerequisites(): [MainWindowArg[], string | null] {
  const mainWindowArgs: MainWindowArg[] = [];

  const steamLocation = findSteamLocation();
  let csgoFolder: string | null = null;
  if (steamLocation) {
    csgoFolder = locateCsgoFolder(steamLocation);
    if (!csgoFolder || !ensureGsiFile(csgoFolder)) {
      mainWindowArgs.push('gsiNotInstalled');
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
        if (currentOptions !== null) {
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
  }

  return [mainWindowArgs, csgoFolder];
}
