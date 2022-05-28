export enum RecordingStartError {
  Timeout = 'Timeout',
  WaitForRoundOver = 'WaitForRoundOver',
  WrongDemoName = 'WrongDemoName',
  AlreadyRecording = 'AlreadyRecording',
}

export type NetConEvents = {
  console: (message: string) => void;
  connected: () => void;
  disconnected: () => void;
  connecting: () => void;
};
