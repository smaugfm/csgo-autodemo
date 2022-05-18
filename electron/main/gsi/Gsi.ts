import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import log from 'electron-log';
import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';
import { AddressInfo } from 'net';
import { GsiEvents } from './types';

export class Gsi extends (EventEmitter as new () => TypedEmitter<GsiEvents>) {
  private readonly authToken;
  private readonly bombTime = 40;
  private readonly app: Server;

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

    this.bombTime = 40;
  }

  processJson(body: string) {
    try {
      const data = JSON.parse(body);
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

  process(data: any) {
    if (data.map) {
      this.emit('gameMap', data.map.name);
      this.emit('gamePhase', data.map.phase); // warmup etc
      this.emit('gameRounds', data.map.round);
      this.emit('gameCTscore', data.map.team_ct);
      this.emit('gameTscore', data.map.team_t);
      this.emit('roundWins', data.map.round_wins);
    }

    if (data.player) {
      this.emit('player', data.player);
    }

    if (data.round) {
      this.emit('roundPhase', data.round.phase);
      switch (data.round.phase) {
        case 'live':
          break;
        case 'freezetime':
          break;
        case 'over':
          this.emit('roundWinTeam', data.round.win_team);
          break;
      }

      if (data.round.bomb) {
        this.emit('bombState', data.round.bomb);
        switch (data.round.bomb) {
          case 'planted':
            this.emit('bombPlanted');
            break;
          case 'defused':
            this.emit('bombDefused');
            break;
          case 'exploded':
            this.emit('bombExploded');
            break;
        }
      }
    }
  }
}
