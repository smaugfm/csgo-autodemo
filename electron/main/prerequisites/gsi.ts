import * as fs from 'fs';
import path from 'path';
import log from 'electron-log';

export const gsiFileName = 'gamestate_integration_autodemo.cfg';
const gsiLocationInCsGoFolder = ['csgo', 'cfg'];

export function ensureGsiFile(csgoFolder: string): boolean {
  const gsiFileFolder = path.join(csgoFolder, ...gsiLocationInCsGoFolder);
  if (!fs.existsSync(gsiFileFolder)) {
    log.error('Missing cfg folder in CS:GO folder ', gsiFileFolder);
    return false;
  }
  const gsiFilePath = path.join(
    csgoFolder,
    ...gsiLocationInCsGoFolder,
    gsiFileName,
  );
  if (fs.existsSync(gsiFilePath)) {
    log.info('Located GSI file at ', gsiFilePath);
    return true;
  }

  return installGsiFileToCsgoLocation(csgoFolder);
}

export function installGsiFileTo(filePath: string) {
  log.info('Installing GSI file to ', filePath);
  try {
    fs.copyFileSync(bundledGsiFilePath(), filePath);
    return true;
  } catch (e) {
    log.error(e);
    return false;
  }
}

function installGsiFileToCsgoLocation(csgoLocation: string) {
  const installationPath = path.join(
    csgoLocation,
    ...gsiLocationInCsGoFolder,
    gsiFileName,
  );
  return installGsiFileTo(installationPath);
}

function bundledGsiFilePath() {
  return path.join(__dirname, gsiFileName);
}
