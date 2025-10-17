import express from 'express';
import { getNonce, verify, getMe, logout } from '../controllers/siweController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @route   GET /api/auth/nonce
 * @desc    Generate a nonce for SIWE authentication
 * @access  Public
 */
router.get('/nonce', getNonce);

/**
 * @route   POST /api/auth/verify
 * @desc    Verify SIWE signature and create session
 * @access  Public
 */
router.post('/verify', verify);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authMiddleware, getMe);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and clear session
 * @access  Public
 */
router.post('/logout', logout);

export default router;
