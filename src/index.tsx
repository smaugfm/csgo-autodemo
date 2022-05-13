/// <reference types="@emotion/react/types/css-prop" />
import "@fontsource/roboto";
import { css, Global } from "@emotion/react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import { PaletteMode, Paper } from "@mui/material";

function initialThemeMode(): PaletteMode {
  const isDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  return isDark ? "dark" : "light";
}

export function Root() {
  const [mode, setMode] = useState(initialThemeMode());

  useEffect(() => {
    window.Main.theming.themeChanged(setMode);
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: "#3F51B5"
          },
          secondary: {
            main: "#fbc02d"
          }
        }
      }),
    [mode]
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
      <Paper css={css`
        height: 100vh;
        width: 100vw;
      `}>
        <App />
      </Paper>
    </ThemeProvider>
  );
}

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<Root />);
