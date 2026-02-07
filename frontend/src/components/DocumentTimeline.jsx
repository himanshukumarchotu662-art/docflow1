import React from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import {
  CheckCircle,
  Cancel,
  Autorenew,
  Description,
  Send,
} from '@mui/icons-material';
import { formatDate } from '../../utils/formatters';
import { STATUS_COLORS } from '../../utils/constants';

const DocumentTimeline = ({ history, isLoading, height = '400px' }) => {
  const getStatusIcon = (action) => {
    switch (action) {
      case 'approved':
        return <CheckCircle />;
      case 'rejected':
        return <Cancel />;
      case 'returned':
        return <Autorenew />;
      case 'submitted':
        return <Description />;
      case 'forwarded':
        return <Send />;
      default:
        return <Description />;
    }
  };

  const getStageLabel = (stage) => {
    const labels = {
      'admissions': 'Admissions Office',
      'finance': 'Finance Department',
      'registrar': 'Registrar Office',
      'scholarship': 'Scholarship Committee',
      'completed': 'Completed',
      'rejected': 'Rejected',
      'returned': 'Returned',
    };
    return labels[stage] || stage;
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={height}>
        <CircularProgress />
      </Box>
    );
  }

  if (!history || history.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center', height }}>
        <Typography variant="body1" color="text.secondary">
          No timeline data available
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ height, overflowY: 'auto', pr: 1 }}>
      <VerticalTimeline layout="1-column">
        {history.map((event, index) => (
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
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              {getStageLabel(event.stage)}
            </Typography>
            <Typography variant="body2" color="primary" gutterBottom>
              {event.action.charAt(0).toUpperCase() + event.action.slice(1)}
            </Typography>
            
            {event.approverId && (
              <Typography variant="body2" gutterBottom>
                <strong>Approver:</strong> {event.approverId?.username || 'System'}
              </Typography>
            )}
            
            {event.comment && (
              <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  <strong>Comment:</strong>
                </Typography>
                <Typography variant="body2">
                  {event.comment}
                </Typography>
              </Box>
            )}
          </VerticalTimelineElement>
        ))}
      </VerticalTimeline>
    </Box>
  );
};

export default DocumentTimeline;