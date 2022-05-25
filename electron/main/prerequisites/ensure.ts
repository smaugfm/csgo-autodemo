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

export async function ensureSteamPrerequisites(
  steamLocation?: string,
  csgoFolder?: string,
): Promise<MainWindowArg[]> {
  const mainWindowArgs: MainWindowArg[] = [];

  if (!steamLocation) {
    mainWindowArgs.push('failedToFindSteam');
    return mainWindowArgs;
  }
  if (!csgoFolder) {
    mainWindowArgs.push('failedToFindCsGo');
    return mainWindowArgs;
  }
  if (!ensureGsiFile(csgoFolder)) {
    mainWindowArgs.push('gsiNotInstalled');
    return mainWindowArgs;
  }
  const lastLoggedInUser = getLastLoggedInUserId(steamLocation);
  if (lastLoggedInUser) {
    const localConfigFilePath = getLocalConfigFilePath(
      steamLocation,
      lastLoggedInUser,
    );
    if (localConfigFilePath) {
      const currentOptions = readCurrentCsgoLaunchOptions(localConfigFilePath);
      if (currentOptions !== null) {
        if (!checkNetconportAlreadyPresent(currentOptions, netConPort)) {
          if (await checkSteamRunning()) {
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
