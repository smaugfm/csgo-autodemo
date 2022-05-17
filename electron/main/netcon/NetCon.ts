import EventEmitter from 'events';
import waitOn from 'wait-on';
import log from 'electron-log';
import TypedEmitter from 'typed-emitter';
import { NetConEvents } from './types';
import { delay } from '../../common/util';
import { SendOptions, Telnet } from '../../telnet-client/telnet-client';

export class NetCon extends (EventEmitter as new () => TypedEmitter<NetConEvents>) {
  private connection: Telnet | null = null;
  private interval: NodeJS.Timeout | null = null;
  private isStopping = false;
  private readonly port: number;

  constructor(port: number) {
    super();
    this.port = port;
  }

  public async connect(): Promise<void> {
    this.reconnect();
    await new Promise<void>(resolve => {
      this.on('connected', resolve);
    });
    await delay(500);
  }

  public get connected() {
    return !!this.connection;
  }

  public async echo(message: string) {
    log.info(`[echo] ${message}`);
    await this.sendCommand(`echo ${message}`, message);
  }

  public recordDemo = async (demoName: string) => {
    log.info(`[netcon] record ${demoName}`);
    return this.sendCommand(`record ${demoName}`, message => {
      const alreadyRecording = 'Already recording.';
      const waitForRoundOver =
        'Please start demo recording after current round is over.';
      const successRegex = /^Recording to (.*?)\.dem\.\.\.$/;

      const match = message.match(successRegex);
      if (
        message === alreadyRecording ||
        message === waitForRoundOver ||
        !match
      ) {
        log.error(`[netcon] record ${demoName}: ${message}`);
        return false;
      }

      const recordingDemoName = match[1];
      if (recordingDemoName !== demoName) {
        log.error(`[netcon] record ${demoName}. Wrong demo name: ${message}`);
        return false;
      }
      return true;
    });
  };

  public async stopRecordingDemo() {
    log.info('[netcon] stop');
    return this.sendCommand('stop', message => {
      const successRegex =
        /^Completed demo, recording time (.*?), game frames (.*?)\.$/;
      const stopAtRoundEnd =
        'Demo recording will stop as soon as the round is over.';
      const recordInDemo = "Can't record during demo playback.";

      const match = message.match(successRegex);
      if (message === stopAtRoundEnd || message === recordInDemo || !match) {
        log.error(`[netcon]: stop: ${message}`);
        return false;
      }

      return true;
    });
  }

  private setupDataHandler(connection: Telnet) {
    connection.on('data', data => {
      const message = data.toString('utf8').trim();
      log.debug('[console]: ', message);
      this.emit('console', message);
    });
  }

  private setupOtherHandlers(connection: Telnet) {
    connection.on('connect', () => {
      this.emit('connected');
      log.info('[netcon]: connected');
    });
    connection.on('close', () => {
      this.emit('disconnected');
      this.connection?.removeAllListeners();
      this.connection = null;
      log.info('[netcon]: close');

      this.reconnect();
    });
  }

  private reconnect() {
    if (this.isStopping) return;

    log.info('[netcon]: connecting...');
    this.emit('connecting');
    const tryConnect = async () => {
      try {
        await waitOn({
          resources: [`tcp:${this.port}`],
          interval: 500,
          timeout: 1000,
        });
      } catch (e) {
        return false;
      }
      if (this.isStopping) return false;

      this.connection = new Telnet();

      this.setupOtherHandlers(this.connection);

      await this.connection.connect({
        host: '127.0.0.1',
        port: this.port,
        sendTimeout: 1000,
        newlineReplace: '',
        negotiationMandatory: false,
        timeout: 500,
      });

      this.setupDataHandler(this.connection);

      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
      return true;
    };

    if (!tryConnect()) this.interval = setInterval(tryConnect, 1500);
  }

  public async stop(): Promise<void> {
    this.isStopping = true;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    await this.connection?.end();
    if (this.connected) {
      return new Promise<void>(resolve => {
        this.on('disconnected', resolve);
      });
    } else return Promise.resolve();
  }

  private async sendCommand(command: string, waitFor?: SendOptions['waitFor']) {
    if (!this.connection) {
      log.info(`[netcon]: cannot send command ${command} as socket is null`);
      return;
    }
    try {
      return await this.connection.send(command, {
        waitFor,
      });
    } catch (e) {
      log.error('[netcon]: error sending command', command, e);
    }
  }
}
