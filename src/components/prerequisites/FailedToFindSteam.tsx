import { PropsWithChildren } from 'react';
import { PrerequisitesModal } from './PrerequisitesModal';
import { Body1 } from '../common/typography';

export function FailedToFindSteam(props: PropsWithChildren<unknown>) {
  const failedToFindSteam = window.Main.failedToFindSteam;

  return (
    <PrerequisitesModal
      state={failedToFindSteam}
      text={
        <Body1>
          Failed to find Steam installation.
          <br />
          Please ensure that you have a Steam installed on your machine.
        </Body1>
      }
    >
      {props.children}
    </PrerequisitesModal>
  );
}
