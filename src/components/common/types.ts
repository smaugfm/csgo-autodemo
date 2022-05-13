import { SerializedStyles } from '@emotion/react';

export type WithCss<T = unknown> = T & {
  outerCss?: SerializedStyles;
};
