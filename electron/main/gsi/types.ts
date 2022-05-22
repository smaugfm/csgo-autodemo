import { GameState } from 'csgo-gsi-types';

export type ModeMap = 'scrimcomp2v2' | 'casual' | 'deathmatch' | 'competitive';

export type GsiEvents = {
  all: (data: Partial<GameState>) => void;
  gameMap: (name: Required<GameState>['map']['name']) => void;
  gameMode: (name: ModeMap) => void;
  gamePhase: (phase: Required<GameState>['map']['phase']) => void;
  gameRounds: (round: Required<GameState>['map']['round']) => void;
  gameCTscore: (team: Required<GameState>['map']['team_ct']) => void;
  gameTscore: (team: Required<GameState>['map']['team_t']) => void;
  roundWins: (roundWins: Required<GameState>['map']['round_wins']) => void;
  player: (player: Required<GameState>['player']) => void;
  roundPhase: (phase: Required<GameState>['round']['phase']) => void;
  roundWinTeam: (winTeam: Required<GameState>['round']['win_team']) => void;
  bombState: (bomb: Required<GameState>['round']['bomb']) => void;
  bombPlanted: () => void;
  bombDefused: () => void;
  bombExploded: () => void;
};
