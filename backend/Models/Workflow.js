const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  documentType: {
    type: String,
    enum: ['admission', 'scholarship', 'transfer', 'graduation', 'other'],
    required: true,
    unique: true,
  },
  stages: [{
    department: {
      type: String,
      enum: ['admissions', 'finance', 'registrar', 'scholarship', 'admin'],
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    approvalRequired: {
      type: Boolean,
      default: true,
    },
    timeLimit: {
      type: Number, // in hours
      default: 48,
    },
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure stages are sorted by order
workflowSchema.pre('save', function (next) {
  this.stages.sort((a, b) => a.order - b.order);
  next();
});

module.exports = mongoose.model('Workflow', workflowSchema);