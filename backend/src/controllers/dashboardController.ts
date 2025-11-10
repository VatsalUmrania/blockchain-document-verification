import { Request, Response } from 'express';
import { blockchainService } from '../services/blockchainService';

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
    
    // Fetch stats from blockchain service
    // --- MODIFICATION: This now returns the full stats object ---
    const stats = await blockchainService.getDocumentStats(address);

    res.json({
      success: true,
      data: {
        totalDocuments: stats.totalDocuments,
        verified: stats.verifiedDocuments,      // Pass 'verified' count
        pending: stats.pendingDocuments,        // Pass 'pending' count
        revoked: stats.revokedDocuments,        // Pass 'revoked' count
        verifications: stats.totalVerifications // Pass verification count
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

    // --- MODIFICATION: Allow anyone to view their documents ---
    // (You can change this back if needed, but this allows individuals to see docs issued *to* them)
    // if (role !== UserRole.INSTITUTE) {
    //   return res.status(403).json({
    //     success: false,
    //     error: 'Only institutions can view issued documents'
    //   });
    // }

    // --- MODIFICATION: This function now returns the correct state (pending/verified/revoked) ---
    const documents = await blockchainService.getIssuedDocuments(address, limit, offset);

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          limit,
          offset,
          total: documents.length // Note: This total is only for the *paginated* result, not all docs
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

    // Get basic stats (now with pending/verified counts)
    const stats = await blockchainService.getDocumentStats(address);

    // Get recent documents (last 5)
    // --- MODIFICATION: This now returns the correct status ---
    const recentDocuments = await blockchainService.getIssuedDocuments(address, 5, 0);

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
        // --- MODIFICATION: Status logic is now correct from the service ---
        recentDocuments: recentDocuments.map(doc => ({
          hash: doc.documentHash,
          type: doc.documentType,
          title: doc.title,
          recipient: doc.recipientName,
          issuanceDate: doc.issuanceDate,
          status: doc.status, // This will be 'pending', 'verified', 'revoked', or 'expired'
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