import { CalibrationConfig } from './clicks';
import { BrowserWindow } from 'electron';
import { MainStore } from './store';
import { UnpackArray } from './misc';

export type Throwing = () => void;

export type StopCondition = () => boolean;

export function toStopCondition(checkStopped: Throwing): StopCondition {
  return () => {
    try {
      checkStopped();
      return false;
    } catch {
      return true;
    }
  };
}

export const commandNames = [
  'batch' as const,
  'calibrate' as const,
  'calibratePartial' as const,
  'test' as const,
];

export type Command = UnpackArray<typeof commandNames>;

export type CommandEventType<T = any, TType extends string = string> = {
  type: TType;
} & T;

export type ProgressEvent = CommandEventType<{ percent?: number }, 'progress'>;

export type CommonCommandEvent = ProgressEvent;
export type CommandEvent<T extends CommandEventType = CommonCommandEvent> =
  | CommonCommandEvent
  | T;

export type BatchCommandEvent = CommandEvent<
  | CommandEventType<{ filePath: string }, 'beginFile'>
  | CommandEventType<{ stage: string }, 'stage'>
>;

export type CommandContextMain<
  TArgs = unknown,
  TEvent extends CommandEventType = CommonCommandEvent,
> = {
  args: TArgs;
  store: MainStore;
  window: BrowserWindow;
  fire(event: TEvent | CommonCommandEvent): void;
  checkStopped: Throwing;
};

export type CommandContextRenderer<TResult> = {
  cancel: () => void;
  result: Promise<TResult>;
};

export type BatchCommandArgs = {
  config: CalibrationConfig;
  targetFolder: string;
};
