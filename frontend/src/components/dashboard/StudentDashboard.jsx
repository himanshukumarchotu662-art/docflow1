import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add,
  Refresh,
  Description,
  CheckCircle,
  Pending,
  Error,
  Schedule,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useAuth } from '../../context/AuthContext';
import DocumentUpload from './DocumentUpload';
import DocumentList from './DocumentList';
import { getMyDocuments, getDocumentStats } from '../../services/api';
import { formatDate } from '../../utils/formatters';
import { STATUS_COLORS } from '../../utils/constants';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { tab } = useParams();
  
  // Map URL tabs to internal state
  const getTabFromUrl = (urlTab) => {
    const tabMap = {
      'track': 1, // Pending
      'history': 2, // Approved (closest match to history)
      'documents': 0, // All
    };
    return tabMap[urlTab] || 0;
  };
  
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(getTabFromUrl(tab));
  const [showUpload, setShowUpload] = useState(false);

  // Sync state with URL tab param
  useEffect(() => {
    if (tab === 'upload') {
      setShowUpload(true);
      setActiveTab(0);
    } else {
      setActiveTab(getTabFromUrl(tab));
      setShowUpload(false); 
    }
  }, [tab]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [docsResponse, statsResponse] = await Promise.all([
        getMyDocuments(),
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

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleUploadSuccess = (newDocument) => {
    setShowUpload(false);
    fetchData();
    toast.success('Document uploaded successfully!');
  };

  const handleViewDocument = (documentId) => {
    navigate(`/document/${documentId}`);
  };

  const getStatusData = () => {
    if (!stats) return null;

    const labels = ['Pending', 'In Review', 'Approved', 'Rejected', 'Returned'];
    const data = [
      stats.pending || 0,
      stats.inReview || 0,
      stats.approved || 0,
      stats.rejected || 0,
      stats.returned || 0,
    ];
    const backgroundColors = [
      STATUS_COLORS.pending,
      STATUS_COLORS['in-review'],
      STATUS_COLORS.approved,
      STATUS_COLORS.rejected,
      STATUS_COLORS.returned,
    ];

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(color => `${color}80`),
          borderWidth: 1,
          hoverOffset: 4,
        },
      ],
    };
  };

  const getRecentDocuments = () => {
    return documents
      .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
      .slice(0, 5);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle fontSize="small" />;
      case 'pending':
        return <Pending fontSize="small" />;
      case 'in-review':
        return <Schedule fontSize="small" />;
      case 'rejected':
      case 'returned':
        return <Error fontSize="small" />;
      default:
        return <Description fontSize="small" />;
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Welcome back, {user?.username}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your document submissions and approvals
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
            startIcon={<Add />}
            onClick={() => setShowUpload(true)}
          >
            Upload New Document
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
                  <Typography variant="h3" color="warning.main">
                    {stats?.pending || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending
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
                  <Typography variant="h3" color="success.main">
                    {stats?.approved || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Approved
                  </Typography>
                </Box>
                <CheckCircle color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h3" color="error.main">
                    {(stats?.rejected || 0) + (stats?.returned || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Needs Attention
                  </Typography>
                </Box>
                <Error color="error" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column - Chart & Recent */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, mb: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Status Distribution
            </Typography>
            <Box sx={{ height: 300, position: 'relative' }}>
              {stats && stats.total > 0 ? (
                <Doughnut data={getStatusData()} options={chartOptions} />
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography variant="body2" color="text.secondary">
                    No documents yet
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>

          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
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
                        icon={getStatusIcon(doc.status)}
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
                      {formatDate(doc.lastUpdated, 'MMM dd, HH:mm')}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No recent activity
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Right Column - Documents List */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ mb: 3 }}
            >
              <Tab label="All Documents" />
              <Tab label="Pending" />
              <Tab label="Approved" />
              <Tab label="Needs Attention" />
            </Tabs>

            <DocumentList
              documents={documents.filter(doc => {
                switch (activeTab) {
                  case 1: // Pending
                    return ['pending', 'in-review'].includes(doc.status);
                  case 2: // Approved
                    return doc.status === 'approved';
                  case 3: // Needs Attention
                    return ['rejected', 'returned'].includes(doc.status);
                  default: // All
                    return true;
                }
              })}
              isLoading={refreshing}
              onView={handleViewDocument}
              onRefresh={handleRefresh}
              title="My Documents"
              emptyMessage={
                activeTab === 0 
                  ? "You haven't uploaded any documents yet"
                  : `No documents in this category`
              }
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Upload Dialog */}
      {showUpload && (
        <Paper
          elevation={3}
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: 800,
            maxHeight: '90vh',
            overflow: 'auto',
            zIndex: 1300,
          }}
        >
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">
                Upload New Document
              </Typography>
              <Button onClick={() => setShowUpload(false)}>
                Close
              </Button>
            </Box>
            <DocumentUpload onUploadSuccess={handleUploadSuccess} />
          </Box>
        </Paper>
      )}

      {showUpload && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1200,
          }}
          onClick={() => setShowUpload(false)}
        />
      )}
    </Box>
  );
};

export default StudentDashboard;