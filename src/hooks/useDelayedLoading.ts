import { useEffect, useRef, useState } from 'react';
import { delay } from '../../electron/common/util';

export function useDelayedLoading(externalLoading: boolean) {
  const [loading, setLoading] = useState(false);

  const ref = useRef(externalLoading);
  useEffect(() => {
    ref.current = externalLoading;
    if (externalLoading) {
      delay(100).then(() => {
        if (ref.current) setLoading(true);
      });
    } else {
      setLoading(false);
    }
  }, [externalLoading]);

  return loading;
}
