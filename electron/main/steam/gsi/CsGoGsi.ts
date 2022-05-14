import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import log from 'electron-log';
import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';
import { AddressInfo } from 'net';
import { CsGoGsiEVents } from './types';

export class CsGoGsi extends (EventEmitter as new () => TypedEmitter<CsGoGsiEVents>) {
  private readonly authToken;
  private readonly bombTime = 40;
  private isBombPlanted;
  private bombTimer?: NodeJS.Timer;
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
    this.isBombPlanted = false;
    this.bombTimer = undefined;
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
          if (this.isBombPlanted) {
            this.isBombPlanted = false;
            this.stopC4Countdown();
          }

          this.emit('roundWinTeam', data.round.win_team);
          break;
      }

      if (data.round.bomb) {
        this.emit('bombState', data.round.bomb);
        switch (data.round.bomb) {
          case 'planted':
            if (!this.isBombPlanted) {
              this.isBombPlanted = true;
              const timeleft =
                this.bombTime -
                (new Date().getTime() / 1000 - data.provider.timestamp);
              this.emit('bombTimeStart', timeleft);
              this.startC4Countdown(timeleft);
            }

            break;
          case 'defused':
            this.emit('bombDefused');
            this.isBombPlanted = false;
            this.stopC4Countdown();
            break;
          case 'exploded':
            this.emit('bombExploded');
            this.isBombPlanted = false;
            this.stopC4Countdown();
            break;
        }
      }
    }
  }

  stopC4Countdown() {
    if (this.bombTimer) {
      clearInterval(this.bombTimer);
      this.bombTimer = undefined;
    }
  }

  startC4Countdown(timeLeft: number) {
    this.bombTimer = setInterval(() => {
      timeLeft = timeLeft - 1;
      if (timeLeft <= 0) {
        this.stopC4Countdown();
        this.isBombPlanted = false;
        return;
      }

      this.emit('bombTimeLeft', timeLeft);
    }, 1000);
  }
}
