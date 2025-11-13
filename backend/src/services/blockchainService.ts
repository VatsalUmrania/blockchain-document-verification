import { ethers, Contract, JsonRpcProvider, Wallet, EventLog, ContractTransactionResponse } from 'ethers';
import { config } from '../config/config'; 

// Try to import the artifact, with fallback for Docker environment
let DocumentVerificationArtifact: any;
try {
  DocumentVerificationArtifact = require('../../../artifacts/contracts/DocumentVerification.sol/DocumentVerification.json');
} catch (e) {
  try {
    DocumentVerificationArtifact = require('../empty-artifact.json');
    console.warn('⚠️  Could not load contract artifact, using empty ABI');
  } catch (fallbackError) {
    DocumentVerificationArtifact = { abi: [] };
    console.warn('⚠️  Could not load contract artifact or fallback, using empty ABI');
  }
}

// --- MODIFICATION: Updated ABI ---
const DOCUMENT_VERIFICATION_ABI = [
  "function registerInstitution(string memory _name, string memory _registrationNumber, string memory _contactInfo) external",
  "function verifyInstitution(address _institutionAddress) external",
  "function issueDocument(bytes32 _documentHash, string memory _documentType, string memory _title, string memory _recipientName, string memory _recipientId, uint256 _expirationDate, string memory _metadataURI, bytes memory _issuerSignature) external",
  "function verifyDocument(bytes32 _documentHash) external view returns (address issuer, string memory issuerName, string memory documentType, string memory title, string memory recipientName, string memory recipientId, uint256 issuanceDate, uint256 expirationDate, bool isValidDoc, bool isActive, bool isVerified)",
  "function confirmVerification(bytes32 _documentHash) external", // <-- ADDED
  "function revokeDocument(bytes32 _documentHash) external",
  "function getDocumentMetadata(bytes32 _documentHash) external view returns (string memory)",
  "function getIssuerSignature(bytes32 _documentHash) external view returns (bytes memory)",
  "function getTotalDocuments() external view returns (uint256)",
  "function getTotalInstitutions() external view returns (uint256)",
  "function isInstitutionVerified(address _institutionAddress) external view returns (bool)",
  "function documents(bytes32) external view returns (bytes32 documentHash, address issuer, string memory issuerName, string memory documentType, string memory title, string memory recipientName, string memory recipientId, uint256 issuanceDate, uint256 expirationDate, string memory metadataURI, bool isActive, bytes memory issuerSignature, bool isVerified)", // <-- ADDED isVerified
  "function institutions(address) external view returns (string memory name, string memory registrationNumber, string memory contactInfo, bool isVerified, uint256 registrationDate)",
  "function institutionAddresses(uint256) external view returns (address)", // <-- ADDED for admin query
  "function owner() external view returns (address)",
  "event DocumentIssued(bytes32 indexed documentHash, address indexed issuer, string recipientName, string documentType, string title, uint256 issuanceDate)",
  "event DocumentVerified(bytes32 indexed documentHash, address indexed verifier, uint256 verificationDate)", // <-- ADDED
  "event DocumentRevoked(bytes32 indexed documentHash, address indexed issuer, uint256 revocationDate)",
  "event InstitutionRegistered(address indexed institutionAddress, string name, uint256 registrationDate)",
  "event InstitutionVerified(address indexed institutionAddress, bool verified)"
];

export interface DocumentStats {
  totalDocuments: number;
  verifiedDocuments: number;
  pendingDocuments: number;
  revokedDocuments: number;
  totalVerifications: number; // This will be the same as verifiedDocuments
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
  status: 'pending' | 'verified' | 'revoked' | 'expired'; // <-- MODIFIED
  isActive: boolean;
  isVerified: boolean; // <-- ADDED
  isRevoked: boolean;
  transactionHash: string;
  blockNumber: number;
}

export interface InstitutionDetails {
  address: string;
  name: string;
  registrationNumber: string;
  contactInfo: string;
  isVerified: boolean;
  registrationDate: string; 
}


class BlockchainService {
  private provider: JsonRpcProvider;
  private contract: Contract; // Read-only contract
  private adminSigner: Wallet; 
  private adminContract: Contract; 

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

  public async isInstitutionVerified(address: string): Promise<boolean> {
    try {
      const isVerified = await this.contract.isInstitutionVerified(address);
      return isVerified;
    } catch (error) {
      console.error(`❌ Error checking institution status:`, error);
      return false;
    }
  }

  // --- MODIFICATION: Updated getDocumentStats function ---
  public async getDocumentStats(issuerAddress: string): Promise<DocumentStats> {
    try {
      console.log(`📊 Fetching stats for issuer: ${issuerAddress}`);
      
      const normalizedAddress = issuerAddress.toLowerCase();

      // 1. Get ALL documents issued by this address
      const issueFilter = this.contract.filters.DocumentIssued(null, issuerAddress);
      const issuedEvents = await this.contract.queryFilter(issueFilter, 0, 'latest') as EventLog[];
      
      const totalIssued = issuedEvents.length;
      console.log(`  📄 Found ${totalIssued} issued documents`);

      if (totalIssued === 0) {
        return {
          totalDocuments: 0,
          verifiedDocuments: 0,
          pendingDocuments: 0,
          revokedDocuments: 0,
          totalVerifications: 0
        };
      }
      
      const issuedHashes = new Set(issuedEvents.map(e => e.args?.documentHash).filter(Boolean) as string[]);

      // 2. Get all VERIFIED documents by this issuer
      const verifyFilter = this.contract.filters.DocumentVerified();
      const allVerifiedEvents = await this.contract.queryFilter(verifyFilter, 0, 'latest') as EventLog[];
      
      const verifiedHashes = new Set(
        allVerifiedEvents
          .filter(e => issuedHashes.has(e.args?.documentHash))
          .map(e => e.args?.documentHash)
      );
      const verifiedDocuments = verifiedHashes.size;

      console.log(`  ✅ Found ${verifiedDocuments} verified documents`);

      // 3. Get all REVOKED documents by this issuer
      const revokeFilter = this.contract.filters.DocumentRevoked(null, issuerAddress);
      const revokedEvents = await this.contract.queryFilter(revokeFilter, 0, 'latest') as EventLog[];
      
      const revokedHashes = new Set(revokedEvents.map(e => e.args?.documentHash));
      const revokedDocuments = revokedHashes.size;
      console.log(`  ❌ Found ${revokedDocuments} revoked documents`);

      // 4. Calculate PENDING documents
      // Pending = Total Issued - (Verified + Revoked)
      // Note: We must not double-count a doc that was verified THEN revoked.
      // We need to find hashes that are ONLY issued.
      
      let pendingCount = 0;
      for (const hash of issuedHashes) {
        if (!verifiedHashes.has(hash) && !revokedHashes.has(hash)) {
          pendingCount++;
        }
      }
      
      // Total documents = pending + verified (as per user request)
      const totalDocuments = pendingCount + verifiedDocuments;

      return {
        totalDocuments, // Total non-revoked docs
        verifiedDocuments,
        pendingDocuments: pendingCount,
        revokedDocuments,
        totalVerifications: verifiedDocuments // Verification count is the number of verified docs
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
  
  // --- MODIFICATION: Updated getIssuedDocuments to reflect new state ---
  public async getIssuedDocuments(
    issuerAddress: string, 
    limit: number = 10, 
    offset: number = 0
  ): Promise<DocumentDetails[]> {
    try {
      console.log(`📄 Fetching documents for issuer: ${issuerAddress} (limit=${limit}, offset=${offset})`);
      
      const normalizedAddress = issuerAddress.toLowerCase();

      // Get all event types
      const issueFilter = this.contract.filters.DocumentIssued(null, issuerAddress);
      const issuedEvents = await this.contract.queryFilter(issueFilter, 0, 'latest') as EventLog[];
      
      console.log(`  Found ${issuedEvents.length} issued events`);
      if (issuedEvents.length === 0) {
        return [];
      }
      
      const issuedHashes = new Set(issuedEvents.map(e => e.args?.documentHash).filter(Boolean) as string[]);

      const revokeFilter = this.contract.filters.DocumentRevoked(null, issuerAddress);
      const revokedEvents = await this.contract.queryFilter(revokeFilter, 0, 'latest') as EventLog[];
      const revokedHashes = new Set(revokedEvents.map(e => e.args?.documentHash));
      
      const verifyFilter = this.contract.filters.DocumentVerified();
      const allVerifiedEvents = await this.contract.queryFilter(verifyFilter, 0, 'latest') as EventLog[];
      const verifiedHashes = new Set(
        allVerifiedEvents
          .filter(e => issuedHashes.has(e.args?.documentHash))
          .map(e => e.args?.documentHash)
      );

      // Reverse, then slice for pagination
      const paginatedEvents = issuedEvents.reverse().slice(offset, offset + limit);

      const documents: DocumentDetails[] = [];

      for (const event of paginatedEvents) {
        try {
          const documentHash = event.args?.documentHash;
          if (!documentHash) continue;

          const doc = await this.contract.documents(documentHash);
          
          const isRevoked = revokedHashes.has(documentHash);
          const isVerified = verifiedHashes.has(documentHash); // Use our new on-chain event set
          
          const expirationDateNum = Number(doc.expirationDate);
          const expirationDate = expirationDateNum > 0 ? new Date(expirationDateNum * 1000) : null;
          const isExpired = expirationDate ? expirationDate < new Date() : false;

          let status: DocumentDetails['status'];
          if (isRevoked) {
            status = 'revoked';
          } else if (isExpired) {
            status = 'expired';
          } else if (isVerified) {
            status = 'verified';
          } else {
            status = 'pending'; // This is the new default state
          }

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
            isVerified: isVerified,
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
      const isVerified = doc.isVerified; // Read directly from struct
      
      const expirationDateNum = Number(doc.expirationDate);
      const expirationDate = expirationDateNum > 0 ? new Date(expirationDateNum * 1000) : null;
      const isExpired = expirationDate ? expirationDate < new Date() : false;

      let status: DocumentDetails['status'];
      if (isRevoked) {
        status = 'revoked';
      } else if (isExpired) {
        status = 'expired';
      } else if (isVerified) {
        status = 'verified';
      } else {
        status = 'pending';
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
        expirationDate: expirationDate,
        status,
        isActive: doc.isActive && !isRevoked && !isExpired,
        isVerified: isVerified,
        isRevoked,
        transactionHash: '', 
        blockNumber: 0     
      };
    } catch (error) {
      console.error('❌ Error getting document:', error);
      return null;
    }
  }

  public async lookupAddress(address: string): Promise<string | null> {
    try {
      const name = await this.provider.lookupAddress(address);
      return name;
    } catch (error: any) {
      console.warn(`⚠️  Could not fetch ENS name for ${address}:`, error.message);
      return null;
    }
  }

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

  public async getInstitutionDetails(address: string): Promise<InstitutionDetails> {
    try {
      const details = await this.contract.institutions(address);
      return {
        address: address, 
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

  public async getAllInstitutionsFromChain(): Promise<InstitutionDetails[]> {
    try {
      console.log('Fetching all institutions from blockchain...');
      const totalBigInt = await this.contract.getTotalInstitutions();
      const total = Number(totalBigInt);
      console.log(`Found ${total} institutions on-chain.`);
      const institutions: InstitutionDetails[] = [];
      for (let i = 0; i < total; i++) {
        try {
          const address = await this.contract.institutionAddresses(i);
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

  public async getAllDocuments(
    limit: number = 10, 
    offset: number = 0
  ): Promise<DocumentDetails[]> {
    try {
      console.log(`📄 Fetching ALL documents (limit=${limit}, offset=${offset})`);

      // Get all event types (NO ISSUER FILTER)
      const issueFilter = this.contract.filters.DocumentIssued(); // <-- No issuer address
      const issuedEvents = await this.contract.queryFilter(issueFilter, 0, 'latest') as EventLog[];
      
      console.log(`  Found ${issuedEvents.length} total issued events`);
      if (issuedEvents.length === 0) {
        return [];
      }
      
      // We need all issued hashes to filter other events
      const allIssuedHashes = new Set(issuedEvents.map(e => e.args?.documentHash).filter(Boolean) as string[]);

      const revokeFilter = this.contract.filters.DocumentRevoked(); // <-- No issuer address
      const revokedEvents = await this.contract.queryFilter(revokeFilter, 0, 'latest') as EventLog[];
      const revokedHashes = new Set(revokedEvents.map(e => e.args?.documentHash));
      
      const verifyFilter = this.contract.filters.DocumentVerified();
      const allVerifiedEvents = await this.contract.queryFilter(verifyFilter, 0, 'latest') as EventLog[];
      const verifiedHashes = new Set(
        allVerifiedEvents
          .filter(e => allIssuedHashes.has(e.args?.documentHash)) // Filter events for docs we found
          .map(e => e.args?.documentHash)
      );

      // Reverse, then slice for pagination
      const paginatedEvents = issuedEvents.reverse().slice(offset, offset + limit);

      const documents: DocumentDetails[] = [];

      for (const event of paginatedEvents) {
        try {
          const documentHash = event.args?.documentHash;
          if (!documentHash) continue;

          const doc = await this.contract.documents(documentHash);
          
          const isRevoked = revokedHashes.has(documentHash);
          const isVerified = verifiedHashes.has(documentHash); 
          
          const expirationDateNum = Number(doc.expirationDate);
          const expirationDate = expirationDateNum > 0 ? new Date(expirationDateNum * 1000) : null;
          const isExpired = expirationDate ? expirationDate < new Date() : false;

          let status: DocumentDetails['status'];
          if (isRevoked) {
            status = 'revoked';
          } else if (isExpired) {
            status = 'expired';
          } else if (isVerified) {
            status = 'verified';
          } else {
            status = 'pending';
          }

          documents.push({
            documentHash,
            issuer: doc.issuer || event.args?.issuer,
            issuerName: doc.issuerName || 'Unknown Institution',
            documentType: doc.documentType || 'other',
            title: doc.title || '',
            recipientName: doc.recipientName || 'Unknown Recipient',
            recipientId: doc.recipientId || '',
            issuanceDate: new Date(Number(doc.issuanceDate) * 1000), 
            expirationDate,
            status,
            isActive: doc.isActive && !isRevoked && !isExpired,
            isVerified: isVerified,
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
      console.error('❌ Error getting all documents:', error);
      return [];
    }
  }
}

export const blockchainService = new BlockchainService();