import { useCallback, useEffect, useRef, useState } from "react";

import { getCaptcha } from "@/features/auth/auth-api";
import { createCaptchaId } from "@/features/auth/auth-utils";

export function useCaptcha() {
  const objectUrl = useRef<string | null>(null);
  const mounted = useRef(false);
  const requestSequence = useRef(0);
  const [captchaId, setCaptchaId] = useState("");
  const [captchaUrl, setCaptchaUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    const requestId = ++requestSequence.current;
    setLoading(true);
    setError(false);

    try {
      const nextId = createCaptchaId();
      setCaptchaId(nextId);
      const blob = await getCaptcha(nextId);
      if (!mounted.current || requestId !== requestSequence.current) return;
      const nextUrl = URL.createObjectURL(blob);
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
      objectUrl.current = nextUrl;
      setCaptchaUrl(nextUrl);
    } catch {
      if (!mounted.current || requestId !== requestSequence.current) return;
      setCaptchaId("");
      setError(true);
      setCaptchaUrl("");
    } finally {
      if (mounted.current && requestId === requestSequence.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => {
      mounted.current = false;
      requestSequence.current += 1;
      window.clearTimeout(timer);
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    };
  }, [refresh]);

  return { captchaId, captchaUrl, error, loading, refresh };
}
