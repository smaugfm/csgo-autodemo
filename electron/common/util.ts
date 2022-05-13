import { Throwing, toStopCondition } from './types/commands';
import { DEFAULT_CONDITION_DELAY, DEFAULT_TIMEOUT } from './types/constants';
import { PrematureSpinWaitEndError, TimeoutError } from './types/errors';
import prettyMilliseconds from 'pretty-ms';
import { SpinWaitResult } from './types/misc';

export const truthy = <T>(item: T): item is NonNullable<T> => !!item;

export const emailRegex =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

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
  checkStopped: Throwing,
  cleanup?: () => void,
  timeout = DEFAULT_TIMEOUT,
) {
  return spinWaitPromiseGeneral(
    mainPromise,
    toStopCondition(checkStopped),
    cleanup,
    timeout,
  );
}

export function isDev() {
  return process.env.NODE_ENV !== 'production';
}

export function formatPlural(
  count: number,
  singular: string,
  plural = `${singular}s`,
) {
  if (count === 1) return singular;
  return plural;
}

export function getBatchFinishText(videosCount: number, elapsedMs: number) {
  return `Finished stabilizing ${videosCount} ${formatPlural(
    videosCount,
    'video',
  )} in ${formatMs(elapsedMs)}.`;
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

export function euclideanColorDistance(color2: string, color1: string) {
  const r1 = parseInt(color1.substring(0, 2), 16);
  const g1 = parseInt(color1.substring(2, 4), 16);
  const b1 = parseInt(color1.substring(4, 6), 16);

  const r2 = parseInt(color2.substring(0, 2), 16);
  const g2 = parseInt(color2.substring(2, 4), 16);
  const b2 = parseInt(color2.substring(4, 6), 16);

  return Math.sqrt(
    Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2),
  );
}
