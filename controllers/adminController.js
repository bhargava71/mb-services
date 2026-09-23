import mongoose from 'mongoose';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';

// @desc    Get all users (optionally filtered by role)
// @route   GET /api/admin/users
// @access  Admin only
export const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users,
    });
  } catch (error) {
    console.error('getAllUsers error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching users',
    });
  }
};

// @desc    Get all professionals
// @route   GET /api/admin/professionals
// @access  Admin only
export const getAllProfessionals = async (req, res) => {
  try {
    const professionals = await User.find({ role: 'professional' })
      .select('-password')
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      message: 'Professionals retrieved successfully',
      data: professionals,
    });
  } catch (error) {
    console.error('getAllProfessionals error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching professionals',
    });
  }
};

// @desc    Get all bookings with full populated details
// @route   GET /api/admin/bookings
// @access  Admin only
export const getAllBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status && status !== 'all' ? { status } : {};

    const bookings = await Booking.find(filter)
      .populate('service', 'name price image category')
      .populate('customer', 'name email phone')
      .populate('professional', 'name email phone')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'All bookings retrieved successfully',
      data: bookings,
    });
  } catch (error) {
    console.error('getAllBookings error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching bookings',
    });
  }
};

// @desc    Assign a professional to a booking
// @route   PUT /api/admin/bookings/:id/assign
// @access  Admin only
export const assignProfessional = async (req, res) => {
  try {
    const { id } = req.params;
    const { professionalId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format',
      });
    }

    if (!professionalId || !mongoose.Types.ObjectId.isValid(professionalId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid professionalId is required in request body',
      });
    }

    // 1. Verify booking exists
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // 2. Verify professional exists
    const professional = await User.findById(professionalId);
    if (!professional) {
      return res.status(404).json({
        success: false,
        message: 'Professional not found',
      });
    }

    // 3. Verify professional role is professional
    if (professional.role !== 'professional') {
      return res.status(400).json({
        success: false,
        message: `User '${professional.name}' does not have the 'professional' role (current role: ${professional.role})`,
      });
    }

    // 4. Assign professional and change status to assigned
    booking.professional = professional._id;
    booking.status = 'assigned';
    await booking.save();

    const updatedBooking = await Booking.findById(id)
      .populate('service', 'name price image category')
      .populate('customer', 'name email phone')
      .populate('professional', 'name email phone');

    return res.status(200).json({
      success: true,
      message: `Professional '${professional.name}' assigned to booking successfully`,
      data: updatedBooking,
    });
  } catch (error) {
    console.error('assignProfessional error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error assigning professional',
    });
  }
};

// @desc    Admin dashboard summary statistics
// @route   GET /api/admin/stats
// @access  Admin only
export const getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalPros, totalServices, totalBookings, bookings] =
      await Promise.all([
        User.countDocuments({ role: 'customer' }),
        User.countDocuments({ role: 'professional' }),
        Service.countDocuments(),
        Booking.countDocuments(),
        Booking.find().select('price status'),
      ]);

    const totalRevenue = bookings
      .filter((b) => b.status === 'completed')
      .reduce((sum, b) => sum + (b.price || 0), 0);

    const pendingCount = bookings.filter((b) => b.status === 'pending').length;
    const assignedCount = bookings.filter((b) => b.status === 'assigned').length;
    const completedCount = bookings.filter((b) => b.status === 'completed').length;

    return res.status(200).json({
      success: true,
      message: 'Admin stats retrieved successfully',
      data: {
        totalCustomers: totalUsers,
        totalProfessionals: totalPros,
        totalServices,
        totalBookings,
        totalRevenue,
        pendingBookings: pendingCount,
        assignedBookings: assignedCount,
        completedBookings: completedCount,
      },
    });
  } catch (error) {
    console.error('getAdminStats error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching admin stats',
    });
  }
};
