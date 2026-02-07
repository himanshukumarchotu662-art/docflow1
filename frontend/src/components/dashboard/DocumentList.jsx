import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Button
} from '@mui/material';
import {
  Description,
  Visibility,
  Assignment,
  Edit,
  Refresh
} from '@mui/icons-material';
import { formatDate } from '../../utils/formatters';
import { STATUS_COLORS } from '../../utils/constants';

const DocumentList = ({
  documents = [],
  isLoading = false,
  onView,
  onAssign,
  onAction,
  onRefresh,
  title,
  emptyMessage = "No documents found",
  showFilters = true
}) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">{title}</Typography>
        {onRefresh && (
          <IconButton onClick={onRefresh} size="small">
            <Refresh />
          </IconButton>
        )}
      </Box>

      {documents.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'background.default' }} elevation={0}>
          <Typography color="text.secondary">{emptyMessage}</Typography>
        </Paper>
      ) : (
        <List>
          {documents.map((doc) => (
            <Paper key={doc._id} sx={{ mb: 2, overflow: 'hidden' }} elevation={1}>
              <ListItem
                secondaryAction={
                  <Box>
                    {onView && (
                      <Tooltip title="View Details">
                        <IconButton edge="end" onClick={() => onView(doc._id)} sx={{ mr: 1 }}>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    )}
                    {onAssign && !doc.assignedTo && (
                      <Tooltip title="Assign to Me">
                        <IconButton edge="end" onClick={() => onAssign(doc._id)} sx={{ mr: 1 }}>
                          <Assignment />
                        </IconButton>
                      </Tooltip>
                    )}
                    {onAction && (
                      <Tooltip title="Take Action">
                        <IconButton edge="end" onClick={() => onAction(doc._id)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                }
              >
                <ListItemIcon>
                  <Description color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" component="span">
                        {doc.title}
                      </Typography>
                      <Chip
                        label={doc.status}
                        size="small"
                        sx={{
                          bgcolor: `${STATUS_COLORS[doc.status]}20`,
                          color: STATUS_COLORS[doc.status],
                          textTransform: 'capitalize',
                          height: 24
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box component="span" sx={{ display: 'flex', flexDirection: 'column', mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" component="span">
                        Type: {doc.documentType || doc.type} • Last Updated: {formatDate(doc.lastUpdated)}
                      </Typography>
                      {doc.currentDepartment && (doc.status === 'pending' || doc.status === 'forwarded' || doc.status === 'in-review') && (
                        <Typography variant="caption" color="primary" component="span">
                          📍 Currently at: {doc.currentDepartment.charAt(0).toUpperCase() + doc.currentDepartment.slice(1)} Department
                        </Typography>
                      )}
                      {doc.status === 'approved' && (
                        <Typography variant="caption" color="success.main" component="span">
                          ✅ Approved by all departments
                        </Typography>
                      )}
                      {doc.status === 'rejected' && (
                        <Typography variant="caption" color="error.main" component="span">
                          ❌ Rejected - please review feedback
                        </Typography>
                      )}
                      {doc.status === 'returned' && (
                        <Typography variant="caption" color="warning.main" component="span">
                          🔄 Returned for corrections - please resubmit
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            </Paper>
          ))}
        </List>
      )}
    </Box>
  );
};

export default DocumentList;
