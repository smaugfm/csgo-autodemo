import { NetCon } from './netcon/NetCon';
import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import TypedEmitter from 'typed-emitter';
import { GsiEvents } from './gsi/types';

export function autodemo(
  netCon: NetCon,
  gsi: TypedEmitter<GsiEvents>,
  demosPath: string,
) {
  let lastMap = '';
  let gameLive = false;

  gsi.on('gameMap', name => {
    log.debug(`gameMap: ${name}`);
    lastMap = name;
  });
  gsi.on('gamePhase', async phase => {
    const wasGameLive = gameLive;
    log.debug(`gamePhase: ${phase}`);

    switch (phase) {
      case 'live':
        gameLive = true;
        break;
      case 'warmup':
        gameLive = true;
        break;
      case 'intermission':
        gameLive = true;
        break;
      case 'gameover':
        gameLive = false;
        break;
    }

    const demoName = await buildDemoName(lastMap, demosPath);

    if (!wasGameLive && gameLive) {
      try {
        await netCon.recordDemo(demoName);
      } catch (e) {
        log.error(`Error starting recording ${demoName}`, e);
      }
    } else if (wasGameLive && !gameLive) {
      lastMap = '';
      try {
        await netCon.stopRecordingDemo();
      } catch (e) {
        log.error('Error stopping recording.');
      }
    }
  });
}

async function buildDemoName(
  lastMap: string,
  demosPath: string,
): Promise<string> {
  const dateString = new Date().toISOString().slice(0, 16).replace(':', '-');
  let demoName = `${dateString}_${lastMap}`;

  let fullDemoPath = path.join(demosPath, demoName);
  let i = 0;
  while (fs.existsSync(fullDemoPath)) {
    demoName = `${demoName}_${i++}`;
    fullDemoPath = path.join(demosPath, demoName);
  }

  return demoName;
}
