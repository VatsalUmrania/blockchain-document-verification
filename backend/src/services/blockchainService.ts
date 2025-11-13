import { ethers, Contract, JsonRpcProvider } from 'ethers';
import { config } from '../config/config';

// Try to import the artifact, with fallback for Docker environment
let DocumentVerificationArtifact: any;
try {
  DocumentVerificationArtifact = require('../../../../artifacts/contracts/DocumentVerification.sol/DocumentVerification.json');
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

      // Fix TypeScript errors by properly handling event types
      const documentHashes = issuedEvents.map(e => {
        if ('args' in e) {
          return e.args?.documentHash;
        }
        return undefined;
      }).filter(Boolean) as string[];

      const revokeFilter = this.contract.filters.DocumentRevoked();
      const allRevokedEvents = await this.contract.queryFilter(revokeFilter, 0, 'latest');
      const revokedByThisIssuer = allRevokedEvents.filter(e => {
        // Use type narrowing to check if args exists
        if (typeof e === 'object' && e !== null && 'args' in e) {
          const eventWithArgs = e as { args?: { issuer?: string } };
          return eventWithArgs.args?.issuer?.toLowerCase() === normalizedAddress;
        }
        return false;
      });

      const revokedHashes = new Set(revokedByThisIssuer.map(e => {
        // Use type narrowing to check if args exists
        if (typeof e === 'object' && e !== null && 'args' in e) {
          const eventWithArgs = e as { args?: { documentHash?: string } };
          return eventWithArgs.args?.documentHash;
        }
        return undefined;
      }).filter(Boolean) as string[]);

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
    const revokedByThisIssuer = allRevokedEvents.filter(e => {
      // Check if the event has args property
      if (Object.prototype.hasOwnProperty.call(e, 'args')) {
        const event: any = e;
        return event.args?.issuer?.toLowerCase() === normalizedAddress;
      }
      return false;
    });

    const revokedHashes = new Set(revokedByThisIssuer.map(e => {
      // Check if the event has args property
      if (Object.prototype.hasOwnProperty.call(e, 'args')) {
        const event: any = e;
        return event.args?.documentHash;
      }
      return undefined;
    }).filter(Boolean) as string[]);

    const paginatedEvents = issuedEvents.slice(offset, offset + limit);

    const documents: DocumentDetails[] = [];

    for (const event of paginatedEvents) {
      try {
        // Properly handle event args
        let documentHash: string | undefined;
        if ('args' in event) {
          documentHash = event.args?.documentHash;
        }

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
        console.error(`❌ Error fetching document details:`, docError);
        // Remove references to event.args in error handling
        documents.push({
          documentHash: '',
          issuer: issuerAddress,
          issuerName: 'Unknown Institution',
          documentType: 'other',
          title: '',
          recipientName: 'Unknown Recipient',
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
      
      if (!doc.issuer || doc.issuer === "0x0000000000000000000000000000000000000000") {
        return null;
      }

      const isRevoked = await this.contract.revokedDocuments(documentHash);
      
      // Fix the args property access
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

      return {
        documentHash,
        issuer: doc.issuer,
        issuerName: doc.issuerName,
        documentType: doc.documentType,
        title: doc.title || '',
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
