import { NextPage } from "next";
import { useRouter } from "next/router";
import { useLayoutEffect, useRef } from "react";
import CircularProgress from "@mui/material/CircularProgress";

const GoogleCallback: NextPage = () => {
  const ready = useRef(false);
  const router = useRouter();

  useLayoutEffect(() => {
    const opener = window.opener.location.href;
    const { code, error } = router.query;

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
  }, [router.query]);

  return (
    <div className="h-full grid place-items-center">
      <CircularProgress />
    </div>
  );
};

export default GoogleCallback;