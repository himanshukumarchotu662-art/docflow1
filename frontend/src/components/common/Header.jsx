import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  AccountCircle,
  Logout,
  Settings,
  Dashboard,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getFileUrl } from '../../services/api';
import { getDepartmentLabel } from '../../utils/formatters';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/dashboard/profile');
  };

  const handleSettings = () => {
    handleMenuClose();
    navigate('/dashboard/settings');
  };

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case 'admin':
        return 'error';
      case 'approver':
        return 'primary';
      case 'student':
        return 'success';
      default:
        return 'default';
    }
  };

  const getRoleLabel = () => {
    const labels = {
      admin: 'Administrator',
      approver: 'Approver',
      student: 'Student',
    };
    return labels[user?.role] || user?.role;
  };

  return (
    <AppBar position="fixed" elevation={1}>
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Typography variant="h6" component="div" sx={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
            DocFlow
          </Typography>
          <Typography variant="caption" sx={{ ml: 2, opacity: 0.8 }}>
            Smart Document Approval & Tracking
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={(e) => setNotificationAnchor(e.currentTarget)}>
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={() => setNotificationAnchor(null)}
          >
            <MenuItem onClick={() => setNotificationAnchor(null)}>
              <Box sx={{ p: 1 }}>
                <Typography variant="body2">New document assigned to you</Typography>
                <Typography variant="caption" color="text.secondary">2 minutes ago</Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={() => setNotificationAnchor(null)}>
              <Box sx={{ p: 1 }}>
                <Typography variant="body2">Document approved by Finance</Typography>
                <Typography variant="caption" color="text.secondary">1 hour ago</Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={() => setNotificationAnchor(null)}>
              <Box sx={{ p: 1 }}>
                <Typography variant="body2">Welcome to DocFlow!</Typography>
                <Typography variant="caption" color="text.secondary">1 day ago</Typography>
              </Box>
            </MenuItem>
          </Menu>

          {/* User Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
            <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
              <Typography variant="subtitle2">
                {user?.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {getRoleLabel()}
                {user?.department && ` • ${getDepartmentLabel(user.department)}`}
              </Typography>
            </Box>
            
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleProfileMenuOpen}
                size="small"
                sx={{ ml: 2 }}
              >
                <Avatar
                  src={getFileUrl(user?.profilePhoto)}
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: getRoleBadgeColor(),
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleProfile}>
              <AccountCircle fontSize="small" sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={handleSettings}>
              <Settings fontSize="small" sx={{ mr: 1 }} />
              Settings
            </MenuItem>
            <MenuItem onClick={() => navigate('/dashboard')}>
              <Dashboard fontSize="small" sx={{ mr: 1 }} />
              Dashboard
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout fontSize="small" sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;