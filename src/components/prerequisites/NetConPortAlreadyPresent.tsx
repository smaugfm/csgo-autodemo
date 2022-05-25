import { PropsWithChildren } from 'react';
import { netConPort } from '../../../electron/common/types/misc';
import { PrerequisitesModal } from './PrerequisitesModal';
import { Body1, Body2 } from '../common/typography';
import { css } from '@emotion/react';
import { useTheme } from '@mui/material';

export function NetConPortAlreadyPresent(props: PropsWithChildren<unknown>) {
  const existingPort = window.Main.netConPortAlreadyPresent;
  const theme = useTheme();

  return (
    <PrerequisitesModal
      state={!!existingPort}
      text={
        <>
          <Body1>
            In order to record demos Autodemo needs to add&nbsp;
            <code>&#8209;netconport&nbsp;{netConPort}</code> to your CS:GO
            launch options.
            <br />
            But you already have such an option but with a different port:{' '}
            <code>&#8209;netconport&nbsp;{existingPort}</code> <br />
            Please remove current option and restart Autodemo.
            <br />
            <br />
            <br />
          </Body1>
          <Body2
            css={css`
              color: ${theme.palette.text.secondary};
            `}
          >
            Currently, Autodemo does not provide a way to specify a different{' '}
            <code>netconport</code>, but you can create an issue for this at{' '}
            <a href="https://github.com/smaug-fm/csgo-autodemo" target="_blank">
              Github
            </a>
            .
          </Body2>
        </>
      }
    >
      {props.children}
    </PrerequisitesModal>
  );
}
