import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import StudentDashboard from '../components/dashboard/StudentDashboard';
import ApproverDashboard from '../components/dashboard/ApproverDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import ProfilePage from './ProfilePage';
import Loader from '../components/common/Loader';

const DashboardPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { tab } = useParams();
  const navigate = useNavigate();
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      // If no user is logged in, redirect to login
      if (!user) {
        navigate('/login');
        return;
      }

      // If a specific tab is requested but user doesn't have access, redirect
      if (tab) {
        const validTabs = getValidTabsForRole(user.role);
        // Allow 'profile' for everyone
        if (!validTabs.includes(tab) && tab !== 'profile') {
          navigate('/dashboard');
          return;
        }
      }

      setPageLoading(false);
    }
  }, [authLoading, user, tab, navigate]);

  const getValidTabsForRole = (role) => {
    const commonTabs = ['profile', 'settings', 'help', 'about'];
    const tabs = {
      student: ['upload', 'documents', 'track', 'history', ...commonTabs],
      approver: ['pending', 'assigned', 'queue', 'approval-history', ...commonTabs],
      admin: ['all-documents', 'users', 'workflows', 'admin', ...commonTabs],
    };
    return tabs[role] || commonTabs;
  };

  const renderDashboard = () => {
    if (!user) return null;

    if (tab === 'profile' || tab === 'settings') {
      return <ProfilePage />;
    }

    if (tab === 'help' || tab === 'about') {
        return (
            <Container sx={{ py: 4 }}>
                <Alert severity="info">
                    This section ({tab}) is coming soon. Please contact system administrator for support.
                </Alert>
            </Container>
        );
    }

    switch (user.role) {
      case 'student':
        return <StudentDashboard />;
      case 'approver':
        return <ApproverDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return (
          <Alert severity="error">
            Invalid user role. Please contact support.
          </Alert>
        );
    }
  };

  const handleTabChange = (newTab) => {
    navigate(`/dashboard/${newTab}`);
  };

  if (authLoading || pageLoading) {
    return <Loader fullScreen message="Loading dashboard..." />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      {renderDashboard()}
    </Box>
  );
};

export default DashboardPage;