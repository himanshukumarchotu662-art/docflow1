import { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse,
  Box,
  Typography,
  Avatar,
  Badge,
} from '@mui/material';
import {
  Dashboard,
  Description,
  Upload,
  Timeline,
  People,
  Settings,
  ExpandLess,
  ExpandMore,
  Home,
  History,
  Assessment,
  Notifications,
  School,
  Business,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getFileUrl } from '../../services/api';
import { getDepartmentLabel } from '../../utils/formatters';

const drawerWidth = 280;

const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [openSubMenu, setOpenSubMenu] = useState({
    documents: false,
    admin: false,
  });

  const handleSubMenuToggle = (menu) => {
    setOpenSubMenu(prev => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 960) {
      onClose();
    }
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const getStudentMenuItems = () => [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/dashboard',
    },
    {
      text: 'Upload Document',
      icon: <Upload />,
      path: '/dashboard/upload',
    },
    {
      text: 'My Documents',
      icon: <Description />,
      path: '/dashboard/documents',
    },
    {
      text: 'Track Status',
      icon: <Timeline />,
      path: '/dashboard/track',
    },
    {
      text: 'History',
      icon: <History />,
      path: '/dashboard/history',
    },
  ];

  const getApproverMenuItems = () => [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/dashboard',
    },
    {
      text: 'Pending Approvals',
      icon: <Notifications />,
      path: '/dashboard/pending',
      badge: 5, // Mock count
    },
    {
      text: 'Assigned to Me',
      icon: <Description />,
      path: '/dashboard/assigned',
      badge: 3, // Mock count
    },
    {
      text: 'Department Queue',
      icon: <Business />,
      path: '/dashboard/queue',
    },
    {
      text: 'Approval History',
      icon: <History />,
      path: '/dashboard/approval-history',
    },
  ];

  const getAdminMenuItems = () => [
    {
      text: 'System Dashboard',
      icon: <Dashboard />,
      path: '/dashboard',
    },
    {
      text: 'All Documents',
      icon: <Description />,
      path: '/dashboard/all-documents',
    },
    {
      text: 'User Management',
      icon: <People />,
      path: '/dashboard/users',
    },
    {
      text: 'Workflow Management',
      icon: <Settings />,
      path: '/dashboard/workflows',
    },

  ];

  const getMenuItems = () => {
    switch (user?.role) {
      case 'admin':
        return getAdminMenuItems();
      case 'approver':
        return getApproverMenuItems();
      case 'student':
      default:
        return getStudentMenuItems();
    }
  };

  const getUserInfo = () => (
    <Box 
      sx={{ p: 3, textAlign: 'center', cursor: 'pointer' }}
      onClick={() => handleNavigation('/dashboard/profile')}
    >
      <Avatar
        src={getFileUrl(user?.profilePhoto)}
        sx={{
          width: 64,
          height: 64,
          margin: '0 auto 12px',
          bgcolor: user?.role === 'admin' ? 'error.main' : 
                  user?.role === 'approver' ? 'primary.main' : 'success.main',
        }}
      >
        {user?.username?.charAt(0).toUpperCase()}
      </Avatar>
      <Typography variant="h6" noWrap>
        {user?.username}
      </Typography>
      <Typography variant="body2" color="text.secondary" noWrap>
        {user?.role === 'approver' 
          ? `${getDepartmentLabel(user.department)} Approver`
          : user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)
        }
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {user?.email}
      </Typography>
    </Box>
  );

  return (
    <Drawer
      variant={window.innerWidth >= 960 ? 'permanent' : 'temporary'}
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      {/* User Info */}
      {getUserInfo()}
      
      <Divider />

      {/* Main Menu */}
      <List sx={{ p: 2 }}>
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton 
            onClick={() => handleNavigation('/')}
            selected={isActive('/') && !isActive('/dashboard')}
            sx={{
              borderRadius: 2,
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                '& .MuiListItemIcon-root': {
                  color: 'white',
                },
              },
            }}
          >
            <ListItemIcon>
              <Home />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>

        {getMenuItems().map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton 
              onClick={() => handleNavigation(item.path)}
              selected={isActive(item.path)}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon>
                {item.badge ? (
                  <Badge badgeContent={item.badge} color="error">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}

        {/* Documents Submenu for Students */}
        {user?.role === 'student' && (
          <>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton 
                onClick={() => handleSubMenuToggle('documents')}
                sx={{ borderRadius: 2 }}
              >
                <ListItemIcon>
                  <Description />
                </ListItemIcon>
                <ListItemText primary="Document Types" />
                {openSubMenu.documents ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            
            <Collapse in={openSubMenu.documents} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {['Admission', 'Scholarship', 'Transfer', 'Graduation'].map((type) => (
                  <ListItem key={type} disablePadding sx={{ pl: 4, mb: 0.5 }}>
                    <ListItemButton 
                      onClick={() => handleNavigation(`/dashboard/documents/${type.toLowerCase()}`)}
                      sx={{ borderRadius: 2 }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <School fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={type} 
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </>
        )}

        {/* Admin Submenu */}
        {user?.role === 'admin' && (
          <>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton 
                onClick={() => handleSubMenuToggle('admin')}
                sx={{ borderRadius: 2 }}
              >
                <ListItemIcon>
                  <AdminPanelSettings />
                </ListItemIcon>
                <ListItemText primary="Admin Tools" />
                {openSubMenu.admin ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            
            <Collapse in={openSubMenu.admin} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {[
                  { text: 'User Roles', path: '/dashboard/admin/roles' },
                  { text: 'Department Setup', path: '/dashboard/admin/departments' },
                  { text: 'Workflow Templates', path: '/dashboard/admin/workflows' },
                  { text: 'System Logs', path: '/dashboard/admin/logs' },
                  { text: 'Backup & Restore', path: '/dashboard/admin/backup' },
                ].map((item) => (
                  <ListItem key={item.text} disablePadding sx={{ pl: 4, mb: 0.5 }}>
                    <ListItemButton 
                      onClick={() => handleNavigation(item.path)}
                      sx={{ borderRadius: 2 }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Settings fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text} 
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </>
        )}
      </List>

      <Divider sx={{ mt: 'auto' }} />

      {/* Footer Links */}
      <List sx={{ p: 2 }}>
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton 
            onClick={() => handleNavigation('/dashboard/settings')}
            selected={isActive('/dashboard/settings')}
            sx={{ borderRadius: 2 }}
          >
            <ListItemIcon>
              <Settings />
            </ListItemIcon>
            <ListItemText primary="Profile Settings" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding sx={{ mb: 1 }}>
          <ListItemButton 
            onClick={() => handleNavigation('/dashboard/help')}
            selected={isActive('/dashboard/help')}
            sx={{ borderRadius: 2 }}
          >
            <ListItemIcon>
              <Notifications />
            </ListItemIcon>
            <ListItemText primary="Help & Support" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={() => handleNavigation('/dashboard/about')}
            selected={isActive('/dashboard/about')}
            sx={{ borderRadius: 2 }}
          >
            <ListItemIcon>
              <Description />
            </ListItemIcon>
            <ListItemText primary="About DocFlow" />
          </ListItemButton>
        </ListItem>
      </List>


    </Drawer>
  );
};

export default Sidebar;