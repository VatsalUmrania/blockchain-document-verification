// import { ethers, Contract, JsonRpcProvider, Wallet, EventLog, ContractTransactionResponse } from 'ethers';
// import { config } from '../config/config'; // Your config loader

// // Try to import the artifact, with fallback for Docker environment
// let DocumentVerificationArtifact: any;
// try {
//   // 1. FIXED: Corrected path from ../../../../ to ../../../
//   DocumentVerificationArtifact = require('../../../artifacts/contracts/DocumentVerification.sol/DocumentVerification.json');
// } catch (e) {
//   try {
//     // Try to load empty artifact as fallback
//     DocumentVerificationArtifact = require('../empty-artifact.json');
//     console.warn('⚠️  Could not load contract artifact, using empty ABI');
//   } catch (fallbackError) {
//     // If even the fallback fails, use an empty object
//     DocumentVerificationArtifact = { abi: [] };
//     console.warn('⚠️  Could not load contract artifact or fallback, using empty ABI');
//   }
// }

// const DOCUMENT_VERIFICATION_ABI = DocumentVerificationArtifact.abi;

// export interface DocumentStats {
//   totalDocuments: number;
//   verifiedDocuments: number;
//   pendingDocuments: number;
//   revokedDocuments: number;
//   totalVerifications: number;
// }

// export interface DocumentDetails {
//   documentHash: string;
//   issuer: string;
//   issuerName: string;
//   documentType: string;
//   title: string;
//   recipientName: string;
//   recipientId: string;
//   issuanceDate: Date;
//   expirationDate: Date | null;
//   status: 'active' | 'verified' | 'revoked' | 'expired';
//   isActive: boolean;
//   isRevoked: boolean;
//   transactionHash: string;
//   blockNumber: number;
// }

// // 2. NEW INTERFACE FOR ADMIN FUNCTION
// export interface InstitutionDetails {
//   name: string;
//   registrationNumber: string;
//   contactInfo: string;
//   isVerified: boolean;
//   registrationDate: string; // Converted to string for JSON
// }

// class BlockchainService {
//   private provider: JsonRpcProvider;
//   private contract: Contract; // Read-only contract
//   private adminSigner: Wallet; // 3. NEW: Admin signer for writing
//   private adminContract: Contract; // 4. NEW: Contract instance for admin

//   constructor() {
//     this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    
//     // 5. KEPT: Your read-only contract
//     this.contract = new Contract(
//       config.contractAddress,
//       DOCUMENT_VERIFICATION_ABI,
//       this.provider
//     );

//     // 6. NEW: Setup admin signer and write-capable contract
//     // This requires ADMIN_PRIVATE_KEY in your .env
//     if (!config.adminPrivateKey) {
//       console.warn('⚠️  ADMIN_PRIVATE_KEY not set. Admin write operations will fail.');
//       // Create a dummy signer to avoid crashing, but it won't work
//       this.adminSigner = new Wallet(ethers.id('dummy'), this.provider);
//     } else {
//       this.adminSigner = new Wallet(config.adminPrivateKey, this.provider);
//     }

//     this.adminContract = new Contract(
//       config.contractAddress,
//       DOCUMENT_VERIFICATION_ABI,
//       this.adminSigner
//     );


//     console.log('✅ Blockchain service initialized');
//     console.log('📝 Contract address:', config.contractAddress);
//     console.log('👑 Admin address:', this.adminSigner.address);
//   }

//   // --- Public/User Functions (Your Existing Logic, Cleaned Up) ---

//   public async isInstitutionVerified(address: string): Promise<boolean> {
//     try {
//       const isVerified = await this.contract.isInstitutionVerified(address);
//       return isVerified;
//     } catch (error) {
//       console.error(`❌ Error checking institution status:`, error);
//       return false;
//     }
//   }

//   public async getDocumentStats(issuerAddress: string): Promise<DocumentStats> {
//     try {
//       console.log(`📊 Fetching stats for issuer: ${issuerAddress}`);
      
//       const normalizedAddress = issuerAddress.toLowerCase();

//       const issueFilter = this.contract.filters.DocumentIssued(null, issuerAddress);
//       const issuedEvents = await this.contract.queryFilter(issueFilter, 0, 'latest') as EventLog[];
      
//       console.log(`  📄 Found ${issuedEvents.length} issued documents`);

//       if (issuedEvents.length === 0) {
//         return {
//           totalDocuments: 0,
//           verifiedDocuments: 0,
//           pendingDocuments: 0,
//           revokedDocuments: 0,
//           totalVerifications: 0
//         };
//       }

//       const documentHashes = issuedEvents.map(e => e.args?.documentHash).filter(Boolean) as string[];

//       const revokeFilter = this.contract.filters.DocumentRevoked();
//       const allRevokedEvents = await this.contract.queryFilter(revokeFilter, 0, 'latest') as EventLog[];
      
//       const revokedByThisIssuer = allRevokedEvents.filter(e => 
//         e.args?.issuer?.toLowerCase() === normalizedAddress
//       );

//       const revokedHashes = new Set(revokedByThisIssuer.map(e => e.args?.documentHash).filter(Boolean) as string[]);

//       let verifiedCount = 0;

//       for (const hash of documentHashes) {
//         try {
//           const doc = await this.contract.documents(hash);
//           const isRevoked = revokedHashes.has(hash);

//           // 7. FIXED: Use Number() to convert bigint
//           const expDate = Number(doc.expirationDate);
//           const isExpired = expDate > 0 ? new Date(expDate * 1000) < new Date() : false;

//           if (!isRevoked && !isExpired && doc.isActive) {
//             verifiedCount++;
//           }
//         } catch (error) {
//           console.error(`Error checking document ${hash}:`, error);
//         }
//       }

//       const totalDocuments = issuedEvents.length;
//       const revokedDocuments = revokedHashes.size;
//       const verifiedDocuments = verifiedCount;
//       const pendingDocuments = totalDocuments - verifiedCount - revokedDocuments; 

//       return {
//         totalDocuments,
//         verifiedDocuments,
//         pendingDocuments: pendingDocuments < 0 ? 0 : pendingDocuments, // Ensure non-negative
//         revokedDocuments,
//         totalVerifications: verifiedCount
//       };
//     } catch (error) {
//       console.error('❌ Error fetching document stats:', error);
//       return {
//         totalDocuments: 0,
//         verifiedDocuments: 0,
//         pendingDocuments: 0,
//         revokedDocuments: 0,
//         totalVerifications: 0
//       };
//     }
//   }

//   public async getIssuedDocuments(
//     issuerAddress: string, 
//     limit: number = 10, 
//     offset: number = 0
//   ): Promise<DocumentDetails[]> {
//     try {
//       console.log(`📄 Fetching documents for issuer: ${issuerAddress} (limit=${limit}, offset=${offset})`);
      
//       const normalizedAddress = issuerAddress.toLowerCase();

//       const issueFilter = this.contract.filters.DocumentIssued(null, issuerAddress);
//       const issuedEvents = await this.contract.queryFilter(issueFilter, 0, 'latest') as EventLog[];
      
//       console.log(`  Found ${issuedEvents.length} issued events`);
//       if (issuedEvents.length === 0) {
//         return [];
//       }

//       const revokeFilter = this.contract.filters.DocumentRevoked();
//       const allRevokedEvents = await this.contract.queryFilter(revokeFilter, 0, 'latest') as EventLog[];
      
//       const revokedHashes = new Set(
//         allRevokedEvents
//           .filter(e => e.args?.issuer?.toLowerCase() === normalizedAddress)
//           .map(e => e.args?.documentHash)
//           .filter(Boolean) as string[]
//       );

//       // Reverse, then slice for pagination
//       const paginatedEvents = issuedEvents.reverse().slice(offset, offset + limit);

//       const documents: DocumentDetails[] = [];

//       for (const event of paginatedEvents) {
//         try {
//           const documentHash = event.args?.documentHash;
//           if (!documentHash) continue;

//           const doc = await this.contract.documents(documentHash);
          
//           const isRevoked = revokedHashes.has(documentHash);
          
//           // 8. FIXED: Use Number() to convert bigint
//           const expirationDateNum = Number(doc.expirationDate);
//           const expirationDate = expirationDateNum > 0 ? new Date(expirationDateNum * 1000) : null;
//           const isExpired = expirationDate ? expirationDate < new Date() : false;

//           let status: 'active' | 'verified' | 'revoked' | 'expired';
//           if (isRevoked) {
//             status = 'revoked';
//           } else if (isExpired) {
//             status = 'expired';
//           } else if (doc.isActive) {
//             status = 'verified';
//           } else {
//             status = 'active';
//           }

//           documents.push({
//             documentHash,
//             issuer: doc.issuer || issuerAddress,
//             issuerName: doc.issuerName || 'Unknown Institution',
//             documentType: doc.documentType || 'other',
//             title: doc.title || '',
//             recipientName: doc.recipientName || 'Unknown Recipient',
//             recipientId: doc.recipientId || '',
//             issuanceDate: new Date(Number(doc.issuanceDate) * 1000), // 9. FIXED: Use Number()
//             expirationDate,
//             status,
//             isActive: doc.isActive && !isRevoked && !isExpired,
//             isRevoked,
//             transactionHash: event.transactionHash,
//             blockNumber: event.blockNumber
//           });
//         } catch (docError) {
//           console.error(`❌ Error fetching document details for ${event.args?.documentHash}:`, docError);
//         }
//       }

//       console.log(`  ✅ Returning ${documents.length} documents with full details`);
//       return documents;
//     } catch (error) {
//       console.error('❌ Error getting issued documents:', error);
//       return [];
//     }
//   }

//   public async getDocument(documentHash: string): Promise<DocumentDetails | null> {
//     try {
//       const doc = await this.contract.documents(documentHash);
      
//       if (!doc.issuer || doc.issuer === ethers.ZeroAddress) {
//         return null;
//       }

//       const isRevoked = await this.contract.revokedDocuments(documentHash);
      
//       // 10. FIXED: Use Number()
//       const expirationDateNum = Number(doc.expirationDate);
//       const expirationDate = expirationDateNum > 0 ? new Date(expirationDateNum * 1000) : null;
//       const isExpired = expirationDate ? expirationDate < new Date() : false;

//       let status: 'active' | 'verified' | 'revoked' | 'expired';
//       if (isRevoked) {
//         status = 'revoked';
//       } else if (isExpired) {
//         status = 'expired';
//       } else if (doc.isActive) {
//         status = 'verified';
//       } else {
//         status = 'active';
//       }

//       return {
//         documentHash,
//         issuer: doc.issuer,
//         issuerName: doc.issuerName,
//         documentType: doc.documentType,
//         title: doc.title || '',
//         recipientName: doc.recipientName,
//         recipientId: doc.recipientId,
//         issuanceDate: new Date(Number(doc.issuanceDate) * 1000), // 11. FIXED: Use Number()
//         expirationDate: expirationDate,
//         status,
//         isActive: doc.isActive && !isRevoked && !isExpired,
//         isRevoked,
//         transactionHash: '', // Not available from this call
//         blockNumber: 0     // Not available from this call
//       };
//     } catch (error) {
//       console.error('❌ Error getting document:', error);
//       return null;
//     }
//   }

//   // ====================================================================
//   // --- NEW FUNCTIONS TO FIX ERRORS ---
//   // ====================================================================

//   /**
//    * 12. NEW: Performs an ENS reverse lookup
//    * Used by siweController.
//    */
//   public async lookupAddress(address: string): Promise<string | null> {
//     try {
//       // Uses the service's read-only provider to look up the name
//       const name = await this.provider.lookupAddress(address);
//       return name;
//     } catch (error: any) {
//       console.warn(`⚠️  Could not fetch ENS name for ${address}:`, error.message);
//       return null;
//     }
//   }

//   /**
//    * 13. NEW: Verifies an institution on-chain. Admin only.
//    * Uses the adminContract to send a transaction.
//    */
//   public async verifyInstitution(addressToVerify: string): Promise<ContractTransactionResponse> {
//     try {
//       console.log(`👑 ADMIN: Sending 'verifyInstitution' tx for: ${addressToVerify}`);
//       const tx: ContractTransactionResponse = await this.adminContract.verifyInstitution(
//         addressToVerify
//       );
//       return tx;
//     } catch (error: any) {
//       console.error(`❌ ADMIN: Failed to send 'verifyInstitution' tx:`, error.message);
//       throw new Error(`Blockchain transaction failed: ${error.message}`);
//     }
//   }

//   /**
//    * 14. NEW: Gets on-chain details for an institution. Admin only.
//    * Uses the read-only contract.
//    */
//   public async getInstitutionDetails(address: string): Promise<InstitutionDetails> {
//     try {
//       const details = await this.contract.institutions(address);

//       // Convert bigint to string for safe JSON transport
//       return {
//         name: details.name,
//         registrationNumber: details.registrationNumber,
//         contactInfo: details.contactInfo,
//         isVerified: details.isVerified,
//         registrationDate: details.registrationDate.toString(),
//       };
//     } catch (error: any) {
//       console.error('❌ ADMIN: Error getting institution details:', error.message);
//       throw new Error(`Failed to fetch institution details: ${error.message}`);
//     }
//   }
// }

// export const blockchainService = new BlockchainService();

import { ethers, Contract, JsonRpcProvider, Wallet, EventLog, ContractTransactionResponse } from 'ethers';
import { config } from '../config/config'; // Your config loader

// Try to import the artifact, with fallback for Docker environment
let DocumentVerificationArtifact: any;
try {
  DocumentVerificationArtifact = require('../../../artifacts/contracts/DocumentVerification.sol/DocumentVerification.json');
} catch (e) {
  try {
    // Try to load empty artifact as fallback
    DocumentVerificationArtifact = require('../empty-artifact.json');
    console.warn('⚠️  Could not load contract artifact, using empty ABI');
  } catch (fallbackError) {
    // If even the fallback fails, use an empty object
    DocumentVerificationArtifact = { abi: [] };
    console.warn('⚠️  Could not load contract artifact or fallback, using empty ABI');
  }
}

const DOCUMENT_VERIFICATION_ABI = DocumentVerificationArtifact.abi;

export interface DocumentStats {
  totalDocuments: number;
  verifiedDocuments: number;
  pendingDocuments: number;
  revokedDocuments: number;
  totalVerifications: number;
}

export interface DocumentDetails {
  documentHash: string;
  issuer: string;
  issuerName: string;
  documentType: string;
  title: string;
  recipientName: string;
  recipientId: string;
  issuanceDate: Date;
  expirationDate: Date | null;
  status: 'active' | 'verified' | 'revoked' | 'expired';
  isActive: boolean;
  isRevoked: boolean;
  transactionHash: string;
  blockNumber: number;
}

// 1. ADDED 'address' to this interface
export interface InstitutionDetails {
  address: string;
  name: string;
  registrationNumber: string;
  contactInfo: string;
  isVerified: boolean;
  registrationDate: string; // Converted to string for JSON
}

class BlockchainService {
  private provider: JsonRpcProvider;
  private contract: Contract; // Read-only contract
  private adminSigner: Wallet; // Admin signer for writing
  private adminContract: Contract; // Contract instance for admin

  constructor() {
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    
    this.contract = new Contract(
      config.contractAddress,
      DOCUMENT_VERIFICATION_ABI,
      this.provider
    );

    if (!config.adminPrivateKey) {
      console.warn('⚠️  ADMIN_PRIVATE_KEY not set. Admin write operations will fail.');
      this.adminSigner = new Wallet(ethers.id('dummy'), this.provider);
    } else {
      this.adminSigner = new Wallet(config.adminPrivateKey, this.provider);
    }

    this.adminContract = new Contract(
      config.contractAddress,
      DOCUMENT_VERIFICATION_ABI,
      this.adminSigner
    );


    console.log('✅ Blockchain service initialized');
    console.log('📝 Contract address:', config.contractAddress);
    console.log('👑 Admin address:', this.adminSigner.address);
  }

  // --- (Your existing functions like getDocumentStats, getIssuedDocuments, etc. go here) ---
  
  public async isInstitutionVerified(address: string): Promise<boolean> {
    try {
      const isVerified = await this.contract.isInstitutionVerified(address);
      return isVerified;
    } catch (error) {
      console.error(`❌ Error checking institution status:`, error);
      return false;
    }
  }

  public async getDocumentStats(issuerAddress: string): Promise<DocumentStats> {
    try {
      console.log(`📊 Fetching stats for issuer: ${issuerAddress}`);
      const normalizedAddress = issuerAddress.toLowerCase();
      const issueFilter = this.contract.filters.DocumentIssued(null, issuerAddress);
      const issuedEvents = await this.contract.queryFilter(issueFilter, 0, 'latest') as EventLog[];
      console.log(`  📄 Found ${issuedEvents.length} issued documents`);
      if (issuedEvents.length === 0) {
        return { totalDocuments: 0, verifiedDocuments: 0, pendingDocuments: 0, revokedDocuments: 0, totalVerifications: 0 };
      }
      const documentHashes = issuedEvents.map(e => e.args?.documentHash).filter(Boolean) as string[];
      const revokeFilter = this.contract.filters.DocumentRevoked();
      const allRevokedEvents = await this.contract.queryFilter(revokeFilter, 0, 'latest') as EventLog[];
      const revokedByThisIssuer = allRevokedEvents.filter(e => e.args?.issuer?.toLowerCase() === normalizedAddress);
      const revokedHashes = new Set(revokedByThisIssuer.map(e => e.args?.documentHash).filter(Boolean) as string[]);
      let verifiedCount = 0;
      for (const hash of documentHashes) {
        try {
          const doc = await this.contract.documents(hash);
          const isRevoked = revokedHashes.has(hash);
          const expDate = Number(doc.expirationDate);
          const isExpired = expDate > 0 ? new Date(expDate * 1000) < new Date() : false;
          if (!isRevoked && !isExpired && doc.isActive) {
            verifiedCount++;
          }
        } catch (error) {
          console.error(`Error checking document ${hash}:`, error);
        }
      }
      const totalDocuments = issuedEvents.length;
      const revokedDocuments = revokedHashes.size;
      const verifiedDocuments = verifiedCount;
      const pendingDocuments = totalDocuments - verifiedCount - revokedDocuments;
      return { totalDocuments, verifiedDocuments, pendingDocuments: pendingDocuments < 0 ? 0 : pendingDocuments, revokedDocuments, totalVerifications: verifiedCount };
    } catch (error) {
      console.error('❌ Error fetching document stats:', error);
      return { totalDocuments: 0, verifiedDocuments: 0, pendingDocuments: 0, revokedDocuments: 0, totalVerifications: 0 };
    }
  }

  public async getIssuedDocuments(issuerAddress: string, limit: number = 10, offset: number = 0): Promise<DocumentDetails[]> {
    try {
      console.log(`📄 Fetching documents for issuer: ${issuerAddress} (limit=${limit}, offset=${offset})`);
      const normalizedAddress = issuerAddress.toLowerCase();
      const issueFilter = this.contract.filters.DocumentIssued(null, issuerAddress);
      const issuedEvents = await this.contract.queryFilter(issueFilter, 0, 'latest') as EventLog[];
      console.log(`  Found ${issuedEvents.length} issued events`);
      if (issuedEvents.length === 0) {
        return [];
      }
      const revokeFilter = this.contract.filters.DocumentRevoked();
      const allRevokedEvents = await this.contract.queryFilter(revokeFilter, 0, 'latest') as EventLog[];
      const revokedHashes = new Set(allRevokedEvents.filter(e => e.args?.issuer?.toLowerCase() === normalizedAddress).map(e => e.args?.documentHash).filter(Boolean) as string[]);
      const paginatedEvents = issuedEvents.reverse().slice(offset, offset + limit);
      const documents: DocumentDetails[] = [];
      for (const event of paginatedEvents) {
        try {
          const documentHash = event.args?.documentHash;
          if (!documentHash) continue;
          const doc = await this.contract.documents(documentHash);
          const isRevoked = revokedHashes.has(documentHash);
          const expirationDateNum = Number(doc.expirationDate);
          const expirationDate = expirationDateNum > 0 ? new Date(expirationDateNum * 1000) : null;
          const isExpired = expirationDate ? expirationDate < new Date() : false;
          let status: 'active' | 'verified' | 'revoked' | 'expired';
          if (isRevoked) { status = 'revoked'; }
          else if (isExpired) { status = 'expired'; }
          else if (doc.isActive) { status = 'verified'; }
          else { status = 'active'; }
          documents.push({
            documentHash,
            issuer: doc.issuer || issuerAddress,
            issuerName: doc.issuerName || 'Unknown Institution',
            documentType: doc.documentType || 'other',
            title: doc.title || '',
            recipientName: doc.recipientName || 'Unknown Recipient',
            recipientId: doc.recipientId || '',
            issuanceDate: new Date(Number(doc.issuanceDate) * 1000),
            expirationDate,
            status,
            isActive: doc.isActive && !isRevoked && !isExpired,
            isRevoked,
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber
          });
        } catch (docError) {
          console.error(`❌ Error fetching document details for ${event.args?.documentHash}:`, docError);
        }
      }
      console.log(`  ✅ Returning ${documents.length} documents with full details`);
      return documents;
    } catch (error) {
      console.error('❌ Error getting issued documents:', error);
      return [];
    }
  }

  public async getDocument(documentHash: string): Promise<DocumentDetails | null> {
    try {
      const doc = await this.contract.documents(documentHash);
      if (!doc.issuer || doc.issuer === ethers.ZeroAddress) {
        return null;
      }
      const isRevoked = await this.contract.revokedDocuments(documentHash);
      const expirationDateNum = Number(doc.expirationDate);
      const expirationDate = expirationDateNum > 0 ? new Date(expirationDateNum * 1000) : null;
      const isExpired = expirationDate ? expirationDate < new Date() : false;
      let status: 'active' | 'verified' | 'revoked' | 'expired';
      if (isRevoked) { status = 'revoked'; }
      else if (isExpired) { status = 'expired'; }
      else if (doc.isActive) { status = 'verified'; }
      else { status = 'active'; }
      return {
        documentHash,
        issuer: doc.issuer,
        issuerName: doc.issuerName,
        documentType: doc.documentType,
        title: doc.title || '',
        recipientName: doc.recipientName,
        recipientId: doc.recipientId,
        issuanceDate: new Date(Number(doc.issuanceDate) * 1000),
        expirationDate: expirationDate,
        status,
        isActive: doc.isActive && !isRevoked && !isExpired,
        isRevoked,
        transactionHash: '',
        blockNumber: 0
      };
    } catch (error) {
      console.error('❌ Error getting document:', error);
      return null;
    }
  }

  // ====================================================================
  // --- NEW/UPDATED FUNCTIONS FOR ADMIN PANEL ---
  // ====================================================================

  /**
   * 2. NEW: This function gets the list *directly from the blockchain*.
   * It loops the on-chain array, which is the "source of truth".
   */
  public async getAllInstitutionsFromChain(): Promise<InstitutionDetails[]> {
    try {
      console.log('Fetching all institutions from blockchain...');
      // Calls getTotalInstitutions() from contract
      const totalBigInt = await this.contract.getTotalInstitutions();
      const total = Number(totalBigInt);
      console.log(`Found ${total} institutions on-chain.`);

      const institutions: InstitutionDetails[] = [];
      
      for (let i = 0; i < total; i++) {
        try {
          // Calls institutionAddresses(i) from contract
          const address = await this.contract.institutionAddresses(i);
          // Calls our existing getInstitutionDetails function
          const details = await this.getInstitutionDetails(address);
          institutions.push(details);
        } catch (e) {
          console.error(`Failed to fetch institute at index ${i}`, e);
        }
      }
      return institutions;
    } catch (error: any) {
      console.error('❌ Error getting all institutions from chain:', error.message);
      throw new Error(`Failed to fetch institutions from chain: ${error.message}`);
    }
  }

  /**
   * Performs an ENS reverse lookup
   * Used by siweController.
   */
  public async lookupAddress(address: string): Promise<string | null> {
    try {
      // Uses the service's read-only provider to look up the name
      const name = await this.provider.lookupAddress(address);
      return name;
    } catch (error: any) {
      console.warn(`⚠️  Could not fetch ENS name for ${address}:`, error.message);
      return null;
    }
  }

  /**
   * Verifies an institution on-chain. Admin only.
   * Uses the adminContract to send a transaction.
   */
  public async verifyInstitution(addressToVerify: string): Promise<ContractTransactionResponse> {
    try {
      console.log(`👑 ADMIN: Sending 'verifyInstitution' tx for: ${addressToVerify}`);
      const tx: ContractTransactionResponse = await this.adminContract.verifyInstitution(
        addressToVerify
      );
      return tx;
    } catch (error: any) {
      console.error(`❌ ADMIN: Failed to send 'verifyInstitution' tx:`, error.message);
      throw new Error(`Blockchain transaction failed: ${error.message}`);
    }
  }

  /**
   * 3. UPDATED: Gets on-chain details and now includes the address.
   */
  public async getInstitutionDetails(address: string): Promise<InstitutionDetails> {
    try {
      // Calls institutions(address) mapping
      const details = await this.contract.institutions(address);

      // Convert bigint to string for safe JSON transport
      return {
        address: address, // <-- 4. FIXED: Added the address
        name: details.name,
        registrationNumber: details.registrationNumber,
        contactInfo: details.contactInfo,
        isVerified: details.isVerified,
        registrationDate: details.registrationDate.toString(),
      };
    } catch (error: any) {
      console.error('❌ ADMIN: Error getting institution details:', error.message);
      throw new Error(`Failed to fetch institution details: ${error.message}`);
    }
  }
}

export const blockchainService = new BlockchainService();