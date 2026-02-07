import * as yup from 'yup';

// User validation schemas
export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export const registerSchema = yup.object().shape({
  username: yup
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .required('Username is required'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
  role: yup
    .string()
    .oneOf(['student', 'approver', 'admin'], 'Invalid role selected')
    .required('Role is required'),
  department: yup
    .string()
    .when('role', {
      is: 'approver',
      then: (schema) => schema.required('Department is required for approvers'),
      otherwise: (schema) => schema.nullable(),
    }),
});

export const profileUpdateSchema = yup.object().shape({
  username: yup
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: yup
    .string()
    .email('Please enter a valid email address'),
  currentPassword: yup
    .string()
    .when(['newPassword'], {
      is: (newPassword) => !!newPassword,
      then: (schema) => schema.required('Current password is required to change password'),
    }),
  newPassword: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .when(['currentPassword'], {
      is: (currentPassword) => !!currentPassword,
      then: (schema) => schema.required('New password is required'),
    }),
  confirmNewPassword: yup
    .string()
    .when('newPassword', {
      is: (newPassword) => !!newPassword,
      then: (schema) => 
        schema
          .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
          .required('Please confirm your new password'),
    }),
});

// Document validation schemas
export const documentUploadSchema = yup.object().shape({
  title: yup
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be at most 200 characters')
    .required('Document title is required'),
  description: yup
    .string()
    .max(1000, 'Description must be at most 1000 characters')
    .nullable(),
  documentType: yup
    .string()
    .oneOf(['admission', 'scholarship', 'transfer', 'graduation', 'other'], 'Invalid document type')
    .required('Document type is required'),
  file: yup
    .mixed()
    .required('A file is required')
    .test('fileSize', 'File size is too large', (value) => {
      if (!value) return true;
      return value.size <= 5 * 1024 * 1024; // 5MB
    })
    .test('fileType', 'Unsupported file format', (value) => {
      if (!value) return true;
      const supportedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
      ];
      return supportedTypes.includes(value.type);
    }),
});

export const documentUpdateSchema = yup.object().shape({
  title: yup
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be at most 200 characters'),
  description: yup
    .string()
    .max(1000, 'Description must be at most 1000 characters')
    .nullable(),
  status: yup
    .string()
    .oneOf(['pending', 'in-review', 'approved', 'rejected', 'returned'], 'Invalid status'),
});

export const documentActionSchema = yup.object().shape({
  action: yup
    .string()
    .oneOf(['approve', 'reject', 'return'], 'Invalid action')
    .required('Action is required'),
  comment: yup
    .string()
    .max(500, 'Comment must be at most 500 characters')
    .nullable(),
});

// File validation helpers
export const validateFile = (file) => {
  const errors = [];

  // Check if file exists
  if (!file) {
    errors.push('No file selected');
    return errors;
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    errors.push('File size exceeds 5MB limit');
  }

  // Check file type
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
  ];
  
  if (!allowedTypes.includes(file.type)) {
    errors.push('File type not supported. Please upload PDF, JPEG, PNG, or GIF files');
  }

  // Check file name length
  if (file.name.length > 255) {
    errors.push('File name is too long');
  }

  return errors;
};

export const validateMultipleFiles = (files, maxFiles = 10) => {
  const errors = [];

  // Check number of files
  if (files.length > maxFiles) {
    errors.push(`Maximum ${maxFiles} files allowed`);
    return errors;
  }

  // Validate each file
  files.forEach((file, index) => {
    const fileErrors = validateFile(file);
    if (fileErrors.length > 0) {
      errors.push(`File ${index + 1}: ${fileErrors.join(', ')}`);
    }
  });

  // Check total size (20MB limit for multiple files)
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const maxTotalSize = 20 * 1024 * 1024; // 20MB
  if (totalSize > maxTotalSize) {
    errors.push('Total file size exceeds 20MB limit');
  }

  return errors;
};

// Form field validation helpers
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return '';
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  
  if (!hasUpperCase) return 'Password must contain at least one uppercase letter';
  if (!hasLowerCase) return 'Password must contain at least one lowercase letter';
  if (!hasNumbers) return 'Password must contain at least one number';
  
  return '';
};

export const validateUsername = (username) => {
  if (!username) return 'Username is required';
  if (username.length < 3) return 'Username must be at least 3 characters';
  if (username.length > 30) return 'Username must be at most 30 characters';
  
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return 'Username can only contain letters, numbers, and underscores';
  }
  
  return '';
};

export const validateDocumentTitle = (title) => {
  if (!title) return 'Document title is required';
  if (title.length < 3) return 'Title must be at least 3 characters';
  if (title.length > 200) return 'Title must be at most 200 characters';
  return '';
};

export const validateComment = (comment) => {
  if (comment && comment.length > 500) {
    return 'Comment must be at most 500 characters';
  }
  return '';
};

// Search validation
export const validateSearchQuery = (query) => {
  if (query && query.length > 100) {
    return 'Search query is too long';
  }
  return '';
};

// Date validation
export const validateDateRange = (startDate, endDate) => {
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return 'Start date cannot be after end date';
    }
    
    // Check if range is too large (1 year max)
    const oneYearInMs = 365 * 24 * 60 * 60 * 1000;
    if (end - start > oneYearInMs) {
      return 'Date range cannot exceed 1 year';
    }
  }
  return '';
};

// Export all validators
export default {
  // Schemas
  loginSchema,
  registerSchema,
  profileUpdateSchema,
  documentUploadSchema,
  documentUpdateSchema,
  documentActionSchema,
  
  // Helper functions
  validateFile,
  validateMultipleFiles,
  validateEmail,
  validatePassword,
  validateUsername,
  validateDocumentTitle,
  validateComment,
  validateSearchQuery,
  validateDateRange,
};