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
  LinearProgress,
  Avatar,
  AvatarGroup,
} from '@mui/material';
import {
  Refresh,
  Assignment,
  CheckCircle,
  Pending,
  Error,
  People,
  Schedule,
  Notifications,
  VerifiedUser,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useAuth } from '../../context/AuthContext';
import DocumentList from './DocumentList';
import { getPendingDocuments, getDocumentStats, assignDocumentToSelf, getApprovalHistory } from '../../services/api';
import { formatDate, getDepartmentLabel } from '../../utils/formatters';
import { STATUS_COLORS } from '../../utils/constants';
import socketService from '../../services/socket';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ApproverDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { tab } = useParams();
  
  // Map URL tabs to internal tab indexes
  const getTabFromUrl = (urlTab) => {
    const tabMap = {
      'pending': 1, // Unassigned
      'assigned': 2, // My Assignments
      'queue': 3, // Others' Assignments / Department Queue
      'approval-history': 4, // Requests verified/processed by this approver
    };
    return tabMap[urlTab] || 0; // Default to All Documents (0)
  };
  
  const [documents, setDocuments] = useState([]);
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(getTabFromUrl(tab));
  const [assignedCount, setAssignedCount] = useState(0);

  // Sync activeTab with URL tab param whenever URL changes
  useEffect(() => {
    setActiveTab(getTabFromUrl(tab));
  }, [tab]);

  useEffect(() => {
    fetchData();
    setupSocket();
    
    return () => {
      socketService.disconnect();
    };
  }, []);

  const setupSocket = () => {
    if (user) {
      socketService.connect(
        localStorage.getItem('token'),
        user.id,
        user.role,
        user.department
      );
      
      socketService.on('new-document', (data) => {
        toast.info(`New document received in ${user.department}`);
        fetchData();
      });
      
      socketService.on('document-updated', (data) => {
        fetchData();
      });
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [docsResponse, statsResponse, historyResponse] = await Promise.all([
        getPendingDocuments(),
        getDocumentStats(),
        getApprovalHistory(),
      ]);
      
      setDocuments(docsResponse.data.data || []);
      setStats(statsResponse.data.data);
      setApprovalHistory(historyResponse.data.data || []);
      
      // Count assigned documents
      const assigned = docsResponse.data.data.filter(
        doc => doc.assignedTo?._id === user?.id
      ).length;
      setAssignedCount(assigned);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleViewDocument = (documentId) => {
    navigate(`/document/${documentId}`);
  };

  const handleAssignToSelf = async (documentId) => {
    try {
      await assignDocumentToSelf(documentId);
      await fetchData();
      toast.success('Document assigned to you');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign document');
    }
  };

  const handleTakeAction = (documentId) => {
    navigate(`/document/${documentId}`);
  };

  const getDepartmentStatsData = () => {
    if (!stats) return null;

    const labels = ['Pending', 'In Review', 'Completed'];
    const pending = stats.pending || 0;
    const inReview = stats.inReview || 0;
    const completed = (stats.approved || 0) + (stats.rejected || 0) + (stats.returned || 0);

    return {
      labels,
      datasets: [
        {
          label: 'Documents',
          data: [pending, inReview, completed],
          backgroundColor: [
            STATUS_COLORS.pending,
            STATUS_COLORS['in-review'],
            STATUS_COLORS.approved,
          ],
          borderColor: [
            STATUS_COLORS.pending,
            STATUS_COLORS['in-review'],
            STATUS_COLORS.approved,
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const getAssignedDocuments = () => {
    return documents.filter(doc => doc.assignedTo?._id === user?.id);
  };

  const getUnassignedDocuments = () => {
    return documents.filter(doc => !doc.assignedTo);
  };

  const getOtherDocuments = () => {
    return documents.filter(
      doc => doc.assignedTo && doc.assignedTo._id !== user?.id
    );
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.raw}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
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

  // Render approval history view when on approval-history tab
  if (tab === 'approval-history') {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Approval History
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Documents you have processed ({approvalHistory.length} total)
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Box>

        <Paper elevation={2} sx={{ p: 3 }}>
          <DocumentList
            documents={approvalHistory}
            isLoading={refreshing}
            onView={handleViewDocument}
            onRefresh={handleRefresh}
            title="Processed Documents"
            emptyMessage="You haven't processed any documents yet"
            showFilters={true}
          />
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Chip 
                label={`${getDepartmentLabel(user?.department)} SECTION`} 
                color="primary" 
                sx={{ 
                  fontWeight: 800, 
                  letterSpacing: 1, 
                  borderRadius: 1,
                  px: 1
                }} 
              />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                SECURED REVIEW PORTAL
              </Typography>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
              {user?.department === 'scholarship' ? 'Scholarship Review Section' : 
               user?.department === 'admissions' ? 'Admissions Processing Section' :
               user?.department === 'registrar' ? 'Registrar Verification Section' :
               `${getDepartmentLabel(user?.department)} Dashboard`}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Review and manage documents specifically assigned to the <strong>{getDepartmentLabel(user?.department)}</strong>.
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{ borderRadius: 2, px: 3 }}
            >
              {refreshing ? 'Syncing...' : 'Sync Section'}
            </Button>
          </Stack>
        </Box>
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
                    Total in Department
                  </Typography>
                </Box>
                <People color="primary" sx={{ fontSize: 40 }} />
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
                    Awaiting Assignment
                  </Typography>
                </Box>
                <Pending color="warning" sx={{ fontSize: 40 }} />
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
                    {assignedCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Assigned to You
                  </Typography>
                </Box>
                <Assignment color="info" sx={{ fontSize: 40 }} />
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
                    {stats?.inReview || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    In Review
                  </Typography>
                </Box>
                <Schedule color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column - Stats & Info */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VerifiedUser fontSize="small" /> SECTION OVERVIEW
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  DOMAIN RESPONSIBILITY
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {user?.department === 'scholarship' ? 'Reviewing all institutional and external scholarship applications, financial need assessments, and merit-based awards.' :
                   user?.department === 'admissions' ? 'Processing new enrollment applications, transfer credit evaluations, and initial eligibility checks.' :
                   user?.department === 'registrar' ? 'Verifying graduation requirements, transcript accuracy, and final degree audits.' :
                   `Handling ${getDepartmentLabel(user?.department)} related documentation.`}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  RESTRICTED ACCESS
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, color: 'success.main', fontWeight: 600 }}>
                  ✓ You are currently viewing the isolated {getDepartmentLabel(user?.department)} section. 
                  Only documents specifically routed to this department are visible here.
                </Typography>
              </Box>
            </Stack>
          </Paper>

          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Section Volume
            </Typography>
            <Box sx={{ height: 250, position: 'relative' }}>
              {stats && stats.total > 0 ? (
                <Bar data={getDepartmentStatsData()} options={chartOptions} />
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography variant="body2" color="text.secondary">
                    No documents currently in this section
                  </Typography>
                </Box>
              )}
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Quick Actions
              </Typography>
              <Stack spacing={1}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => setActiveTab(1)}
                  disabled={getUnassignedDocuments().length === 0}
                >
                  Claim Unassigned ({getUnassignedDocuments().length})
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setActiveTab(2)}
                  disabled={assignedCount === 0}
                >
                  Review Assigned ({assignedCount})
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setActiveTab(3)}
                  disabled={getOtherDocuments().length === 0}
                >
                  View Others' ({getOtherDocuments().length})
                </Button>
              </Stack>
            </Box>
          </Paper>

          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Department Info
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Your Department
                </Typography>
                <Typography variant="body1">
                  {getDepartmentLabel(user?.department)}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Average Processing Time
                </Typography>
                <Typography variant="body1">
                  2-3 business days
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Approval Rate
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={75} 
                    sx={{ flexGrow: 1 }}
                  />
                  <Typography variant="body2">75%</Typography>
                </Box>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Right Column - Documents */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ mb: 3 }}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="All Pending" />
              <Tab label="Unassigned" />
              <Tab label="My Assignments" />
              <Tab label="Others' Assignments" />
              <Tab label="Approval History" />
            </Tabs>

            {activeTab === 0 && (
              <DocumentList
                documents={documents}
                isLoading={refreshing}
                onView={handleViewDocument}
                onAssign={handleAssignToSelf}
                onAction={handleTakeAction}
                onRefresh={handleRefresh}
                title={`${getDepartmentLabel(user?.department)} Documents`}
                emptyMessage="No documents pending in your department"
              />
            )}

            {activeTab === 1 && (
              <DocumentList
                documents={getUnassignedDocuments()}
                isLoading={refreshing}
                onView={handleViewDocument}
                onAssign={handleAssignToSelf}
                onRefresh={handleRefresh}
                title="Unassigned Documents"
                emptyMessage="No unassigned documents available"
              />
            )}

            {activeTab === 2 && (
              <DocumentList
                documents={getAssignedDocuments()}
                isLoading={refreshing}
                onView={handleViewDocument}
                onAction={handleTakeAction}
                onRefresh={handleRefresh}
                title="My Assignments"
                emptyMessage="You don't have any assigned documents"
                showFilters={false}
              />
            )}

            {activeTab === 3 && (
              <DocumentList
                documents={getOtherDocuments()}
                isLoading={refreshing}
                onView={handleViewDocument}
                onRefresh={handleRefresh}
                title="Others' Assignments"
                emptyMessage="No documents assigned to other approvers"
                showFilters={false}
              />
            )}

            {activeTab === 4 && (
              <DocumentList
                documents={approvalHistory}
                isLoading={refreshing}
                onView={handleViewDocument}
                onRefresh={handleRefresh}
                title="Approval History"
                emptyMessage="You haven't taken action on any documents yet"
                showFilters={true}
              />
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Notifications Banner */}
      {getUnassignedDocuments().length > 0 && (
        <Alert 
          severity="info" 
          icon={<Notifications />}
          sx={{ mt: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={() => setActiveTab(1)}
            >
              View Now
            </Button>
          }
        >
          You have {getUnassignedDocuments().length} unassigned documents waiting for review.
        </Alert>
      )}
    </Box>
  );
};

export default ApproverDashboard;