import { Notification } from 'electron';
import {
  DEFAULT_FIRE_NOTIFICATION_TIMEOUT,
  DEFAULT_NOTIFICATION_TIMEOUT,
} from '../../common/types/constants';
import {
  ClosedNotificationError,
  NotificationTimeoutError,
} from '../../common/types/errors';
import log from 'electron-log';

export type NotificationRequest = {
  message: string;
  timeout?: number;
  reply?: boolean;
  ignoreClose?: boolean;
  ignoreTimeout?: boolean;
};

export function fireOsNotification(message: string, noTimeout?: boolean) {
  void osNotification({
    message,
    ignoreTimeout: true,
    timeout: noTimeout
      ? Number.MAX_SAFE_INTEGER
      : DEFAULT_FIRE_NOTIFICATION_TIMEOUT,
  });
}

export async function osNotification(
  message: NotificationRequest | string,
): Promise<
  typeof message extends NotificationRequest
    ? typeof message['reply'] extends true
      ? string
      : void
    : void
> {
  const request: NotificationRequest =
    typeof message === 'string'
      ? {
          message,
          reply: false,
          timeout: DEFAULT_NOTIFICATION_TIMEOUT,
        }
      : message;

  const notification = new Notification({
    title: 'Autodemo',
    body: request.message,
    hasReply: request.reply,
    timeoutType: 'never',
  });

  return new Promise((resolve, reject) => {
    log.info('Sending notification: ', notification.body);
    notification.show();

    let settled = false;

    let timedOut = false;
    let timeoutHandle: NodeJS.Timeout | undefined;
    let stopInterval: NodeJS.Timeout | undefined;
    if (request.timeout && !request.ignoreTimeout) {
      timeoutHandle = setTimeout(() => {
        timedOut = true;
        log.info('Notification timed out.');
        if (!settled) {
          notification.close();
        }
      }, request.timeout);
    }

    const resolvePromise = (...args: any[]) => {
      settled = true;
      if (timeoutHandle) clearTimeout(timeoutHandle);
      if (stopInterval) clearTimeout(stopInterval);
      resolve(...args);
    };

    const rejectPromise = (reason?: any) => {
      settled = true;
      if (timeoutHandle) clearTimeout(timeoutHandle);
      if (stopInterval) clearTimeout(stopInterval);
      reject(reason);
    };

    notification.on('show', () => {
      log.info('Notification has been shown: ', request.message);
    });
    notification.on('action', () => {
      log.info('Notification event "action".');
      resolvePromise();
    });
    notification.on('reply', (e, reply) => {
      log.info('Notification event "reply": ', reply);
      if (request.reply) {
        resolvePromise(reply as any);
      }
    });
    notification.on('failed', (e, error) => {
      log.error('Notification failed');
      rejectPromise(new Error(error));
    });
    notification.on('close', () => {
      log.warn('Notification closed');
      if (timedOut)
        rejectPromise(new NotificationTimeoutError(request.timeout));
      else if (request.ignoreClose) resolvePromise();
      else rejectPromise(new ClosedNotificationError(request.message));
    });
    notification.on('click', () => {
      log.info('Notification clicked');
      resolvePromise();
    });
  });
}
