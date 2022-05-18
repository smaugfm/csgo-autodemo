import TypedEmitter, { EventMap } from 'typed-emitter';

let isFunction = function (obj: any) {
  return typeof obj == 'function' || false;
};

export class TestEventEmitter<Events extends EventMap>
  implements TypedEmitter<Events>
{
  private handlers: Map<keyof Events, Events[keyof Events][]>;

  constructor() {
    this.handlers = new Map();
  }

  addListener<E extends keyof Events>(label: E, callback: Events[E]) {
    this.handlers.has(label) || this.handlers.set(label, []);
    this.handlers.get(label)?.push(callback);

    return this;
  }

  once<E extends keyof Events>(event: E, listener: Events[E]): this {
    return this.on(event, this.createOnceWrapper(event, listener));
  }

  prependOnceListener<E extends keyof Events>(
    event: E,
    listener: Events[E],
  ): this {
    return this.prependListener(event, this.createOnceWrapper(event, listener));
  }

  private createOnceWrapper<E extends keyof Events>(
    event: E,
    listener: Events[E],
  ) {
    let onceListener: Events[E];
    return (args => {
      listener(args);
      this.removeListener(event, onceListener);
    }) as Events[E];
  }

  rawListeners<E extends keyof Events>(event: E): Events[E][] {
    throw new Error('Not implemented');
  }

  prependListener<E extends keyof Events>(event: E, listener: Events[E]): this {
    this.handlers.has(event) || this.handlers.set(event, []);
    this.handlers.get(event)?.unshift(listener);

    return this;
  }

  removeListener<E extends keyof Events>(label: E, callback: Events[E]) {
    let listeners = this.handlers.get(label),
      index;

    if (listeners && listeners.length) {
      index = listeners.reduce((i, listener, index) => {
        return isFunction(listener) && listener === callback ? (i = index) : i;
      }, -1);

      if (index > -1) {
        listeners.splice(index, 1);
        this.handlers.set(label, listeners);
        return this;
      }
    }
    return this;
  }

  emit<E extends keyof Events>(
    label: E,
    ...args: Parameters<Events[E]>
  ): boolean {
    let listeners = this.handlers.get(label);

    if (listeners && listeners.length) {
      for (const listener of listeners) {
        listener(...args);
      }
      return true;
    }
    return false;
  }

  async emitAwait<E extends keyof Events>(
    label: E,
    ...args: Parameters<Events[E]>
  ): Promise<boolean> {
    let listeners = this.handlers.get(label);

    if (listeners && listeners.length) {
      for (const listener of listeners) {
        await listener(...args);
      }
      return true;
    }
    return false;
  }

  eventNames(): (keyof Events | string | symbol)[] {
    return [...this.handlers.keys()];
  }

  getMaxListeners(): number {
    return Number.MAX_SAFE_INTEGER;
  }

  listenerCount<E extends keyof Events>(event: E): number {
    return this.handlers.get(event)?.length ?? 0;
  }

  listeners<E extends keyof Events>(event: E): Events[E][] {
    return (this.handlers.get(event) as Events[E][]) ?? [];
  }

  off<E extends keyof Events>(event: E, listener: Events[E]): this {
    return this.removeListener(event, listener);
  }

  on<E extends keyof Events>(event: E, listener: Events[E]): this {
    return this.addListener(event, listener);
  }

  removeAllListeners<E extends keyof Events>(event?: E): this {
    this.handlers.clear();
    return this;
  }

  setMaxListeners(maxListeners: number): this {
    return this;
  }
}
