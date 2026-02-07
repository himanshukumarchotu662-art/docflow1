import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  IconButton,
  Tooltip,
  CardHeader,
  Avatar,
} from '@mui/material';
import {
  Description,
  Visibility,
  Download,
  Schedule,
  Person,
  Business,
  ArrowForward,
  CheckCircle,
  Cancel,
  Autorenew,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { formatDate, getStatusLabel, getDepartmentLabel } from '../../utils/formatters';
import { STATUS_COLORS } from '../../utils/constants';
import { getFileUrl } from '../../services/api';

const DocumentCard = ({ 
  document, 
  showActions = true, 
  onView, 
  onDownload,
  onAssign,
  onAction,
  isApprover = false 
}) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle fontSize="small" />;
      case 'rejected':
        return <Cancel fontSize="small" />;
      case 'returned':
        return <Autorenew fontSize="small" />;
      default:
        return <Description fontSize="small" />;
    }
  };

  const getStatusChip = (status) => {
    const color = STATUS_COLORS[status] || 'default';
    return (
      <Chip
        icon={getStatusIcon(status)}
        label={getStatusLabel(status)}
        size="small"
        sx={{
          backgroundColor: `${color}15`,
          color: color,
          border: `1px solid ${color}30`,
          fontWeight: 500,
        }}
      />
    );
  };

  const handleView = () => {
    if (onView) {
      onView(document);
    }
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    if (onDownload) {
      onDownload(document);
    } else {
      window.open(getFileUrl(document.fileUrl), '_blank');
    }
  };

  const handleAssign = (e) => {
    e.stopPropagation();
    if (onAssign) {
      onAssign(document._id);
    }
  };

  const formatFileName = (fileName) => {
    if (fileName.length > 30) {
      return fileName.substring(0, 15) + '...' + fileName.substring(fileName.length - 10);
    }
    return fileName;
  };

  return (
    <Card 
      elevation={2} 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
        cursor: 'pointer',
      }}
      onClick={handleView}
    >
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: STATUS_COLORS[document.status] }}>
            {getStatusIcon(document.status)}
          </Avatar>
        }
        action={getStatusChip(document.status)}
        title={
          <Typography variant="h6" noWrap>
            {document.title}
          </Typography>
        }
        subheader={
          <Typography variant="caption" color="text.secondary">
            {formatDate(document.submissionDate, 'MMM dd, yyyy')}
          </Typography>
        }
      />

      <CardContent sx={{ flexGrow: 1, pt: 0 }}>
        {document.description && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {document.description}
          </Typography>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Business fontSize="small" sx={{ color: 'primary.main' }} />
            <Typography variant="body2">
              <strong>Type:</strong>{' '}
              <span style={{ textTransform: 'capitalize' }}>
                {document.documentType}
              </span>
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Business fontSize="small" sx={{ color: 'secondary.main' }} />
            <Typography variant="body2">
              <strong>Current Stage:</strong>{' '}
              {document.currentStage ? getDepartmentLabel(document.currentStage) : 'Completed'}
            </Typography>
          </Box>

          {document.assignedTo && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person fontSize="small" sx={{ color: 'info.main' }} />
              <Typography variant="body2">
                <strong>Assigned To:</strong>{' '}
                {document.assignedTo.username}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Schedule fontSize="small" sx={{ color: 'text.secondary' }} />
            <Typography variant="body2">
              <strong>Last Updated:</strong>{' '}
              {formatDate(document.lastUpdated, 'MMM dd, HH:mm')}
            </Typography>
          </Box>
        </Box>

        {document.fileName && (
          <Box 
            sx={{ 
              mt: 2,
              p: 1,
              bgcolor: 'action.hover',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Description fontSize="small" />
              <Typography variant="caption" noWrap>
                {formatFileName(document.fileName)}
              </Typography>
            </Box>
            <Tooltip title="Download">
              <IconButton 
                size="small" 
                onClick={handleDownload}
                sx={{ ml: 1 }}
              >
                <Download fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </CardContent>

      {showActions && (
        <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}>
          <Button
            size="small"
            startIcon={<Visibility />}
            onClick={handleView}
          >
            View Details
          </Button>
          
          {isApprover && document.status === 'pending' && !document.assignedTo && (
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={handleAssign}
            >
              Assign to Me
            </Button>
          )}

          {isApprover && document.assignedTo && document.assignedTo._id === document.assignedTo && (
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              endIcon={<ArrowForward />}
              onClick={() => onAction && onAction(document._id)}
            >
              Take Action
            </Button>
          )}
        </CardActions>
      )}
    </Card>
  );
};

export default DocumentCard;