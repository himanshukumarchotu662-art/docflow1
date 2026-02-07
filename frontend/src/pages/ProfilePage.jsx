import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  IconButton,
} from '@mui/material';
import { getProfile, getFileUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  CloudUpload,
  Save,
  Lock,
  Visibility,
  VisibilityOff,
  Notifications,
  Person,
  Email,
  CalendarToday,
  Image,
} from '@mui/icons-material';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth(); // Use updateProfile from AuthContext for state sync
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    age: '',
    profilePhoto: '',
    role: '',
    department: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      const userData = response.data;
      setFormData({
        username: userData.username || '',
        email: userData.email || '',
        age: userData.age || '',
        profilePhoto: userData.profilePhoto || '',
        role: userData.role || '',
        department: userData.department || '',
        password: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile data' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size exceeds 2MB limit');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const profileData = new FormData();
      profileData.append('username', formData.username);
      profileData.append('email', formData.email);
      if (formData.age) profileData.append('age', formData.age);
      
      if (selectedFile) {
        profileData.append('profilePhoto', selectedFile);
      } else {
        profileData.append('profilePhoto', formData.profilePhoto);
      }

      if (formData.password) {
        if (formData.password !== formData.confirmPassword) {
          setMessage({ type: 'error', text: 'Passwords do not match' });
          setSaving(false);
          return;
        }
        if (formData.password.length < 6) {
          setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
          setSaving(false);
          return;
        }
        profileData.append('password', formData.password);
      }

      const result = await updateProfile(profileData);

      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        // Sync local formData with the updated user info from context
        if (result.user) {
          setFormData({
            username: result.user.username || '',
            email: result.user.email || '',
            age: result.user.age || '',
            profilePhoto: result.user.profilePhoto || '',
            role: result.user.role || '',
            department: result.user.department || '',
            password: '',
            confirmPassword: '',
          });
        }
        setSelectedFile(null); // Clear selected file after successful upload
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <Avatar
              src={previewUrl || getFileUrl(formData.profilePhoto)}
              alt={formData.username}
              sx={{ width: 120, height: 120, mb: 2, mx: 'auto', border: '4px solid white', boxShadow: 3, fontSize: '3rem' }}
            >
              {formData.username?.charAt(0).toUpperCase()}
            </Avatar>
            <input
              type="file"
              accept="image/*"
              id="profile-photo-input"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <label htmlFor="profile-photo-input">
              <Button
                variant="contained"
                size="small"
                component="span"
                startIcon={<CloudUpload />}
                sx={{ 
                  position: 'absolute', 
                  bottom: 16, 
                  right: -10, 
                  borderRadius: '50%', 
                  minWidth: 40, 
                  width: 40, 
                  height: 40, 
                  p: 0,
                  '& .MuiButton-startIcon': { margin: 0 }
                }}
              />
            </label>
          </Box>
          <Typography variant="h4" fontWeight="bold">
            {formData.username}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
            {formData.role} {formData.department && `• ${formData.department}`}
          </Typography>
        </Box>

        {message.text && (
          <Alert severity={message.type} sx={{ mb: 3 }}>
            {message.text}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person color="primary" /> Personal Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: <Person color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
               <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: <Email color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <CalendarToday color="action" sx={{ mr: 1 }} />,
                  inputProps: { min: 0 }
                }}
              />
            </Grid>

             <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Profile Photo URL"
                name="profilePhoto"
                value={formData.profilePhoto}
                onChange={handleChange}
                placeholder="https://example.com/photo.jpg"
                InputProps={{
                  startAdornment: <Image color="action" sx={{ mr: 1 }} />,
                }}
                helperText="Enter a URL for your profile picture"
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Lock color="primary" /> Security (Change Password)
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="New Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave blank to keep current"
                InputProps={{
                  startAdornment: <Lock color="action" sx={{ mr: 1 }} />,
                  endAdornment: (
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Confirm New Password"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <Lock color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid', borderColor: 'divider', pt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<Save />}
                  disabled={saving}
                  sx={{ px: 4 }}
                >
                  {saving ? 'Saving Changes...' : 'Save Settings'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default ProfilePage;
