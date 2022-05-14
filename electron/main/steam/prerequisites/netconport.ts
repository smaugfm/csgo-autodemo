import path from 'path';
import * as fs from 'fs';
import { parse as parseVdf, stringify as stringifyVdf } from '@node-steam/vdf';
import { get, has, keys } from 'lodash';
import log from 'electron-log';
import SteamID from 'steamid';
import { searchMatchingClosingBracket } from '../../../common/util';
import { readLoginUsersVdf } from './vdf';

export function readCurrentCsgoLaunchOptions(
  localConfigPath: string,
): string | null {
  const content = fs.readFileSync(localConfigPath, 'utf-8');
  const indexOf730 = content.search(/"730"\s+{\s+"/gm);
  if (indexOf730 < 0) {
    log.error('Could not find CS:GO (id 730) entry in ', localConfigPath);
    return null;
  }
  const indexOfLaunchOptions = content.indexOf('LaunchOptions', indexOf730);
  if (indexOfLaunchOptions < 0) {
    log.info('CS:GO LaunchOptions are empty');
    return '';
  }

  const indexOfOptionsStart =
    content.indexOf('"', 'LaunchOptions'.length + indexOfLaunchOptions + 1) + 1;
  const indexOfOptionsEnd = content.indexOf('"', indexOfOptionsStart);

  const result = content.substring(indexOfOptionsStart, indexOfOptionsEnd);
  log.info('CS:GO LaunchOptions are ', result);
  return result;
}

export function checkNetconportAlreadyPresent(
  options: string,
  netconport: number,
): boolean {
  return new RegExp(`-netconport\\s+${netconport}`).test(options);
}

export function patchLocalConfig(
  localConfigPath: string,
  netconport: number,
): boolean {
  const content = fs.readFileSync(localConfigPath, 'utf-8');
  const indexOf730 = content.search(/"730"\s+{\s+"/gm);
  const openingBracket = content.indexOf('{', indexOf730);
  const closingBracket = searchMatchingClosingBracket(content, openingBracket);
  if (closingBracket == null) return false;
  const entry = content.substring(indexOf730, closingBracket + 1);
  const obj = parseVdf(entry);
  const inner = obj['730'];
  if (!has(inner, 'LaunchOptions')) {
    inner.LaunchOptions = '';
  }
  if (has(inner, 'cloud.last_sync_state')) {
    delete inner.cloud.last_sync_state;
    if (keys(inner.cloud).length === 0) delete inner.cloud;
  }
  inner.LaunchOptions = `${inner.LaunchOptions} -netconport ${netconport}`;

  const modifiedEntry = stringifyVdf(obj);

  fs.writeFileSync(
    localConfigPath,
    content.substring(0, indexOf730) +
      modifiedEntry.substring(0, modifiedEntry.length - 1) +
      content.substring(closingBracket + 1),
  );
  return true;
}

export function verifyLocalConfig(path: string, netconport: number): boolean {
  const content = fs.readFileSync(path, 'utf-8');
  try {
    const objPath =
      'UserLocalConfigStore.Software.Valve.Steam.apps.730.LaunchOptions';
    const obj = parseVdf(content);
    if (!has(obj, objPath)) {
      return false;
    }
    const options = get(obj, objPath);
    return checkNetconportAlreadyPresent(options, netconport);
  } catch (e) {
    return false;
  }
}

export function getLocalConfigFilePath(
  steamLocation: string,
  sid: SteamID,
): string | null {
  const accountId = sid.accountid;
  if (!accountId) {
    log.error('Failed to read accountId from SteamID ', sid);
    return null;
  }
  const localConfigVdfPath = path.join(
    steamLocation,
    'userData',
    accountId.toString(),
    'config',
    'localconfig.vdf',
  );
  if (!fs.existsSync(localConfigVdfPath)) {
    log.error('File localconfig.vdf does not exist', localConfigVdfPath);
    return null;
  }
  return localConfigVdfPath;
}

export function getLastLoggedInUserId(steamLocation: string): SteamID | null {
  const loginUsers = readLoginUsersVdf(steamLocation);
  if (loginUsers.length === 0) return null;

  const mostRecentUser = loginUsers.find(([, x]) => x.MostRecent === 1);
  if (!mostRecentUser) {
    log.error('Failed to find most recent logged in user');
    return null;
  }
  try {
    const sid = new SteamID(mostRecentUser[0]);
    log.info('Read most recent Steam account ID ', sid);
    return sid;
  } catch (e) {
    log.error('Error parsin Steam ID ', e);
    return null;
  }
}
