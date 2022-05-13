export type ConfigSchema = {
  csgoLocation: string;
};

export type Config = {
  read: <K extends keyof ConfigSchema>(
    key: K,
  ) => Promise<Partial<ConfigSchema>[K]>;
  write: <K extends keyof ConfigSchema>(
    key: K,
    value: ConfigSchema[K],
  ) => Promise<void>;
  reset: () => Promise<void>;
};
