export interface Document {
    id: string;
    hash: string;
    title: string;
    type: string;
    issuer: string;
    recipient: string;
    issueDate: string;
    expiryDate?: string;
    isVerified: boolean;
    metadata: DocumentMetadata;
    blockchain: {
      transactionHash: string;
      blockNumber: number;
      gasUsed: string;
    };
  }
  
  export interface DocumentMetadata {
    institution: string;
    course?: string;
    grade?: string;
    credentialType: string;
    additionalInfo?: Record<string, any>;
  }
  
  export interface Institution {
    address: string;
    name: string;
    registrationNumber: string;
    contactEmail: string;
    isVerified: boolean;
    documentsIssued: number;
    reputationScore: number;
    verificationDate?: string;
  }
  
  export interface VerificationResult {
    isValid: boolean;
    document?: Document;
    institution?: Institution;
    verificationTimestamp: number;
    error?: string;
    confidence: number;
  }
  
  export interface User {
    address: string;
    userType: 'student' | 'institution' | 'verifier';
    profile?: {
      name: string;
      email: string;
      institution?: string;
    };
  }
  
  export interface WalletState {
    isConnected: boolean;
    account: string | null;
    chainId: number | null;
    balance: string;
  }
  