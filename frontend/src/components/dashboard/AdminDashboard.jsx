import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Refresh,
  People,
  Description,
  TrendingUp,
  MoreVert,
  Add,
  Edit,
  Delete,
  Visibility,
  Block,
  CheckCircle,
  BarChart,
  Timeline,
  Download,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { useAuth } from '../../context/AuthContext';
import DocumentList from './DocumentList';
import { getAllDocuments, getDocumentStats } from '../../services/api';
import { formatDate, getDepartmentLabel, getStatusLabel } from '../../utils/formatters';
import { STATUS_COLORS, ROLES, DEPARTMENTS } from '../../utils/constants';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { tab, subtab } = useParams();
  
  // Map URL tabs to internal tab indexes
  const getTabFromUrl = (urlTab) => {
    const tabMap = {
      'all-documents': 1,
      'users': 2,
      'workflows': 3,
      'admin': 4, // Admin Tools
    };
    return tabMap[urlTab] || 0; // Default to overview (0)
  };
  
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(getTabFromUrl(tab));
  
  // User management
  const [users, setUsers] = useState([]);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    role: 'student',
    department: '',
  });

  // Statistics
  const [timeRange, setTimeRange] = useState('week');

  // Workflow management
  const [workflows, setWorkflows] = useState([
    { id: '1', name: 'Admission Application', type: 'admission', stages: ['Admissions', 'Finance', 'Registrar'], status: 'Active' },
    { id: '2', name: 'Scholarship Application', type: 'scholarship', stages: ['Admissions', 'Finance'], status: 'Active' },
    { id: '3', name: 'Transfer Application', type: 'transfer', stages: ['Admissions', 'Registrar'], status: 'Active' },
  ]);
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [workflowForm, setWorkflowForm] = useState({ name: '', type: 'admission', stages: '' });

  // Dept management
  const [deptDialogOpen, setDeptDialogOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [deptForm, setDeptForm] = useState({ label: '', head: '', code: '' });

  // Role management
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  // Sync activeTab with URL tab param whenever URL changes
  useEffect(() => {
    setActiveTab(getTabFromUrl(tab));
  }, [tab]);

  useEffect(() => {
    fetchData();
    // In a real app, you would fetch users from an API
    fetchUsers();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [docsResponse, statsResponse] = await Promise.all([
        getAllDocuments(),
        getDocumentStats(),
      ]);
      
      setDocuments(docsResponse.data.data || []);
      setStats(statsResponse.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUsers = async () => {
    // Mock users - in real app, fetch from API
    const mockUsers = [
      { _id: '1', username: 'student1', email: 'student1@docflow.edu', role: 'student', isActive: true, createdAt: new Date('2024-01-15') },
      { _id: '2', username: 'student2', email: 'student2@docflow.edu', role: 'student', isActive: true, createdAt: new Date('2024-01-20') },
      { _id: '3', username: 'approver_admissions', email: 'admissions@docflow.edu', role: 'approver', department: 'admissions', isActive: true, createdAt: new Date('2024-01-10') },
      { _id: '4', username: 'approver_finance', email: 'finance@docflow.edu', role: 'approver', department: 'finance', isActive: true, createdAt: new Date('2024-01-12') },
      { _id: '5', username: 'approver_registrar', email: 'registrar@docflow.edu', role: 'approver', department: 'registrar', isActive: true, createdAt: new Date('2024-01-08') },
    ];
    setUsers(mockUsers);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleViewDocument = (documentId) => {
    navigate(`/document/${documentId}`);
  };

  const handleUserMenuOpen = (event, user) => {
    setUserMenuAnchor(event.currentTarget);
    setSelectedUser(user);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
    setSelectedUser(null);
  };

  const handleAddUser = () => {
    setUserForm({
      username: '',
      email: '',
      role: 'student',
      department: '',
    });
    setUserDialogOpen(true);
  };

  const handleEditUser = (user) => {
    setUserForm({
      username: user.username,
      email: user.email,
      role: user.role,
      department: user.department || '',
    });
    setUserDialogOpen(true);
  };

  const handleDeleteUser = (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.username}?`)) {
      toast.success(`User ${user.username} deleted`);
      // In real app, call API to delete user
    }
  };

  const handleToggleUserStatus = (user) => {
    toast.success(`User ${user.username} ${user.isActive ? 'deactivated' : 'activated'}`);
    // In real app, call API to toggle user status
  };

  const handleUserFormSubmit = () => {
    // Validate form
    if (!userForm.username || !userForm.email || !userForm.role) {
      toast.error('Please fill all required fields');
      return;
    }

    if (userForm.role === 'approver' && !userForm.department) {
      toast.error('Please select a department for approver role');
      return;
    }

    // In real app, call API to create/update user
    if (selectedUser) {
      setUsers(users.map(u => u._id === selectedUser._id ? { ...u, ...userForm } : u));
    } else {
      setUsers([...users, { _id: Date.now().toString(), ...userForm, isActive: true, createdAt: new Date() }]);
    }
    toast.success(selectedUser ? 'User updated successfully' : 'User created successfully');
    setUserDialogOpen(false);
  };

  // Workflow Handlers
  const handleCreateWorkflow = () => {
    setSelectedWorkflow(null);
    setWorkflowForm({ name: '', type: 'admission', stages: '' });
    setWorkflowDialogOpen(true);
  };

  const handleEditWorkflow = (wf) => {
    setSelectedWorkflow(wf);
    setWorkflowForm({ name: wf.name, type: wf.type, stages: wf.stages.join(', ') });
    setWorkflowDialogOpen(true);
  };

  const handleDeleteWorkflow = (id) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      setWorkflows(workflows.filter(w => w.id !== id));
      toast.success('Workflow deleted');
    }
  };

  const handleWorkflowSubmit = () => {
    const newWf = {
      id: selectedWorkflow ? selectedWorkflow.id : Date.now().toString(),
      name: workflowForm.name,
      type: workflowForm.type,
      stages: workflowForm.stages.split(',').map(s => s.trim()),
      status: 'Active'
    };
    if (selectedWorkflow) {
      setWorkflows(workflows.map(w => w.id === selectedWorkflow.id ? newWf : w));
    } else {
      setWorkflows([...workflows, newWf]);
    }
    setWorkflowDialogOpen(false);
    toast.success(selectedWorkflow ? 'Workflow updated' : 'Workflow created');
  };

  // Dept Handlers
  const handleEditDept = (dept) => {
    setSelectedDept(dept);
    setDeptForm({ 
      label: dept.label, 
      head: `Dr. ${dept.value.charAt(0).toUpperCase() + dept.value.slice(1)}`,
      code: dept.value.toUpperCase().substring(0, 3)
    });
    setDeptDialogOpen(true);
  };

  const handleDeptSubmit = () => {
    toast.success('Department updated successfully');
    setDeptDialogOpen(false);
  };

  // Role Handlers
  const handleEditRole = (role) => {
    setSelectedRole(role);
    setRoleDialogOpen(true);
  };

  // Statistics calculations
  const getDocumentTrendData = () => {
    // Mock data for trends
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const submissions = [5, 7, 3, 8, 6, 2, 4];
    const approvals = [3, 5, 2, 6, 4, 1, 3];

    return {
      labels,
      datasets: [
        {
          label: 'Submissions',
          data: submissions,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          tension: 0.4,
        },
        {
          label: 'Approvals',
          data: approvals,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.4,
        },
      ],
    };
  };

  const getDepartmentDistributionData = () => {
    // Mock data for department distribution
    const departments = DEPARTMENTS.map(d => d.label);
    const counts = [15, 12, 8, 5]; // Mock counts

    return {
      labels: departments,
      datasets: [
        {
          label: 'Documents',
          data: counts,
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const getStatusDistributionData = () => {
    if (!stats) return null;

    const labels = ['Pending', 'In Review', 'Approved', 'Rejected', 'Returned'];
    const data = [
      stats.pending || 0,
      stats.inReview || 0,
      stats.approved || 0,
      stats.rejected || 0,
      stats.returned || 0,
    ];

    return {
      labels,
      datasets: [
        {
          label: 'Documents by Status',
          data,
          backgroundColor: [
            STATUS_COLORS.pending,
            STATUS_COLORS['in-review'],
            STATUS_COLORS.approved,
            STATUS_COLORS.rejected,
            STATUS_COLORS.returned,
          ],
          borderColor: [
            STATUS_COLORS.pending,
            STATUS_COLORS['in-review'],
            STATUS_COLORS.approved,
            STATUS_COLORS.rejected,
            STATUS_COLORS.returned,
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const getRecentDocuments = () => {
    return documents
      .sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate))
      .slice(0, 5);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  if (loading && !refreshing) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            System overview and management
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => toast.info('Export feature coming soon')}
          >
            Export Report
          </Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h3" color="primary">
                    {stats?.total || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Documents
                  </Typography>
                </Box>
                <Description color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h3" color="success.main">
                    {users.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </Box>
                <People color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h3" color="warning.main">
                    {stats?.pending || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Approval
                  </Typography>
                </Box>
                <TrendingUp color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h3" color="info.main">
                    {stats?.approved || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Approved Today
                  </Typography>
                </Box>
                <CheckCircle color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Tabs 
        value={activeTab} 
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Overview" />
        <Tab label="Documents" />
        <Tab label="Users" />
        <Tab label="Workflows" />
        <Tab label="Admin Tools" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Charts */}
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Document Trends
              </Typography>
              <Box sx={{ height: 300 }}>
                <Line data={getDocumentTrendData()} options={chartOptions} />
              </Box>
            </Paper>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Status Distribution
                  </Typography>
                  <Box sx={{ height: 250 }}>
                    {stats && stats.total > 0 ? (
                      <Bar data={getStatusDistributionData()} options={chartOptions} />
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <Typography variant="body2" color="text.secondary">
                          No data available
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Department Distribution
                  </Typography>
                  <Box sx={{ height: 250 }}>
                    <Bar data={getDepartmentDistributionData()} options={chartOptions} />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Recent Activity & Quick Stats */}
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Documents
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {getRecentDocuments().length > 0 ? (
                  getRecentDocuments().map((doc) => (
                    <Box
                      key={doc._id}
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                      onClick={() => handleViewDocument(doc._id)}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="subtitle2" noWrap sx={{ flex: 1 }}>
                          {doc.title}
                        </Typography>
                        <Chip
                          label={doc.status}
                          size="small"
                          sx={{
                            backgroundColor: `${STATUS_COLORS[doc.status]}15`,
                            color: STATUS_COLORS[doc.status],
                            border: `1px solid ${STATUS_COLORS[doc.status]}30`,
                          }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(doc.submissionDate, 'MMM dd, HH:mm')}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No recent documents
                  </Typography>
                )}
              </Box>
            </Paper>

            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Quick Stats
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Average Approval Time</Typography>
                  <Typography variant="body2" fontWeight="medium">2.5 days</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Approval Rate</Typography>
                  <Typography variant="body2" fontWeight="medium">85%</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Active Users</Typography>
                  <Typography variant="body2" fontWeight="medium">{users.filter(u => u.isActive).length}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Departments</Typography>
                  <Typography variant="body2" fontWeight="medium">{DEPARTMENTS.length}</Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Paper elevation={2} sx={{ p: 3 }}>
          <DocumentList
            documents={documents}
            isLoading={refreshing}
            onView={handleViewDocument}
            onRefresh={handleRefresh}
            title="All System Documents"
            emptyMessage="No documents in the system"
          />
        </Paper>
      )}

      {activeTab === 2 && (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              User Management ({users.length} users)
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddUser}
            >
              Add User
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell>
                      <Typography variant="body2">{user.username}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{user.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        size="small"
                        color={user.role === 'admin' ? 'error' : user.role === 'approver' ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      {user.department ? getDepartmentLabel(user.department) : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={user.isActive ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell>
                      {formatDate(user.createdAt, 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleUserMenuOpen(e, user)}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}


      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Workflow Management</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={handleCreateWorkflow}>
                  Create Workflow
                </Button>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Workflow Name</TableCell>
                      <TableCell>Document Type</TableCell>
                      <TableCell>Stages</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {workflows.map((wf) => (
                      <TableRow key={wf.id} hover>
                        <TableCell>{wf.name}</TableCell>
                        <TableCell>{wf.type}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            {wf.stages.map(stage => (
                              <Chip key={stage} label={stage} size="small" />
                            ))}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip label={wf.status} color="success" size="small" />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => handleEditWorkflow(wf)}><Edit /></IconButton>
                          <IconButton size="small" onClick={() => handleDeleteWorkflow(wf.id)}><Delete /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Admin Tools Tab */}
      {activeTab === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                {subtab === 'roles' && 'User Roles Management'}
                {subtab === 'departments' && 'Department Setup'}
                {subtab === 'workflows' && 'Workflow Templates'}
                {subtab === 'logs' && 'System Logs'}
                {subtab === 'backup' && 'Backup & Restore'}
                {!subtab && 'Admin Tools'}
              </Typography>

              {subtab === 'roles' && (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Role Name</TableCell>
                        <TableCell>Permissions</TableCell>
                        <TableCell>Users Count</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Admin</TableCell>
                        <TableCell>Full Access</TableCell>
                        <TableCell>2</TableCell>
                        <TableCell align="right"><IconButton size="small" onClick={() => handleEditRole('Admin')}><Edit /></IconButton></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Approver</TableCell>
                        <TableCell>Approve/Reject Documents</TableCell>
                        <TableCell>5</TableCell>
                        <TableCell align="right"><IconButton size="small" onClick={() => handleEditRole('Approver')}><Edit /></IconButton></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Student</TableCell>
                        <TableCell>Upload/View Documents</TableCell>
                        <TableCell>150</TableCell>
                        <TableCell align="right"><IconButton size="small" onClick={() => handleEditRole('Student')}><Edit /></IconButton></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {subtab === 'departments' && (
                 <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Department Name</TableCell>
                        <TableCell>Head</TableCell>
                        <TableCell>Code</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {DEPARTMENTS.map(dept => (
                        <TableRow key={dept.value}>
                          <TableCell>{dept.label}</TableCell>
                          <TableCell>Dr. {dept.value.charAt(0).toUpperCase() + dept.value.slice(1)}</TableCell>
                          <TableCell>{dept.value.toUpperCase().substring(0, 3)}</TableCell>
                          <TableCell align="right"><IconButton size="small" onClick={() => handleEditDept(dept)}><Edit /></IconButton></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {subtab === 'workflows' && (
                <Alert severity="info">
                  Workflow templates are managed under "Workflow Management". 
                  <Button color="primary" onClick={() => navigate('/dashboard/workflows')}>Go to Workflows</Button>
                </Alert>
              )}

              {subtab === 'logs' && (
                <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, fontFamily: 'monospace', height: 300, overflow: 'auto' }}>
                  <Typography variant="caption" display="block">[2024-02-07 10:00:01] System: Backup completed successfully</Typography>
                  <Typography variant="caption" display="block">[2024-02-07 09:45:22] Auth: User admin logged in</Typography>
                  <Typography variant="caption" display="block">[2024-02-07 09:30:15] Document: DOC-001 approved by Finance</Typography>
                  <Typography variant="caption" display="block">[2024-02-07 09:15:10] Error: Email service timeout (retried)</Typography>
                </Box>
              )}

              {subtab === 'backup' && (
                <Stack spacing={3} sx={{ maxWidth: 400 }}>
                  <Alert severity="success">Last backup: Today at 02:00 AM</Alert>
                  <Button variant="contained" startIcon={<Download />}>Download Last Backup</Button>
                  <Button variant="outlined" startIcon={<Refresh />}>Trigger Manual Backup</Button>
                  <Button variant="outlined" color="error">Restore from File</Button>
                </Stack>
              )}

              {!subtab && (
                <Alert severity="info">Please select a tool from the sidebar menu.</Alert>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
      >
        <MenuItem onClick={() => {
          handleEditUser(selectedUser);
          handleUserMenuClose();
        }}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit User
        </MenuItem>
        <MenuItem onClick={() => {
          handleToggleUserStatus(selectedUser);
          handleUserMenuClose();
        }}>
          {selectedUser?.isActive ? (
            <>
              <Block fontSize="small" sx={{ mr: 1 }} />
              Deactivate
            </>
          ) : (
            <>
              <CheckCircle fontSize="small" sx={{ mr: 1 }} />
              Activate
            </>
          )}
        </MenuItem>
        <MenuItem onClick={() => {
          handleDeleteUser(selectedUser);
          handleUserMenuClose();
        }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* User Dialog */}
      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Username"
              value={userForm.username}
              onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Role</InputLabel>
              <Select
                value={userForm.role}
                label="Role"
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value, department: e.target.value === 'approver' ? userForm.department : '' })}
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="approver">Approver</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            
            {userForm.role === 'approver' && (
              <FormControl fullWidth required>
                <InputLabel>Department</InputLabel>
                <Select
                  value={userForm.department}
                  label="Department"
                  onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                >
                  {DEPARTMENTS.map((dept) => (
                    <MenuItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUserFormSubmit} variant="contained">
            {selectedUser ? 'Update' : 'Create'} User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Workflow Dialog */}
      <Dialog open={workflowDialogOpen} onClose={() => setWorkflowDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedWorkflow ? 'Edit Workflow' : 'Create New Workflow'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Workflow Name"
              value={workflowForm.name}
              onChange={(e) => setWorkflowForm({ ...workflowForm, name: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Document Type</InputLabel>
              <Select
                value={workflowForm.type}
                label="Document Type"
                onChange={(e) => setWorkflowForm({ ...workflowForm, type: e.target.value })}
              >
                <MenuItem value="admission">Admission</MenuItem>
                <MenuItem value="scholarship">Scholarship</MenuItem>
                <MenuItem value="transfer">Transfer</MenuItem>
                <MenuItem value="graduation">Graduation</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Review Stages (comma separated)"
              placeholder="Admissions, Finance, Registrar"
              value={workflowForm.stages}
              onChange={(e) => setWorkflowForm({ ...workflowForm, stages: e.target.value })}
              fullWidth
              required
              helperText="List departments in order of approval"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWorkflowDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleWorkflowSubmit} variant="contained">
            {selectedWorkflow ? 'Update' : 'Create'} Workflow
          </Button>
        </DialogActions>
      </Dialog>

      {/* Department Dialog */}
      <Dialog open={deptDialogOpen} onClose={() => setDeptDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Department Setup</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Department Name"
              value={deptForm.label}
              onChange={(e) => setDeptForm({ ...deptForm, label: e.target.value })}
              fullWidth
              disabled
            />
            <TextField
              label="Department Head"
              value={deptForm.head}
              onChange={(e) => setDeptForm({ ...deptForm, head: e.target.value })}
              fullWidth
            />
            <TextField
              label="Department Code"
              value={deptForm.code}
              onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeptDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeptSubmit} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Role Dialog */}
      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Permission Management: {selectedRole}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Detailed permission toggles for the <strong>{selectedRole}</strong> role would appear here in a full implementation.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>Close</Button>
          <Button onClick={() => { toast.success('Permissions updated'); setRoleDialogOpen(false); }} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
