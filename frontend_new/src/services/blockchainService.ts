import {
  BrowserProvider,
  Signer,
  Contract,
  keccak256,
  toUtf8Bytes,
  ZeroAddress,
} from "ethers";
import {
  DocumentMetadata,
  BlockchainDocument,
  VerificationResult,
} from "../types/document.types";

// --- TYPE DEFINITIONS ---

interface ContractResult {
  success: boolean;
  transactionHash: string;
  blockNumber: number;
  gasUsed: string;
  documentHash?: string;
  error?: string;
}

// ← UPDATED ABI with title field
const DOCUMENT_VERIFICATION_ABI = [
  "function registerInstitution(string memory _name, string memory _registrationNumber, string memory _contactInfo) external",
  "function verifyInstitution(address _institutionAddress) external",
  "function issueDocument(bytes32 _documentHash, string memory _documentType, string memory _title, string memory _recipientName, string memory _recipientId, uint256 _expirationDate, string memory _metadataURI, bytes memory _issuerSignature) external",
  "function verifyDocument(bytes32 _documentHash) external view returns (address issuer, string memory issuerName, string memory documentType, string memory title, string memory recipientName, string memory recipientId, uint256 issuanceDate, uint256 expirationDate, bool isValidDoc, bool isActive)",
  "function revokeDocument(bytes32 _documentHash) external",
  "function getDocumentMetadata(bytes32 _documentHash) external view returns (string memory)",
  "function getIssuerSignature(bytes32 _documentHash) external view returns (bytes memory)",
  "function getTotalDocuments() external view returns (uint256)",
  "function getTotalInstitutions() external view returns (uint256)",
  "function isInstitutionVerified(address _institutionAddress) external view returns (bool)",
  "function documents(bytes32) external view returns (bytes32 documentHash, address issuer, string memory issuerName, string memory documentType, string memory title, string memory recipientName, string memory recipientId, uint256 issuanceDate, uint256 expirationDate, string memory metadataURI, bool isActive, bytes memory issuerSignature)",
  "function institutions(address) external view returns (string memory name, string memory registrationNumber, string memory contactInfo, bool isVerified, uint256 registrationDate)",
  "function owner() external view returns (address)",
  "event DocumentIssued(bytes32 indexed documentHash, address indexed issuer, string recipientName, string documentType, string title, uint256 issuanceDate)",
  "event DocumentRevoked(bytes32 indexed documentHash, address indexed issuer, uint256 revocationDate)",
  "event InstitutionRegistered(address indexed institutionAddress, string name, uint256 registrationDate)",
  "event InstitutionVerified(address indexed institutionAddress, bool verified)",
];

// --- BLOCKCHAIN SERVICE CLASS ---

class BlockchainService {
  private provider: BrowserProvider;
  private signer: Signer;
  private contractAddress: string | null;
  private contract: Contract | null = null;

  constructor(
    provider: BrowserProvider, 
    signer: Signer, 
    contractAddress: string | null = null
  ) {
    this.provider = provider;
    this.signer = signer;
    this.contractAddress = contractAddress || import.meta.env.VITE_CONTRACT_ADDRESS;
  }

  async initialize(contractAddress?: string): Promise<boolean> {
    if (contractAddress) {
      this.contractAddress = contractAddress;
    }

    if (!this.contractAddress) {
      throw new Error("Contract address not provided");
    }

    if (!this.provider || !this.signer) {
      throw new Error("Provider or Signer not available");
    }

    this.contract = new Contract(this.contractAddress, DOCUMENT_VERIFICATION_ABI, this.signer);

    try {
      const code = await this.provider.getCode(this.contractAddress);
      if (code === '0x') {
        throw new Error("No contract deployed at the specified address.");
      }
      await this.contract.owner();
      console.log("✅ Contract connection established");
      return true;
    } catch (error) {
      console.error("❌ Failed to connect to contract:", error);
      throw new Error("Contract not found or is invalid.");
    }
  }

  createDocumentHash(fileContent: string, metadata: DocumentMetadata): string {
    const metadataString = JSON.stringify(metadata.toJSON());
    const combined = fileContent + metadataString;
    return keccak256(toUtf8Bytes(combined));
  }

  async registerInstitution(name: string, registrationNumber: string, contactInfo: string): Promise<ContractResult> {
    if (!this.contract) throw new Error("Contract not initialized");
    try {
      const tx = await this.contract.registerInstitution(name, registrationNumber, contactInfo);
      const receipt = await tx.wait();
      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error: any) {
      console.error("❌ Error registering institution:", error);
      throw new Error(error.reason || `Failed to register institution: ${error.message}`);
    }
  }

  async verifyInstitution(institutionAddress: string): Promise<ContractResult> {
    if (!this.contract) throw new Error("Contract not initialized");
    try {
      const tx = await this.contract.verifyInstitution(institutionAddress);
      const receipt = await tx.wait();
      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error: any) {
      console.error("❌ Error verifying institution:", error);
      throw new Error(error.reason || `Failed to verify institution: ${error.message}`);
    }
  }
  
  async isInstitutionVerified(institutionAddress: string): Promise<boolean> {
    if (!this.contract) throw new Error("Contract not initialized");
    try {
      const isVerified = await this.contract.isInstitutionVerified(institutionAddress);
      console.log(`🔍 Institution ${institutionAddress} verification status:`, isVerified);
      return isVerified;
    } catch (error) {
      console.error("❌ Error checking institution verification:", error);
      return false;
    }
  }

  async getInstitutionInfo(institutionAddress: string): Promise<any | null> {
    if (!this.contract) throw new Error("Contract not initialized");
    try {
      const institutionData = await this.contract.institutions(institutionAddress);
      return {
        name: institutionData.name,
        registrationNumber: institutionData.registrationNumber,
        contactInfo: institutionData.contactInfo,
        isVerified: institutionData.isVerified,
        registrationDate: institutionData.registrationDate,
      };
    } catch (error) {
      console.error("❌ Error getting institution info:", error);
      return null;
    }
  }

  // ← UPDATED: Added title parameter
  async issueDocument(
    documentHash: string, 
    metadata: DocumentMetadata, 
    title: string = "",
    metadataURI: string = "", 
    issuerSignature: string = "0x"
  ): Promise<ContractResult> {
    if (!this.contract) throw new Error("Contract not initialized");
    
    try {
      console.log("📝 Issuing document with params:", {
        documentHash,
        documentType: metadata.documentType,
        title,
        recipientName: metadata.recipientName,
        recipientId: metadata.recipientId
      });

      const expirationTimestamp = metadata.expirationDate
        ? Math.floor(new Date(metadata.expirationDate).getTime() / 1000)
        : 0;

      // ← UPDATED: Added title parameter in contract call
      const tx = await this.contract.issueDocument(
        documentHash,
        metadata.documentType,
        title,  // ← ADDED
        metadata.recipientName,
        metadata.recipientId || "",
        expirationTimestamp,
        metadataURI,
        issuerSignature
      );
      
      console.log("⏳ Waiting for transaction confirmation...");
      const receipt = await tx.wait();
      console.log("✅ Document issued successfully!");

      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        documentHash,
      };
    } catch (error: any) {
      console.error("❌ Error issuing document:", error);
      
      if (error.message.includes("Only authorized issuers")) {
        throw new Error("Your account is not authorized to issue documents. Please register and get verified as an institution first.");
      }
      
      throw new Error(error.reason || `Failed to issue document: ${error.message}`);
    }
  }

  async verifyDocumentOnChain(documentHash: string): Promise<VerificationResult> {
    if (!this.contract) throw new Error("Contract not initialized");
    try {
        const docData = await this.contract.documents(documentHash);
        if (!docData || !docData.issuer || docData.issuer === ZeroAddress) {
            throw new Error("Document does not exist");
        }

        const blockchainDoc = new BlockchainDocument({
            documentHash: docData.documentHash,
            issuer: docData.issuer,
            issuerName: docData.issuerName,
            documentType: docData.documentType,
            title: docData.title || "",  // ← ADDED
            recipientName: docData.recipientName,
            recipientId: docData.recipientId,
            issuanceDate: new Date(Number(docData.issuanceDate) * 1000),
            expirationDate: Number(docData.expirationDate) > 0 ? new Date(Number(docData.expirationDate) * 1000) : null,
            metadataURI: docData.metadataURI,
            isActive: docData.isActive,
            isValid: true,
            issuerSignature: docData.issuerSignature,
        });

        const result = new VerificationResult({
            isValid: blockchainDoc.isCurrentlyValid(),
            document: blockchainDoc,
            blockchainConfirmed: true,
        });
        
        if (!blockchainDoc.isActive) {
            result.addWarning("Document has been revoked by the issuer.");
        }
        if (blockchainDoc.expirationDate && blockchainDoc.expirationDate <= new Date()) {
            result.addWarning("This document has expired.");
        }

        return result;
    } catch (error: any) {
        console.error("❌ Error verifying document on chain:", error);
        return new VerificationResult({
            isValid: false,
            errors: [error.reason || "Document not found on the blockchain."],
        });
    }
  }

    async getGasPrice() {
        if (!this.provider) throw new Error("Provider not available");
        try {
            const feeData = await this.provider.getFeeData();
            return {
                gasPrice: feeData.gasPrice?.toString(),
                maxFeePerGas: feeData.maxFeePerGas?.toString(),
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
            };
        } catch (error) {
            console.error("❌ Error getting gas price:", error);
            return null;
        }
    }
}

export default BlockchainService;
