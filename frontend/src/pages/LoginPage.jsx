import { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Link,
  Divider,
  IconButton,
  InputAdornment,
  Grid,
  alpha,
  Fade,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  School,
  Business,
  VerifiedUser,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        // Successful login transitions to the dashboard
        navigate('/dashboard');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    let credentials = {};
    
    switch (role) {
      case 'student':
        credentials = { email: 'student1@docflow.edu', password: 'student123' };
        break;
      case 'approver':
        credentials = { email: 'admissions@docflow.edu', password: 'approver123' };
        break;
      case 'admin':
        credentials = { email: 'admin@docflow.edu', password: 'admin123' };
        break;
    }
    
    setFormData(credentials);
    // Submit after a small delay to show the filled fields
    setTimeout(() => {
        handleSubmit({ preventDefault: () => {} });
    }, 100);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-20%',
          right: '-10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(147, 51, 234, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in={true} timeout={800}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 6 },
              borderRadius: 4,
              backgroundColor: alpha('#fff', 0.05),
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              color: 'white',
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Box 
                sx={{ 
                  display: 'inline-flex', 
                  p: 1.5, 
                  borderRadius: 2, 
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  mb: 2,
                  boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)'
                }}
              >
                <School sx={{ fontSize: 32, color: 'white' }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
                DocFlow
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}>
                Smart Document Approval & Tracking
              </Typography>
            </Box>

            {error && (
              <Alert 
                severity="error" 
                variant="filled"
                sx={{ 
                  mb: 4, 
                  borderRadius: 2,
                  backgroundColor: alpha('#ef4444', 0.9),
                  color: 'white'
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
                variant="filled"
                InputProps={{
                  disableUnderline: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  '& .MuiFilledInput-root': {
                    backgroundColor: alpha('#fff', 0.05),
                    borderRadius: 2,
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      backgroundColor: alpha('#fff', 0.08),
                    },
                    '&.Mui-focused': {
                      backgroundColor: alpha('#fff', 0.1),
                      border: '1px solid #3b82f6',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.4)',
                    '&.Mui-focused': {
                      color: '#3b82f6',
                    },
                  },
                }}
                disabled={loading}
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                required
                variant="filled"
                InputProps={{
                  disableUnderline: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: 'rgba(255, 255, 255, 0.4)' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
                  '& .MuiFilledInput-root': {
                    backgroundColor: alpha('#fff', 0.05),
                    borderRadius: 2,
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      backgroundColor: alpha('#fff', 0.08),
                    },
                    '&.Mui-focused': {
                      backgroundColor: alpha('#fff', 0.1),
                      border: '1px solid #3b82f6',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.4)',
                    '&.Mui-focused': {
                      color: '#3b82f6',
                    },
                  },
                }}
                disabled={loading}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ 
                  py: 1.8, 
                  mt: 2, // Added top margin since forgot password was removed
                  mb: 4, 
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s',
                  },
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Sign In to Dashboard'}
              </Button>

              <Divider sx={{ my: 4, '&::before, &::after': { borderColor: 'rgba(255, 255, 255, 0.1)' } }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 500 }}>
                  Quick Access Demo
                </Typography>
              </Divider>

              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<School />}
                    onClick={() => handleDemoLogin('student')}
                    disabled={loading}
                    sx={{ 
                      py: 1.2, 
                      borderRadius: 2, 
                      color: 'white', 
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: alpha('#fff', 0.05),
                      }
                    }}
                  >
                    Student
                  </Button>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Business />}
                    onClick={() => handleDemoLogin('approver')}
                    disabled={loading}
                    sx={{ 
                      py: 1.2, 
                      borderRadius: 2, 
                      color: 'white', 
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: alpha('#fff', 0.05),
                      }
                    }}
                  >
                    Reviewer
                  </Button>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<VerifiedUser />}
                    onClick={() => handleDemoLogin('admin')}
                    disabled={loading}
                    sx={{ 
                      py: 1.2, 
                      borderRadius: 2, 
                      color: 'white', 
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: alpha('#fff', 0.05),
                      }
                    }}
                  >
                    Admin
                  </Button>
                </Grid>
              </Grid>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  Don't have an account?{' '}
                  <Link component={RouterLink} to="/register" sx={{ color: '#3b82f6', fontWeight: 700, textDecoration: 'none' }}>
                    Sign up
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default LoginPage;
