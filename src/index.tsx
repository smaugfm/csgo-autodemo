/// <reference types="@emotion/react/types/css-prop" />
import '@fontsource/roboto';
import { css, Global } from '@emotion/react';
import { createRoot } from 'react-dom/client';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useEffect, useMemo, useState } from 'react';
import { PaletteMode, Paper } from '@mui/material';
import { GsiInstalled } from './components/prerequisites/GsiInstalled';
import { PleaseCloseSteam } from './components/prerequisites/PleaseCloseSteam';
import { FailedToSetNetConPort } from './components/prerequisites/FailedToSetNetConPort';
import { NetConPortAlreadyPresent } from './components/prerequisites/NetConPortAlreadyPresent';

function initialThemeMode(): PaletteMode {
  const isDark =
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  return isDark ? 'dark' : 'light';
}

export function Root() {
  const [mode, setMode] = useState(initialThemeMode());

  useEffect(() => {
    window.Main.theming.themeChanged(setMode);
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        typography: {
          fontSize: 22,
        },
        palette: {
          mode,
          primary: {
            main: '#3F51B5',
          },
          secondary: {
            main: '#fbc02d',
          },
        },
      }),
    [mode],
  );

  const globalStyles = css`
    html,
    body {
      overflow-x: hidden;
      margin: 0;
      border: 0;
      padding: 0;
      background: ${theme.palette.background.paper};
    }
  `;

  return (
    <ThemeProvider theme={theme}>
      <Global styles={globalStyles} />
      <Paper
        css={css`
          height: calc(100vh - ${theme.spacing(8)});
          width: calc(100vw - ${theme.spacing(8)});
          padding: ${theme.spacing(4)};
        `}
      >
        <GsiInstalled>
          <NetConPortAlreadyPresent>
            <PleaseCloseSteam>
              <FailedToSetNetConPort>
                <></>
              </FailedToSetNetConPort>
            </PleaseCloseSteam>
          </NetConPortAlreadyPresent>
        </GsiInstalled>
      </Paper>
    </ThemeProvider>
  );
}

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<Root />);
