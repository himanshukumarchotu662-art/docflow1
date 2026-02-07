import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Stack,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
  alpha,
  Avatar,
  Chip,
} from '@mui/material';
import {
  RocketLaunch,
  Security,
  Timeline,
  Notifications,
  CloudUpload,
  Speed,
  People,
  School,
  Business,
  ArrowForward,
  Search,
  CheckCircle,
  VerifiedUser,
  AutoAwesome,
  Dashboard,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/common/Footer';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const features = [
    {
      icon: <CloudUpload fontSize="large" />,
      title: 'Smart Document Upload',
      description: 'Upload documents with automatic validation and file type checking.',
      color: '#1976d2',
    },
    {
      icon: <Timeline fontSize="large" />,
      title: 'Automated Workflow',
      description: 'Documents are automatically routed through predefined approval stages.',
      color: '#2e7d32',
    },
    {
      icon: <Notifications fontSize="large" />,
      title: 'Real-time Tracking',
      description: 'Track document status in real-time with instant notifications.',
      color: '#ed6c02',
    },
    {
      icon: <Security fontSize="large" />,
      title: 'Role-based Access',
      description: 'Secure access control for students, approvers, and administrators.',
      color: '#9c27b0',
    },
    {
      icon: <Speed fontSize="large" />,
      title: 'Fast Processing',
      description: 'Reduce approval times from weeks to just days.',
      color: '#0288d1',
    },
    {
      icon: <People fontSize="large" />,
      title: 'Collaborative Review',
      description: 'Multiple approvers can review and comment on documents.',
      color: '#d32f2f',
    },
  ];



  const workflowSteps = [
    { step: 1, title: 'Document Upload', description: 'Student uploads document with metadata' },
    { step: 2, title: 'Auto-Validation', description: 'System validates file type, size, and content' },
    { step: 3, title: 'Department Routing', description: 'Document routed to appropriate department' },
    { step: 4, title: 'Review & Approval', description: 'Approvers review and take action' },
    { step: 5, title: 'Status Update', description: 'Real-time updates sent to student' },
  ];

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const handleTryDemo = () => {
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <Box
        sx={{
          pt: { xs: 8, md: 12 },
          pb: { xs: 12, md: 20 },
          background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 800,
                mb: 2,
                background: 'linear-gradient(45deg, #ffffff 30%, #e3f2fd 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Streamline Your Document
              <br />
              Approval Process
            </Typography>

            <Typography variant="h6" sx={{ mb: 4, color: 'rgba(255,255,255,0.9)', maxWidth: 600 }}>
              DocFlow automates document routing, tracking, and approval for educational institutions. Save time, reduce errors, and improve transparency.
            </Typography>

            <Stack direction="row" spacing={2} sx={{ mb: 6 }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)',
                  },
                }}
              >
                Go to Dashboard
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<Dashboard />}
                onClick={() => navigate('/login')}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.5)',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                Try Live Demo
              </Button>
            </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper
                elevation={24}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  backgroundColor: alpha('#fff', 0.1),
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                  },
                }}
              >
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Experience DocFlow
                </Typography>
                <Typography variant="body2" gutterBottom sx={{ mb: 3, opacity: 0.9 }}>
                  See how easy it is to manage documents
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      borderRadius: 2,
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: 'transparent',
                        },
                      },
                    }}
                  />
                </Box>

                <List sx={{ mb: 3 }}>
                  {[
                    { text: 'Admission Applications', icon: <School /> },
                    { text: 'Scholarship Requests', icon: <VerifiedUser /> },
                    { text: 'Transfer Documents', icon: <Business /> },
                    { text: 'Graduation Clearance', icon: <CheckCircle /> },
                  ].map((item, index) => (
                    <ListItem 
                      key={index} 
                      sx={{ 
                        py: 1.5,
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.05)',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40, color: 'white' }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text} 
                        primaryTypographyProps={{ sx: { color: 'white' } }}
                      />
                    </ListItem>
                  ))}
                </List>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<RocketLaunch />}
                  onClick={handleTryDemo}
                  sx={{
                    backgroundColor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: alpha('#fff', 0.9),
                    },
                  }}
                >
                  Launch Interactive Demo
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
            Powerful Features
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', mb: 6 }}>
            Everything you need to modernize your document approval process
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 8,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 60,
                      height: 60,
                      borderRadius: 2,
                      backgroundColor: `${feature.color}15`,
                      color: feature.color,
                      mb: 3,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Workflow Section */}
      <Box sx={{ backgroundColor: 'grey.50', py: 12 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
              How It Works
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Simple 5-step process from submission to approval
            </Typography>
          </Box>

          <Box sx={{ position: 'relative' }}>
            {/* Connecting Line */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: 2,
                backgroundColor: 'primary.main',
                transform: 'translateY(-50%)',
                zIndex: 0,
                display: { xs: 'none', md: 'block' },
              }}
            />

            <Grid container spacing={4}>
              {workflowSteps.map((step, index) => (
                <Grid item xs={12} md={2.4} key={index}>
                  <Box
                    sx={{
                      position: 'relative',
                      zIndex: 1,
                      textAlign: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        border: '4px solid white',
                        boxShadow: 3,
                      }}
                    >
                      {step.step}
                    </Box>
                    
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      {step.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      {step.description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>



      {/* CTA Section */}
      <Box
        sx={{
          py: 12,
          background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <AutoAwesome sx={{ fontSize: 60, mb: 3, opacity: 0.9 }} />
          
          <Typography variant="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Ready to Transform Your Document Workflow?
          </Typography>
          
          <Typography variant="h5" gutterBottom sx={{ opacity: 0.9, mb: 6 }}>
            Join 50+ institutions already using DocFlow
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              onClick={handleGetStarted}
              sx={{
                backgroundColor: 'white',
                color: 'primary.main',
                py: 2,
                px: 6,
                fontSize: '1.1rem',
                '&:hover': {
                  backgroundColor: alpha('#fff', 0.9),
                },
              }}
            >
              Start Free Trial
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              sx={{ 
                borderColor: 'white', 
                color: 'white',
                py: 2,
                px: 6,
                fontSize: '1.1rem',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                }
              }}
              onClick={() => navigate('/contact')}
            >
              Schedule a Demo
            </Button>
          </Stack>

          <Typography variant="body2" sx={{ mt: 4, opacity: 0.8 }}>
            No credit card required • 14-day free trial • Full support included
          </Typography>
        </Container>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default Home;