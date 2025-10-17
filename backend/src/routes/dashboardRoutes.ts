// import { Router } from 'express';
// import { getDashboardStats } from '../controllers/dashboardController';
// import { authMiddleware } from '../middleware/authMiddleware';

// const router = Router();

// /**
//  * This route is protected by the authMiddleware.
//  * Only users with a valid JWT (obtained after logging in) can access it.
//  */
// router.get('/stats', authMiddleware, getDashboardStats);

// export default router;

import express from 'express';
import {
  getDashboardStats,
  getUserDocuments,
  getDashboardAnalytics
} from '../controllers/dashboardController';
import { authMiddleware, requireInstitute } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics for current user
 * @access  Private
 */
router.get('/stats', authMiddleware, getDashboardStats);

/**
 * @route   GET /api/dashboard/documents
 * @desc    Get list of documents for current user
 * @access  Private (Institute only for now)
 */
router.get('/documents', authMiddleware, requireInstitute, getUserDocuments);

/**
 * @route   GET /api/dashboard/analytics
 * @desc    Get detailed analytics for dashboard
 * @access  Private
 */
router.get('/analytics', authMiddleware, getDashboardAnalytics);

export default router;
