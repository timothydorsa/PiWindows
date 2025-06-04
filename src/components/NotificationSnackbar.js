import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

export default function NotificationSnackbar({ open, onClose, message }) {
  return (
    <Snackbar open={open} autoHideDuration={3000} onClose={onClose}>
      <Alert onClose={onClose} severity="info" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
