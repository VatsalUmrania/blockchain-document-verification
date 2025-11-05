// import { Request, Response } from 'express';
// import User, { UserRole } from '../models/User';
// import { blockchainService } from '../services/blockchainService';

// /**
//  * @desc    Get all users (Institutes and Individuals)
//  * @route   GET /api/admin/institutions
//  * @access  Private (Admin only)
//  */
// export const listInstitutions = async (req: Request, res: Response) => {
//   try {
//     // 1. FIXED: Find all users that are NOT Admins
//     const institutions = await User.find({ 
//       role: { $ne: UserRole.ADMIN } 
//     }).select('-__v');
    
//     // Enhance by fetching on-chain status for each
//     const institutionData = await Promise.all(
//       institutions.map(async (inst) => {
//         try {
//           const onChainData = await blockchainService.getInstitutionDetails(inst.address);
//           return {
//             ...inst.toObject(),
//             // Use the on-chain verification status as the source of truth
//             isVerified: onChainData.isVerified, 
//             onChainName: onChainData.name || 'N/A',
//             registrationDate: onChainData.registrationDate,
//           };
//         } catch (error) {
//           // Handle cases where address might not be on-chain
//           return {
//             ...inst.toObject(),
//             isVerified: false,
//             onChainName: 'N/A (Not Registered On-Chain)',
//             registrationDate: '0',
//           };
//         }
//       })
//     );

//     res.status(200).json({
//       success: true,
//       data: institutionData,
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

//     // 2. FIXED: Now that verification is on-chain, update the DB role
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
  try {
    // 1. FIXED: This now calls the new blockchain service function
    // and does NOT query MongoDB for the list.
    const institutions = await blockchainService.getAllInstitutionsFromChain();

    // This will now be an empty array [] if you just reset your Hardhat node.

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

    // 2. We still update the DB role so the user gets the
    // 'Institute' role when they next log in.
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