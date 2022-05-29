import EventEmitter from 'events';
import waitOn from 'wait-on';
import log from 'electron-log';
import TypedEmitter from 'typed-emitter';
import { NetConEvents, RecordingStartError } from './types';
import { delay } from '../../common/util';
import { SendOptions, Telnet } from '../../telnet-client/telnet-client';
import { TimeoutError } from '../../common/types/errors';

export class NetCon extends (EventEmitter as new () => TypedEmitter<NetConEvents>) {
  private connection: Telnet | null = null;
  private isStopping = false;
  private readonly port: number;

  constructor(port: number) {
    super();
    this.port = port;
  }

  public async setupConnectionLoop(): Promise<void> {
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

  public async recordDemo(
    demoName: string,
  ): Promise<RecordingStartError | undefined> {
    log.info(`[netcon] record ${demoName}`);
    let result: RecordingStartError | undefined;
    const timeout = await this.sendCommand(`record ${demoName}`, message => {
      const alreadyRecording = 'Already recording.';
      const waitForRoundOver =
        'Please start demo recording after current round is over.';
      const successRegex = /^Recording to (.*?)\.dem\.\.\.$/m;

      const match = message.match(successRegex);
      if (match) {
        const recordingDemoName = match[1];
        if (recordingDemoName !== demoName) {
          log.error(`[netcon] ${message}`);
          result = RecordingStartError.WrongDemoName;
          return true;
        }
        return true;
      } else {
        if (message.includes(alreadyRecording)) {
          log.warn(`[netcon] ${message}`);
          result = RecordingStartError.AlreadyRecording;
          return true;
        }
        if (message.includes(waitForRoundOver)) {
          log.error(`[netcon] ${message}`);
          result = RecordingStartError.WaitForRoundOver;
          return true;
        }
        return false;
      }
    });

    if (timeout) {
      log.error(`[netcon] record command timed-out`);
      return RecordingStartError.Timeout;
    }

    return result;
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
    const connectionLoop = () => {
      const tryConnect = async () => {
        try {
          log.debug('[netcon]: waitOn');
          await waitOn({
            resources: [`tcp:${this.port}`],
            interval: 500,
            timeout: 1000,
          });
        } catch (e) {
          log.debug('[netcon]: waitOn timed out');
          return !this.isStopping;
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

        return false;
      };

      tryConnect().then(x => {
        if (x) setTimeout(connectionLoop, 1500);
      });
    };

    connectionLoop();
  }

  public async stop(): Promise<void> {
    this.isStopping = true;
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
      log.info('Waiting 10 seconds for connection...');
      await Promise.any([
        new Promise<void>(resolve => {
          this.on('connected', resolve);
        }),
        delay(10000),
      ]);
      return;
    }
    try {
      await this.connection.send(command, {
        waitFor,
      });
      return false;
    } catch (e) {
      if (e instanceof TimeoutError) {
        return true;
      } else {
        log.error('[netcon]: error sending command', command, e);
        return false;
      }
    }
  }
}
