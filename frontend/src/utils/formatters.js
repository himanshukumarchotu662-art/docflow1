import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (date, formatStr = 'PPpp') => {
  if (!date) return 'N/A';
  return format(new Date(date), formatStr);
};

export const formatRelativeTime = (date) => {
  if (!date) return 'N/A';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pending',
    'in-review': 'In Review',
    approved: 'Approved',
    rejected: 'Rejected',
    returned: 'Returned for Correction',
    forwarded: 'Forwarded to Admin',
  };
  return labels[status] || status;
};

export const getDepartmentLabel = (dept) => {
  const labels = {
    admissions: 'Admissions Office',
    finance: 'Finance Department',
    registrar: 'Registrar Office',
    scholarship: 'Scholarship Committee',
    admin: 'Administrator',
  };
  return labels[dept] || dept;
};