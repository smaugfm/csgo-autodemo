import { useCallback, useState } from 'react';

export function useBooleanState(
  initial = false,
): [boolean, () => void, () => void] {
  const [state, setState] = useState<boolean>(initial);

  const on = useCallback(() => {
    setState(true);
  }, []);
  const off = useCallback(() => {
    setState(false);
  }, []);

  return [state, on, off];
}
