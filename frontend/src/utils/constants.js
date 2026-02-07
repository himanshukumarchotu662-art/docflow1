export const ROLES = {
  STUDENT: 'student',
  APPROVER: 'approver',
  ADMIN: 'admin',
};

export const DOCUMENT_TYPES = [
  { value: 'admission', label: 'Admission Application' },
  { value: 'scholarship', label: 'Scholarship Application' },
  { value: 'transfer', label: 'Transfer Application' },
  { value: 'graduation', label: 'Graduation Application' },
  { value: 'other', label: 'Other' },
];

export const DOCUMENT_STATUS = {
  PENDING: 'pending',
  IN_REVIEW: 'in-review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  RETURNED: 'returned',
  FORWARDED: 'forwarded',
};

export const STATUS_COLORS = {
  pending: '#ff9800',
  'in-review': '#2196f3',
  approved: '#4caf50',
  rejected: '#f44336',
  returned: '#9c27b0',
  forwarded: '#673ab7',
};

export const DEPARTMENTS = [
  { value: 'admissions', label: 'Admissions Office' },
  { value: 'finance', label: 'Finance Department' },
  { value: 'registrar', label: 'Registrar Office' },
  { value: 'scholarship', label: 'Scholarship Committee' },
  { value: 'admin', label: 'Administrator' },
];

export const ACTIONS = [
  { value: 'approve', label: 'Approve', color: 'success' },
  { value: 'reject', label: 'Reject', color: 'error' },
  { value: 'return', label: 'Return for Correction', color: 'warning' },
  { value: 'forward', label: 'Forward to Admin', color: 'info' },
];

export const FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB