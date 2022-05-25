import { PropsWithChildren } from 'react';
import { netConPort } from '../../../electron/common/types/misc';
import { PrerequisitesModal } from './PrerequisitesModal';
import { Body1 } from '../common/typography';

export function FailedToSetNetConPort(props: PropsWithChildren<unknown>) {
  return (
    <PrerequisitesModal
      state={window.Main.netConPortFailed}
      text={
        <Body1>
          Failed to automatically add <code>-netconport {netConPort}</code> to
          your CS:GO launch options.
          <br />
          Please do this manually and restart Autodemo.
        </Body1>
      }
    >
      {props.children}
    </PrerequisitesModal>
  );
}
