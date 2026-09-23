import express from 'express';
import {
  getCategories,
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from '../controllers/serviceController.js';
import protect from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getServices);
router.get('/categories', getCategories);
router.get('/:id', getServiceById);

// Admin-protected routes
router.post('/', protect, authorize('admin'), createService);
router.put('/:id', protect, authorize('admin'), updateService);
router.delete('/:id', protect, authorize('admin'), deleteService);

export default router;
