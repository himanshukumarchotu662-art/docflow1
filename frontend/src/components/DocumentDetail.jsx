import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  ArrowBack,
  Download,
  Description,
  Person,
  Business,
  Schedule,
  CheckCircle,
  Cancel,
  Autorenew,
  Send,
  Assignment,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import { useAuth } from '../../context/AuthContext';
import { 
  getDocumentById, 
  updateDocumentStatus, 
  assignDocumentToSelf,
  getFileUrl,
} from '../../services/api';
import { 
  getStatusLabel, 
  getDepartmentLabel, 
  formatDate, 
  formatRelativeTime,
  formatFileSize 
} from '../../utils/formatters';
import { STATUS_COLORS, ACTIONS } from '../../utils/constants';

const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await getDocumentById(id);
      setDocument(response.data.data);
    } catch (error) {
      toast.error('Failed to load document');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignToSelf = async () => {
    try {
      setSubmitting(true);
      await assignDocumentToSelf(id);
      await fetchDocument();
      toast.success('Document assigned to you successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign document');
    } finally {
      setSubmitting(false);
    }
  };

  const handleActionSubmit = async () => {
    if (!selectedAction) {
      toast.error('Please select an action');
      return;
    }

    try {
      setSubmitting(true);
      await updateDocumentStatus(id, {
        action: selectedAction,
        comment: comment.trim(),
      });
      
      await fetchDocument();
      toast.success(`Document ${selectedAction} successfully`);
      setActionDialogOpen(false);
      setSelectedAction('');
      setComment('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const canTakeAction = () => {
    if (!document || !user) return false;
    
    return (
      user.role === 'approver' &&
      user.department === document.currentDepartment &&
      document.status === 'in-review' &&
      document.assignedTo?._id === user.id
    );
  };

  const canAssign = () => {
    if (!document || !user) return false;
    
    return (
      user.role === 'approver' &&
      user.department === document.currentDepartment &&
      document.status === 'pending' &&
      !document.assignedTo
    );
  };

  const getActionButton = () => {
    if (canAssign()) {
      return (
        <Button
          variant="contained"
          startIcon={<Assignment />}
          onClick={handleAssignToSelf}
          disabled={submitting}
        >
          {submitting ? 'Assigning...' : 'Assign to Me'}
        </Button>
      );
    }

    if (canTakeAction()) {
      return (
        <Button
          variant="contained"
          color="secondary"
          startIcon={<Send />}
          onClick={() => setActionDialogOpen(true)}
        >
          Take Action
        </Button>
      );
    }

    return null;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle />;
      case 'rejected':
        return <Cancel />;
      case 'returned':
        return <Autorenew />;
      default:
        return <Description />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!document) {
    return (
      <Alert severity="error">
        Document not found
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/dashboard')}
          variant="outlined"
        >
          Back to Dashboard
        </Button>
        {getActionButton()}
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Document Details */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box>
                <Typography variant="h4" gutterBottom>
                  {document.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {document.description || 'No description provided'}
                </Typography>
              </Box>
              <Chip
                icon={getStatusIcon(document.status)}
                label={getStatusLabel(document.status)}
                sx={{
                  backgroundColor: `${STATUS_COLORS[document.status]}15`,
                  color: STATUS_COLORS[document.status],
                  border: `1px solid ${STATUS_COLORS[document.status]}30`,
                  fontSize: '1rem',
                  height: '36px',
                  px: 1,
                }}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={3}>
              {/* Submitted By */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Person color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Submitted By
                    </Typography>
                    <Typography variant="body1">
                      {document.studentId?.username || 'Unknown'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {document.studentId?.email || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Document Type */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Business color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Document Type
                    </Typography>
                    <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                      {document.documentType}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Current Stage */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Business color="secondary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Current Stage
                    </Typography>
                    <Typography variant="body1">
                      {document.currentStage ? getDepartmentLabel(document.currentStage) : 'Completed'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {document.currentDepartment ? getDepartmentLabel(document.currentDepartment) : 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Timeline Info */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Schedule color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Timeline
                    </Typography>
                    <Typography variant="body1">
                      Submitted: {formatDate(document.submissionDate, 'MMM dd, yyyy')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Last updated: {formatRelativeTime(document.lastUpdated)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* File Section */}
            <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Document File
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={() => window.open(getFileUrl(document.fileUrl), '_blank')}
                >
                  Download
                </Button>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Description fontSize="large" color="primary" />
                <Box>
                  <Typography variant="body1">
                    {document.fileName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {document.fileType} • {formatFileSize(document.fileSize)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column - Timeline */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Approval Timeline
            </Typography>
            <Box sx={{ maxHeight: '500px', overflowY: 'auto', pr: 1 }}>
              <VerticalTimeline layout="1-column">
                {document.history?.map((event, index) => (
                  <VerticalTimelineElement
                    key={index}
                    className="vertical-timeline-element"
                    contentStyle={{
                      background: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      padding: '16px',
                    }}
                    contentArrowStyle={{ borderRight: '7px solid white' }}
                    date={formatDate(event.timestamp, 'MMM dd, HH:mm')}
                    iconStyle={{
                      background: STATUS_COLORS[event.action] || '#1976d2',
                      color: '#fff',
                    }}
                    icon={getStatusIcon(event.action)}
                  >
                    <h3 className="vertical-timeline-element-title" style={{ marginTop: 0, marginBottom: '8px' }}>
                      {event.stage ? getDepartmentLabel(event.stage) : 'Submission'}
                    </h3>
                    <h4 className="vertical-timeline-element-subtitle" style={{ marginTop: 0, marginBottom: '8px' }}>
                      {event.action.charAt(0).toUpperCase() + event.action.slice(1)}
                    </h4>
                    {event.approverId && (
                      <p style={{ margin: '4px 0' }}>
                        <strong>Approver:</strong> {event.approverId?.username || 'System'}
                      </p>
                    )}
                    {event.comment && (
                      <p style={{ margin: '4px 0' }}>
                        <strong>Comment:</strong> {event.comment}
                      </p>
                    )}
                  </VerticalTimelineElement>
                ))}
              </VerticalTimeline>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Take Action on Document</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Action</InputLabel>
            <Select
              value={selectedAction}
              label="Action"
              onChange={(e) => setSelectedAction(e.target.value)}
              disabled={submitting}
            >
              {ACTIONS.map((action) => (
                <MenuItem key={action.value} value={action.value}>
                  {action.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            margin="normal"
            label="Comments (Optional)"
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={submitting}
            placeholder="Add any comments or feedback for the student..."
          />

          {selectedAction === 'return' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              The document will be returned to the student for corrections. They will be able to resubmit.
            </Alert>
          )}

          {selectedAction === 'reject' && (
            <Alert severity="error" sx={{ mt: 2 }}>
              The document will be rejected and the process will be terminated.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleActionSubmit}
            variant="contained"
            disabled={!selectedAction || submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? 'Processing...' : 'Submit Action'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentDetail;