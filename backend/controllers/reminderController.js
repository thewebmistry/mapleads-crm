const Reminder = require('../models/Reminder');
const Lead = require('../models/Lead');

/**
 * @desc    Create a new reminder
 * @route   POST /api/v1/reminders
 * @access  Private
 */
exports.createReminder = async (req, res) => {
  try {
    const { leadId, dueDate, message, priority } = req.body;
    const userId = req.user.id;

    // Check if lead exists
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found',
      });
    }

    const reminder = await Reminder.create({
      leadId,
      userId,
      dueDate,
      message,
      priority,
    });

    res.status(201).json({
      success: true,
      message: 'Reminder created successfully',
      data: reminder,
    });
  } catch (error) {
    console.error('Error creating reminder:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: errors,
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid lead ID format',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
    });
  }
};

/**
 * @desc    Get all reminders for current user
 * @route   GET /api/v1/reminders
 * @access  Private
 */
exports.getAllReminders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      completed,
      priority,
      leadId,
    } = req.query;

    const userId = req.user.id;

    // Build filter object
    const filter = { userId };

    if (completed !== undefined) {
      filter.completed = completed === 'true';
    }

    if (priority) {
      filter.priority = priority;
    }

    if (leadId) {
      filter.leadId = leadId;
    }

    // Calculate pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const reminders = await Reminder.find(filter)
      .populate('lead', 'businessName ownerName district stage status')
      .sort({ dueDate: 1, priority: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination info
    const total = await Reminder.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      count: reminders.length,
      total,
      page: pageNum,
      totalPages,
      data: reminders,
      pagination: {
        current: pageNum,
        total: totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
    });
  }
};

/**
 * @desc    Get upcoming reminders
 * @route   GET /api/v1/reminders/upcoming
 * @access  Private
 */
exports.getUpcomingReminders = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;

    const reminders = await Reminder.getUpcomingReminders(userId, startDate, endDate);

    res.status(200).json({
      success: true,
      count: reminders.length,
      data: reminders,
    });
  } catch (error) {
    console.error('Error fetching upcoming reminders:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
    });
  }
};

/**
 * @desc    Get overdue reminders
 * @route   GET /api/v1/reminders/overdue
 * @access  Private
 */
exports.getOverdueReminders = async (req, res) => {
  try {
    const userId = req.user.id;

    const reminders = await Reminder.getOverdueReminders(userId);

    res.status(200).json({
      success: true,
      count: reminders.length,
      data: reminders,
    });
  } catch (error) {
    console.error('Error fetching overdue reminders:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
    });
  }
};

/**
 * @desc    Get single reminder by ID
 * @route   GET /api/v1/reminders/:id
 * @access  Private
 */
exports.getReminderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId,
    }).populate('lead', 'businessName ownerName district stage status');

    if (!reminder) {
      return res.status(404).json({
        success: false,
        error: 'Reminder not found',
      });
    }

    res.status(200).json({
      success: true,
      data: reminder,
    });
  } catch (error) {
    console.error('Error fetching reminder:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid reminder ID format',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
    });
  }
};

/**
 * @desc    Update reminder
 * @route   PUT /api/v1/reminders/:id
 * @access  Private
 */
exports.updateReminder = async (req, res) => {
  try {
    const { dueDate, message, priority, completed } = req.body;
    const userId = req.user.id;

    // Build update object with only provided fields
    const updateData = {};
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (message !== undefined) updateData.message = message;
    if (priority !== undefined) updateData.priority = priority;
    
    // Handle completed status
    if (completed !== undefined) {
      updateData.completed = completed;
      if (completed === true) {
        updateData.completedAt = new Date();
      } else {
        updateData.completedAt = null;
      }
    }

    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId },
      updateData,
      { new: true, runValidators: true }
    ).populate('lead', 'businessName ownerName district stage status');

    if (!reminder) {
      return res.status(404).json({
        success: false,
        error: 'Reminder not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Reminder updated successfully',
      data: reminder,
    });
  } catch (error) {
    console.error('Error updating reminder:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: errors,
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid reminder ID format',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
    });
  }
};

/**
 * @desc    Delete reminder
 * @route   DELETE /api/v1/reminders/:id
 * @access  Private
 */
exports.deleteReminder = async (req, res) => {
  try {
    const userId = req.user.id;
    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      userId,
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        error: 'Reminder not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Reminder deleted successfully',
      data: {},
    });
  } catch (error) {
    console.error('Error deleting reminder:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid reminder ID format',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
    });
  }
};

/**
 * @desc    Mark reminder as completed
 * @route   PUT /api/v1/reminders/:id/complete
 * @access  Private
 */
exports.markAsCompleted = async (req, res) => {
  try {
    const userId = req.user.id;
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId,
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        error: 'Reminder not found',
      });
    }

    await reminder.markAsCompleted();

    res.status(200).json({
      success: true,
      message: 'Reminder marked as completed',
      data: reminder,
    });
  } catch (error) {
    console.error('Error marking reminder as completed:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid reminder ID format',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
    });
  }
};