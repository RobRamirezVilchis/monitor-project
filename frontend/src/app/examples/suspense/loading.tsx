"use client";

import { CircularProgress } from "@mui/material";

const Loading = () => {

  return (
    <div className="grid place-items-center h-full">
      <CircularProgress />
    </div>
  )
}

export default Loading;