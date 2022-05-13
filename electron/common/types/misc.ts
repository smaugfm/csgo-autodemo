export type SpinWaitResult<T> =
  | {
      status: 'main';
      result: T;
    }
  | {
      status: 'spin';
      result: boolean;
    };
