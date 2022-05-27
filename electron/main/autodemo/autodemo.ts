import { NetCon } from '../netcon/NetCon';
import log from 'electron-log';
import path from 'path';
import fs from 'fs';
import TypedEmitter from 'typed-emitter';
import { GsiEvents } from '../gsi/types';
import EventEmitter from 'events';
import { AutodemoEvents, modeMapToHuman } from './types';
import { strcmp } from '../../common/util';
import sanitize from 'sanitize-filename';
import { RecordingStartError } from '../netcon/types';

export class Autodemo extends (EventEmitter as new () => TypedEmitter<AutodemoEvents>) {
  private mapName: string;
  private gameMode: string;
  private gameLive: boolean;
  private recording = false;
  private readonly netCon: NetCon;
  private readonly csgoPath: string;

  constructor(netCon: NetCon, gsi: TypedEmitter<GsiEvents>, csgoPath: string) {
    super();
    this.mapName = '';
    this.gameMode = '';
    this.gameLive = false;
    this.netCon = netCon;
    this.csgoPath = csgoPath;

    this.netCon.on('disconnected', () => {
      this.gameLive = false;
      this.mapName = '';
      this.gameMode = '';
      this.recording = false;
    });
    gsi.on('gameMap', name => {
      log.debug(`gameMap: ${name}`);
      this.mapName = name;
    });

    gsi.on('gameMode', mode => {
      this.gameMode = modeMapToHuman[mode] ?? mode;
    });
    gsi.on('roundPhase', async phase => {
      if (!this.recording && ['freezetime', 'live'].includes(phase)) {
        await this.recordOrStop(this.gameLive);
      }
    });
    gsi.on('gamePhase', async phase => {
      const wasGameLive = this.updateGameLive(phase);

      await this.recordOrStop(wasGameLive);
    });
  }

  private async recordOrStop(wasGameLive: boolean) {
    if (!this.recording) {
      const demoName = await this.buildDemoName();
      try {
        const error = await this.netCon.recordDemo(demoName);
        if (error) {
          switch (error) {
            case RecordingStartError.Timeout:
              log.error(
                'Failed to start recording due to an unexpected error (timed-out)',
              );
              break;
            case RecordingStartError.WaitForRoundOver:
              log.error(
                'Failed to start recording this round. Will try at next one.',
              );
              break;
            case RecordingStartError.WrongDemoName:
              log.error('Recording started but with wrong demo name.');
              break;
            case RecordingStartError.AlreadyRecording:
              this.recording = true;
              break;
          }
        } else {
          this.recording = true;
        }
      } catch (e) {
        log.error('Error starting recording: ', e);
      }
    } else if (wasGameLive && !this.gameLive) {
      this.mapName = '';
      try {
        await this.netCon.stopRecordingDemo();
        this.recording = false;
      } catch (e) {
        log.error('Error stopping recording: ', e);
      }
    }
  }

  private updateGameLive(
    phase: 'live' | 'intermission' | 'gameover' | 'warmup',
  ) {
    const wasGameLive = this.gameLive;
    log.debug(`gamePhase: ${phase}`);

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
    return wasGameLive;
  }

  public get demoFileNameRegex() {
    return /^\d\d\d\d-\d\d-\d\dT\d\d-\d\d_\w+_\w+(_\d+)?\.dem$/;
  }

  get demosFolder() {
    return 'autodemo';
  }

  fullDemoPath(demoName: string) {
    return path.join(this.csgoPath, demoName);
  }

  async buildDemoName(): Promise<string> {
    const dateString = new Date().toISOString().slice(0, 16).replace(':', '-');
    let demoName = path.join(
      this.demosFolder,
      `${dateString}_${this.gameMode}_${this.mapName}`,
    );
    demoName = sanitize(demoName);

    let fullDemoPath = this.fullDemoPath(demoName);
    let i = 0;
    while (fs.existsSync(fullDemoPath)) {
      demoName = `${demoName}_${i++}`;
      fullDemoPath = this.fullDemoPath(demoName);
    }

    return demoName;
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
