import { ModeMap } from '../gsi/types';

export const modeMapToHuman: Record<ModeMap, string> = {
  scrimcomp2v2: 'wingman',
  casual: 'casual',
  deathmatch: 'deathmatch',
  competitive: 'competitive',
};

export type AutodemoEvents = {
  recordingStarted: (demoName: string) => void;
  recordingStopped: () => void;
};
