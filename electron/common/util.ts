import { DEFAULT_CONDITION_DELAY, DEFAULT_TIMEOUT } from './types/constants';
import { PrematureSpinWaitEndError, TimeoutError } from './types/errors';
import prettyMilliseconds from 'pretty-ms';
import { SpinWaitResult } from './types/misc';

export const truthy = <T>(item: T): item is NonNullable<T> => !!item;

export function formatMs(ms: number, compact?: boolean) {
  return prettyMilliseconds(ms, {
    secondsDecimalDigits: 0,
    millisecondsDecimalDigits: 0,
    verbose: true,
    compact,
  });
}

export async function spinWaitPromise<T>(
  mainPromise: Promise<T>,
  stopCondition: () => boolean,
  cleanup?: () => void,
  timeout = DEFAULT_TIMEOUT,
) {
  return spinWaitPromiseGeneral(mainPromise, stopCondition, cleanup, timeout);
}

export function isDev() {
  return process.env.NODE_ENV !== 'production';
}

export async function spinWaitPromiseGeneral<T>(
  mainPromise: Promise<T>,
  stopCondition: () => boolean,
  cleanup?: () => void,
  timeout = DEFAULT_TIMEOUT * 2,
): Promise<T> {
  let mainFinished = false;
  const { result, status } = await Promise.race([
    mainPromise.then(result => {
      mainFinished = true;
      return {
        result,
        status: 'main',
      } as SpinWaitResult<T>;
    }),
    waitForCondition(timeout, () => mainFinished || stopCondition()).then(
      result =>
        ({
          result,
          status: 'spin',
        } as SpinWaitResult<T>),
    ),
  ]);

  if (status === 'main') return result as T;

  cleanup?.();
  if (result) {
    throw new PrematureSpinWaitEndError();
  } else {
    throw new TimeoutError(`Spin-wait timed out.`, timeout);
  }
}

export function delay(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export async function waitForCondition(
  timeout: number,
  check: (iteration: number) => Promise<boolean> | boolean,
): Promise<boolean> {
  let isTimeout = false;
  setTimeout(() => {
    isTimeout = true;
  }, timeout);
  let iteration = 0;
  // eslint-disable-next-line
  while (!(await check(iteration++)) && !isTimeout) {
    await delay(DEFAULT_CONDITION_DELAY);
  }

  return !isTimeout;
}
