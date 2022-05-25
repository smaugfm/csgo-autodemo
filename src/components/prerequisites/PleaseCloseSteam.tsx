import { PropsWithChildren } from 'react';
import { netConPort } from '../../../electron/common/types/misc';
import { PrerequisitesModal } from './PrerequisitesModal';
import { Body1 } from '../common/typography';

export function PleaseCloseSteam(props: PropsWithChildren<unknown>) {
  return (
    <PrerequisitesModal
      state={window.Main.netConPortNeedToCloseSteam}
      text={
        <Body1>
          In order to record demos Autodemo needs to add{' '}
          <code>&#8209;netconport&nbsp;{netConPort}</code> to your CS:GO launch
          options.
          <br />
          Please restart Autodemo with Steam for this option to be added
          automatically.
        </Body1>
      }
    >
      {props.children}
    </PrerequisitesModal>
  );
}
