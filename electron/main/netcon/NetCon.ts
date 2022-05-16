import EventEmitter from 'events';
import { Telnet } from 'telnet-client';
import waitOn from 'wait-on';
import log from 'electron-log';
import TypedEmitter from 'typed-emitter';
import { NetConEvents } from './types';

export class NetCon extends (EventEmitter as new () => TypedEmitter<NetConEvents>) {
  private connection: Telnet | null = null;
  private interval: NodeJS.Timeout | null = null;
  private isStopping: boolean = false;
  private readonly port: number;

  constructor(port: number) {
    super();
    this.port = port;
  }

  public connect(): Promise<void> {
    this.reconnect();
    return new Promise<void>(resolve => {
      this.on('connected', resolve);
    });
  }

  public get connected() {
    return !!this.connection;
  }

  public async echo(message: string) {
    log.info(`netcon[echo] ${message}`);
    await this.sendCommand(`echo ${message}`);
  }

  public recordDemo = async (
    demoName: string,
    listener?: (message: string) => void,
  ) => {
    return this.sendCommand(`record "${demoName}"`, listener);
  };

  public async stopRecordingDemo(listener?: (message: string) => void) {
    return this.sendCommand(`stop`, listener);
  }

  private setupDataHandler(connection: Telnet) {
    connection.on('data', data => {
      const message = data.toString('utf8').trim();
      log.debug('netcon[console]: ', message);
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
        execTimeout: 500,
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

  private async sendCommand(
    command: string,
    listener?: (message: string) => void,
  ) {
    if (!this.connection) {
      log.info(`NetCon is disconnected: cannot send command ${command}`);
      return;
    }
    //
    // if (listener) this.on('console', listener);
    //
    try {
      return await this.connection.exec(command);
    } catch (e) {
      log.error('NetCon: error sending command', command, e);
      // if (listener) this.removeListener('console', listener);
    }
  }
}
