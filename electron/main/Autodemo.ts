import { NetCon } from './netcon/NetCon';
import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import TypedEmitter from 'typed-emitter';
import { CsGoGsiEVents } from './gsi/types';

export class Autodemo {
  private readonly netCon: NetCon;
  private readonly gsi: TypedEmitter<CsGoGsiEVents>;
  private readonly demosPath: () => Promise<string>;
  private gameLive = false;
  private lastMap = '';

  constructor(
    netCon: NetCon,
    gsi: TypedEmitter<CsGoGsiEVents>,
    demosPath: () => Promise<string>,
  ) {
    this.netCon = netCon;
    this.gsi = gsi;
    this.demosPath = demosPath;

    gsi.on('gameMap', async name => {
      log.info(`gameMap: ${name}`);
      this.lastMap = name;
    });
    gsi.on('gamePhase', async phase => {
      const wasGameLive = this.gameLive;
      log.info(`gamePhase: ${phase}`);

      switch (phase) {
        case 'live':
          this.gameLive = true;
          break;
        case 'warmup':
          this.gameLive = true;
          break;
        case 'intermission':
          this.gameLive = true;
          break;
        case 'gameover':
          this.gameLive = false;
          break;
      }

      const demoName = await this.buildDemoName();

      if (!wasGameLive && this.gameLive) {
        try {
          await this.netCon.recordDemo(demoName);
        } catch (e) {
          log.error(`Error starting recording ${demoName}`, e);
        }
      } else {
        this.lastMap = '';
        try {
          await this.netCon.stopRecordingDemo();
        } catch (e) {
          log.error('Error stopping recording.');
        }
      }
    });
  }

  private async buildDemoName(): Promise<string> {
    const dateString = new Date().toISOString().slice(0, 16);
    let demoName = `${dateString}_${this.lastMap}`;

    let fullDemoPath = path.join(await this.demosPath(), demoName);
    let i = 0;
    while (fs.existsSync(fullDemoPath)) {
      demoName = `${demoName}_${i++}`;
      fullDemoPath = path.join(await this.demosPath(), demoName);
    }

    return demoName;
  }
}
