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
  private gameLive: boolean = false;
  private lastMap: string = '';

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
          await this.startRecording(demoName);
        } catch (e) {
          log.error(`Error starting recording ${demoName}`, e);
        }
      } else {
        this.lastMap = '';
        try {
          await this.stopRecording();
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

  private async startRecording(demoName: string) {
    // log.info(`Recording demo ${demoName}`);
    // await this.netCon.recordDemo(demoName, message => {
    //   const alreadyRecording = 'Already recording.';
    //   const waitForRoundOver =
    //     'Please start demo recording after current round is over.';
    //   const successRegex = /^Recording to (.*?)\.dem\.\.\.$/;
    //
    //   if (message == alreadyRecording) return reject(alreadyRecording);
    //
    //   if (message == waitForRoundOver) return reject(waitForRoundOver);
    //
    //   // check for recording
    //   const match = message.match(successRegex);
    //   if (match) {
    //     const recordingDemoName = match[1];
    //     if (recordingDemoName != demoName)
    //       return reject(
    //         'Actually started wrong demo. ' +
    //           `Wanted: ${demoName}. Actual: ${recordingDemoName}`,
    //       );
    //
    //     resolve();
    //   } else {
    //     reject(
    //       "Haven't received stop acknowledgment. " +
    //         `Instead received: ${message}`,
    //     );
    //   }
    // });
  }

  private stopRecording() {
    // const waitPromise = new Promise<void>((resolve, reject) => {
    //   this.netCon.on('console', message => {
    //     const successRegex =
    //       /^Completed demo, recording time (.*?), game frames (.*?)\.$/;
    //     const stopAtRoundEnd =
    //       'Demo recording will stop as soon as the round is over.';
    //     const recordInDemo = "Can't record during demo playback.";
    //
    //     if (message == stopAtRoundEnd) return reject(stopAtRoundEnd);
    //     if (message == recordInDemo) return reject(recordInDemo);
    //
    //     // check for recording
    //     const match = message.match(successRegex);
    //     if (match) {
    //       resolve();
    //     } else {
    //       reject(
    //         "Haven't received stop acknowledgment. " +
    //           `Instead received: ${message}`,
    //       );
    //     }
    //   });
    // });
    //
    // log.info(`Stopping recording.`);
    // const stopRecording = this.netCon.stopRecordingDemo();
    //
    // return Promise.all([waitPromise, stopRecording]).then(() => {
    //   this.netCon.removeAllListeners('console');
    // });
  }
}
