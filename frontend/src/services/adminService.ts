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

export const adminService = {
  getInstitutions,
  verifyInstitution,
};