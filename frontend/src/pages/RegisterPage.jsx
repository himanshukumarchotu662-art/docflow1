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
  Stepper,
  Step,
  StepLabel,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  InputAdornment,
  alpha,
  Fade,
  CircularProgress,
  StepConnector,
  stepConnectorClasses,
  styled,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Lock,
  School,
  Business,
  ArrowForward,
  ArrowBack,
  CheckCircle,
  VerifiedUser,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DEPARTMENTS } from '../utils/constants';

// Custom Stepper Connector
const QontoConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
    left: 'calc(-50% + 16px)',
    right: 'calc(50% + 16px)',
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: '#3b82f6',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: '#3b82f6',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderTopWidth: 3,
    borderRadius: 1,
  },
}));

const steps = ['Account Type', 'Personal Info', 'Account Details'];

const RegisterPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    role: 'student',
    department: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError('');
  };

  const handleNext = () => {
    if (activeStep === 0 && !formData.role) {
      setError('Please select an account type');
      return;
    }
    
    if (activeStep === 0 && formData.role === 'approver' && !formData.department) {
      setError('Please select a department for approver role');
      return;
    }
    
    if (activeStep === 1) {
      if (!formData.username.trim() || !formData.email.trim()) {
        setError('Please fill in all fields');
        return;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }
    }
    
    setActiveStep((prevStep) => prevStep + 1);
    setError('');
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await register(formData);
      if (result.success) {
        setSuccess('Registration successful! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'white' }}>
              Select Your Role
            </Typography>
            
            <RadioGroup
              name="role"
              value={formData.role}
              onChange={handleChange}
              sx={{ mb: 4 }}
            >
              {[
                { 
                  value: 'student', 
                  label: 'Student', 
                  desc: 'Submit documents and track approvals',
                  icon: <School /> 
                },
                { 
                  value: 'approver', 
                  label: 'Reviewer', 
                  desc: 'Review and approve documents',
                  icon: <Business /> 
                },
                { 
                  value: 'admin', 
                  label: 'Administrator', 
                  desc: 'Manage users and workflows',
                  icon: <VerifiedUser /> 
                },
              ].map((role) => (
                <Paper 
                  key={role.value}
                  elevation={0}
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    borderRadius: 3,
                    backgroundColor: formData.role === role.value ? alpha('#3b82f6', 0.1) : alpha('#fff', 0.05),
                    border: '1px solid',
                    borderColor: formData.role === role.value ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: alpha('#fff', 0.08),
                    }
                  }}
                >
                  <FormControlLabel
                    value={role.value}
                    control={<Radio sx={{ color: 'rgba(255, 255, 255, 0.4)', '&.Mui-checked': { color: '#3b82f6' } }} />}
                    label={
                      <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ color: formData.role === role.value ? '#3b82f6' : 'rgba(255, 255, 255, 0.4)' }}>
                          {role.icon}
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'white' }}>
                            {role.label}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                            {role.desc}
                          </Typography>
                        </Box>
                      </Box>
                    }
                    sx={{ width: '100%', m: 0 }}
                  />
                </Paper>
              ))}
            </RadioGroup>

            {formData.role === 'approver' && (
              <Fade in={true}>
                <FormControl 
                  fullWidth 
                  variant="filled"
                  sx={{ 
                    mt: 2,
                    '& .MuiFilledInput-root': {
                      backgroundColor: alpha('#fff', 0.05),
                      borderRadius: 2,
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }
                  }}
                >
                  <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>Select Department</InputLabel>
                  <Select
                    name="department"
                    value={formData.department}
                    label="Select Department"
                    onChange={handleChange}
                    required
                    disableUnderline
                    sx={{ color: 'white' }}
                  >
                    {DEPARTMENTS.map((dept) => (
                      <MenuItem key={dept.value} value={dept.value}>
                        {dept.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Fade>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'white' }}>
              Personal Information
            </Typography>
            
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              margin="normal"
              required
              variant="filled"
              InputProps={{
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: 'rgba(255, 255, 255, 0.4)' }} />
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
                }
              }}
            />
            
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
                }
              }}
              helperText={<Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>We'll send notifications to this email</Typography>}
            />
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'white' }}>
              Account Security
            </Typography>
            
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
                mb: 2,
                '& .MuiFilledInput-root': {
                  backgroundColor: alpha('#fff', 0.05),
                  borderRadius: 2,
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }
              }}
            />
            
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
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
              }}
              sx={{
                mb: 3,
                '& .MuiFilledInput-root': {
                  backgroundColor: alpha('#fff', 0.05),
                  borderRadius: 2,
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }
              }}
            />
            
            <Box sx={{ mt: 2, p: 2, backgroundColor: alpha('#fff', 0.05), borderRadius: 3, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 700, mb: 1 }}>
                Password Protection Guide:
              </Typography>
              <Typography variant="caption" component="div" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                • Minimum 6 characters long
              </Typography>
              <Typography variant="caption" component="div" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                • Mix letters, numbers, and symbols
              </Typography>
            </Box>
          </Box>
        );

      default:
        return null;
    }
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
        py: 4,
      }}
    >
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
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
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
                Join DocFlow
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}>
                Start your journey towards effortless document management
              </Typography>
            </Box>

            <Stepper 
              activeStep={activeStep} 
              sx={{ mb: 6 }} 
              alternativeLabel
              connector={<QontoConnector />}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel 
                    sx={{ 
                      '& .MuiStepLabel-label': { 
                        color: 'rgba(255, 255, 255, 0.4)',
                        fontWeight: 600,
                        '&.Mui-active': { color: '#3b82f6' },
                        '&.Mui-completed': { color: 'white' }
                      }
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

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

            {success && (
              <Alert 
                severity="success" 
                variant="filled"
                icon={<CheckCircle />}
                sx={{ 
                  mb: 4, 
                  borderRadius: 2,
                  backgroundColor: alpha('#22c55e', 0.9),
                  color: 'white'
                }}
              >
                {success}
              </Alert>
            )}

            <Box component="form" onSubmit={activeStep === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
              {renderStepContent(activeStep)}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6 }}>
                <Button
                  onClick={handleBack}
                  disabled={activeStep === 0 || loading}
                  startIcon={<ArrowBack />}
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontWeight: 700,
                    '&:hover': { color: 'white' }
                  }}
                >
                  Previous
                </Button>

                {activeStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{ 
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      '&:hover': { background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }
                    }}
                  >
                    {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Finish Registration'}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="contained"
                    endIcon={<ArrowForward />}
                    sx={{ 
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    }}
                  >
                    Continue
                  </Button>
                )}
              </Box>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 6, pt: 3, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Already have an account?{' '}
                <Link component={RouterLink} to="/login" sx={{ color: '#3b82f6', fontWeight: 700, textDecoration: 'none' }}>
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default RegisterPage;
