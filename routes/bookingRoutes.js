import express from 'express';
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getMyJobs,
  updateJobStatus,
} from '../controllers/bookingController.js';
import protect from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';

const router = express.Router();

// Professional specific routes (declared before /:id)
router.get('/my-jobs', protect, authorize('professional'), getMyJobs);
router.put('/:id/status', protect, authorize('professional'), updateJobStatus);

// Customer / General Booking routes
router.post('/', protect, authorize('customer'), createBooking);
router.get('/', protect, getBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id', protect, updateBooking);
router.delete('/:id', protect, authorize('admin'), deleteBooking);

export default router;
