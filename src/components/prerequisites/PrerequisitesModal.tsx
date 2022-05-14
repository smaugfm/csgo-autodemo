import { ReactNode, PropsWithChildren, useState } from 'react';
import { useTheme } from '@mui/material';
import { Column } from '../common/layout';
import { css } from '@emotion/react';
import { H6 } from '../common/typography';

interface Props {
  state: boolean;
  text: ReactNode;
  other?: ReactNode;
}

export function PrerequisitesModal(props: PropsWithChildren<Props>) {
  const [state] = useState(props.state);
  const theme = useTheme();

  return (
    <>
      {state ? (
        <Column
          css={css`
            height: 100%;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          `}
        >
          <H6
            css={css`
              text-align: center;
              margin-bottom: ${theme.spacing(2)};
            `}
          >
            {props.text}
          </H6>
          {props.other}
        </Column>
      ) : (
        props.children
      )}
    </>
  );
}
