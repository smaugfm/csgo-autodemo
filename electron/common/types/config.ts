export type ConfigSchema = {
  dummy: boolean;
};

export type Config = {
  read: <K extends keyof ConfigSchema>(key: K) => Promise<ConfigSchema[K]>;
  write: <K extends keyof ConfigSchema>(
    key: K,
    value: ConfigSchema[K],
  ) => Promise<void>;
  reset: () => Promise<void>;
};

export type MainWindowArg =
  | 'failedToFindSteam'
  | 'failedToFindCsGo'
  | 'gsiNotInstalled'
  | 'netConPortNeedToCloseSteam'
  | 'netConPortFailed';
