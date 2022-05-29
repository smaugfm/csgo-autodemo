import { NetCon } from '../netcon/NetCon';
import path from 'path';
import fs from 'fs';
import TypedEmitter from 'typed-emitter';
import { GsiEvents, ModeMap } from '../gsi/types';
import EventEmitter from 'events';
import { AutodemoEvents, modeMapToHuman } from './types';
import { strcmp } from '../../common/util';
import sanitize from 'sanitize-filename';
import { RecordingStartError } from '../netcon/types';
import log from 'electron-log';

const MAX_RETRIES = 3;

export class Autodemo extends (EventEmitter as new () => TypedEmitter<AutodemoEvents>) {
  private readonly netCon: NetCon;
  private readonly csgoPath: string;
  private retryOnNextRound = false;
  private retryOnFreezeTime = false;
  private retryCounter = 1;
  private liveSkipCounter = 0;

  constructor(netCon: NetCon, gsi: TypedEmitter<GsiEvents>, csgoPath: string) {
    super();
    this.netCon = netCon;
    this.csgoPath = csgoPath;

    gsi.on('gameLive', async (mapName, gameMode) => {
      this.resetState();
      const demoName = await this.buildDemoName(mapName, gameMode);
      const error = await this.netCon.recordDemo(demoName);
      if (!error) {
        this.emit('recordingStarted', `${demoName}.dem`);
      }

      switch (error) {
        case RecordingStartError.Timeout:
          this.retryOnNextRound = true;
          break;
        case RecordingStartError.WaitForRoundOver:
          this.retryOnNextRound = true;
          this.retryOnFreezeTime = true;
          break;
        case RecordingStartError.WrongDemoName:
          log.warn('Unexpected wrong demo name, but the recording is on!');
          break;
        case RecordingStartError.AlreadyRecording:
          break;
      }
      if (this.retryOnNextRound) {
        log.info('Will retry recording on the next round');
      }
    });
    gsi.on('roundPhase', async (mapName, gameMode, phase) => {
      if (!this.retryOnNextRound) {
        return;
      }
      if (this.retryOnFreezeTime && phase === 'live') {
        if (this.liveSkipCounter > MAX_RETRIES) {
          log.info(
            'It looks like there is no freezetime in this game. Aborting attempts to record.',
          );
          this.resetState();
          return;
        }
        log.info('Skipping live phase, will attempt at next freezetime.');
        this.liveSkipCounter++;
        return;
      }
      this.liveSkipCounter = 0;
      this.retryCounter++;
      if (this.retryCounter > MAX_RETRIES + 1) {
        log.info(
          `Already tried maximum of ${MAX_RETRIES} times. Aborting attemps to record until next game.`,
        );
        this.resetState();
      }
      log.info(`Recording try #${this.retryCounter}`);
      if (!mapName || !gameMode) {
        log.error(
          'Round is live but mapNape or gameMode is not set!' +
            `mapName: ${mapName}, gameMode: $${gameMode}`,
        );
        return;
      }
      const demoName = await this.buildDemoName(mapName, gameMode);
      const error = await this.netCon.recordDemo(demoName);
      if (!error) {
        this.emit('recordingStarted', `${demoName}.dem`);
        this.resetState();
        return;
      }
      switch (error) {
        case RecordingStartError.Timeout:
          break;
        case RecordingStartError.WaitForRoundOver:
          if (phase === 'freezetime')
            log.error(
              'Unexpected behaviour: cannot start during freezetime ' +
                'after specific error message to do so.',
            );
          break;
        case RecordingStartError.WrongDemoName:
          log.warn('Unexpected wrong demo name, but the recording is on!');
          break;
        case RecordingStartError.AlreadyRecording:
          break;
      }
    });
  }

  private resetState() {
    this.retryOnNextRound = false;
    this.retryOnFreezeTime = false;
    this.retryCounter = 1;
  }

  get demosFolder() {
    return 'autodemo';
  }

  fullDemoPath(demoName: string) {
    return path.join(this.csgoPath, demoName);
  }

  async buildDemoName(mapName: string, gameMode: ModeMap): Promise<string> {
    const dateString = new Date().toISOString().slice(0, 16).replace(':', '-');
    let demoName = path.join(
      this.demosFolder,
      sanitize(`${dateString}_${modeMapToHuman[gameMode]}_${mapName}`),
    );

    let fullDemoPath = this.fullDemoPath(demoName);
    let i = 0;
    while (fs.existsSync(fullDemoPath)) {
      demoName = `${demoName}_${i++}`;
      fullDemoPath = this.fullDemoPath(demoName);
    }

    return demoName.toLowerCase();
  }

  public get demoFileNameRegex() {
    return /^\d\d\d\d-\d\d-\d\d[tT]\d\d-\d\d_\w+_\w+(.+)?\.dem$/;
  }

  existingDemos(ascending: boolean): string[] {
    const autodemosFolder = path.join(this.csgoPath, this.demosFolder);
    if (!fs.existsSync(autodemosFolder)) {
      fs.mkdirSync(autodemosFolder);
    }

    return fs
      .readdirSync(autodemosFolder, {
        withFileTypes: true,
      })
      .filter(x => x.isFile())
      .map(x => x.name)
      .filter(x => this.demoFileNameRegex.test(x))
      .sort((a, b) => {
        if (ascending) return strcmp(a, b);
        else return strcmp(b, a);
      })
      .map(x => path.join(this.csgoPath, this.demosFolder, x));
  }
}
