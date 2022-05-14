import { SteamLibraryFolder, SteamLoginUser } from './types';
import path from 'path';
import fs from 'fs';
import log from 'electron-log';
import { parse as parseVdf } from '@node-steam/vdf';
import { entries, has, values } from 'lodash';

export function readLoginUsersVdf(
  steamLocation: string,
): [string, SteamLoginUser][] {
  const loginUsersVdfPath = path.join(
    steamLocation,
    'config',
    'loginusers.vdf',
  );

  if (!fs.existsSync(loginUsersVdfPath)) {
    log.error('Missing file ', loginUsersVdfPath);
    return [];
  }

  const content = fs.readFileSync(loginUsersVdfPath, 'utf-8');
  try {
    const data = parseVdf(content) as { users: Record<number, SteamLoginUser> };

    const pairs = entries(data.users).filter(
      ([, x]) =>
        has(x, 'AccountName') && has(x, 'PersonaName') && has(x, 'MostRecent'),
    );
    if (pairs.length === 0) {
      log.error(
        'File loginusers.vdf has no valid logged users ',
        loginUsersVdfPath,
      );
    }
    return pairs;
  } catch (e) {
    log.error('Error parsing loginusers.vdf.', loginUsersVdfPath, e);
    return [];
  }
}

export function readLibraryFoldersVdf(
  steamLocation: string,
): SteamLibraryFolder[] {
  const libraryFolderVdfPath = path.join(
    steamLocation,
    'config',
    'libraryfolders.vdf',
  );
  if (!fs.existsSync(libraryFolderVdfPath)) {
    log.error('Missing file ', libraryFolderVdfPath);
    return [];
  }

  const content = fs.readFileSync(libraryFolderVdfPath, 'utf-8');
  try {
    const data = parseVdf(content) as {
      libraryfolders: Record<number, SteamLibraryFolder>;
    };

    const folders = values(data.libraryfolders).filter(
      x => has(x, 'path') && has(x, 'apps'),
    );
    if (folders.length === 0) {
      log.error(
        'File libraryfolders.vdf has no valid library folders ',
        libraryFolderVdfPath,
      );
    }
    return folders;
  } catch (e) {
    log.error('Error parsing libraryfolders.vdf.', libraryFolderVdfPath, e);
    return [];
  }
}
