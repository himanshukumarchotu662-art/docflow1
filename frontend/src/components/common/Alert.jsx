import { useState, forwardRef } from 'react';
import {
  Alert as MuiAlert,
  Snackbar,
  IconButton,
  Collapse,
  Box,
} from '@mui/material';
import {
  Close,
  CheckCircle,
  Error,
  Warning,
  Info,
  Notifications,
} from '@mui/icons-material';

const Alert = forwardRef((props, ref) => {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

Alert.displayName = 'Alert';

export const ToastAlert = ({ 
  open, 
  message, 
  severity = 'info', 
  duration = 6000,
  onClose,
  action,
}) => {
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    onClose();
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        action={action}
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export const InlineAlert = ({
  severity = 'info',
  message,
  title,
  dismissible = false,
  icon = true,
  sx = {},
}) => {
  const [open, setOpen] = useState(true);

  const getSeverityIcon = () => {
    switch (severity) {
      case 'success':
        return <CheckCircle />;
      case 'error':
        return <Error />;
      case 'warning':
        return <Warning />;
      case 'info':
      default:
        return <Info />;
    }
  };

  if (!open) return null;

  return (
    <Collapse in={open}>
      <MuiAlert
        severity={severity}
        sx={{ mb: 2, ...sx }}
        icon={icon ? getSeverityIcon() : false}
        action={
          dismissible && (
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setOpen(false)}
            >
              <Close fontSize="inherit" />
            </IconButton>
          )
        }
      >
        {title && (
          <Box sx={{ fontWeight: 'bold', mb: 0.5 }}>
            {title}
          </Box>
        )}
        {message}
      </MuiAlert>
    </Collapse>
  );
};

export const NotificationAlert = ({ count = 0, maxCount = 99 }) => {
  const displayCount = count > maxCount ? `${maxCount}+` : count;

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <Notifications color="action" />
      {count > 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: -8,
            right: -8,
            minWidth: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: 'error.main',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            padding: '0 4px',
            border: '2px solid white',
          }}
        >
          {displayCount}
        </Box>
      )}
    </Box>
  );
};

export default Alert;