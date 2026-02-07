const express = require('express');
const router = express.Router();
const { 
  uploadDocument,
  getMyDocuments,
  getPendingDocuments,
  getDocumentById,
  updateDocumentStatus,
  assignToSelf,
  getDocumentStats,
  getAllDocuments,
  getApprovalHistory,
  viewDocument,
  downloadDocument,
} = require('../Controllers/documentController');
const { protect, authorize } = require('../Middleware/auth');
const upload = require('../Middleware/upload');

// Admin routes
router.get('/', protect, authorize('admin'), getAllDocuments);

// Student routes
router.post(
  '/upload',
  protect,
  authorize('student'),
  upload.single('document'),
  uploadDocument
);
router.get('/my-documents', protect, authorize('student'), getMyDocuments);

// Approver/Admin routes for processing
router.get('/pending', protect, authorize('approver', 'admin'), getPendingDocuments);
router.get('/approval-history', protect, authorize('approver', 'admin'), getApprovalHistory);
router.put('/:id/status', protect, authorize('approver', 'admin'), updateDocumentStatus);
router.put('/:id/assign', protect, authorize('approver', 'admin'), assignToSelf);

// Shared routes (stats before :id to avoid matching 'stats' as id)
router.get('/stats', protect, getDocumentStats);

// Document View/Download Routes
router.get('/:id/view', protect, viewDocument);
router.get('/:id/download', protect, downloadDocument);

router.get('/:id', protect, getDocumentById);

module.exports = router;