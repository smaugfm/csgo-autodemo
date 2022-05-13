export class TimeoutError extends Error {
  name = TimeoutError.name;

  constructor(msg: string, timeout?: number) {
    super(`Timeout exceeded ${timeout}ms. ${msg}`);
  }
}

export class NotificationTimeoutError extends TimeoutError {
  name = NotificationTimeoutError.name;

  constructor(timeout?: number) {
    super(`Notification timed out.`, timeout);
  }
}

export class PrematureSpinWaitEndError extends Error {
  name = PrematureSpinWaitEndError.name;

  constructor() {
    super(`Spin-wait ended due to condition.`);
  }
}

export class UserStoppedError extends Error {
  name = UserStoppedError.name;
}

export class BatchErrorWrapper extends Error {
  name = BatchErrorWrapper.name;
  inner: unknown;
  videoIndex: number;
  filePath: string;

  constructor(inner: unknown, videoIndex: number, filePath: string) {
    super();
    this.inner = inner;
    this.videoIndex = videoIndex;
    this.filePath = filePath;
  }
}

export class CommandStoppedError extends UserStoppedError {
  name = CommandStoppedError.name;

  constructor(cmd: string) {
    super(`Command ${cmd} has been stopped.`);
  }
}

export class ClosedNotificationError extends UserStoppedError {
  name = ClosedNotificationError.name;

  constructor(notificationMessage: string) {
    super(`Closed notification ${notificationMessage}`);
  }
}
