// import { Request, Response } from 'express';
// import { blockchainService } from '../services/blockchainService';

// /**
//  * @desc Gets dashboard statistics for the authenticated user.
//  * @route GET /api/dashboard/stats
//  * @access Private (requires JWT)
//  */
// export const getDashboardStats = async (req: Request, res: Response) => {
//   try {
//     // The user's address and role are attached to the request by the authMiddleware
//     const { address, role } = req.user;

//     console.log(`Received request for dashboard stats from ${role}: ${address}`);

//     // Fetch real-time stats from our blockchain service using the user's address
//     const stats = await blockchainService.getDocumentStats(address);

//     res.status(200).json(stats);
//   } catch (error) {
//     console.error("❌ Failed to get dashboard stats:", error);
//     res.status(500).json({ error: "Could not retrieve dashboard statistics." });
//   }
// };

import { Request, Response } from 'express';
import { blockchainService } from '../services/blockchainService';
import { UserRole } from '../models/User';

/**
 * Get dashboard statistics for authenticated user
 */
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { address, role } = req.user;
    
    console.log(`📊 Dashboard stats requested for ${role}: ${address}`);

    // Determine role type for blockchain service
    const blockchainRole = role === UserRole.INSTITUTE ? 'institute' : 'individual';
    
    // Fetch stats from blockchain
    const stats = await blockchainService.getDocumentStats(address, blockchainRole);

    res.json({
      success: true,
      data: {
        totalDocuments: stats.totalDocuments,
        verified: stats.verifiedDocuments,
        pending: stats.pendingDocuments,
        verifications: stats.totalVerifications
      },
      user: {
        address,
        role
      }
    });
  } catch (error: any) {
    console.error('❌ Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics',
      message: error.message
    });
  }
};

/**
 * Get list of documents for authenticated user
 */
export const getUserDocuments = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { address, role } = req.user;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    console.log(`📄 Documents requested for ${role}: ${address} (limit=${limit}, offset=${offset})`);

    // Only institutes can view issued documents for now
    if (role !== UserRole.INSTITUTE) {
      return res.status(403).json({
        success: false,
        error: 'Only institutions can view issued documents'
      });
    }

    const documents = await blockchainService.getIssuedDocuments(address, limit, offset);

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          limit,
          offset,
          total: documents.length
        }
      }
    });
  } catch (error: any) {
    console.error('❌ Get documents error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch documents',
      message: error.message
    });
  }
};

/**
 * Get detailed analytics for dashboard
 */
export const getDashboardAnalytics = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { address, role } = req.user;

    // Get basic stats
    const blockchainRole = role === UserRole.INSTITUTE ? 'institute' : 'individual';
    const stats = await blockchainService.getDocumentStats(address, blockchainRole);

    // Get recent documents (last 5)
    const recentDocuments = role === UserRole.INSTITUTE 
      ? await blockchainService.getIssuedDocuments(address, 5, 0)
      : [];

    res.json({
      success: true,
      data: {
        stats: {
          totalDocuments: stats.totalDocuments,
          verified: stats.verifiedDocuments,
          pending: stats.pendingDocuments,
          revoked: stats.revokedDocuments,
          verifications: stats.totalVerifications
        },
        recentDocuments: recentDocuments.map(doc => ({
          hash: doc.documentHash,
          type: doc.documentType,
          recipient: doc.recipientName,
          issuanceDate: doc.issuanceDate,
          status: doc.isRevoked ? 'revoked' : 'active',
          transactionHash: doc.transactionHash
        })),
        user: {
          address,
          role
        }
      }
    });
  } catch (error: any) {
    console.error('❌ Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard analytics',
      message: error.message
    });
  }
};
