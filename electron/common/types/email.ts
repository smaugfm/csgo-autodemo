export type Email = {
  title?: string;
  text: string;
};

export type EmailNotificator = (email: Email) => Promise<unknown>;

export type GetEmailNotificator<T> = (config: T) => Promise<EmailNotificator>;

export type NodemailerConfig = {
  host: string;
  port: number;
  secure: boolean;

  auth: {
    user: string;
    pass: string;
  };
  defaults: {
    from: string;
    to: string;
  };
};

export const emptyNodemailerConfig: NodemailerConfig = {
  host: '',
  port: '' as any,
  secure: true,

  auth: {
    user: '',
    pass: '',
  },
  defaults: {
    from: '',
    to: '',
  },
};
