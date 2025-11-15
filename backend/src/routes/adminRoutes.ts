// import { Router } from 'express';
// import { 
//   listInstitutions, 
//   verifyInstitution,
//   getInstitutionDetails
// } from '../controllers/adminController';
// import { authMiddleware, requireAdmin } from '../middleware/authMiddleware';

// const router = Router();

// // All routes in this file are protected and require admin access

// /**
//  * @route   GET /api/admin/institutions
//  * @desc    Get all registered institutions (from DB and chain)
//  * @access  Private (Admin)
//  */
// router.get('/institutions', authMiddleware, requireAdmin, listInstitutions);

// /**
//  * @route   POST /api/admin/verify
//  * @desc    Verify an institution on-chain (onlyOwner)
//  * @access  Private (Admin)
//  */
// router.post('/verify', authMiddleware, requireAdmin, verifyInstitution);

// /**
//  * @route   GET /api/admin/institution/:address
//  * @desc    Get on-chain details for a specific institution
//  * @access  Private (Admin)
//  */
// router.get('/institution/:address', authMiddleware, requireAdmin, getInstitutionDetails);


// export default router;

import { Router } from 'express';
import { 
  listInstitutions, 
  verifyInstitution,
  getInstitutionDetails,
  getAllDocuments // <-- Import new function
} from '../controllers/adminController';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// All routes in this file are protected and require admin access

/**
 * @route   GET /api/admin/institutions
 * @desc    Get all registered institutions (from DB and chain)
 * @access  Private (Admin)
 */
router.get('/institutions', authMiddleware, requireAdmin, listInstitutions);

/**
 * @route   POST /api/admin/verify
 * @desc    Verify an institution on-chain (onlyOwner)
 * @access  Private (Admin)
 */
router.post('/verify', authMiddleware, requireAdmin, verifyInstitution);

/**
 * @route   GET /api/admin/institution/:address
 * @desc    Get on-chain details for a specific institution
 * @access  Private (Admin)
 */
router.get('/institution/:address', authMiddleware, requireAdmin, getInstitutionDetails);

// --- ADD THIS NEW ROUTE ---
/**
 * @route   GET /api/admin/documents
 * @desc    Get all documents
 * @access  Private (Admin)
 */
router.get('/documents', authMiddleware, requireAdmin, getAllDocuments);
// --- END OF NEW ROUTE ---


export default router;