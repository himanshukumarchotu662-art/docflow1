const Document = require('../Models/Document');
const Workflow = require('../Models/Workflow');
const User = require('../Models/User');
const { sendEmail } = require('../Utils/emailService');
const fs = require('fs');
const path = require('path');

// Helper to get initial department based on document type
const getInitialDepartment = (documentType) => {
  const mapping = {
    'admission': 'admissions',
    'scholarship': 'scholarship',
    'transfer': 'admissions',
    'graduation': 'registrar',
    'other': 'admin'
  };
  return mapping[documentType] || 'admin';
};

// Helper to fix misrouted documents in the database
const fixMisroutedDocuments = async (department) => {
  try {
    const wrongTypesForDept = {
      'scholarship': ['admission', 'transfer', 'graduation'], // These shouldn't be in scholarship
      'admissions': ['scholarship', 'graduation'], // Scholarship shouldn't be here
    };

    // Fix: Scholarship documents in Admissions
    if (department === 'scholarship') {
       const result = await Document.updateMany(
        { 
          documentType: 'scholarship', 
          currentDepartment: { $in: ['admissions', 'admin', null, ''] },
          status: { $in: ['pending', 'in-review'] }
        },
        { $set: { currentDepartment: 'scholarship', currentStage: 'scholarship' } }
      );
      if (result.modifiedCount > 0) {
        console.log(`✅ Re-routed ${result.modifiedCount} scholarship documents to Scholarship Committee`);
      }
    }
  } catch (error) {
    console.error('Error fixing misrouted documents:', error);
  }
};

// @desc    Upload document
// @route   POST /api/documents/upload
// @access  Private (Student)
const uploadDocument = async (req, res) => {
  try {
    const { title, description, documentType } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    // Validate file size
    if (req.file.size > 5 * 1024 * 1024) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'File size exceeds 5MB limit' });
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        message: 'Invalid file type. Only PDF, JPEG, and PNG are allowed.' 
      });
    }

    // Use local file storage instead of Cloudinary
    // The file is already saved by multer to uploads/ folder
    // Use /uploads/ path (not /api/uploads/) since frontend VITE_API_URL already includes /api
    const fileUrl = `/uploads/${req.file.filename}`;

    // Get workflow for document type
    const workflow = await Workflow.findOne({ 
      documentType,
      isActive: true 
    });

    // If no workflow found, use default mapping
    let currentDept = '';
    let workflowId = null;

    if (workflow) {
      const firstStage = workflow.stages.find(s => s.order === 1);
      currentDept = firstStage.department;
      workflowId = workflow._id;

      // FIX: If scholarship is incorrectly routed to admissions (bug in seed), correct it
      if (documentType === 'scholarship' && currentDept === 'admissions') {
        console.log('🔄 Correcting scholarship workflow: admissions -> scholarship');
        currentDept = 'scholarship';
        
        // Update the workflow stage in database to prevent future issues
        const stageIndex = workflow.stages.findIndex(s => s.order === 1);
        if (stageIndex !== -1) {
          workflow.stages[stageIndex].department = 'scholarship';
          await workflow.save();
        }
      }
    } else {
      currentDept = getInitialDepartment(documentType);
    }
    
    // Create document
    const document = await Document.create({
      title,
      description: description || '',
      studentId: req.user.id,
      fileUrl: fileUrl,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      documentType,
      status: 'pending',
      currentStage: currentDept,
      currentDepartment: currentDept,
      workflowId: workflowId,
      history: [{
        stage: currentDept,
        action: 'submitted',
        comment: 'Document submitted for approval',
      }],
    });

    // Find approvers in the determined department
    const approvers = await User.find({
      role: 'approver',
      department: currentDept,
      isActive: true,
    });

    // Send email notifications to approvers
    approvers.forEach(approver => {
      sendEmail({
        to: approver.email,
        subject: 'New Document Pending Approval',
        text: `A new document "${title}" has been submitted and requires your approval in ${currentDept} department.`,
        html: `
          <h2>New Document Pending Approval</h2>
          <p>A new document <strong>"${title}"</strong> has been submitted and requires your approval.</p>
          <p><strong>Department:</strong> ${currentDept}</p>
          <p><strong>Submitted by:</strong> ${req.user.username}</p>
          <p>Please log in to DocFlow to review this document.</p>
        `,
      });
    });

    // Note: File is kept locally for serving - no cleanup needed
    // (removed fs.unlinkSync since we're using local storage instead of Cloudinary)

    res.status(201).json({
      success: true,
      data: document
    });
  } catch (error) {
    // Only clean up local file if there was an error during upload
    // to avoid orphaned files in the uploads folder
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Server error during upload' 
    });
  }
};

// @desc    Get all documents for student
// @route   GET /api/documents/my-documents
// @access  Private (Student)
const getMyDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ studentId: req.user.id })
      .populate('assignedTo', 'username email')
      .sort('-submissionDate');
    
    res.json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    console.error('Get my documents error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Server error' 
    });
  }
};

// @desc    Get pending documents for approver
// @route   GET /api/documents/pending
// @access  Private (Approver)
const getPendingDocuments = async (req, res) => {
  try {
    // Audit check: ensure documents are in the right place for this department
    if (req.user.role === 'approver') {
      await fixMisroutedDocuments(req.user.department);
    }

    const query = {
      status: { $in: ['pending', 'in-review', 'forwarded'] },
    };

    // If not admin, filter by department
    if (req.user.role !== 'admin') {
      // Find documents where currentDepartment matches OR (if currentDepartment is missing and documentType mapping matches)
      const dept = req.user.department;
      
      query.$or = [
        { currentDepartment: dept },
        { 
          currentDepartment: { $in: [null, ''] },
          documentType: { 
            $in: Object.keys({
              'admission': 'admissions',
              'scholarship': 'scholarship',
              'transfer': 'admissions',
              'graduation': 'registrar'
            }).filter(type => {
              const mapping = {
                'admission': 'admissions',
                'scholarship': 'scholarship',
                'transfer': 'admissions',
                'graduation': 'registrar'
              };
              return mapping[type] === dept;
            })
          }
        }
      ];
    }

    const documents = await Document.find(query)
      .populate('studentId', 'username email')
      .populate('assignedTo', 'username email')
      .sort('-lastUpdated');
    
    res.json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    console.error('Get pending documents error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Server error' 
    });
  }
};

// @desc    Get document by ID
// @route   GET /api/documents/:id
// @access  Private
const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('studentId', 'username email')
      .populate('assignedTo', 'username email')
      .populate('history.approverId', 'username')
      .populate('workflowId', 'name stages');

    if (!document) {
      return res.status(404).json({ 
        success: false,
        message: 'Document not found' 
      });
    }

    // Check authorization
    if (req.user.role === 'student' && document.studentId._id.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to view this document' 
      });
    }

    if (req.user.role === 'approver' && document.currentDepartment !== req.user.department) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized for this department' 
      });
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    console.error('Get document by ID error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false,
        message: 'Document not found' 
      });
    }
    res.status(500).json({ 
      success: false,
      message: error.message || 'Server error' 
    });
  }
};

// @desc    Update document status (approve/reject/return)
// @route   PUT /api/documents/:id/status
// @access  Private (Approver)
const updateDocumentStatus = async (req, res) => {
  try {
    const { action, comment } = req.body;
    
    // Validate action
    const validActions = ['approve', 'reject', 'return', 'forward'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid action. Must be: approve, reject, return, or forward' 
      });
    }

    const document = await Document.findById(req.params.id)
      .populate('studentId', 'email username')
      .populate('workflowId');

    if (!document) {
      return res.status(404).json({ 
        success: false,
        message: 'Document not found' 
      });
    }

    // Check if approver has permission for this department
    // Admins can take action on any stage, especially 'admin' stage
    if (req.user.role !== 'admin' && document.currentDepartment !== req.user.department) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized for this department' 
      });
    }

    const workflow = document.workflowId;
    const currentStageIndex = workflow ? workflow.stages.findIndex(
      s => s.department === document.currentStage
    ) : -1;

    let newStatus = document.status;
    let nextStage = document.currentStage;
    let nextDepartment = document.currentDepartment;

    // Handle different actions
    switch (action) {
      case 'approve':
        if (req.user.role === 'admin' || !workflow || currentStageIndex === workflow.stages.length - 1 || document.currentDepartment === 'admin') {
          // Admin approval OR No workflow OR Last stage OR Forwarded Admin approval - document approved
          newStatus = 'approved';
          nextStage = 'completed';
          nextDepartment = null;
        } else {
          // Move to next stage based on workflow
          const nextStageInfo = workflow.stages[currentStageIndex + 1];
          nextStage = nextStageInfo.department;
          nextDepartment = nextStageInfo.department;
          newStatus = 'pending';
        }
        break;

      case 'reject':
        newStatus = 'rejected';
        nextStage = 'rejected';
        nextDepartment = null;
        break;

      case 'return':
        newStatus = 'returned';
        nextStage = 'returned';
        nextDepartment = null;
        break;

      case 'forward':
        newStatus = 'forwarded';
        nextStage = 'admin';
        nextDepartment = 'admin';
        break;
    }

    // Save current stage for history
    const previousStage = document.currentStage;

    // Update document
    document.status = newStatus;
    document.currentStage = nextStage;
    document.currentDepartment = nextDepartment;
    document.assignedTo = null;
    document.lastUpdated = Date.now();

    // Convert action to past tense for history
    const actionText = action === 'approve' ? 'approved' : 
                      action === 'reject' ? 'rejected' : 
                      action === 'return' ? 'returned' : 'forwarded';

    // Add to history
    document.history.push({
      stage: previousStage,
      approverId: req.user.id,
      action: actionText,
      comment: comment || '',
      timestamp: new Date(),
    });

    await document.save();

    // Send email notification to student
    
    sendEmail({
      to: document.studentId.email,
      subject: `Document ${actionText.charAt(0).toUpperCase() + actionText.slice(1)} - ${document.title}`,
      text: `Your document "${document.title}" has been ${actionText}. ${comment ? `Comment: ${comment}` : ''}`,
      html: `
        <h2>Document ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}</h2>
        <p>Your document <strong>"${document.title}"</strong> has been <strong>${actionText}</strong>.</p>
        ${comment ? `<p><strong>Comment from approver:</strong> ${comment}</p>` : ''}
        <p>Login to DocFlow to view details and track progress.</p>
      `,
    });

    // If moving to next stage, notify next department approvers
    if (action === 'approve' && nextDepartment) {
      const nextApprovers = await User.find({
        role: 'approver',
        department: nextDepartment,
        isActive: true,
      });

      nextApprovers.forEach(approver => {
        sendEmail({
          to: approver.email,
          subject: 'Document Forwarded for Approval',
          text: `Document "${document.title}" has been forwarded to your department (${nextDepartment}) for approval.`,
          html: `
            <h2>Document Forwarded for Approval</h2>
            <p>Document <strong>"${document.title}"</strong> has been forwarded to your department.</p>
            <p><strong>Department:</strong> ${nextDepartment}</p>
            <p><strong>Current Status:</strong> Pending approval</p>
            <p>Please log in to DocFlow to review this document.</p>
          `,
        });
      });
    }

    // Emit socket event for real-time updates
    if (req.io) {
      req.io.to(document.studentId._id.toString()).emit('document-updated', {
        documentId: document._id,
        status: newStatus,
        action: action,
        timestamp: new Date(),
      });
      
      if (nextDepartment) {
        req.io.to(nextDepartment).emit('new-document', {
          documentId: document._id,
          title: document.title,
          department: nextDepartment,
        });
      }
    }

    res.json({
      success: true,
      data: document,
      message: `Document ${actionText} successfully`
    });
  } catch (error) {
    console.error('Update document status error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false,
        message: 'Document not found' 
      });
    }
    res.status(500).json({ 
      success: false,
      message: error.message || 'Server error' 
    });
  }
};

// @desc    Assign document to self
// @route   PUT /api/documents/:id/assign
// @access  Private (Approver)
const assignToSelf = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ 
        success: false,
        message: 'Document not found' 
      });
    }

    // Check if document is in approver's department
    if (document.currentDepartment !== req.user.department) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized for this department' 
      });
    }

    // Check if document is not already assigned
    if (document.assignedTo && document.assignedTo.toString() !== req.user.id) {
      return res.status(400).json({ 
        success: false,
        message: 'Document already assigned to another approver' 
      });
    }

    document.assignedTo = req.user.id;
    document.status = 'in-review';
    document.lastUpdated = Date.now();

    await document.save();

    // Emit socket event
    if (req.io) {
      req.io.to(document.studentId.toString()).emit('document-assigned', {
        documentId: document._id,
        assignedTo: req.user.username,
        timestamp: new Date(),
      });
    }

    res.json({
      success: true,
      data: document,
      message: 'Document assigned to you successfully'
    });
  } catch (error) {
    console.error('Assign to self error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false,
        message: 'Document not found' 
      });
    }
    res.status(500).json({ 
      success: false,
      message: error.message || 'Server error' 
    });
  }
};

// @desc    Get document statistics
// @route   GET /api/documents/stats
// @access  Private
const getDocumentStats = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'student') {
      query.studentId = req.user.id;
    } else if (req.user.role === 'approver') {
      const dept = req.user.department;
      query.$or = [
        { currentDepartment: dept },
        { 
          currentDepartment: { $in: [null, ''] },
          documentType: { 
            $in: Object.keys({
              'admission': 'admissions',
              'scholarship': 'scholarship',
              'transfer': 'admissions',
              'graduation': 'registrar'
            }).filter(type => {
              const mapping = {
                'admission': 'admissions',
                'scholarship': 'scholarship',
                'transfer': 'admissions',
                'graduation': 'registrar'
              };
              return mapping[type] === dept;
            })
          }
        }
      ];
    }
    // Admin can see all documents

    const total = await Document.countDocuments(query);
    const pending = await Document.countDocuments({ ...query, status: { $in: ['pending', 'forwarded'] } });
    const inReview = await Document.countDocuments({ ...query, status: 'in-review' });
    const approved = await Document.countDocuments({ ...query, status: 'approved' });
    const rejected = await Document.countDocuments({ ...query, status: 'rejected' });
    const returned = await Document.countDocuments({ ...query, status: 'returned' });

    res.json({
      success: true,
      data: {
        total,
        pending,
        inReview,
        approved,
        rejected,
        returned,
      }
    });
  } catch (error) {
    console.error('Get document stats error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Server error' 
    });
  }
};

// @desc    Get all documents (Admin only)
// @route   GET /api/documents
// @access  Private (Admin)
const getAllDocuments = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Admin access required' 
      });
    }

    const documents = await Document.find()
      .populate('studentId', 'username email')
      .populate('assignedTo', 'username email')
      .sort('-submissionDate');

    res.json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    console.error('Get all documents error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Server error' 
    });
  }
};

// @desc    Get approval history for approver (documents they've processed)
// @route   GET /api/documents/approval-history
// @access  Private (Approver)
const getApprovalHistory = async (req, res) => {
  try {
    // Find documents where this approver has taken action in the history
    const documents = await Document.find({
      'history.approverId': req.user.id
    })
      .populate('studentId', 'username email')
      .populate('history.approverId', 'username')
      .sort('-lastUpdated');
    
    res.json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    console.error('Get approval history error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Server error' 
    });
  }
};

// @desc    View document
// @route   GET /api/documents/:id/view
// @access  Private
const viewDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user has access
    // (Reuse existing access logic or assume authorized since route is protected)
    const canAccess = 
      req.user.role === 'admin' ||
      req.user.role === 'approver' ||
      (req.user.role === 'student' && document.studentId.toString() === req.user.id);
      
    if (!canAccess) {
      return res.status(403).json({ message: 'Not authorized to view this document' });
    }

    // If it's an absolute URL (Cloudinary, etc), redirect to it
    if (document.fileUrl.startsWith('http')) {
      return res.redirect(document.fileUrl);
    }

    // Extract filename from URL more robustly
    const filename = path.basename(document.fileUrl);
    const filePath = path.join(__dirname, '../uploads', filename);

    if (!fs.existsSync(filePath)) {
      console.error(`File not found at path: ${filePath}`);
      return res.status(404).json({ message: 'File not found on server' });
    }

    // Set headers
    const contentType = document.fileType || (filename.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream');
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${document.fileName || filename}"`);

    // Stream file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error viewing document:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Download document
// @route   GET /api/documents/:id/download
// @access  Private
const downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // If it's an absolute URL, redirect to it
    if (document.fileUrl.startsWith('http')) {
      return res.redirect(document.fileUrl);
    }

    // Extract filename from URL
    const filename = path.basename(document.fileUrl);
    const filePath = path.join(__dirname, '../uploads', filename);

    if (!fs.existsSync(filePath)) {
      console.error(`File not found at path: ${filePath}`);
      return res.status(404).json({ message: 'File not found on server' });
    }

    // Set headers for download
    res.download(filePath, document.fileName || filename, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Error downloading file' });
        }
      }
    });

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
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
};