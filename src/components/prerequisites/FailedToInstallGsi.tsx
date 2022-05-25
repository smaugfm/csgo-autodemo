import { PropsWithChildren } from 'react';
import { Button } from '@mui/material';
import { Download } from '@mui/icons-material';
import { PrerequisitesModal } from './PrerequisitesModal';
import { Body1 } from '../common/typography';

export function FailedToInstallGsi(props: PropsWithChildren<unknown>) {
  return (
    <PrerequisitesModal
      state={window.Main.gsiNotInstalled}
      text={
        <Body1>
          Failed to locate CS:GO installation. <br />
          Please manually put this file to <b>csgo\cfg</b> under your CS:GO
          installation folder and restart the app:
        </Body1>
      }
      other={
        <Button
          onClick={window.Main.ipc.saveGsiFileDialog}
          variant="outlined"
          startIcon={<Download />}
        >
          gamestate_integration_autodemo.cfg
        </Button>
      }
    >
      {props.children}
    </PrerequisitesModal>
  );
}
