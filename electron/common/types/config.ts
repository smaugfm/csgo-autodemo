export type ModeMap = "competitive" | "casual" | "deathmatch" | "wingman";

export type ConfigSchema = {
  gameModes: ModeMap[];
  demosPath: string;
};

export type Config = {
  read: <K extends keyof ConfigSchema>(
    key: K,
  ) => Promise<ConfigSchema[K]>;
  write: <K extends keyof ConfigSchema>(
    key: K,
    value: ConfigSchema[K],
  ) => Promise<void>;
  reset: () => Promise<void>;
};

export type MainWindowArg =
  | 'gsiInstalled'
  | 'netConPortNeedToCloseSteam'
  | 'netConPortFailed';
