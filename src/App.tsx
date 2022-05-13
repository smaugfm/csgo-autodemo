import { useAsync } from 'react-use';

export function App() {
  const state = useAsync(() => window.Main.config.read('csgoLocation'), []);

  return <div>Csgo location: {state.value}</div>;
}
