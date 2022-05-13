import path from 'path';
import * as fs from 'fs';

export function checkAndInstallGSIFile(csgoLocation: string) {
  const suffix = ['csgo', 'cfg'];
  const targetFolder = path.join(csgoLocation, ...suffix);
  if (!fs.existsSync(targetFolder))
    throw new Error('Failed to install GSI file');

  const fileName = 'gamestate_integration_autodemo.cfg';
  fs.copyFileSync(
    path.join(__dirname, fileName),
    path.join(targetFolder, fileName),
  );
}
