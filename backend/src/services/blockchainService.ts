// // import { ethers, Contract, JsonRpcProvider } from 'ethers';
// // import { config } from '../config/config';
// // import * as DocumentVerificationArtifact from '../../../artifacts/contracts/DocumentVerification.sol/DocumentVerification.json';

// // const DOCUMENT_VERIFICATION_ABI = DocumentVerificationArtifact.abi;

// // export interface DocumentStats {
// //   totalDocuments: number;
// //   verifiedDocuments: number;
// //   pendingDocuments: number;
// //   revokedDocuments: number;
// //   totalVerifications: number;
// // }

// // export interface DocumentDetails {
// //   documentHash: string;
// //   issuer: string;
// //   issuerName: string;
// //   documentType: string;
// //   recipientName: string;
// //   recipientId: string;
// //   issuanceDate: Date;
// //   expirationDate: Date | null;
// //   isActive: boolean;
// //   isRevoked: boolean;
// //   transactionHash: string;
// //   blockNumber: number;
// // }

// // class BlockchainService {
// //   private provider: JsonRpcProvider;
// //   private contract: Contract;

// //   constructor() {
// //     this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
// //     this.contract = new Contract(
// //       config.contractAddress,
// //       DOCUMENT_VERIFICATION_ABI,
// //       this.provider
// //     );
// //     console.log('✅ Blockchain service initialized');
// //     console.log('📝 Contract address:', config.contractAddress);
// //     console.log('🌐 RPC URL:', config.rpcUrl);
// //   }

// //   /**
// //    * Check if an address is a verified institution
// //    */
// //   public async isInstitutionVerified(address: string): Promise<boolean> {
// //     try {
// //       console.log(`🔍 Checking institution status for: ${address}`);
// //       const isVerified = await this.contract.isInstitutionVerified(address);
// //       console.log(`   -> Institution verified: ${isVerified}`);
// //       return isVerified;
// //     } catch (error) {
// //       console.error(`❌ Error checking institution status:`, error);
// //       return false;
// //     }
// //   }

// //   /**
// //    * Get comprehensive document statistics for a user
// //    * Supports both institute (issuer) and individual (recipient) views
// //    */
// //   public async getDocumentStats(userAddress: string, role: 'institute' | 'individual' = 'institute'): Promise<DocumentStats> {
// //     try {
// //       console.log(`📊 Fetching document stats for ${role}: ${userAddress}`);
      
// //       if (role === 'institute') {
// //         return await this.getIssuerStats(userAddress);
// //       } else {
// //         return await this.getRecipientStats(userAddress);
// //       }
// //     } catch (error) {
// //       console.error(`❌ Error fetching document stats:`, error);
// //       return {
// //         totalDocuments: 0,
// //         verifiedDocuments: 0,
// //         pendingDocuments: 0,
// //         revokedDocuments: 0,
// //         totalVerifications: 0
// //       };
// //     }
// //   }

// //   /**
// //    * Get stats for document issuer (institution)
// //    */
// //   private async getIssuerStats(issuerAddress: string): Promise<DocumentStats> {
// //     try {
// //       // Get all issued documents
// //       const issueFilter = this.contract.filters.DocumentIssued(null, issuerAddress);
// //       const issuedEvents = await this.contract.queryFilter(issueFilter, 0, 'latest');
      
// //       // Get all revoked documents
// //       const revokeFilter = this.contract.filters.DocumentRevoked(null, issuerAddress);
// //       const revokedEvents = await this.contract.queryFilter(revokeFilter, 0, 'latest');

// //       // Get verification events (documents that were verified by others)
// //       const verificationFilter = this.contract.filters.DocumentVerified();
// //       const allVerificationEvents = await this.contract.queryFilter(verificationFilter, 0, 'latest');
      
// //       // Filter verifications for documents issued by this institution
// //       const issuedDocumentHashes = new Set(issuedEvents.map(e => e.args?.documentHash));
// //       const verificationsForThisIssuer = allVerificationEvents.filter(
// //         e => issuedDocumentHashes.has(e.args?.documentHash)
// //       );

// //       // Create sets for efficient lookup
// //       const revokedHashes = new Set(revokedEvents.map(e => e.args?.documentHash));
      
// //       // Calculate stats
// //       const totalDocuments = issuedEvents.length;
// //       const revokedDocuments = revokedEvents.length;
// //       const verifiedDocuments = totalDocuments - revokedDocuments; // Active documents
// //       const pendingDocuments = 0; // For now, all issued docs are either active or revoked
// //       const totalVerifications = verificationsForThisIssuer.length;

// //       console.log(`   ✅ Stats: Total=${totalDocuments}, Verified=${verifiedDocuments}, Revoked=${revokedDocuments}, Verifications=${totalVerifications}`);

// //       return {
// //         totalDocuments,
// //         verifiedDocuments,
// //         pendingDocuments,
// //         revokedDocuments,
// //         totalVerifications
// //       };
// //     } catch (error) {
// //       console.error('❌ Error getting issuer stats:', error);
// //       throw error;
// //     }
// //   }

// //   /**
// //    * Get stats for document recipient (individual)
// //    */
// //   private async getRecipientStats(recipientAddress: string): Promise<DocumentStats> {
// //     try {
// //       // Get all documents issued to this address
// //       // This requires the contract to emit events with recipient address
// //       // Assuming you have a way to filter by recipient (might need contract modification)
      
// //       // For now, we'll return placeholder stats
// //       // You'd need to implement recipient-specific logic based on your contract
      
// //       return {
// //         totalDocuments: 0,
// //         verifiedDocuments: 0,
// //         pendingDocuments: 0,
// //         revokedDocuments: 0,
// //         totalVerifications: 0
// //       };
// //     } catch (error) {
// //       console.error('❌ Error getting recipient stats:', error);
// //       throw error;
// //     }
// //   }

// //   /**
// //    * Get list of all documents issued by an institution
// //    */
// //   public async getIssuedDocuments(issuerAddress: string, limit: number = 10, offset: number = 0): Promise<DocumentDetails[]> {
// //     try {
// //       console.log(`📄 Fetching issued documents for: ${issuerAddress}`);
      
// //       const issueFilter = this.contract.filters.DocumentIssued(null, issuerAddress);
// //       const issuedEvents = await this.contract.queryFilter(issueFilter, 0, 'latest');
      
// //       // Get revoked document hashes
// //       const revokeFilter = this.contract.filters.DocumentRevoked(null, issuerAddress);
// //       const revokedEvents = await this.contract.queryFilter(revokeFilter, 0, 'latest');
// //       const revokedHashes = new Set(revokedEvents.map(e => e.args?.documentHash));

// //       // Process events with pagination
// //       const paginatedEvents = issuedEvents.slice(offset, offset + limit);
      
// //       const documents: DocumentDetails[] = await Promise.all(
// //         paginatedEvents.map(async (event) => {
// //           const documentHash = event.args?.documentHash;
// //           const isRevoked = revokedHashes.has(documentHash);
          
// //           // Get document details from contract
// //           try {
// //             const docDetails = await this.contract.documents(documentHash);
            
// //             return {
// //               documentHash,
// //               issuer: event.args?.issuer || issuerAddress,
// //               issuerName: docDetails.issuerName || 'Unknown',
// //               documentType: event.args?.documentType || docDetails.documentType || 'Unknown',
// //               recipientName: event.args?.recipientName || docDetails.recipientName || 'Unknown',
// //               recipientId: docDetails.recipientId || '',
// //               issuanceDate: new Date(event.args?.issuanceDate?.toNumber() * 1000 || Date.now()),
// //               expirationDate: docDetails.expirationDate?.toNumber() > 0 
// //                 ? new Date(docDetails.expirationDate.toNumber() * 1000) 
// //                 : null,
// //               isActive: !isRevoked,
// //               isRevoked,
// //               transactionHash: event.transactionHash,
// //               blockNumber: event.blockNumber
// //             };
// //           } catch (error) {
// //             console.error(`Error fetching details for document ${documentHash}:`, error);
// //             return {
// //               documentHash,
// //               issuer: issuerAddress,
// //               issuerName: 'Unknown',
// //               documentType: 'Unknown',
// //               recipientName: 'Unknown',
// //               recipientId: '',
// //               issuanceDate: new Date(),
// //               expirationDate: null,
// //               isActive: !isRevoked,
// //               isRevoked,
// //               transactionHash: event.transactionHash,
// //               blockNumber: event.blockNumber
// //             };
// //           }
// //         })
// //       );

// //       console.log(`   ✅ Found ${documents.length} documents`);
// //       return documents;
// //     } catch (error) {
// //       console.error('❌ Error getting issued documents:', error);
// //       return [];
// //     }
// //   }

// //   /**
// //    * Get contract statistics (admin view)
// //    */
// //   public async getContractStats() {
// //     try {
// //       const totalDocs = await this.contract.getTotalDocuments();
// //       const totalInstitutions = await this.contract.getTotalInstitutions();
      
// //       return {
// //         totalDocuments: totalDocs.toNumber(),
// //         totalInstitutions: totalInstitutions.toNumber()
// //       };
// //     } catch (error) {
// //       console.error('❌ Error getting contract stats:', error);
// //       return {
// //         totalDocuments: 0,
// //         totalInstitutions: 0
// //       };
// //     }
// //   }
// // }

// // export const blockchainService = new BlockchainService();


// import { ethers, Contract, JsonRpcProvider } from 'ethers';
// import { config } from '../config/config';
// import * as DocumentVerificationArtifact from '../../../artifacts/contracts/DocumentVerification.sol/DocumentVerification.json';

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

// class BlockchainService {
//   private provider: JsonRpcProvider;
//   private contract: Contract;

//   constructor() {
//     this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
//     this.contract = new Contract(
//       config.contractAddress,
//       DOCUMENT_VERIFICATION_ABI,
//       this.provider
//     );
//     console.log('✅ Blockchain service initialized');
//     console.log('📝 Contract address:', config.contractAddress);
//   }

//   /**
//    * Check if an address is a verified institution
//    */
//   public async isInstitutionVerified(address: string): Promise<boolean> {
//     try {
//       const isVerified = await this.contract.isInstitutionVerified(address);
//       return isVerified;
//     } catch (error) {
//       console.error(`❌ Error checking institution status:`, error);
//       return false;
//     }
//   }

//   /**
//    * Get comprehensive document statistics for an issuer
//    */
//   public async getDocumentStats(issuerAddress: string): Promise<DocumentStats> {
//     try {
//       console.log(`📊 Fetching stats for issuer: ${issuerAddress}`);
      
//       // Normalize address to lowercase for comparison
//       const normalizedAddress = issuerAddress.toLowerCase();

//       // Get all DocumentIssued events for this issuer
//       const issueFilter = this.contract.filters.DocumentIssued(null, issuerAddress);
//       const issuedEvents = await this.contract.queryFilter(issueFilter, 0, 'latest');
      
//       console.log(`   📄 Found ${issuedEvents.length} issued documents`);

//       if (issuedEvents.length === 0) {
//         return {
//           totalDocuments: 0,
//           verifiedDocuments: 0,
//           pendingDocuments: 0,
//           revokedDocuments: 0,
//           totalVerifications: 0
//         };
//       }

//       // Get document hashes
//       const documentHashes = issuedEvents.map(e => e.args?.documentHash).filter(Boolean);
      
//       // Get revoked documents
//       const revokeFilter = this.contract.filters.DocumentRevoked();
//       const allRevokedEvents = await this.contract.queryFilter(revokeFilter, 0, 'latest');
//       const revokedByThisIssuer = allRevokedEvents.filter(e => 
//         e.args?.issuer?.toLowerCase() === normalizedAddress
//       );
//       const revokedHashes = new Set(revokedByThisIssuer.map(e => e.args?.documentHash));

//       // Get verification events
//       // Note: You may need to add a DocumentVerified event in your contract
//       // For now, we'll check document status from contract
//       let verifiedCount = 0;
//       let expiredCount = 0;

//       // Check each document's status
//       for (const hash of documentHashes) {
//         try {
//           const doc = await this.contract.documents(hash);
          
//           // Check if document is still valid (not revoked and not expired)
//           const isRevoked = revokedHashes.has(hash);
//           const isExpired = doc.expirationDate && doc.expirationDate.toNumber() > 0 
//             ? new Date(doc.expirationDate.toNumber() * 1000) < new Date()
//             : false;

//           if (!isRevoked && !isExpired && doc.isActive) {
//             verifiedCount++;
//           }
          
//           if (isExpired) {
//             expiredCount++;
//           }
//         } catch (error) {
//           console.error(`Error checking document ${hash}:`, error);
//         }
//       }

//       const totalDocuments = issuedEvents.length;
//       const revokedDocuments = revokedHashes.size;
//       const verifiedDocuments = verifiedCount;
//       const pendingDocuments = totalDocuments - verifiedCount - revokedDocuments;

//       console.log(`   ✅ Stats calculated:`);
//       console.log(`      Total: ${totalDocuments}`);
//       console.log(`      Verified: ${verifiedDocuments}`);
//       console.log(`      Pending: ${pendingDocuments}`);
//       console.log(`      Revoked: ${revokedDocuments}`);

//       return {
//         totalDocuments,
//         verifiedDocuments,
//         pendingDocuments,
//         revokedDocuments,
//         totalVerifications: verifiedCount // Can be enhanced with actual verification events
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

//   /**
//    * Get list of all documents issued by an institution with full details
//    */
//   public async getIssuedDocuments(
//     issuerAddress: string, 
//     limit: number = 10, 
//     offset: number = 0
//   ): Promise<DocumentDetails[]> {
//     try {
//       console.log(`📄 Fetching documents for issuer: ${issuerAddress} (limit=${limit}, offset=${offset})`);
      
//       const normalizedAddress = issuerAddress.toLowerCase();

//       // Get issued events
//       const issueFilter = this.contract.filters.DocumentIssued(null, issuerAddress);
//       const issuedEvents = await this.contract.queryFilter(issueFilter, 0, 'latest');
      
//       console.log(`   Found ${issuedEvents.length} issued events`);

//       if (issuedEvents.length === 0) {
//         return [];
//       }

//       // Get revoked documents
//       const revokeFilter = this.contract.filters.DocumentRevoked();
//       const allRevokedEvents = await this.contract.queryFilter(revokeFilter, 0, 'latest');
//       const revokedByThisIssuer = allRevokedEvents.filter(e => 
//         e.args?.issuer?.toLowerCase() === normalizedAddress
//       );
//       const revokedHashes = new Set(revokedByThisIssuer.map(e => e.args?.documentHash));

//       // Apply pagination
//       const paginatedEvents = issuedEvents.slice(offset, offset + limit);

//       // Fetch full document details for each event
//       const documents: DocumentDetails[] = [];

//       for (const event of paginatedEvents) {
//         try {
//           const documentHash = event.args?.documentHash;
          
//           if (!documentHash) {
//             console.warn('⚠️  Event missing documentHash:', event);
//             continue;
//           }

//           // Fetch document details from contract storage
//           const doc = await this.contract.documents(documentHash);
          
//           console.log(`   📋 Document ${documentHash}:`, {
//             issuerName: doc.issuerName,
//             documentType: doc.documentType,
//             recipientName: doc.recipientName,
//             isActive: doc.isActive
//           });

//           const isRevoked = revokedHashes.has(documentHash);
//           const expirationDate = doc.expirationDate && doc.expirationDate.toNumber() > 0
//             ? new Date(doc.expirationDate.toNumber() * 1000)
//             : null;
//           const isExpired = expirationDate ? expirationDate < new Date() : false;

//           // Determine status
//           let status: 'active' | 'verified' | 'revoked' | 'expired';
//           if (isRevoked) {
//             status = 'revoked';
//           } else if (isExpired) {
//             status = 'expired';
//           } else if (doc.isActive) {
//             status = 'verified'; // If document is active and not revoked, it's verified
//           } else {
//             status = 'active'; // Newly issued but not yet verified
//           }

//           documents.push({
//             documentHash,
//             issuer: doc.issuer || issuerAddress,
//             issuerName: doc.issuerName || 'Unknown Institution',
//             documentType: doc.documentType || 'Unknown',
//             recipientName: doc.recipientName || 'Unknown Recipient',
//             recipientId: doc.recipientId || '',
//             issuanceDate: new Date(doc.issuanceDate.toNumber() * 1000),
//             expirationDate,
//             status,
//             isActive: doc.isActive && !isRevoked && !isExpired,
//             isRevoked,
//             transactionHash: event.transactionHash,
//             blockNumber: event.blockNumber
//           });
//         } catch (docError) {
//           console.error(`❌ Error fetching document details for ${event.args?.documentHash}:`, docError);
//           // Add basic info even if detailed fetch fails
//           documents.push({
//             documentHash: event.args?.documentHash || '',
//             issuer: issuerAddress,
//             issuerName: 'Unknown Institution',
//             documentType: event.args?.documentType || 'Unknown',
//             recipientName: event.args?.recipientName || 'Unknown Recipient',
//             recipientId: '',
//             issuanceDate: new Date(),
//             expirationDate: null,
//             status: 'active',
//             isActive: false,
//             isRevoked: false,
//             transactionHash: event.transactionHash,
//             blockNumber: event.blockNumber
//           });
//         }
//       }

//       console.log(`   ✅ Returning ${documents.length} documents with full details`);
//       return documents;
//     } catch (error) {
//       console.error('❌ Error getting issued documents:', error);
//       return [];
//     }
//   }

//   /**
//    * Get a single document's details
//    */
//   public async getDocument(documentHash: string): Promise<DocumentDetails | null> {
//     try {
//       const doc = await this.contract.documents(documentHash);
      
//       if (!doc.issuer || doc.issuer === ethers.constants.AddressZero) {
//         return null;
//       }

//       // Check if revoked
//       const isRevoked = await this.contract.revokedDocuments(documentHash);
      
//       const expirationDate = doc.expirationDate && doc.expirationDate.toNumber() > 0
//         ? new Date(doc.expirationDate.toNumber() * 1000)
//         : null;
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
//         recipientName: doc.recipientName,
//         recipientId: doc.recipientId,
//         issuanceDate: new Date(doc.issuanceDate.toNumber() * 1000),
//         expirationDate,
//         status,
//         isActive: doc.isActive && !isRevoked && !isExpired,
//         isRevoked,
//         transactionHash: '',
//         blockNumber: 0
//       };
//     } catch (error) {
//       console.error('❌ Error getting document:', error);
//       return null;
//     }
//   }
// }

// export const blockchainService = new BlockchainService();


import { ethers, Contract, JsonRpcProvider } from 'ethers';
import { config } from '../config/config';
import * as DocumentVerificationArtifact from '../../../artifacts/contracts/DocumentVerification.sol/DocumentVerification.json';

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
  title: string;  // ← ADDED
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

class BlockchainService {
  private provider: JsonRpcProvider;
  private contract: Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.contract = new Contract(
      config.contractAddress,
      DOCUMENT_VERIFICATION_ABI,
      this.provider
    );
    console.log('✅ Blockchain service initialized');
    console.log('📝 Contract address:', config.contractAddress);
  }

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
      const issuedEvents = await this.contract.queryFilter(issueFilter, 0, 'latest');
      
      console.log(`   📄 Found ${issuedEvents.length} issued documents`);

      if (issuedEvents.length === 0) {
        return {
          totalDocuments: 0,
          verifiedDocuments: 0,
          pendingDocuments: 0,
          revokedDocuments: 0,
          totalVerifications: 0
        };
      }

      const documentHashes = issuedEvents.map(e => e.args?.documentHash).filter(Boolean);
      
      const revokeFilter = this.contract.filters.DocumentRevoked();
      const allRevokedEvents = await this.contract.queryFilter(revokeFilter, 0, 'latest');
      const revokedByThisIssuer = allRevokedEvents.filter(e => 
        e.args?.issuer?.toLowerCase() === normalizedAddress
      );
      const revokedHashes = new Set(revokedByThisIssuer.map(e => e.args?.documentHash));

      let verifiedCount = 0;

      for (const hash of documentHashes) {
        try {
          const doc = await this.contract.documents(hash);
          const isRevoked = revokedHashes.has(hash);
          const isExpired = doc.expirationDate && doc.expirationDate.toNumber() > 0 
            ? new Date(doc.expirationDate.toNumber() * 1000) < new Date()
            : false;

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

      return {
        totalDocuments,
        verifiedDocuments,
        pendingDocuments,
        revokedDocuments,
        totalVerifications: verifiedCount
      };
    } catch (error) {
      console.error('❌ Error fetching document stats:', error);
      return {
        totalDocuments: 0,
        verifiedDocuments: 0,
        pendingDocuments: 0,
        revokedDocuments: 0,
        totalVerifications: 0
      };
    }
  }

  // public async getIssuedDocuments(
  //   issuerAddress: string, 
  //   limit: number = 10, 
  //   offset: number = 0
  // ): Promise<DocumentDetails[]> {
  //   try {
  //     console.log(`📄 Fetching documents for issuer: ${issuerAddress} (limit=${limit}, offset=${offset})`);
      
  //     const normalizedAddress = issuerAddress.toLowerCase();

  //     const issueFilter = this.contract.filters.DocumentIssued(null, issuerAddress);
  //     const issuedEvents = await this.contract.queryFilter(issueFilter, 0, 'latest');
      
  //     console.log(`   Found ${issuedEvents.length} issued events`);

  //     if (issuedEvents.length === 0) {
  //       return [];
  //     }

  //     const revokeFilter = this.contract.filters.DocumentRevoked();
  //     const allRevokedEvents = await this.contract.queryFilter(revokeFilter, 0, 'latest');
  //     const revokedByThisIssuer = allRevokedEvents.filter(e => 
  //       e.args?.issuer?.toLowerCase() === normalizedAddress
  //     );
  //     const revokedHashes = new Set(revokedByThisIssuer.map(e => e.args?.documentHash));

  //     const paginatedEvents = issuedEvents.slice(offset, offset + limit);

  //     const documents: DocumentDetails[] = [];

  //     for (const event of paginatedEvents) {
  //       try {
  //         const documentHash = event.args?.documentHash;
          
  //         if (!documentHash) {
  //           console.warn('⚠️  Event missing documentHash:', event);
  //           continue;
  //         }

  //         const doc = await this.contract.documents(documentHash);
          
  //         console.log(`   📋 Document ${documentHash}:`, {
  //           issuerName: doc.issuerName,
  //           documentType: doc.documentType,
  //           title: doc.title || 'N/A',  // ← LOG TITLE
  //           recipientName: doc.recipientName,
  //           isActive: doc.isActive
  //         });

  //         const isRevoked = revokedHashes.has(documentHash);
  //         const expirationDate = doc.expirationDate && doc.expirationDate.toNumber() > 0
  //           ? new Date(doc.expirationDate.toNumber() * 1000)
  //           : null;
  //         const isExpired = expirationDate ? expirationDate < new Date() : false;

  //         let status: 'active' | 'verified' | 'revoked' | 'expired';
  //         if (isRevoked) {
  //           status = 'revoked';
  //         } else if (isExpired) {
  //           status = 'expired';
  //         } else if (doc.isActive) {
  //           status = 'verified';
  //         } else {
  //           status = 'active';
  //         }

  //         documents.push({
  //           documentHash,
  //           issuer: doc.issuer || issuerAddress,
  //           issuerName: doc.issuerName || 'Unknown Institution',
  //           documentType: doc.documentType || 'other',
  //           title: doc.title || '',  // ← ADD TITLE
  //           recipientName: doc.recipientName || 'Unknown Recipient',
  //           recipientId: doc.recipientId || '',
  //           issuanceDate: new Date(doc.issuanceDate.toNumber() * 1000),
  //           expirationDate,
  //           status,
  //           isActive: doc.isActive && !isRevoked && !isExpired,
  //           isRevoked,
  //           transactionHash: event.transactionHash,
  //           blockNumber: event.blockNumber
  //         });
  //       } catch (docError) {
  //         console.error(`❌ Error fetching document details for ${event.args?.documentHash}:`, docError);
  //         documents.push({
  //           documentHash: event.args?.documentHash || '',
  //           issuer: issuerAddress,
  //           issuerName: 'Unknown Institution',
  //           documentType: event.args?.documentType || 'other',
  //           title: '',  // ← ADD EMPTY TITLE
  //           recipientName: event.args?.recipientName || 'Unknown Recipient',
  //           recipientId: '',
  //           issuanceDate: new Date(),
  //           expirationDate: null,
  //           status: 'active',
  //           isActive: false,
  //           isRevoked: false,
  //           transactionHash: event.transactionHash,
  //           blockNumber: event.blockNumber
  //         });
  //       }
  //     }

  //     console.log(`   ✅ Returning ${documents.length} documents with full details`);
  //     return documents;
  //   } catch (error) {
  //     console.error('❌ Error getting issued documents:', error);
  //     return [];
  //   }
  // }

  public async getIssuedDocuments(
  issuerAddress: string, 
  limit: number = 10, 
  offset: number = 0
): Promise<DocumentDetails[]> {
  try {
    console.log(`📄 Fetching documents for issuer: ${issuerAddress} (limit=${limit}, offset=${offset})`);
    
    const normalizedAddress = issuerAddress.toLowerCase();

    const issueFilter = this.contract.filters.DocumentIssued(null, issuerAddress);
    const issuedEvents = await this.contract.queryFilter(issueFilter, 0, 'latest');
    
    console.log(`   Found ${issuedEvents.length} issued events`);

    if (issuedEvents.length === 0) {
      return [];
    }

    const revokeFilter = this.contract.filters.DocumentRevoked();
    const allRevokedEvents = await this.contract.queryFilter(revokeFilter, 0, 'latest');
    const revokedByThisIssuer = allRevokedEvents.filter(e => 
      e.args?.issuer?.toLowerCase() === normalizedAddress
    );
    const revokedHashes = new Set(revokedByThisIssuer.map(e => e.args?.documentHash));

    const paginatedEvents = issuedEvents.slice(offset, offset + limit);

    const documents: DocumentDetails[] = [];

    for (const event of paginatedEvents) {
      try {
        const documentHash = event.args?.documentHash;
        
        if (!documentHash) {
          console.warn('⚠️  Event missing documentHash:', event);
          continue;
        }

        const doc = await this.contract.documents(documentHash);
        
        console.log(`   📋 Document ${documentHash}:`, {
          issuerName: doc.issuerName,
          documentType: doc.documentType,
          title: doc.title || 'N/A',
          recipientName: doc.recipientName,
          isActive: doc.isActive
        });

        const isRevoked = revokedHashes.has(documentHash);
        
        // ← FIXED: Use Number() instead of .toNumber()
        const expirationDate = doc.expirationDate && Number(doc.expirationDate) > 0
          ? new Date(Number(doc.expirationDate) * 1000)
          : null;
        const isExpired = expirationDate ? expirationDate < new Date() : false;

        let status: 'active' | 'verified' | 'revoked' | 'expired';
        if (isRevoked) {
          status = 'revoked';
        } else if (isExpired) {
          status = 'expired';
        } else if (doc.isActive) {
          status = 'verified';
        } else {
          status = 'active';
        }

        documents.push({
          documentHash,
          issuer: doc.issuer || issuerAddress,
          issuerName: doc.issuerName || 'Unknown Institution',
          documentType: doc.documentType || 'other',
          title: doc.title || '',
          recipientName: doc.recipientName || 'Unknown Recipient',
          recipientId: doc.recipientId || '',
          issuanceDate: new Date(Number(doc.issuanceDate) * 1000),  // ← FIXED
          expirationDate,
          status,
          isActive: doc.isActive && !isRevoked && !isExpired,
          isRevoked,
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber
        });
      } catch (docError) {
        console.error(`❌ Error fetching document details for ${event.args?.documentHash}:`, docError);
        documents.push({
          documentHash: event.args?.documentHash || '',
          issuer: issuerAddress,
          issuerName: 'Unknown Institution',
          documentType: event.args?.documentType || 'other',
          title: '',
          recipientName: event.args?.recipientName || 'Unknown Recipient',
          recipientId: '',
          issuanceDate: new Date(),
          expirationDate: null,
          status: 'active',
          isActive: false,
          isRevoked: false,
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber
        });
      }
    }

    console.log(`   ✅ Returning ${documents.length} documents with full details`);
    return documents;
  } catch (error) {
    console.error('❌ Error getting issued documents:', error);
    return [];
  }
}

  public async getDocument(documentHash: string): Promise<DocumentDetails | null> {
    try {
      const doc = await this.contract.documents(documentHash);
      
      if (!doc.issuer || doc.issuer === ethers.constants.AddressZero) {
        return null;
      }

      const isRevoked = await this.contract.revokedDocuments(documentHash);
      
      const expirationDate = doc.expirationDate && doc.expirationDate.toNumber() > 0
        ? new Date(doc.expirationDate.toNumber() * 1000)
        : null;
      const isExpired = expirationDate ? expirationDate < new Date() : false;

      let status: 'active' | 'verified' | 'revoked' | 'expired';
      if (isRevoked) {
        status = 'revoked';
      } else if (isExpired) {
        status = 'expired';
      } else if (doc.isActive) {
        status = 'verified';
      } else {
        status = 'active';
      }

      return {
        documentHash,
        issuer: doc.issuer,
        issuerName: doc.issuerName,
        documentType: doc.documentType,
        title: doc.title || '',  // ← ADD TITLE
        recipientName: doc.recipientName,
        recipientId: doc.recipientId,
        issuanceDate: new Date(Number(doc.issuanceDate) * 1000),
        expirationDate: Number(doc.expirationDate) > 0
          ? new Date(Number(doc.expirationDate) * 1000)
          : null,
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
}

export const blockchainService = new BlockchainService();
