const Payment = require('../models/Payment');
const mongoose = require('mongoose');

/**
 * @desc    Create a new payment
 * @route   POST /api/v1/payments
 * @access  Private
 */
exports.createPayment = async (req, res) => {
  try {
    const {
      clientName,
      projectName,
      dealAmount,
      receivedAmount,
      paymentDate,
      paymentMethod,
      nextDueDate,
      status,
      notes,
    } = req.body;

    // Check if MongoDB is connected
    const isMongoConnected = mongoose.connection.readyState === 1;
    
    let payment;
    if (isMongoConnected) {
      // Create payment in database
      payment = await Payment.create({
        clientName,
        projectName,
        dealAmount,
        receivedAmount: receivedAmount || 0,
        paymentDate: paymentDate || Date.now(),
        paymentMethod,
        nextDueDate,
        status,
        notes,
        createdBy: req.user?.id,
      });

      res.status(201).json({
        success: true,
        data: payment,
        message: 'Payment created successfully',
      });
    } else {
      // Development mode: return mock payment
      console.warn('⚠️ MongoDB not connected. Returning mock payment for development.');
      
      const mockPayment = {
        _id: 'mock-payment-' + Date.now(),
        clientName,
        projectName,
        dealAmount,
        receivedAmount: receivedAmount || 0,
        pendingAmount: dealAmount - (receivedAmount || 0),
        paymentDate: paymentDate || new Date(),
        paymentMethod,
        nextDueDate,
        status: status || 'pending',
        notes,
        createdBy: req.user?.id || 'mock-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      res.status(201).json({
        success: true,
        data: mockPayment,
        message: 'Payment created successfully (mock mode)',
        warning: 'MongoDB not connected - using mock data',
      });
    }
  } catch (error) {
    console.error('❌ Error creating payment:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        messages: errors,
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Duplicate field value entered',
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
 * @desc    Get all payments with filtering, sorting, and pagination
 * @route   GET /api/v1/payments
 * @access  Private
 */
exports.getAllPayments = async (req, res) => {
  try {
    // Check if MongoDB is connected
    const isMongoConnected = mongoose.connection.readyState === 1;
    
    if (!isMongoConnected) {
      // Development mode: return mock payments
      console.warn('⚠️ MongoDB not connected. Returning mock payments for development.');
      
      // Generate mock payments
      const mockPayments = [
        {
          _id: 'mock-1',
          clientName: 'ABC Corporation',
          projectName: 'Website Redesign',
          dealAmount: 50000,
          receivedAmount: 25000,
          pendingAmount: 25000,
          paymentDate: new Date('2026-03-15'),
          paymentMethod: 'bank_transfer',
          nextDueDate: new Date('2026-04-15'),
          status: 'partial',
          notes: 'First installment received',
          isArchived: false,
          createdAt: new Date('2026-03-15T10:00:00Z'),
          updatedAt: new Date('2026-03-15T10:00:00Z')
        },
        {
          _id: 'mock-2',
          clientName: 'XYZ Ltd',
          projectName: 'Mobile App Development',
          dealAmount: 150000,
          receivedAmount: 150000,
          pendingAmount: 0,
          paymentDate: new Date('2026-02-28'),
          paymentMethod: 'upi',
          nextDueDate: null,
          status: 'completed',
          notes: 'Full payment received',
          isArchived: false,
          createdAt: new Date('2026-02-28T14:30:00Z'),
          updatedAt: new Date('2026-02-28T14:30:00Z')
        },
        {
          _id: 'mock-3',
          clientName: 'John Doe Consulting',
          projectName: 'SEO Services',
          dealAmount: 30000,
          receivedAmount: 0,
          pendingAmount: 30000,
          paymentDate: new Date('2026-04-01'),
          paymentMethod: 'credit_card',
          nextDueDate: new Date('2026-04-30'),
          status: 'pending',
          notes: 'Payment pending',
          isArchived: false,
          createdAt: new Date('2026-04-01T09:15:00Z'),
          updatedAt: new Date('2026-04-01T09:15:00Z')
        },
      ];

      // Apply filtering if provided
      let filteredPayments = mockPayments;
      const { clientName, status, projectName } = req.query;
      
      if (clientName) {
        filteredPayments = filteredPayments.filter(p => 
          p.clientName.toLowerCase().includes(clientName.toLowerCase())
        );
      }
      
      if (status) {
        filteredPayments = filteredPayments.filter(p => 
          p.status === status
        );
      }
      
      if (projectName) {
        filteredPayments = filteredPayments.filter(p => 
          p.projectName.toLowerCase().includes(projectName.toLowerCase())
        );
      }

      return res.status(200).json({
        success: true,
        count: filteredPayments.length,
        data: filteredPayments,
        message: 'Payments retrieved successfully (mock mode)',
        warning: 'MongoDB not connected - using mock data',
      });
    }

    // Build query for MongoDB
    const query = { isArchived: false };
    
    // Filter by client name (partial match)
    if (req.query.clientName) {
      query.clientName = { $regex: req.query.clientName, $options: 'i' };
    }
    
    // Filter by project name (partial match)
    if (req.query.projectName) {
      query.projectName = { $regex: req.query.projectName, $options: 'i' };
    }
    
    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filter by payment method
    if (req.query.paymentMethod) {
      query.paymentMethod = req.query.paymentMethod;
    }
    
    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      query.paymentDate = {};
      if (req.query.startDate) {
        query.paymentDate.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.paymentDate.$lte = new Date(req.query.endDate);
      }
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Sorting
    const sortBy = req.query.sortBy || '-createdAt';
    const sortOrder = {};
    if (sortBy.startsWith('-')) {
      sortOrder[sortBy.substring(1)] = -1;
    } else {
      sortOrder[sortBy] = 1;
    }

    // Execute query
    const payments = await Payment.find(query)
      .sort(sortOrder)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Payment.countDocuments(query);

    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: payments,
      message: 'Payments retrieved successfully',
    });
  } catch (error) {
    console.error('❌ Error fetching payments:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
    });
  }
};

/**
 * @desc    Get payment by ID
 * @route   GET /api/v1/payments/:id
 * @access  Private
 */
exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if MongoDB is connected
    const isMongoConnected = mongoose.connection.readyState === 1;
    
    if (!isMongoConnected) {
      // Development mode: return mock payment
      console.warn('⚠️ MongoDB not connected. Returning mock payment for development.');
      
      const mockPayment = {
        _id: id,
        clientName: 'ABC Corporation',
        projectName: 'Website Redesign',
        dealAmount: 50000,
        receivedAmount: 25000,
        pendingAmount: 25000,
        paymentDate: new Date('2026-03-15'),
        paymentMethod: 'bank_transfer',
        nextDueDate: new Date('2026-04-15'),
        status: 'partial',
        notes: 'First installment received',
        isArchived: false,
        createdAt: new Date('2026-03-15T10:00:00Z'),
        updatedAt: new Date('2026-03-15T10:00:00Z')
      };

      return res.status(200).json({
        success: true,
        data: mockPayment,
        message: 'Payment retrieved successfully (mock mode)',
        warning: 'MongoDB not connected - using mock data',
      });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment ID format',
      });
    }

    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found',
      });
    }

    res.status(200).json({
      success: true,
      data: payment,
      message: 'Payment retrieved successfully',
    });
  } catch (error) {
    console.error('❌ Error fetching payment:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
    });
  }
};

/**
 * @desc    Update payment
 * @route   PUT /api/v1/payments/:id
 * @access  Private
 */
exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if MongoDB is connected
    const isMongoConnected = mongoose.connection.readyState === 1;
    
    if (!isMongoConnected) {
      // Development mode: return mock updated payment
      console.warn('⚠️ MongoDB not connected. Returning mock update for development.');
      
      const mockPayment = {
        _id: id,
        ...updateData,
        pendingAmount: (updateData.dealAmount || 50000) - (updateData.receivedAmount || 25000),
        updatedAt: new Date(),
      };

      return res.status(200).json({
        success: true,
        data: mockPayment,
        message: 'Payment updated successfully (mock mode)',
        warning: 'MongoDB not connected - using mock data',
      });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment ID format',
      });
    }

    // Find and update payment
    const payment = await Payment.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true, // Return the updated document
        runValidators: true, // Run model validators
      }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found',
      });
    }

    res.status(200).json({
      success: true,
      data: payment,
      message: 'Payment updated successfully',
    });
  } catch (error) {
    console.error('❌ Error updating payment:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        messages: errors,
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
 * @desc    Delete payment (soft delete by archiving)
 * @route   DELETE /api/v1/payments/:id
 * @access  Private
 */
exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if MongoDB is connected
    const isMongoConnected = mongoose.connection.readyState === 1;
    
    if (!isMongoConnected) {
      // Development mode: return mock deletion
      console.warn('⚠️ MongoDB not connected. Returning mock deletion for development.');
      
      return res.status(200).json({
        success: true,
        data: { _id: id },
        message: 'Payment deleted successfully (mock mode)',
        warning: 'MongoDB not connected - using mock data',
      });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment ID format',
      });
    }

    // Soft delete by archiving
    const payment = await Payment.findByIdAndUpdate(
      id,
      { isArchived: true },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {},
      message: 'Payment archived successfully',
    });
  } catch (error) {
    console.error('❌ Error deleting payment:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
    });
  }
};

/**
 * @desc    Get payment statistics
 * @route   GET /api/v1/payments/stats/summary
 * @access  Private
 */
exports.getPaymentStats = async (req, res) => {
  try {
    // Check if MongoDB is connected
    const isMongoConnected = mongoose.connection.readyState === 1;
    
    if (!isMongoConnected) {
      // Development mode: return mock stats
      console.warn('⚠️ MongoDB not connected. Returning mock stats for development.');
      
      const mockStats = {
        totalPayments: 3,
        totalDealAmount: 230000,
        totalReceivedAmount: 175000,
        totalPendingAmount: 55000,
        byStatus: {
          pending: 1,
          partial: 1,
          completed: 1,
          overdue: 0,
          cancelled: 0,
        },
        byPaymentMethod: {
          bank_transfer: 1,
          upi: 1,
          credit_card: 1,
          cash: 0,
          cheque: 0,
          other: 0,
        },
        recentPayments: 3,
      };

      return res.status(200).json({
        success: true,
        data: mockStats,
        message: 'Payment statistics retrieved (mock mode)',
        warning: 'MongoDB not connected - using mock data',
      });
    }

    // Get statistics from database
    const totalPayments = await Payment.countDocuments({ isArchived: false });
    
    const amountStats = await Payment.aggregate([
      { $match: { isArchived: false } },
      {
        $group: {
          _id: null,
          totalDealAmount: { $sum: '$dealAmount' },
          totalReceivedAmount: { $sum: '$receivedAmount' },
          totalPendingAmount: { $sum: '$pendingAmount' },
        },
      },
    ]);

    const statusStats = await Payment.aggregate([
      { $match: { isArchived: false } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const methodStats = await Payment.aggregate([
      { $match: { isArchived: false } },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
        },
      },
    ]);

    // Format statistics
    const stats = {
      totalPayments,
      totalDealAmount: amountStats[0]?.totalDealAmount || 0,
      totalReceivedAmount: amountStats[0]?.totalReceivedAmount || 0,
      totalPendingAmount: amountStats[0]?.totalPendingAmount || 0,
      byStatus: {},
      byPaymentMethod: {},
      recentPayments: await Payment.countDocuments({
        isArchived: false,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
      }),
    };

    // Convert status stats to object
    statusStats.forEach(stat => {
      stats.byStatus[stat._id] = stat.count;
    });

    // Convert method stats to object
    methodStats.forEach(stat => {
      stats.byPaymentMethod[stat._id] = stat.count;
    });

    res.status(200).json({
      success: true,
      data: stats,
      message: 'Payment statistics retrieved successfully',
    });
  } catch (error) {
    console.error('❌ Error fetching payment statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
    });
  }
};