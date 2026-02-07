import { Box, Container, Grid, Typography, Link, IconButton } from '@mui/material';
import {
  Facebook,
  Twitter,
  LinkedIn,
  GitHub,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'primary.main',
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              DocFlow
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
              Smart Document Approval & Tracking System for educational institutions. 
              Streamline your document workflow with automated routing and real-time tracking.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <IconButton color="inherit" size="small">
                <Facebook />
              </IconButton>
              <IconButton color="inherit" size="small">
                <Twitter />
              </IconButton>
              <IconButton color="inherit" size="small">
                <LinkedIn />
              </IconButton>
              <IconButton color="inherit" size="small">
                <GitHub />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} md={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/" color="inherit" underline="hover" variant="body2">
                Home
              </Link>
              <Link href="/dashboard" color="inherit" underline="hover" variant="body2">
                Dashboard
              </Link>
              <Link href="/about" color="inherit" underline="hover" variant="body2">
                About Us
              </Link>
              <Link href="/features" color="inherit" underline="hover" variant="body2">
                Features
              </Link>
              <Link href="/pricing" color="inherit" underline="hover" variant="body2">
                Pricing
              </Link>
            </Box>
          </Grid>

          {/* Resources */}
          <Grid item xs={12} md={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Resources
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/docs" color="inherit" underline="hover" variant="body2">
                Documentation
              </Link>
              <Link href="/help" color="inherit" underline="hover" variant="body2">
                Help Center
              </Link>
              <Link href="/api" color="inherit" underline="hover" variant="body2">
                API Reference
              </Link>
              <Link href="/blog" color="inherit" underline="hover" variant="body2">
                Blog
              </Link>
              <Link href="/status" color="inherit" underline="hover" variant="body2">
                System Status
              </Link>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Contact Us
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn fontSize="small" />
                <Typography variant="body2">
                  123 Education Street, University City, UC 12345
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone fontSize="small" />
                <Typography variant="body2">
                  +1 (555) 123-4567
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email fontSize="small" />
                <Typography variant="body2">
                  support@docflow.edu
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Box
          sx={{
            borderTop: '1px solid',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            mt: 4,
            pt: 4,
            textAlign: 'center',
          }}
        >
          <Typography variant="body2">
            © {new Date().getFullYear()} DocFlow. All rights reserved.
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 1 }}>
            Version 1.0.0 | Built with MERN Stack
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Link href="/privacy" color="inherit" underline="hover" variant="caption" sx={{ mr: 2 }}>
              Privacy Policy
            </Link>
            <Link href="/terms" color="inherit" underline="hover" variant="caption" sx={{ mr: 2 }}>
              Terms of Service
            </Link>
            <Link href="/cookies" color="inherit" underline="hover" variant="caption">
              Cookie Policy
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;