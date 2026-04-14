const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      maxlength: [200, 'Business name cannot exceed 200 characters'],
    },
    ownerName: {
      type: String,
      trim: true,
      maxlength: [100, 'Owner name cannot exceed 100 characters'],
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
      maxlength: [100, 'District cannot exceed 100 characters'],
    },
    businessType: {
      type: String,
    },
    mapsLink: {
      type: String,
      trim: true,
    },
    whatsapp: {
      type: String,
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$|^$/, 'Please enter a valid WhatsApp number in E.164 format'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$|^$/, 'Please enter a valid email'],
    },
    instagram: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    facebook: {
      type: String,
      trim: true,
    },
    firstMessageDate: {
      type: Date,
      default: Date.now,
    },
    followUpDate: {
      type: Date,
    },
    stage: {
      type: String,
      enum: ['new', 'contacted', 'replied', 'demo_sent', 'closed'],
      default: 'new',
    },
    status: {
      type: String,
      enum: ['hot', 'warm', 'cold'],
      default: 'warm',
    },
    budget: {
      type: Number,
      min: [0, 'Budget cannot be negative'],
      default: 0,
    },
    remark: {
      type: String,
      trim: true,
      maxlength: [500, 'Remark cannot exceed 500 characters'],
      default: '',
    },
    address: {
      type: String,
      trim: true,
      maxlength: [500, 'Address cannot exceed 500 characters'],
      default: '',
    },
    probability: {
      type: Number,
      min: [0, 'Probability cannot be less than 0'],
      max: [100, 'Probability cannot exceed 100'],
      default: 0,
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

// Indexes for better query performance
leadSchema.index({ district: 1 });
leadSchema.index({ followUpDate: 1 });
leadSchema.index({ stage: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ businessType: 1 });
leadSchema.index({ isArchived: 1 });
leadSchema.index({ createdAt: -1 });

// Virtual for formatted dates
leadSchema.virtual('formattedFirstMessageDate').get(function () {
  return this.firstMessageDate ? this.firstMessageDate.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }) : '';
});

leadSchema.virtual('formattedFollowUpDate').get(function () {
  return this.followUpDate ? this.followUpDate.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }) : '';
});

// Static method to get lead statistics
leadSchema.statics.getStats = async function () {
  const stats = await this.aggregate([
    {
      $match: { isArchived: false }
    },
    {
      $group: {
        _id: '$stage',
        count: { $sum: 1 },
        totalBudget: { $sum: '$budget' }
      },
    },
    {
      $project: {
        stage: '$_id',
        count: 1,
        totalBudget: 1,
        _id: 0,
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  return stats;
};

// Instance method to get lead summary
leadSchema.methods.getSummary = function () {
  return {
    id: this._id,
    businessName: this.businessName,
    ownerName: this.ownerName,
    district: this.district,
    businessType: this.businessType,
    stage: this.stage,
    status: this.status,
    budget: this.budget,
    probability: this.probability,
    followUpDate: this.followUpDate,
    formattedFollowUpDate: this.formattedFollowUpDate,
    createdAt: this.createdAt,
  };
};

// Query middleware to filter out archived leads by default
leadSchema.pre(/^find/, function(next) {
  if (this.getFilter().isArchived === undefined) {
    this.where({ isArchived: false });
  }
  if (typeof next === 'function') {
    next();
  }
});

const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;