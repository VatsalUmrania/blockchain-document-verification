// import { Request, Response } from 'express';
// import User, { UserRole } from '../models/User';
// import { blockchainService } from '../services/blockchainService';

// /**
//  * @desc    Get all on-chain institutions from the BLOCKCHAIN
//  * @route   GET /api/admin/institutions
//  * @access  Private (Admin only)
//  */
// export const listInstitutions = async (req: Request, res: Response) => {
//   try {
//     // 1. FIXED: This now calls the new blockchain service function
//     // and does NOT query MongoDB for the list.
//     const institutions = await blockchainService.getAllInstitutionsFromChain();

//     // This will now be an empty array [] if you just reset your Hardhat node.

//     res.status(200).json({
//       success: true,
//       data: institutions,
//     });
//   } catch (error: any) {
//     console.error('❌ Error listing institutions:', error);
//     res.status(500).json({ 
//       success: false, 
//       error: 'Failed to list institutions',
//       details: error.message 
//     });
//   }
// };

// /**
//  * @desc    Verify an institution on the blockchain
//  * @route   POST /api/admin/verify
//  * @access  Private (Admin only)
//  */
// export const verifyInstitution = async (req: Request, res: Response) => {
//   try {
//     const { addressToVerify } = req.body;

//     if (!addressToVerify || !/^0x[a-fA-F0-9]{40}$/.test(addressToVerify)) {
//       return res.status(400).json({
//         success: false,
//         error: 'A valid Ethereum address "addressToVerify" is required.',
//       });
//     }

//     const adminUserAddress = req.user?.address;
//     console.log(`👑 Admin ${adminUserAddress} attempting to verify: ${addressToVerify}`);
    
//     const tx = await blockchainService.verifyInstitution(addressToVerify);
    
//     const txHash = tx.hash;
//     console.log(`Transaction sent, waiting for confirmation... TxHash: ${txHash}`);

//     const receipt = await tx.wait();

//     if (!receipt) {
//       throw new Error('Transaction failed to confirm or receipt was null.');
//     }

//     console.log(`✅ Institution verified. Block: ${receipt.blockNumber}`);

//     // 2. We still update the DB role so the user gets the
//     // 'Institute' role when they next log in.
//     await User.findOneAndUpdate(
//       { address: addressToVerify.toLowerCase() },
//       { role: UserRole.INSTITUTE } 
//     );

//     res.status(200).json({
//       success: true,
//       message: `Institution ${addressToVerify} verified successfully.`,
//       transactionHash: txHash,
//     });

//   } catch (error: any) {
//     console.error('❌ Error verifying institution:', error);
//     res.status(500).json({ 
//       success: false, 
//       error: 'Failed to verify institution',
//       details: error.message 
//     });
//   }
// };

// /**
//  * @desc    Get blockchain details for a specific institution
//  * @route   GET /api/admin/institution/:address
//  * @access  Private (Admin only)
//  */
// export const getInstitutionDetails = async (req: Request, res: Response) => {
//   try {
//     const { address } = req.params;

//     if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
//       return res.status(400).json({
//         success: false,
//         error: 'A valid Ethereum address parameter is required.',
//       });
//     }

//     const details = await blockchainService.getInstitutionDetails(address);
    
//     if (details.registrationDate === '0') {
//         return res.status(404).json({
//             success: false,
//             error: 'Institution not registered on-chain.'
//         });
//     }

//     res.status(200).json({
//       success: true,
//       data: details,
//     });

//   } catch (error: any) {
//     console.error('❌ Error getting institution details:', error);
//     res.status(500).json({ 
//       success: false, 
//       error: 'Failed to get institution details',
//       details: error.message 
//     });
//   }
// };

import { Request, Response } from 'express';
import User, { UserRole } from '../models/User';
import { blockchainService } from '../services/blockchainService';

/**
 * @desc    Get all on-chain institutions from the BLOCKCHAIN
 * @route   GET /api/admin/institutions
 * @access  Private (Admin only)
 */
export const listInstitutions = async (req: Request, res: Response) => {
  // ... (existing listInstitutions function stays the same)
  try {
    const institutions = await blockchainService.getAllInstitutionsFromChain();
    res.status(200).json({
      success: true,
      data: institutions,
    });
  } catch (error: any) {
    console.error('❌ Error listing institutions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to list institutions',
      details: error.message 
    });
  }
};

/**
 * @desc    Verify an institution on the blockchain
 * @route   POST /api/admin/verify
 * @access  Private (Admin only)
 */
export const verifyInstitution = async (req: Request, res: Response) => {
  // ... (existing verifyInstitution function stays the same)
  try {
    const { addressToVerify } = req.body;

    if (!addressToVerify || !/^0x[a-fA-F0-9]{40}$/.test(addressToVerify)) {
      return res.status(400).json({
        success: false,
        error: 'A valid Ethereum address "addressToVerify" is required.',
      });
    }

    const adminUserAddress = req.user?.address;
    console.log(`👑 Admin ${adminUserAddress} attempting to verify: ${addressToVerify}`);
    
    const tx = await blockchainService.verifyInstitution(addressToVerify);
    
    const txHash = tx.hash;
    console.log(`Transaction sent, waiting for confirmation... TxHash: ${txHash}`);

    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error('Transaction failed to confirm or receipt was null.');
    }

    console.log(`✅ Institution verified. Block: ${receipt.blockNumber}`);

    await User.findOneAndUpdate(
      { address: addressToVerify.toLowerCase() },
      { role: UserRole.INSTITUTE } 
    );

    res.status(200).json({
      success: true,
      message: `Institution ${addressToVerify} verified successfully.`,
      transactionHash: txHash,
    });

  } catch (error: any) {
    console.error('❌ Error verifying institution:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to verify institution',
      details: error.message 
    });
  }
};

/**
 * @desc    Get blockchain details for a specific institution
 * @route   GET /api/admin/institution/:address
 * @access  Private (Admin only)
 */
export const getInstitutionDetails = async (req: Request, res: Response) => {
  // ... (existing getInstitutionDetails function stays the same)
  try {
    const { address } = req.params;

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({
        success: false,
        error: 'A valid Ethereum address parameter is required.',
      });
    }

    const details = await blockchainService.getInstitutionDetails(address);
    
    if (details.registrationDate === '0') {
        return res.status(404).json({
            success: false,
            error: 'Institution not registered on-chain.'
        });
    }

    res.status(200).json({
      success: true,
      data: details,
    });

  } catch (error: any) {
    console.error('❌ Error getting institution details:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get institution details',
      details: error.message 
    });
  }
};

// --- ADD THIS NEW FUNCTION ---
/**
 * @desc    Get all documents from the blockchain
 * @route   GET /api/admin/documents
 * @access  Private (Admin only)
 */
export const getAllDocuments = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const documents = await blockchainService.getAllDocuments(limit, offset);
    
    res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (error: any) {
    console.error('❌ Error getting all documents:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get all documents',
      details: error.message 
    });
  }
};