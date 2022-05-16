export interface SteamLibraryFolder {
  path: string;
  apps: Record<number, number>;
}

export interface SteamLoginUser {
  AccountName: string;
  PersonaName: string;
  MostRecent: number;
}
