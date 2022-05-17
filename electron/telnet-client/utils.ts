export type Callback<T> = (err: any, value?: T) => void;

export function asCallback<T>(
  promise: Promise<T>,
  callback?: Callback<T>,
): Promise<T> {
  if (typeof callback === 'function')
    promise.then(result => callback(null, result)).catch(err => callback(err));

  return promise;
}

export function search(str: string, pattern: RegExp | string): number {
  if (!str || !pattern) return -1;
  else if (pattern instanceof RegExp) return str.search(pattern);
  else return str.indexOf(pattern);
}
