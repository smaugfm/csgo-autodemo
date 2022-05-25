import { PropsWithChildren } from 'react';
import { PrerequisitesModal } from './PrerequisitesModal';
import { Body1 } from '../common/typography';

export function FailedToFindCsGo(props: PropsWithChildren<unknown>) {
  const failedToFindCsGo = window.Main.failedToFindCsGo;

  return (
    <PrerequisitesModal
      state={failedToFindCsGo}
      text={
        <Body1>
          It doesn't seem like you have CS:GO installed.
          <br />
          Autodemo is app for automatic demos recording in CS:GO and it needs
          the game😃
        </Body1>
      }
    >
      {props.children}
    </PrerequisitesModal>
  );
}
