import EventEmitter from 'events';
import { Telnet } from 'telnet-client';
import waitOn from 'wait-on';
import log from 'electron-log';

export class NetConnection extends EventEmitter {
  private connection = new Telnet();
  private connected = false;

  async connect(port: number) {
    await this.stop();

    try {
      await waitOn({
        resources: [`tcp:${port}`],
        interval: 100,
        timeout: 90000,
        window: 500,
      });
    } catch (e) {
      throw new Error('Failed to connect to CSGO');
    }

    await this.connection.connect({
      host: '127.0.0.1',
      port,
      negotiationMandatory: false,
      timeout: 1500,
    });

    this.connection.getSocket().on('data', data => {
      const message = data.toString('utf8').trim();
      this.emit('console', message);
    });
    this.connection.on('ready', () => {
      log.info('NetConnection ready');
    });
    this.connection.on('close', () => {
      log.info('NetConnection close');
    });
    this.connection.on('end', () => {
      log.info('NetConnection end');
    });

    this.connected = true;

    log.info('Initialized NetConnection');
  }

  async stop() {
    await this.removeAllListeners();

    if (this.connected) {
      await this.connection.end();
      this.connected = false;
      log.info('Closed CSGO connection');
    }
  }

  async echo(message: string) {
    log.info(`[console] ${message}`);
    await this.sendCommand(`echo [clipper] ${message}`);
  }

  private async sendCommand(command: string) {
    try {
      log.info(`NetCond: sending command ${command}`);
      return await this.connection.exec(command);
    } catch (e) {
      log.error('NetCon: error sending command', command, e);
    }
  }

  playDemo = async (demoPath: string) => {
    await this.sendCommand(`playdemo "${demoPath}"`);
  };

  recordDemo = async (demoName: string) => {
    await this.sendCommand(`record "${demoName}"`);
  };

  stopRecordingDemo = async () => {
    await this.sendCommand(`stop`);
  };
}
