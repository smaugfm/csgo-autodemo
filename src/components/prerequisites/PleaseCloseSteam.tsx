import { PropsWithChildren } from 'react';
import { netConPort } from '../../../electron/common/types/misc';
import { PrerequisitesModal } from './PrerequisitesModal';

export function PleaseCloseSteam(props: PropsWithChildren<unknown>) {
  return (
    <PrerequisitesModal
      state={window.Main.netConPortNeedToCloseSteam}
      text={
        <>
          In order to record demos Autodemo needs to add{' '}
          <code>-netconport {netConPort}</code> to your CS:GO launch options.
          <br />
          Close Steam and restart Autodemo for it to happen automatically.
        </>
      }
    >
      {props.children}
    </PrerequisitesModal>
  );
}
