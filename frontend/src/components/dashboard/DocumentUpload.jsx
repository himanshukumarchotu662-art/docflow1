import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { CloudUpload, Delete, Description } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { uploadDocument } from '../../services/api';
import { DOCUMENT_TYPES, MAX_FILE_SIZE, FILE_TYPES } from '../../utils/constants';
import { formatFileSize } from '../../utils/formatters';

const DocumentUpload = ({ onUploadSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    documentType: 'admission',
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpeg', '.jpg', '.png'],
    },
    maxSize: MAX_FILE_SIZE,
    maxFiles: 1,
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const error = rejectedFiles[0].errors[0];
        if (error.code === 'file-too-large') {
          toast.error('File size exceeds 5MB limit');
        } else if (error.code === 'file-invalid-type') {
          toast.error('Only PDF, JPEG, and PNG files are allowed');
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        // Auto-fill title from filename if not set
        if (!formData.title) {
          const fileName = acceptedFiles[0].name.replace(/\.[^/.]+$/, '');
          setFormData(prev => ({ ...prev, title: fileName }));
        }
      }
    },
  });

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!file) {
      newErrors.file = 'Please select a file to upload';
    }
    
    if (!formData.documentType) {
      newErrors.documentType = 'Document type is required';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setUploading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('title', formData.title);
      formDataObj.append('description', formData.description);
      formDataObj.append('documentType', formData.documentType);
      formDataObj.append('document', file);

      const response = await uploadDocument(formDataObj);
      
      toast.success('Document uploaded successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        documentType: 'admission',
      });
      setFile(null);
      
      // Notify parent component
      if (onUploadSuccess) {
        onUploadSuccess(response.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Upload New Document
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Document Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          margin="normal"
          required
          error={!!errors.title}
          helperText={errors.title}
          disabled={uploading}
        />

        <TextField
          fullWidth
          label="Description (Optional)"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          margin="normal"
          multiline
          rows={3}
          disabled={uploading}
        />

        <FormControl fullWidth margin="normal" error={!!errors.documentType}>
          <InputLabel>Document Type</InputLabel>
          <Select
            value={formData.documentType}
            label="Document Type"
            onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
            disabled={uploading}
          >
            {DOCUMENT_TYPES.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
          {errors.documentType && (
            <Typography variant="caption" color="error">
              {errors.documentType}
            </Typography>
          )}
        </FormControl>

        <Box sx={{ mt: 2 }}>
          {!file ? (
            <Box
              {...getRootProps()}
              sx={{
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'grey.300',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <input {...getInputProps()} />
              <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {isDragActive ? 'Drop the file here' : 'Drag & drop a file here'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                or click to select a file
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Supports PDF, JPEG, PNG (Max 5MB)
              </Typography>
            </Box>
          ) : (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Description color="primary" />
                <Box>
                  <Typography variant="subtitle1">{file.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(file.size)}
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={removeFile} disabled={uploading}>
                <Delete />
              </IconButton>
            </Paper>
          )}
          {errors.file && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
              {errors.file}
            </Typography>
          )}
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            After upload, your document will be automatically routed through the approval workflow.
            You can track its progress in your dashboard.
          </Typography>
        </Alert>

        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={() => {
              setFormData({
                title: '',
                description: '',
                documentType: 'admission',
              });
              setFile(null);
              setErrors({});
            }}
            disabled={uploading}
          >
            Clear
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={uploading || !file}
            startIcon={uploading ? <CircularProgress size={20} /> : null}
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default DocumentUpload;