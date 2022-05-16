
export type NetConEvents = {
  console: (message: string) => void;
  connected: () => void;
  disconnected: () => void;
  connecting: () => void;
}
