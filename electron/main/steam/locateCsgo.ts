import path from 'path';
import * as fs from 'fs';
import { parse as parseVdf } from '@node-steam/vdf';
import { has, range, uniq } from 'lodash';

export function locateCsgo(): string | undefined {
  const steamLocation = tryDiscoverSteamLocation();
  if (!steamLocation) return undefined;

  const steamLibraryFolders = tryGetSteamLibraryFolders(steamLocation);
  return locateCsGoInSteamLibraryFolders(steamLibraryFolders);
}

function tryDiscoverSteamLocation() {
  let candidate: string;
  switch (process.platform) {
    case 'darwin':
      candidate = path.join(
        process.env.HOME!,
        'Library/Application Support/Steam/',
      );
      if (!fs.existsSync(candidate)) return null;
      return candidate;
    case 'linux':
      candidate = path.join(process.env.HOME!, '.local/share/Steam/');
      if (!fs.existsSync(candidate)) return null;
      return candidate;
    case 'win32':
      // "HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Valve\Steam"
      // "HKEY_LOCAL_MACHINE\SOFTWARE\Valve\Steam"
      return null;
  }
}

function tryGetSteamLibraryFolders(steamLocation: string): string[] {
  const libraryFolderVdfPath = path.join(
    steamLocation,
    'SteamApps',
    'libraryfolders.vdf',
  );
  if (!fs.existsSync(libraryFolderVdfPath)) return [];

  const content = fs.readFileSync(libraryFolderVdfPath, 'utf-8');
  const data = parseVdf(content);

  if (!has(data, 'libraryfolders')) return [];
  const folders = data.libraryfolders;

  const paths = range(0, 100)
    .filter(n => {
      return has(folders, n.toString()) && has(folders[n.toString()], 'path');
    })
    .map(n => folders[n.toString()].path);

  return uniq([steamLocation].concat(paths).filter(fs.existsSync));
}

function locateCsGoInSteamLibraryFolders(
  steamLibraryFolders: string[],
): string | undefined {
  const suffix = ['steamapps', 'common', 'Counter-Strike Global Offensive'];
  return steamLibraryFolders
    .map(x => path.join(x, ...suffix))
    .find(fs.existsSync);
}
