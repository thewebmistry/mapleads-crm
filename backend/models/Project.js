const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: [true, 'Lead ID is required'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'refunded'],
      default: 'pending',
    },
    deliveryDate: {
      type: Date,
      required: [true, 'Delivery date is required'],
    },
    reviewRequested: {
      type: Boolean,
      default: false,
    },
    reviewSubmitted: {
      type: Boolean,
      default: false,
    },
    reviewRating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    reviewComment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Review comment cannot exceed 1000 characters'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
projectSchema.index({ leadId: 1 });
projectSchema.index({ userId: 1 });
projectSchema.index({ paymentStatus: 1 });
projectSchema.index({ deliveryDate: 1 });
projectSchema.index({ reviewRequested: 1 });
projectSchema.index({ createdAt: -1 });

// Virtual for formatted delivery date
projectSchema.virtual('formattedDeliveryDate').get(function () {
  return this.deliveryDate ? this.deliveryDate.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }) : '';
});

// Virtual for lead details (populated)
projectSchema.virtual('lead', {
  ref: 'Lead',
  localField: 'leadId',
  foreignField: '_id',
  justOne: true,
});

// Virtual for user details (populated)
projectSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

// Instance method to update payment status
projectSchema.methods.updatePaymentStatus = function(newStatus) {
  this.paymentStatus = newStatus;
  return this.save();
};

// Instance method to request review
projectSchema.methods.requestReview = function() {
  this.reviewRequested = true;
  return this.save();
};

// Instance method to submit review
projectSchema.methods.submitReview = function(rating, comment) {
  this.reviewSubmitted = true;
  this.reviewRating = rating;
  this.reviewComment = comment;
  return this.save();
};

// Static method to get projects by payment status
projectSchema.statics.getProjectsByPaymentStatus = async function(userId, status) {
  const query = { userId };
  
  if (status) {
    query.paymentStatus = status;
  }
  
  return this.find(query)
    .populate('lead', 'businessName ownerName district businessType')
    .sort({ deliveryDate: 1 });
};

// Static method to get overdue projects (delivery date passed but not completed)
projectSchema.statics.getOverdueProjects = async function(userId) {
  return this.find({
    userId,
    deliveryDate: { $lt: new Date() },
    paymentStatus: { $ne: 'paid' },
  })
    .populate('lead', 'businessName ownerName district businessType')
    .sort({ deliveryDate: 1 });
};

// Static method to get revenue statistics
projectSchema.statics.getRevenueStats = async function(userId) {
  const stats = await this.aggregate([
    {
      $match: { userId: new mongoose.Types.ObjectId(userId) }
    },
    {
      $group: {
        _id: '$paymentStatus',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        averageAmount: { $avg: '$amount' }
      }
    },
    {
      $project: {
        paymentStatus: '$_id',
        count: 1,
        totalAmount: 1,
        averageAmount: 1,
        _id: 0
      }
    }
  ]);

  return stats;
};

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;