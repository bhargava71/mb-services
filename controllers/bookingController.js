import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import User from '../models/User.js';

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (Customer)
export const createBooking = async (req, res) => {
  try {
    const { service: serviceId, date, timeSlot, address, quantity, price, selectedAddOns } = req.body;

    if (!serviceId || !date || !timeSlot || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide service ID, date, time slot, and address',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID format',
      });
    }

    const serviceDoc = await Service.findById(serviceId);
    if (!serviceDoc) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    const customerId = req.user.id;

    // Calculate actual total price considering quantity and add-ons if provided
    const qty = Number(quantity) > 0 ? Number(quantity) : 1;
    const addOns = Array.isArray(selectedAddOns) ? selectedAddOns : [];
    const addOnsTotal = addOns.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
    const finalCalculatedPrice = Number(price) > 0 ? Number(price) : (serviceDoc.price + addOnsTotal) * qty;

    // Automatic Intelligent Order Assignment: Find active professionals ready for work
    const activePros = await User.find({ role: 'professional', isAvailable: true });

    let assignedProId = null;
    let initialStatus = 'pending';

    if (activePros.length > 0) {
      // Balance workload: assign to active professional with lowest current active jobs
      const prosWithWorkload = await Promise.all(
        activePros.map(async (pro) => {
          const activeJobCount = await Booking.countDocuments({
            professional: pro._id,
            status: { $in: ['assigned', 'accepted', 'in_progress'] },
          });
          return { pro, activeJobCount };
        })
      );

      prosWithWorkload.sort((a, b) => a.activeJobCount - b.activeJobCount);
      const chosenPro = prosWithWorkload[0].pro;
      assignedProId = chosenPro._id;
      initialStatus = 'assigned';
    } else {
      // Fallback: If no pro is explicitly toggled online, assign to available registered partner
      const anyPro = await User.findOne({ role: 'professional' });
      if (anyPro) {
        assignedProId = anyPro._id;
        initialStatus = 'assigned';
      }
    }

    const booking = await Booking.create({
      customer: customerId,
      service: serviceDoc._id,
      date: new Date(date),
      timeSlot,
      address,
      quantity: qty,
      selectedAddOns: addOns,
      price: finalCalculatedPrice,
      professional: assignedProId,
      status: initialStatus,
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('service', 'name price originalPrice image category subcategory')
      .populate('customer', 'name email phone')
      .populate('professional', 'name email phone');

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: populatedBooking,
    });
  } catch (error) {
    console.error('createBooking error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating booking',
    });
  }
};

// @desc    Get user's bookings (Customer sees only own, Admin sees all)
// @route   GET /api/bookings
// @access  Private
export const getBookings = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'customer') {
      filter.customer = req.user.id;
    } else if (req.user.role === 'professional') {
      filter.professional = req.user.id;
    }
    // admin sees all (filter = {})

    const bookings = await Booking.find(filter)
      .populate('service', 'name price image category description')
      .populate('customer', 'name email phone')
      .populate('professional', 'name email phone')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Bookings retrieved successfully',
      data: bookings,
    });
  } catch (error) {
    console.error('getBookings error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching bookings',
    });
  }
};

// @desc    Get booking details by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format',
      });
    }

    const booking = await Booking.findById(id)
      .populate('service', 'name price image category description')
      .populate('customer', 'name email phone')
      .populate('professional', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Ownership check: customer can only view their own; pro can only view assigned to them; admin can view any
    if (
      req.user.role === 'customer' &&
      booking.customer._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking',
      });
    }

    if (
      req.user.role === 'professional' &&
      (!booking.professional ||
        booking.professional._id.toString() !== req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Booking details retrieved',
      data: booking,
    });
  } catch (error) {
    console.error('getBookingById error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching booking',
    });
  }
};

// @desc    Update booking (e.g. cancellation by customer, or update by admin)
// @route   PUT /api/bookings/:id
// @access  Private
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format',
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    const { status, address, date, timeSlot } = req.body;

    // Customer cancellation logic
    if (req.user.role === 'customer') {
      if (booking.customer.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this booking',
        });
      }

      // Customer can only cancel pending bookings
      if (status) {
        if (status === 'cancelled') {
          if (booking.status !== 'pending') {
            return res.status(400).json({
              success: false,
              message: `Cannot cancel a booking that is already '${booking.status}'. Only 'pending' bookings can be cancelled.`,
            });
          }
          booking.status = 'cancelled';
        } else {
          return res.status(403).json({
            success: false,
            message: 'Customers are only permitted to cancel pending bookings.',
          });
        }
      }

      if (address) booking.address = address;
      if (date) booking.date = new Date(date);
      if (timeSlot) booking.timeSlot = timeSlot;
    } else if (req.user.role === 'admin') {
      if (status) booking.status = status;
      if (address) booking.address = address;
      if (date) booking.date = new Date(date);
      if (timeSlot) booking.timeSlot = timeSlot;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Please use the professional job endpoints to update job status',
      });
    }

    await booking.save();

    const updatedBooking = await Booking.findById(id)
      .populate('service', 'name price image category')
      .populate('customer', 'name email phone')
      .populate('professional', 'name email phone');

    return res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      data: updatedBooking,
    });
  } catch (error) {
    console.error('updateBooking error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating booking',
    });
  }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Admin only
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format',
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    await Booking.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Booking deleted successfully',
      data: { id },
    });
  } catch (error) {
    console.error('deleteBooking error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting booking',
    });
  }
};

// @desc    Get jobs assigned to current professional
// @route   GET /api/bookings/my-jobs
// @access  Private (Professional only)
export const getMyJobs = async (req, res) => {
  try {
    const jobs = await Booking.find({ professional: req.user.id })
      .populate('service', 'name price image category description')
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Assigned jobs retrieved successfully',
      data: jobs,
    });
  } catch (error) {
    console.error('getMyJobs error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching assigned jobs',
    });
  }
};

// @desc    Update assigned job status by Professional
// @route   PUT /api/bookings/:id/status
// @access  Private (Professional only)
export const updateJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format',
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check ownership: must be assigned to this professional
    if (
      !booking.professional ||
      booking.professional.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized: this job is not assigned to you',
      });
    }

    // Validate status transitions:
    // assigned → accepted
    // accepted → in-progress
    // in-progress → completed
    const currentStatus = booking.status;
    const validTransitions = {
      assigned: 'accepted',
      accepted: 'in-progress',
      'in-progress': 'completed',
    };

    if (validTransitions[currentStatus] !== status) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from '${currentStatus}' to '${status}'. Allowed next status: '${validTransitions[currentStatus] || 'none'}'`,
      });
    }

    booking.status = status;
    if (status === 'in-progress' && !booking.startedAt) {
      booking.startedAt = new Date();
    }
    if (status === 'completed' && !booking.completedAt) {
      booking.completedAt = new Date();
    }

    await booking.save();

    const updated = await Booking.findById(id)
      .populate('service', 'name price image category')
      .populate('customer', 'name email phone')
      .populate('professional', 'name email phone');

    return res.status(200).json({
      success: true,
      message: `Job status updated to '${status}' successfully`,
      data: updated,
    });
  } catch (error) {
    console.error('updateJobStatus error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating job status',
    });
  }
};
