"use client";

import { useSearchParams } from "next/navigation";
import { useLayoutEffect, useRef } from "react";
import CircularProgress from "@mui/material/CircularProgress";

const GoogleCallback = () => {
  const ready = useRef(false);
  const searchParams = useSearchParams();
  const code = searchParams?.get("code");
  const error = searchParams?.get("error");

  useLayoutEffect(() => {
    const opener = window.opener.location.href;

    if (opener && !ready.current && (code || error)) {
      ready.current = true;
      window.opener.postMessage({ 
        type: "google-callback", 
        payload: {
          code: code as string,
          error: error as string,
        }
      }, opener);
      window.close();
    }
  }, [code, error]);

  return (
    <div className="h-full grid place-items-center">
      <CircularProgress />
    </div>
  );
};

export default GoogleCallback;
