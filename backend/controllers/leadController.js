const Lead = require('../models/Lead');
const Reminder = require('../models/Reminder');
const mongoose = require('mongoose');

/**
 * @desc    Create a new lead
 * @route   POST /api/v1/leads
 * @access  Private
 */
exports.createLead = async (req, res) => {
  try {
    const {
      businessName,
      ownerName,
      district,
      businessType,
      mapsLink,
      whatsapp,
      email,
      instagram,
      website,
      facebook,
      firstMessageDate,
      followUpDate,
      stage,
      status,
      budget,
      remark,
      address,
      probability,
    } = req.body;

    // Check if MongoDB is connected
    const isMongoConnected = mongoose.connection.readyState === 1;
    
    let lead;
    if (isMongoConnected) {
      // Create lead in database
      lead = await Lead.create({
        businessName,
        ownerName,
        district,
        businessType,
        mapsLink,
        whatsapp,
        email,
        instagram,
        website,
        facebook,
        firstMessageDate,
        followUpDate,
        stage,
        status,
        budget,
        remark,
        address,
        probability,
      });
    } else {
      // Development mode: return mock lead data
      console.warn('⚠️ MongoDB not connected. Creating mock lead for development.');
      lead = {
        _id: `mock-${Date.now()}`,
        businessName,
        ownerName,
        district,
        businessType: businessType || 'restaurant',
        mapsLink,
        whatsapp,
        email,
        instagram,
        website,
        facebook,
        firstMessageDate: firstMessageDate || new Date(),
        followUpDate,
        stage: stage || 'new',
        status: status || 'warm',
        budget: budget || 0,
        remark,
        address,
        probability: probability || 0,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0
      };
    }

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: lead,
      developmentMode: !isMongoConnected
    });
  } catch (error) {
    console.error('Error creating lead:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: errors,
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
 * @desc    Get all leads with filtering, sorting, and pagination
 * @route   GET /api/v1/leads
 * @access  Private
 */
exports.getAllLeads = async (req, res) => {
  try {
    // Check if MongoDB is connected
    const isMongoConnected = mongoose.connection.readyState === 1;
    
    if (!isMongoConnected) {
      // Development mode: return mock leads
      console.warn('⚠️ MongoDB not connected. Returning mock leads for development.');
      
      // Generate mock leads
      const mockLeads = [
        {
          _id: 'mock-1',
          businessName: 'Sample Restaurant',
          ownerName: 'John Doe',
          district: 'Ranchi',
          businessType: 'restaurant',
          stage: 'new',
          status: 'warm',
          budget: 50000,
          probability: 30,
          isArchived: false,
          createdAt: new Date('2026-04-01T10:00:00Z'),
          updatedAt: new Date('2026-04-01T10:00:00Z')
        },
        {
          _id: 'mock-2',
          businessName: 'Tech Solutions Inc',
          ownerName: 'Jane Smith',
          district: 'Gumla',
          businessType: 'coaching',
          stage: 'contacted',
          status: 'hot',
          budget: 120000,
          probability: 70,
          isArchived: false,
          createdAt: new Date('2026-04-02T14:30:00Z'),
          updatedAt: new Date('2026-04-02T14:30:00Z')
        },
        {
          _id: 'mock-3',
          businessName: 'Fitness Center',
          ownerName: 'Bob Johnson',
          district: 'Lohardaga',
          businessType: 'gym',
          stage: 'replied',
          status: 'cold',
          budget: 80000,
          probability: 20,
          isArchived: false,
          createdAt: new Date('2026-04-03T09:15:00Z'),
          updatedAt: new Date('2026-04-03T09:15:00Z')
        }
      ];
      
      // Apply simple filtering for mock data
      let filteredLeads = [...mockLeads];
      const { district, stage, status, businessType, search } = req.query;
      
      if (district) {
        filteredLeads = filteredLeads.filter(lead =>
          lead.district.toLowerCase().includes(district.toLowerCase())
        );
      }
      
      if (stage) {
        filteredLeads = filteredLeads.filter(lead => lead.stage === stage);
      }
      
      if (status) {
        filteredLeads = filteredLeads.filter(lead => lead.status === status);
      }
      
      if (businessType) {
        filteredLeads = filteredLeads.filter(lead => lead.businessType === businessType);
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        filteredLeads = filteredLeads.filter(lead =>
          lead.businessName.toLowerCase().includes(searchLower) ||
          lead.ownerName.toLowerCase().includes(searchLower)
        );
      }
      
      // Pagination for mock data
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedLeads = filteredLeads.slice(startIndex, endIndex);
      
      // Mock stats
      const stats = {
        total: filteredLeads.length,
        byStage: {
          new: filteredLeads.filter(l => l.stage === 'new').length,
          contacted: filteredLeads.filter(l => l.stage === 'contacted').length,
          replied: filteredLeads.filter(l => l.stage === 'replied').length,
          demo_sent: 0,
          closed: 0
        },
        byStatus: {
          hot: filteredLeads.filter(l => l.status === 'hot').length,
          warm: filteredLeads.filter(l => l.status === 'warm').length,
          cold: filteredLeads.filter(l => l.status === 'cold').length
        },
        byDistrict: {
          Ranchi: filteredLeads.filter(l => l.district === 'Ranchi').length,
          Gumla: filteredLeads.filter(l => l.district === 'Gumla').length,
          Lohardaga: filteredLeads.filter(l => l.district === 'Lohardaga').length
        }
      };
      
      return res.status(200).json({
        success: true,
        count: paginatedLeads.length,
        total: filteredLeads.length,
        page,
        totalPages: Math.ceil(filteredLeads.length / limit),
        data: paginatedLeads,
        stats,
        developmentMode: true,
        pagination: {
          current: page,
          total: Math.ceil(filteredLeads.length / limit),
          hasNext: endIndex < filteredLeads.length,
          hasPrev: startIndex > 0,
        },
      });
    }

    // Original MongoDB code below
    // Extract query parameters
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      district,
      stage,
      status,
      businessType,
      search,
      includeArchived = false,
    } = req.query;

    // Build filter object
    const filter = {};

    if (district) {
      filter.district = { $regex: district, $options: 'i' };
    }

    if (stage) {
      filter.stage = stage;
    }

    if (status) {
      filter.status = status;
    }

    if (businessType) {
      filter.businessType = businessType;
    }

    if (search) {
      filter.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { whatsapp: { $regex: search, $options: 'i' } },
        { instagram: { $regex: search, $options: 'i' } },
        { remark: { $regex: search, $options: 'i' } },
      ];
    }

    // Include archived leads if requested
    if (includeArchived === 'true') {
      delete filter.isArchived;
    } else {
      filter.isArchived = false;
    }

    // Calculate pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const leads = await Lead.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination info
    const total = await Lead.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum);

    // Get statistics
    const stats = await Lead.getStats();

    res.status(200).json({
      success: true,
      count: leads.length,
      total,
      page: pageNum,
      totalPages,
      data: leads,
      stats,
      developmentMode: false,
      pagination: {
        current: pageNum,
        total: totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
    });
  }
};

/**
 * @desc    Get single lead by ID
 * @route   GET /api/v1/leads/:id
 * @access  Private
 */
exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found',
      });
    }

    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    console.error('Error fetching lead:', error);

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
 * @desc    Update lead
 * @route   PUT /api/v1/leads/:id
 * @access  Private
 */
exports.updateLead = async (req, res) => {
  try {
    const {
      businessName,
      ownerName,
      district,
      businessType,
      mapsLink,
      whatsapp,
      email,
      instagram,
      website,
      facebook,
      firstMessageDate,
      followUpDate,
      stage,
      status,
      budget,
      remark,
      address,
      probability,
    } = req.body;

    // Build update object with only provided fields
    const updateData = {};
    if (businessName !== undefined) updateData.businessName = businessName;
    if (ownerName !== undefined) updateData.ownerName = ownerName;
    if (district !== undefined) updateData.district = district;
    if (businessType !== undefined) updateData.businessType = businessType;
    if (mapsLink !== undefined) updateData.mapsLink = mapsLink;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
    if (email !== undefined) updateData.email = email;
    if (instagram !== undefined) updateData.instagram = instagram;
    if (website !== undefined) updateData.website = website;
    if (facebook !== undefined) updateData.facebook = facebook;
    if (firstMessageDate !== undefined) updateData.firstMessageDate = firstMessageDate;
    if (followUpDate !== undefined) updateData.followUpDate = followUpDate;
    if (stage !== undefined) updateData.stage = stage;
    if (status !== undefined) updateData.status = status;
    if (budget !== undefined) updateData.budget = budget;
    if (remark !== undefined) updateData.remark = remark;
    if (probability !== undefined) updateData.probability = probability;

    // Check if stage or status is being updated (for audit log trigger)
    const leadBeforeUpdate = await Lead.findById(req.params.id);
    const stageChanged = leadBeforeUpdate && stage !== undefined && leadBeforeUpdate.stage !== stage;
    const statusChanged = leadBeforeUpdate && status !== undefined && leadBeforeUpdate.status !== status;

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found',
      });
    }

    // Create audit log entry if stage or status changed
    if (stageChanged || statusChanged) {
      console.log(`Lead ${req.params.id} stage/status updated:`, {
        oldStage: leadBeforeUpdate?.stage,
        newStage: stage,
        oldStatus: leadBeforeUpdate?.status,
        newStatus: status,
        updatedBy: req.user?.id,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully',
      data: lead,
    });
  } catch (error) {
    console.error('Error updating lead:', error);

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
 * @desc    Delete lead (soft delete)
 * @route   DELETE /api/v1/leads/:id
 * @access  Private
 */
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { isArchived: true },
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lead archived successfully',
      data: {},
    });
  } catch (error) {
    console.error('Error archiving lead:', error);

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
 * @desc    Get lead statistics
 * @route   GET /api/v1/leads/stats/summary
 * @access  Private
 */
exports.getLeadStats = async (req, res) => {
  try {
    const stats = await Lead.getStats();

    // Get total count (non-archived)
    const total = await Lead.countDocuments({ isArchived: false });

    // Get today's leads
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLeads = await Lead.countDocuments({
      createdAt: { $gte: today },
      isArchived: false,
    });

    // Get this month's leads
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthLeads = await Lead.countDocuments({
      createdAt: { $gte: startOfMonth },
      isArchived: false,
    });

    // Get leads by stage
    const stageStats = await Lead.aggregate([
      {
        $match: { isArchived: false }
      },
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 },
          totalBudget: { $sum: '$budget' },
          avgProbability: { $avg: '$probability' }
        }
      },
      {
        $project: {
          stage: '$_id',
          count: 1,
          totalBudget: 1,
          avgProbability: 1,
          _id: 0
        }
      }
    ]);

    // Get leads by status
    const statusStats = await Lead.aggregate([
      {
        $match: { isArchived: false }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalBudget: { $sum: '$budget' }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          totalBudget: 1,
          _id: 0
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        today: todayLeads,
        thisMonth: monthLeads,
        byStage: stageStats,
        byStatus: statusStats,
        byBusinessType: stats,
      },
    });
  } catch (error) {
    console.error('Error fetching lead stats:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
    });
  }
};

/**
 * @desc    Get leads with upcoming follow-ups
 * @route   GET /api/v1/leads/follow-ups
 * @access  Private
 */
exports.getLeadsWithFollowUps = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + parseInt(days, 10));

    const leads = await Lead.find({
      followUpDate: {
        $gte: today,
        $lte: futureDate,
      },
      isArchived: false,
    }).sort({ followUpDate: 1 });

    res.status(200).json({
      success: true,
      count: leads.length,
      data: leads,
    });
  } catch (error) {
    console.error('Error fetching leads with follow-ups:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
    });
  }
};

/**
 * @desc    Bulk update leads
 * @route   PUT /api/v1/leads/bulk
 * @access  Private (Admin only)
 */
exports.bulkUpdateLeads = async (req, res) => {
  try {
    const { leadIds, updateData } = req.body;

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Lead IDs array is required',
      });
    }

    if (!updateData || typeof updateData !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Update data object is required',
      });
    }

    // Filter out invalid fields
    const allowedFields = [
      'stage', 'status', 'probability', 'budget', 'followUpDate', 
      'remark', 'businessType', 'district'
    ];
    
    const filteredUpdateData = {};
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredUpdateData[key] = updateData[key];
      }
    });

    const result = await Lead.updateMany(
      { _id: { $in: leadIds } },
      { $set: filteredUpdateData }
    );

    res.status(200).json({
      success: true,
      message: `Successfully updated ${result.modifiedCount} leads`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    console.error('Error in bulk update:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
    });
  }
};

/**
 * @desc    Get dashboard KPI metrics
 * @route   GET /api/v1/leads/dashboard/kpi
 * @access  Private
 */
exports.getDashboardKPI = async (req, res) => {
  try {
    // Check if MongoDB is connected
    const isMongoConnected = mongoose.connection.readyState === 1;
    
    if (!isMongoConnected) {
      // Development mode: return mock KPI data
      console.warn('⚠️ MongoDB not connected. Returning mock KPI data for development.');
      
      const mockKPIs = {
          totalLeads: 1248,
          conversionRate: 24.8,
          activeDeals: 48,
          totalRevenue: 24500,
          revenueGoal: 100000,
          leadsByDistrict: [
            { district: 'Central Delhi', count: 320 },
            { district: 'South Delhi', count: 280 },
            { district: 'North Delhi', count: 210 },
            { district: 'West Delhi', count: 190 },
            { district: 'East Delhi', count: 150 },
            { district: 'New Delhi', count: 98 },
          ],
          monthlyRevenueTrend: [
            { month: 'Jan', revenue: 18000 },
            { month: 'Feb', revenue: 22000 },
            { month: 'Mar', revenue: 19500 },
            { month: 'Apr', revenue: 24500 },
            { month: 'May', revenue: 21000 },
            { month: 'Jun', revenue: 23000 },
          ],
          recentActivities: [
            { type: 'stage_update', message: 'Lead "ABC Restaurant" moved to "Live" stage', timestamp: new Date(Date.now() - 3600000) },
            { type: 'payment_received', message: 'Payment of $2,500 received from "XYZ Salon"', timestamp: new Date(Date.now() - 7200000) },
            { type: 'new_lead', message: 'New lead added: "PQR Gym" from South Delhi', timestamp: new Date(Date.now() - 10800000) },
            { type: 'follow_up', message: 'Follow-up scheduled for "LMN Clinic" tomorrow', timestamp: new Date(Date.now() - 14400000) },
          ],
          recentClosedDeals: [
            { businessName: 'Global Solutions', stage: 'closed', budget: 12500, timestamp: new Date(Date.now() - 3600000) },
            { businessName: 'TechCorp Inc', stage: 'closed', budget: 8500, timestamp: new Date(Date.now() - 7200000) },
            { businessName: 'Marketing Pro Ltd', stage: 'closed', budget: 9200, timestamp: new Date(Date.now() - 10800000) },
            { businessName: 'Foodie Restaurant', stage: 'closed', budget: 5600, timestamp: new Date(Date.now() - 14400000) },
            { businessName: 'Fitness Gym', stage: 'closed', budget: 7200, timestamp: new Date(Date.now() - 18000000) }
          ],
          recentPayments: [
            { clientName: 'XYZ Salon', receivedAmount: 2500, paymentMethod: 'bank_transfer', timestamp: new Date(Date.now() - 3600000) },
            { clientName: 'ABC Restaurant', receivedAmount: 1800, paymentMethod: 'upi', timestamp: new Date(Date.now() - 7200000) },
            { clientName: 'Global Solutions', receivedAmount: 5000, paymentMethod: 'bank_transfer', timestamp: new Date(Date.now() - 10800000) },
            { clientName: 'TechCorp Inc', receivedAmount: 3200, paymentMethod: 'credit_card', timestamp: new Date(Date.now() - 14400000) },
            { clientName: 'Marketing Pro Ltd', receivedAmount: 4200, paymentMethod: 'bank_transfer', timestamp: new Date(Date.now() - 18000000) }
          ]
        };

      return res.status(200).json({
        success: true,
        data: mockKPIs,
        message: 'Dashboard KPI metrics retrieved (mock mode)',
        warning: 'MongoDB not connected - using mock data',
      });
    }

    // Get total leads (non-archived)
    const totalLeads = await Lead.countDocuments({ isArchived: false });
    
    // Get conversion rate: percentage of leads in 'closed' stage
    const closedLeads = await Lead.countDocuments({
      isArchived: false,
      stage: 'closed'
    });
    const conversionRate = totalLeads > 0 ? (closedLeads / totalLeads * 100).toFixed(1) : 0;
    
    // Get active deals: leads in 'Designing' or 'Development' stage
    // Note: Based on the requirement, we need to check for 'Designing' or 'Development' stages
    // but our current Lead model has stages: ['new', 'contacted', 'replied', 'demo_sent', 'closed']
    // We'll need to adjust this based on actual stage values
    const activeDeals = await Lead.countDocuments({
      isArchived: false,
      stage: { $in: ['demo_sent', 'replied'] } // Using closest matches
    });
    
    // Get total revenue: sum of 'receivedAmount' from all payments
    const Payment = require('../models/Payment');
    const revenueStats = await Payment.aggregate([
      { $match: { isArchived: false } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$receivedAmount' }
        }
      }
    ]);
    const totalRevenue = revenueStats[0]?.totalRevenue || 0;
    
    // Get leads by district
    const leadsByDistrict = await Lead.aggregate([
      { $match: { isArchived: false } },
      {
        $group: {
          _id: '$district',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Get monthly revenue trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyRevenueTrend = await Payment.aggregate([
      {
        $match: {
          isArchived: false,
          paymentDate: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$paymentDate' },
            month: { $month: '$paymentDate' }
          },
          revenue: { $sum: '$receivedAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 }
    ]);
    
    // Format monthly revenue trend
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedMonthlyTrend = monthlyRevenueTrend.map(item => ({
      month: monthNames[item._id.month - 1],
      revenue: item.revenue
    }));
    
    // Get recent closed deals (leads with stage 'closed')
    const recentClosedDeals = await Lead.find({
      isArchived: false,
      stage: 'closed'
    })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('businessName stage updatedAt budget');
    
    // Get recent payments (all payments, assuming they are 'received')
    const recentPayments = await Payment.find({ isArchived: false })
      .sort({ paymentDate: -1 })
      .limit(5)
      .select('clientName receivedAmount paymentDate paymentMethod');
    
    // Build combined recent activities for backward compatibility
    const recentActivities = [];
    
    // Add closed deals as activities
    recentClosedDeals.forEach(lead => {
      recentActivities.push({
        type: 'deal_closed',
        message: `Deal closed: "${lead.businessName}" with budget ₹${lead.budget?.toLocaleString() || 'N/A'}`,
        timestamp: lead.updatedAt
      });
    });
    
    // Add payment activities
    recentPayments.forEach(payment => {
      recentActivities.push({
        type: 'payment_received',
        message: `Payment of ₹${payment.receivedAmount.toLocaleString()} received from "${payment.clientName}" via ${payment.paymentMethod}`,
        timestamp: payment.paymentDate
      });
    });
    
    // Sort by timestamp and limit to 10
    recentActivities.sort((a, b) => b.timestamp - a.timestamp);
    const topRecentActivities = recentActivities.slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        totalLeads,
        conversionRate: parseFloat(conversionRate),
        activeDeals,
        totalRevenue,
        revenueGoal: 100000, // Default monthly revenue goal
        leadsByDistrict: leadsByDistrict.map(item => ({
          district: item._id || 'Unknown',
          count: item.count
        })),
        monthlyRevenueTrend: formattedMonthlyTrend,
        recentActivities: topRecentActivities,
        recentClosedDeals: recentClosedDeals.map(deal => ({
          businessName: deal.businessName,
          stage: deal.stage,
          budget: deal.budget,
          timestamp: deal.updatedAt
        })),
        recentPayments: recentPayments.map(payment => ({
          clientName: payment.clientName,
          receivedAmount: payment.receivedAmount,
          paymentMethod: payment.paymentMethod,
          timestamp: payment.paymentDate
        }))
      },
      message: 'Dashboard KPI metrics retrieved successfully',
    });
  } catch (error) {
    console.error('❌ Error fetching dashboard KPI metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message,
    });
  }
};

// Alias exports to match requirement function names
exports.getLeads = exports.getAllLeads;
exports.getLead = exports.getLeadById;