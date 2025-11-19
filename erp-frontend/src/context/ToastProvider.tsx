import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Alert, Snackbar, SnackbarCloseReason } from '@mui/material';

type ToastSeverity = 'success' | 'info' | 'warning' | 'error';

type ToastOptions = {
  message: string;
  severity?: ToastSeverity;
  autoHideDuration?: number;
};

export type ToastContextValue = {
  show: (opts: ToastOptions) => void;
  success: (msg: string, ms?: number) => void;
  info: (msg: string, ms?: number) => void;
  warn: (msg: string, ms?: number) => void;
  error: (msg: string, ms?: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<Required<ToastOptions>>({
    message: '',
    severity: 'info',
    autoHideDuration: 3000,
  });

  const show = useCallback((o: ToastOptions) => {
    setOpts({
      message: o.message,
      severity: o.severity ?? 'info',
      autoHideDuration: o.autoHideDuration ?? 3000,
    });
    setOpen(true);
  }, []);

  const success = useCallback((m: string, ms = 2500) => show({ message: m, severity: 'success', autoHideDuration: ms }), [show]);
  const info    = useCallback((m: string, ms = 3000) => show({ message: m, severity: 'info',    autoHideDuration: ms }), [show]);
  const warn    = useCallback((m: string, ms = 3500) => show({ message: m, severity: 'warning', autoHideDuration: ms }), [show]);
  const error   = useCallback((m: string, ms = 4000) => show({ message: m, severity: 'error',   autoHideDuration: ms }), [show]);

  const value = useMemo(() => ({ show, success, info, warn, error }), [show, success, info, warn, error]);

  const handleClose = (_e?: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={opts.autoHideDuration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleClose} severity={opts.severity} variant="filled" sx={{ width: '100%' }}>
          {opts.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

/** Hook estricto – lanza error si no hay provider */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast debe usarse dentro de <ToastProvider>');
  }
  return ctx;
}

/** Hook tolerante – NO lanza error si no hay provider (devuelve no-ops) */
export function useToastOptional(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (ctx) return ctx;
  const noop = () => {};
  return {
    show: noop,
    success: noop,
    info: noop,
    warn: noop,
    error: noop,
  };
}
