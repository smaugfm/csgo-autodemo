import EventEmitter from 'events';
import { Telnet } from 'telnet-client';
import waitOn from 'wait-on';
import log from 'electron-log';

export class NetConnection extends EventEmitter {
  private connection: Telnet | null = null;
  private interval: NodeJS.Timeout | null = null;

  constructor(port: number) {
    super();

    this.reconnect(port);
  }

  private setupDataHandler(connection: Telnet) {
    connection.getSocket().on('data', data => {
      const message = data.toString('utf8').trim();
      log.debug('netcon: ', message);
      this.emit('console', message);
    });
  }

  private setupHandlers(connection: Telnet, port: number) {
    connection.on('connect', () => {
      log.info('[netcon]: connected');
    });
    connection.on('close', () => {
      this.connection?.removeAllListeners();
      this.connection = null;
      log.info('[netcon]: close');

      this.reconnect(port);
    });
  }

  private reconnect(port: number) {
    log.info('[netcon]: connecting...');
    this.interval = setInterval(async () => {
      try {
        await waitOn({
          resources: [`tcp:${port}`],
          interval: 2000,
          timeout: 10000,
        });
      } catch (e) {
        return;
      }

      this.connection = new Telnet();

      this.setupHandlers(this.connection, port);

      await this.connection.connect({
        host: '127.0.0.1',
        port,
        negotiationMandatory: false,
        timeout: 500,
      });

      this.setupDataHandler(this.connection);

      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
    }, 11000);
  }

  async echo(message: string) {
    log.info(`[console] ${message}`);
    await this.sendCommand(`echo [clipper] ${message}`);
  }

  playDemo = async (demoPath: string) =>
    this.sendCommand(`playdemo "${demoPath}"`);

  recordDemo = async (demoName: string) =>
    this.sendCommand(`record "${demoName}"`);

  stopRecordingDemo = async () => this.sendCommand(`stop`);

  private async sendCommand(command: string) {
    if (!this.connection) {
      log.info(`NetCon disconnected: skipping sending command ${command}`);
      return;
    }

    try {
      log.info(`NetCon: sending command ${command}`);
      return await this.connection.exec(command);
    } catch (e) {
      log.error('NetCon: error sending command', command, e);
    }
  }
}
