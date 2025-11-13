// import api from './api';

// export interface Institution {
//   address: string;
//   name: string;
//   registrationNumber: string;
//   contactInfo: string;
//   isVerified: boolean;
//   registrationDate: string;
// }

// // --- MODIFIED: Added verifiedBy field ---
// export interface DocumentDetails {
//   documentHash: string;
//   issuer: string;
//   issuerName: string;
//   documentType: string;
//   title: string;
//   recipientName: string;
//   recipientId: string;
//   issuanceDate: string; 
//   expirationDate: string | null;
//   status: 'pending' | 'verified' | 'revoked' | 'expired';
//   isActive: boolean;
//   isVerified: boolean;
//   verifiedBy: string | null; // <-- ADDED THIS FIELD
//   isRevoked: boolean;
//   transactionHash: string;
//   blockNumber: number;
// }
// // --- END MODIFICATION ---


// const getInstitutions = async (): Promise<Institution[]> => {
//   // ... (existing function)
//   try {
//     const response = await api.get('/admin/institutions');
//     if (response.data && response.data.success) {
//       return response.data.data;
//     }
//     throw new Error(response.data.error || 'Failed to fetch institutions');
//   } catch (error) {
//     console.error('Error fetching institutions:', error);
//     throw error;
//   }
// };

// const verifyInstitution = async (addressToVerify: string): Promise<any> => {
//   // ... (existing function)
//   try {
//     const response = await api.post('/admin/verify', { addressToVerify });
//     if (response.data && response.data.success) {
//       return response.data;
//     }
//     throw new Error(response.data.error || 'Failed to verify institution');
//   } catch (error) {
//     console.error('Error verifying institution:', error);
//     throw error;
//   }
// };

// const getAllDocuments = async (): Promise<DocumentDetails[]> => {
//   // ... (existing function)
//   try {
//     const response = await api.get('/admin/documents'); 
//     if (response.data && response.data.success) {
//       return response.data.data;
//     }
//     throw new Error(response.data.error || 'Failed to fetch documents');
//   } catch (error) {
//     console.error('Error fetching all documents:', error);
//     throw error;
//   }
// };

// export const adminService = {
//   getInstitutions,
//   verifyInstitution,
//   getAllDocuments, 
// };


import api from './api';

// 1. FIXED: This interface now MATCHES what the backend is sending
// from blockchainService.getAllInstitutionsFromChain()
export interface Institution {
  address: string;
  name: string;
  registrationNumber: string;
  contactInfo: string;
  isVerified: boolean;
  registrationDate: string;
}

// --- MODIFIED: Added verifiedBy field AND EXPORTED ---
export interface DocumentDetails {
  documentHash: string;
  issuer: string;
  issuerName: string;
  documentType: string;
  title: string;
  recipientName: string;
  recipientId: string;
  issuanceDate: string; 
  expirationDate: string | null;
  status: 'pending' | 'verified' | 'revoked' | 'expired';
  isActive: boolean;
  isVerified: boolean;
  verifiedBy: string | null; // <-- This was added
  isRevoked: boolean;
  transactionHash: string;
  blockNumber: number;
}
// --- END MODIFICATION ---


/**
 * Fetches the list of all institutions from the admin endpoint.
 * Requires an Admin token.
 */
const getInstitutions = async (): Promise<Institution[]> => {
  try {
    const response = await api.get('/admin/institutions');
    if (response.data && response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch institutions');
  } catch (error) {
    console.error('Error fetching institutions:', error);
    throw error;
  }
};

/**
 * Sends a request to verify an institution on-chain.
 * Requires an Admin token.
 * @param addressToVerify The Ethereum address of the institution to verify
 */
const verifyInstitution = async (addressToVerify: string): Promise<any> => {
  try {
    const response = await api.post('/admin/verify', { addressToVerify });
    if (response.data && response.data.success) {
      return response.data;
    }
    throw new Error(response.data.error || 'Failed to verify institution');
  } catch (error) {
    console.error('Error verifying institution:', error);
    throw error;
  }
};

/**
 * Fetches the list of all documents from the admin endpoint.
 * Requires an Admin token.
 */
const getAllDocuments = async (): Promise<DocumentDetails[]> => {
  try {
    const response = await api.get('/admin/documents'); // You can add params here, e.g., ?limit=20
    if (response.data && response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to fetch documents');
  } catch (error) {
    console.error('Error fetching all documents:', error);
    throw error;
  }
};

export const adminService = {
  getInstitutions,
  verifyInstitution,
  getAllDocuments, 
};