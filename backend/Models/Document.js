const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  stage: {
    type: String,
    required: true,
  },
  approverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  action: {
    type: String,
    enum: ['submitted', 'approved', 'rejected', 'returned', 'forwarded'],
    required: true,
  },
  comment: {
    type: String,
    default: '',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide document title'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  documentType: {
    type: String,
    enum: ['admission', 'scholarship', 'transfer', 'graduation', 'other'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'in-review', 'approved', 'rejected', 'returned', 'forwarded'],
    default: 'pending',
  },
  currentStage: {
    type: String,
    default: '',
  },
  currentDepartment: {
    type: String,
    enum: ['admissions', 'finance', 'registrar', 'scholarship', 'admin', null],
    default: null,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  workflowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workflow',
  },
  history: [historySchema],
  submissionDate: {
    type: Date,
    default: Date.now,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  dueDate: {
    type: Date,
  },
});

documentSchema.index({ studentId: 1, status: 1 });
documentSchema.index({ currentDepartment: 1, status: 1 });

module.exports = mongoose.model('Document', documentSchema);