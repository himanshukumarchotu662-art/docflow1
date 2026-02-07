import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Divider,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack,
  Download,
  CheckCircle,
  Cancel,
  Replay,
  Description,
  Person,
  CalendarToday,
  Assignment,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api, { getDocumentById, updateDocumentStatus, assignDocumentToSelf, getFileUrl } from '../services/api';
import { STATUS_COLORS, ACTIONS } from '../utils/constants';
import { formatDate, getDepartmentLabel } from '../utils/formatters';

const DocumentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      setError(null);
      const response = await getDocumentById(id);
      setDocument(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load document');
      console.error('Error loading document:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignToSelf = async () => {
    try {
      await assignDocumentToSelf(id);
      toast.success('Document assigned to you');
      fetchDocument();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign document');
    }
  };

  const handleOpenActionDialog = (action) => {
    setSelectedAction(action);
    setComment('');
    setActionDialogOpen(true);
  };

  const handleCloseActionDialog = () => {
    setActionDialogOpen(false);
    setSelectedAction('');
    setComment('');
  };

  const handleSubmitAction = async () => {
    try {
      setSubmitting(true);
      await updateDocumentStatus(id, { action: selectedAction, comment });
      
      const actionLabel = ACTIONS.find(a => a.value === selectedAction)?.label || selectedAction;
      toast.success(`Document ${actionLabel.toLowerCase()}d successfully`);
      
      handleCloseActionDialog();
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update document');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusChip = (status) => {
    return (
      <Chip
        label={status?.replace('-', ' ').toUpperCase()}
        sx={{
          backgroundColor: STATUS_COLORS[status] || '#grey',
          color: 'white',
          fontWeight: 600,
        }}
      />
    );
  };

  const canTakeAction = () => {
    if (!document || !user) return false;
    
    // Admins can ALWAYS take action if not already final
    if (user.role === 'admin') {
      return document.status !== 'approved' && document.status !== 'rejected';
    }

    if (user.role !== 'approver') return false;
    if (document.status === 'approved' || document.status === 'rejected') return false;
    
    // Check if document is assigned to this user or unassigned
    const isAssignedToMe = document.assignedTo?._id === user.id;
    const isUnassigned = !document.assignedTo;
    
    // Check if it's in their department
    const isMyDepartment = document.currentDepartment === user.department;
    
    return isMyDepartment && (isAssignedToMe || isUnassigned);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  if (!document) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">Document not found</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/dashboard')} sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
        {document.fileUrl && (
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Description />}
              onClick={async () => {
                try {
                  const response = await api.get(`/documents/${document._id}/view`, { 
                    responseType: 'blob' 
                  });
                  
                  // Check if the received blob is actually a JSON error
                  if (response.data.type === 'application/json') {
                    const text = await response.data.text();
                    const error = JSON.parse(text);
                    toast.error(error.message || 'File not found');
                    return;
                  }

                  // Even if type is not application/json, some 404s might be sent as blobs
                  const firstBytes = await response.data.slice(0, 5).text();
                  if (firstBytes.startsWith('{')) {
                    toast.error('File content is invalid (Server error captured)');
                    // Fallback to direct link as a last resort
                    window.open(getFileUrl(document.fileUrl), '_blank');
                    return;
                  }

                  const fileType = response.headers['content-type'] || 'application/pdf';
                  const blob = new Blob([response.data], { type: fileType });
                  const url = window.URL.createObjectURL(blob);
                  window.open(url, '_blank');
                  setTimeout(() => window.URL.revokeObjectURL(url), 60000);
                } catch (err) {
                  console.error('View error:', err);
                  toast.error('Failed to view file. Attempting direct link...');
                  // Fallback to direct link
                  window.open(getFileUrl(document.fileUrl), '_blank');
                }
              }}
            >
              View File
            </Button>
            {/* Added direct download button for redundancy */}
            <Button
              variant="text"
              size="small"
              onClick={() => window.open(getFileUrl(document.fileUrl), '_blank')}
              sx={{ ml: 1, textTransform: 'none', color: 'text.secondary' }}
            >
              (Direct Link)
            </Button>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={async () => {
                    try {
                      // Use authenticated API call for downloading
                      const response = await api.get(`/documents/${document._id}/download`, { 
                        responseType: 'blob' 
                      });
                      
                      // Create download link
                      const blob = new Blob([response.data], { 
                        type: response.headers['content-type'] || 'application/octet-stream' 
                      });
                      const url = window.URL.createObjectURL(blob);
                      const link = window.document.createElement('a');
                      link.href = url;
                      link.download = document.fileName || `document-${document._id}.pdf`;
                      window.document.body.appendChild(link);
                      link.click();
                      window.document.body.removeChild(link);
                      window.URL.revokeObjectURL(url);
                      toast.success('File downloaded successfully');
                    } catch (err) {
                      console.error('Download error:', err);
                      toast.error('Failed to download file');
                    }
                  }}
                >
                  Download File
                </Button>
              </Stack>
            )}
      </Box>

      <Paper sx={{ p: 4, mb: 3 }}>
        {/* Document Title and Status */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              {document.title}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              {getStatusChip(document.status)}
              <Chip
                icon={<Assignment />}
                label={document.documentType?.toUpperCase()}
                variant="outlined"
              />
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Document Details */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                <Description sx={{ fontSize: 16, mr: 1, verticalAlign: 'text-bottom' }} />
                Description
              </Typography>
              <Typography>{document.description || 'No description provided'}</Typography>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                <Person sx={{ fontSize: 16, mr: 1, verticalAlign: 'text-bottom' }} />
                Submitted By
              </Typography>
              <Typography>{document.studentId?.username || 'Unknown'}</Typography>
              <Typography variant="body2" color="text.secondary">
                {document.studentId?.email}
              </Typography>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                <CalendarToday sx={{ fontSize: 16, mr: 1, verticalAlign: 'text-bottom' }} />
                Submission Date
              </Typography>
              <Typography>{formatDate(document.submissionDate)}</Typography>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Current Stage
              </Typography>
              <Typography>{getDepartmentLabel(document.currentStage)}</Typography>
              {document.assignedTo && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Assigned to: {document.assignedTo.username}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* History Timeline */}
        {document.history && document.history.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              Approval History
            </Typography>
            <Stack spacing={2}>
              {document.history.map((entry, index) => (
                <Card key={index} variant="outlined" sx={{ backgroundColor: 'grey.50' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {entry.action?.charAt(0).toUpperCase() + entry.action?.slice(1)} - {getDepartmentLabel(entry.stage)}
                          {entry.approverId?.username && ` (by ${entry.approverId.username})`}
                        </Typography>
                        {entry.comment && (
                          <Typography variant="body2" color="text.secondary">
                            {entry.comment}
                          </Typography>
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(entry.timestamp)}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </>
        )}

        {/* Action Buttons */}
        {(user?.role === 'approver' || user?.role === 'admin') && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              Actions
            </Typography>
            
            {!document.assignedTo && document.status !== 'approved' && document.status !== 'rejected' && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleAssignToSelf}
                sx={{ mb: 2 }}
              >
                Assign to Me
              </Button>
            )}

            {canTakeAction() && (
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ gap: 2 }}>
                {user.role === 'approver' && (
                  <>
                    <Button
                      variant="contained"
                      color="info"
                      startIcon={<CheckCircle />}
                      onClick={() => handleOpenActionDialog('forward')}
                    >
                      Forward to Admin
                    </Button>
                    <Button
                      variant="contained"
                      color="warning"
                      startIcon={<Replay />}
                      onClick={() => handleOpenActionDialog('return')}
                    >
                      Return for Update
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={() => handleOpenActionDialog('reject')}
                    >
                      Reject
                    </Button>
                  </>
                )}

                {user.role === 'admin' && (
                  <>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircle />}
                      onClick={() => handleOpenActionDialog('approve')}
                      sx={{ minWidth: 200 }}
                    >
                      {document.currentDepartment === 'admin' || document.status === 'forwarded' 
                        ? 'Final Verification & Approve' 
                        : 'Direct Approve'}
                    </Button>
                    <Button
                      variant="contained"
                      color="warning"
                      startIcon={<Replay />}
                      onClick={() => handleOpenActionDialog('return')}
                    >
                      Return for Correction
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={() => handleOpenActionDialog('reject')}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </Stack>
            )}

            {document.status === 'approved' && (
              <Alert severity="success">This document has been approved.</Alert>
            )}
            {document.status === 'rejected' && (
              <Alert severity="error">This document has been rejected.</Alert>
            )}
          </>
        )}
      </Paper>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onClose={handleCloseActionDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedAction === 'approve' && 'Approve Document'}
          {selectedAction === 'reject' && 'Reject Document'}
          {selectedAction === 'return' && 'Return Document for Correction'}
          {selectedAction === 'forward' && 'Forward to Admin for Final Confirmation'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Comment (optional)"
            fullWidth
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={
              selectedAction === 'approve'
                ? 'Add any notes about your approval...'
                : selectedAction === 'reject'
                ? 'Please provide a reason for rejection...'
                : selectedAction === 'forward'
                ? 'Add any notes for the administrator...'
                : 'Please explain what needs to be corrected...'
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseActionDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitAction}
            variant="contained"
            color={
              selectedAction === 'approve' ? 'success' :
              selectedAction === 'reject' ? 'error' : 
              selectedAction === 'forward' ? 'info' : 'warning'
            }
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DocumentDetailPage;
