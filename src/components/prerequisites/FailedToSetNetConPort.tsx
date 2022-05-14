import { PropsWithChildren } from 'react';
import { netConPort } from '../../../electron/common/types/misc';
import { PrerequisitesModal } from './PrerequisitesModal';

export function FailedToSetNetConPort(props: PropsWithChildren<unknown>) {
  return (
    <PrerequisitesModal
      state={window.Main.netConPortFailed}
      text={
        <>
          Failed to automatically add <code>-netconport {netConPort}</code> to
          your CS:GO launch options.
          <br />
          Please do this manually and restart Autodemo.
        </>
      }
    >
      {props.children}
    </PrerequisitesModal>
  );
}
