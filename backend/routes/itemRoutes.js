import express from 'express';
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  markRecovered,
  getMyReports,
} from '../controllers/itemController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// General item operations
router.post('/', protect, upload.single('image'), createItem);
router.get('/', getItems);

// User-specific reports route
router.get('/myreports', protect, getMyReports);

// Individual item operations
router.get('/:id', getItemById);
router.put('/:id', protect, upload.single('image'), updateItem);
router.delete('/:id', protect, deleteItem);
router.put('/:id/recover', protect, markRecovered);

export default router;
