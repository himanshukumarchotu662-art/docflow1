import { Box, CircularProgress, Typography, Backdrop } from '@mui/material';
import { HourglassEmpty } from '@mui/icons-material';

const Loader = ({ fullScreen = false, message = 'Loading...', size = 40 }) => {
  if (fullScreen) {
    return (
      <Backdrop
        sx={{
          color: '#fff',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          flexDirection: 'column',
          gap: 2,
        }}
        open={true}
      >
        <CircularProgress color="inherit" size={60} />
        <Typography variant="h6">{message}</Typography>
      </Backdrop>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        gap: 2,
      }}
    >
      <CircularProgress size={size} />
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

export const InlineLoader = ({ size = 20 }) => (
  <CircularProgress size={size} sx={{ ml: 1 }} />
);

export const PageLoader = () => (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'background.paper',
      zIndex: 9999,
    }}
  >
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CircularProgress size={80} thickness={4} />
        <HourglassEmpty
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: 40,
            color: 'primary.main',
          }}
        />
      </Box>
      <Box>
        <Typography variant="h5" gutterBottom align="center">
          DocFlow
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          Smart Document Approval & Tracking
        </Typography>
      </Box>
    </Box>
  </Box>
);

export default Loader;