const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
      maxlength: [200, 'Client name cannot exceed 200 characters'],
    },
    projectName: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [200, 'Project name cannot exceed 200 characters'],
    },
    dealAmount: {
      type: Number,
      required: [true, 'Deal amount is required'],
      min: [0, 'Deal amount cannot be negative'],
    },
    receivedAmount: {
      type: Number,
      required: [true, 'Received amount is required'],
      min: [0, 'Received amount cannot be negative'],
      default: 0,
    },
    pendingAmount: {
      type: Number,
      min: [0, 'Pending amount cannot be negative'],
    },
    paymentDate: {
      type: Date,
      required: [true, 'Payment date is required'],
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: ['cash', 'bank_transfer', 'cheque', 'upi', 'credit_card', 'debit_card', 'other'],
      default: 'bank_transfer',
    },
    nextDueDate: {
      type: Date,
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: ['pending', 'partial', 'completed', 'overdue', 'cancelled'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Calculate pending amount before saving
paymentSchema.pre('save', function (next) {
  // Calculate pending amount as dealAmount - receivedAmount
  this.pendingAmount = this.dealAmount - this.receivedAmount;
  
  // Auto-update status based on amounts
  if (this.receivedAmount === 0) {
    this.status = 'pending';
  } else if (this.receivedAmount > 0 && this.receivedAmount < this.dealAmount) {
    this.status = 'partial';
  } else if (this.receivedAmount >= this.dealAmount) {
    this.status = 'completed';
  }
  
  // Check if nextDueDate is in the past and status is not completed
  if (this.nextDueDate && this.nextDueDate < new Date() && this.status !== 'completed') {
    this.status = 'overdue';
  }
  
  next();
});

// Update pending amount before findOneAndUpdate operations
paymentSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  
  // If dealAmount or receivedAmount is being updated, recalculate pendingAmount
  if (update.dealAmount !== undefined || update.receivedAmount !== undefined) {
    // We'll handle this in the controller to ensure we have current values
    // For now, set a flag to recalculate in post middleware
    update.$set = update.$set || {};
    update.$set._recalculatePending = true;
  }
  
  next();
});

// Post findOneAndUpdate middleware to recalculate pending
paymentSchema.post('findOneAndUpdate', async function (doc) {
  if (doc && doc._recalculatePending) {
    // Recalculate pending amount
    doc.pendingAmount = doc.dealAmount - doc.receivedAmount;
    
    // Update status based on new amounts
    if (doc.receivedAmount === 0) {
      doc.status = 'pending';
    } else if (doc.receivedAmount > 0 && doc.receivedAmount < doc.dealAmount) {
      doc.status = 'partial';
    } else if (doc.receivedAmount >= doc.dealAmount) {
      doc.status = 'completed';
    }
    
    // Check overdue
    if (doc.nextDueDate && doc.nextDueDate < new Date() && doc.status !== 'completed') {
      doc.status = 'overdue';
    }
    
    await doc.save();
    delete doc._recalculatePending;
  }
});

// Indexes for better query performance
paymentSchema.index({ clientName: 1 });
paymentSchema.index({ projectName: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ nextDueDate: 1 });
paymentSchema.index({ createdBy: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;