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
          In order to record demos Autodemo needs to add{' '}
          <code>&#8209;netconport&nbsp;{netConPort}</code> to your CS:GO launch
          options but it failed to do so.
          <br />
          Please add this option manually and restart Autodemo.
        </Body1>
      }
    >
      {props.children}
    </PrerequisitesModal>
  );
}
