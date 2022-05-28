import { GameState } from 'csgo-gsi-types';
import PhaseRound = __GSICSGO.PhaseRound;

export type ModeMap = 'scrimcomp2v2' | 'casual' | 'deathmatch' | 'competitive';

export type GsiEvents = {
  all: (data: Partial<GameState>) => void;
  gameLive: (mapName: string, gameMode: string) => void;
  roundPhase: (
    mapName: string | undefined,
    gameMode: string | undefined,
    phase: Exclude<PhaseRound, 'over'>,
  ) => void;
};
