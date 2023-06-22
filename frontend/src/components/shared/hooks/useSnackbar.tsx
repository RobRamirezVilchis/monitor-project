"use client";

import React from "react";
import { 
  useSnackbar as useNotistack, 
  SnackbarMessage, 
  OptionsObject, 
  SnackbarKey 
} from "notistack";
import IconButton from '@mui/material/IconButton';

import CloseIcon from '@mui/icons-material/Close';

type SnackbarOptions = OptionsObject<"default" | "error" | "success" | "warning" | "info"> | undefined;

export const useSnackbar = () => {
  const { enqueueSnackbar: enqueue, closeSnackbar: close } = useNotistack();

  const enqueueSnackbar = React.useCallback((message: SnackbarMessage, options?: SnackbarOptions) => {
    return enqueue(message, {
      ...options,
      action: key => (
        <IconButton
          size="small"
          aria-label="close"
          color="inherit"
          onClick={() => close(key)}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      ),
    })
  }, [enqueue, close]);

  const closeSnackbar = React.useCallback((key?: SnackbarKey) => {
    close(key);
  }, [close]);

  return { enqueueSnackbar, closeSnackbar };
};
