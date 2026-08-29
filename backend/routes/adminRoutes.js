import express from 'express';
import {
  getAllUsers,
  getAllItems,
  getAllClaims,
  deleteUser,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/users', protect, admin, getAllUsers);
router.get('/items', protect, admin, getAllItems);
router.get('/claims', protect, admin, getAllClaims);
router.delete('/users/:id', protect, admin, deleteUser);

export default router;
