const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
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
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
reminderSchema.index({ dueDate: 1 });
reminderSchema.index({ userId: 1 });
reminderSchema.index({ leadId: 1 });
reminderSchema.index({ completed: 1 });
reminderSchema.index({ priority: 1 });
reminderSchema.index({ dueDate: 1, completed: 1 });

// Virtual for formatted due date
reminderSchema.virtual('formattedDueDate').get(function () {
  return this.dueDate ? this.dueDate.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) : '';
});

// Virtual for lead details (populated)
reminderSchema.virtual('lead', {
  ref: 'Lead',
  localField: 'leadId',
  foreignField: '_id',
  justOne: true,
});

// Virtual for user details (populated)
reminderSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

// Instance method to mark as completed
reminderSchema.methods.markAsCompleted = function() {
  this.completed = true;
  this.completedAt = new Date();
  return this.save();
};

// Static method to get upcoming reminders
reminderSchema.statics.getUpcomingReminders = async function(userId, startDate, endDate) {
  const query = {
    userId,
    completed: false,
  };

  if (startDate && endDate) {
    query.dueDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  } else {
    // Default to next 7 days if no date range provided
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    query.dueDate = {
      $gte: today,
      $lte: nextWeek,
    };
  }

  return this.find(query)
    .populate('lead', 'businessName ownerName district stage status')
    .sort({ dueDate: 1, priority: -1 });
};

// Static method to get overdue reminders
reminderSchema.statics.getOverdueReminders = async function(userId) {
  return this.find({
    userId,
    completed: false,
    dueDate: { $lt: new Date() },
  })
    .populate('lead', 'businessName ownerName district stage status')
    .sort({ dueDate: 1, priority: -1 });
};

const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = Reminder;