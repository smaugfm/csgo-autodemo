import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import log from 'electron-log';
import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';
import { AddressInfo } from 'net';
import { GsiEvents } from './types';
import { GameState } from 'csgo-gsi-types';

export class Gsi extends (EventEmitter as new () => TypedEmitter<GsiEvents>) {
  private readonly authToken;
  private readonly app: Server;
  private prevState: Partial<GameState> | undefined;

  constructor(port: number, authToken: string) {
    super();
    this.authToken = authToken;
    this.app = createServer((req: IncomingMessage, res: ServerResponse) => {
      if (req.method !== 'POST') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('404 Not Found');
      }

      let body = '';
      req.on('data', data => {
        body += data;
      });

      req.on('end', () => {
        this.processJson(body);
        return res.writeHead(200).end();
      });
    }).listen(port, () => {
      const address = this.app.address() as AddressInfo;
      log.info(`GSI: server listening on ${address.address}:${address.port}`);
    });
  }

  processJson(body: string) {
    try {
      const data = JSON.parse(body) as Partial<GameState>;
      if (!this.isAuthenticated(data)) {
        log.error('GSI: Unauthenticated POST request ', data);
        return;
      }

      this.emit('all', data);
      this.process(data);
    } catch (error) {
      log.error('GSI: Error processing json ', error);
    }
  }

  isAuthenticated(data: any) {
    return data.auth.token === this.authToken;
  }

  process(state: Partial<GameState>) {
    if (!this.prevState?.map && state.map) {
      log.info(`[gsi] Game ${state.map.mode} on ${state.map.name} begins`);
      this.emit('gameLive', state.map.name, state.map.mode);
    }
    if (state.round?.phase && state.round?.phase !== 'over') {
      log.info(`[gsi] Round ${state.map?.round} begins`);
      this.emit(
        'roundPhase',
        state.map?.name,
        state.map?.mode,
        state.round.phase,
      );
    }

    this.prevState = state;
  }
}
