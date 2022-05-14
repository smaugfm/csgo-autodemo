export const netConPort = 13331;
export const gsiPort = 13337;

export type SpinWaitResult<T> =
  | {
      status: 'main';
      result: T;
    }
  | {
      status: 'spin';
      result: boolean;
    };
