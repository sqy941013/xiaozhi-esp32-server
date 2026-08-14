import { useCallback, useEffect, useState } from "react";

export function useCountdown() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds]);

  const start = useCallback((duration = 60) => setSeconds(duration), []);
  const reset = useCallback(() => setSeconds(0), []);

  return { reset, seconds, start };
}
