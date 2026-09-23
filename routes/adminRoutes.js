import express from 'express';
import {
  getAllUsers,
  getAllProfessionals,
  getAllBookings,
  assignProfessional,
  getAdminStats,
} from '../controllers/adminController.js';
import protect from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';

const router = express.Router();

// All admin routes require authentication and 'admin' role
router.use(protect, authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.get('/professionals', getAllProfessionals);
router.get('/bookings', getAllBookings);
router.put('/bookings/:id/assign', assignProfessional);

export default router;
