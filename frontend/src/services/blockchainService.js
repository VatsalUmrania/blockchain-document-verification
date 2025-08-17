// services/blockchainService.js
import { ethers } from "ethers";
import {
  DocumentMetadata,
  BlockchainDocument,
  Institution,
  VerificationResult,
  DOCUMENT_STATUS,
} from "../types/DocumentTypes.js";

// Smart contract ABI (Application Binary Interface)
const DOCUMENT_VERIFICATION_ABI = [
  // Contract functions
  "function registerInstitution(string memory _name, string memory _registrationNumber, string memory _contactInfo) external",
  "function verifyInstitution(address _institutionAddress) external",
  "function issueDocument(bytes32 _documentHash, string memory _documentType, string memory _recipientName, string memory _recipientId, uint256 _expirationDate, string memory _metadataURI, bytes memory _issuerSignature) external",
  "function verifyDocument(bytes32 _documentHash) external view returns (address issuer, string memory issuerName, string memory documentType, string memory recipientName, string memory recipientId, uint256 issuanceDate, uint256 expirationDate, bool isValidDoc, bool isActive)",
  "function revokeDocument(bytes32 _documentHash) external",
  "function getDocumentMetadata(bytes32 _documentHash) external view returns (string memory)",
  "function getIssuerSignature(bytes32 _documentHash) external view returns (bytes memory)",
  "function getTotalDocuments() external view returns (uint256)",
  "function getTotalInstitutions() external view returns (uint256)",
  "function isInstitutionVerified(address _institutionAddress) external view returns (bool)",

  // Contract state variables
  "function documents(bytes32) external view returns (bytes32 documentHash, address issuer, string memory issuerName, string memory documentType, string memory recipientName, string memory recipientId, uint256 issuanceDate, uint256 expirationDate, string memory metadataURI, bool isActive, bytes memory issuerSignature)",
  "function institutions(address) external view returns (string memory name, string memory registrationNumber, string memory contactInfo, bool isVerified, uint256 registrationDate)",
  "function authorizedIssuers(address) external view returns (bool)",
  "function revokedDocuments(bytes32) external view returns (bool)",
  "function owner() external view returns (address)",

  // Events
  "event DocumentIssued(bytes32 indexed documentHash, address indexed issuer, string recipientName, string documentType, uint256 issuanceDate)",
  "event DocumentRevoked(bytes32 indexed documentHash, address indexed issuer, uint256 revocationDate)",
  "event InstitutionRegistered(address indexed institutionAddress, string name, uint256 registrationDate)",
  "event InstitutionVerified(address indexed institutionAddress, bool verified)",
];

class BlockchainService {
  constructor(provider, signer, contractAddress = null) {
    this.provider = provider;
    this.signer = signer;
    this.contractAddress =
      contractAddress || import.meta.env.VITE_CONTRACT_ADDRESS;
    this.contract = null;

    if (this.contractAddress && this.signer) {
      this.contract = new ethers.Contract(
        this.contractAddress,
        DOCUMENT_VERIFICATION_ABI,
        this.signer
      );
    }
  }

  /**
   * Initialize the contract connection
   */
  async initialize(contractAddress) {
    if (contractAddress) {
      this.contractAddress = contractAddress;
    }

    if (!this.contractAddress) {
      throw new Error("Contract address not provided");
    }

    if (!this.signer) {
      throw new Error("Signer not available");
    }

    this.contract = new ethers.Contract(
      this.contractAddress,
      DOCUMENT_VERIFICATION_ABI,
      this.signer
    );

    // Verify contract is deployed
    try {
      await this.contract.owner();
      console.log("✅ Contract connection established");
      return true;
    } catch (error) {
      console.error("❌ Failed to connect to contract:", error);
      throw new Error("Contract not found at the specified address");
    }
  }

  /**
   * Create document hash from file content and metadata
   */
  createDocumentHash(fileContent, metadata) {
    const metadataString = JSON.stringify(metadata.toJSON());
    const combined = fileContent + metadataString;
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(combined));
  }

  /**
   * Register an institution on the blockchain
   */
  async registerInstitution(name, registrationNumber, contactInfo) {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      console.log("📝 Registering institution:", name);

      const tx = await this.contract.registerInstitution(
        name,
        registrationNumber,
        contactInfo
      );

      console.log("⏳ Transaction submitted:", tx.hash);
      const receipt = await tx.wait();

      console.log("✅ Institution registered successfully");
      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      console.error("❌ Error registering institution:", error);
      throw new Error(`Failed to register institution: ${error.message}`);
    }
  }

  /**
   * Verify an institution on the blockchain (only contract owner can do this)
   */
  async verifyInstitution(institutionAddress) {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      console.log("🔍 Verifying institution:", institutionAddress);

      const tx = await this.contract.verifyInstitution(institutionAddress);

      console.log("⏳ Transaction submitted:", tx.hash);
      const receipt = await tx.wait();

      console.log("✅ Institution verified successfully");
      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      console.error("❌ Error verifying institution:", error);
      throw new Error(`Failed to verify institution: ${error.message}`);
    }
  }

  /**
   * Check if an institution is verified
   */
  async isInstitutionVerified(institutionAddress) {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      const isVerified = await this.contract.isInstitutionVerified(
        institutionAddress
      );
      console.log(
        `🔍 Institution ${institutionAddress} verification status:`,
        isVerified
      );
      return isVerified;
    } catch (error) {
      console.error("❌ Error checking institution verification:", error);
      return false;
    }
  }

  /**
   * Get institution information from blockchain
   */
  async getInstitutionInfo(institutionAddress) {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      const institutionData = await this.contract.institutions(
        institutionAddress
      );

      return {
        name: institutionData[0],
        registrationNumber: institutionData[1],
        contactInfo: institutionData[2],
        isVerified: institutionData[3],
        registrationDate: institutionData[4],
      };
    } catch (error) {
      console.error("❌ Error getting institution info:", error);
      return null;
    }
  }

  async isInstitutionVerified(institutionAddress) {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      const isVerified = await this.contract.isInstitutionVerified(
        institutionAddress
      );
      return isVerified;
    } catch (error) {
      console.error("❌ Error checking institution verification:", error);
      return false;
    }
  }

  /**
   * Get institution details
   */
  async getInstitution(institutionAddress) {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      const institutionData = await this.contract.institutions(
        institutionAddress
      );

      return new Institution({
        address: institutionAddress,
        name: institutionData.name,
        registrationNumber: institutionData.registrationNumber,
        contactInfo: institutionData.contactInfo,
        isVerified: institutionData.isVerified,
        registrationDate: new Date(
          institutionData.registrationDate.toNumber() * 1000
        ),
      });
    } catch (error) {
      console.error("❌ Error getting institution:", error);
      return null;
    }
  }

  /**
   * Issue a document on the blockchain
   */
  async issueDocument(
    documentHash,
    metadata,
    metadataURI = "",
    issuerSignature = "0x"
  ) {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      console.log("📄 Issuing document on blockchain:", documentHash);

      const expirationTimestamp = metadata.expirationDate
        ? Math.floor(new Date(metadata.expirationDate).getTime() / 1000)
        : 0;

      const tx = await this.contract.issueDocument(
        documentHash,
        metadata.documentType,
        metadata.recipientName,
        metadata.recipientId || "",
        expirationTimestamp,
        metadataURI,
        issuerSignature
      );

      console.log("⏳ Transaction submitted:", tx.hash);
      const receipt = await tx.wait();

      console.log("✅ Document issued successfully");
      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        documentHash,
      };
    } catch (error) {
      console.error("❌ Error issuing document:", error);
      throw new Error(`Failed to issue document: ${error.message}`);
    }
  }

  /**
   * Verify a document on the blockchain
   */
  async verifyDocumentOnChain(documentHash) {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      console.log("🔍 Verifying document on blockchain:", documentHash);

      const result = await this.contract.verifyDocument(documentHash);

      const [
        issuer,
        issuerName,
        documentType,
        recipientName,
        recipientId,
        issuanceDate,
        expirationDate,
        isValidDoc,
        isActive,
      ] = result;

      // Get additional document data
      const documentData = await this.contract.documents(documentHash);
      const isRevoked = await this.contract.revokedDocuments(documentHash);

      const blockchainDoc = new BlockchainDocument({
        documentHash,
        issuer,
        issuerName,
        documentType,
        recipientName,
        recipientId,
        issuanceDate: new Date(issuanceDate.toNumber() * 1000),
        expirationDate:
          expirationDate.toNumber() > 0
            ? new Date(expirationDate.toNumber() * 1000)
            : null,
        metadataURI: documentData.metadataURI,
        isActive: isActive && !isRevoked,
        isValid: isValidDoc,
        issuerSignature: documentData.issuerSignature,
      });

      const verificationResult = new VerificationResult({
        isValid: blockchainDoc.isCurrentlyValid(),
        document: blockchainDoc,
        blockchainConfirmed: true,
      });

      // Add warnings for expired or revoked documents
      if (isRevoked) {
        verificationResult.addWarning(
          "Document has been revoked by the issuer"
        );
      }

      if (
        blockchainDoc.expirationDate &&
        blockchainDoc.expirationDate <= new Date()
      ) {
        verificationResult.addWarning("Document has expired");
      }

      console.log("✅ Document verification completed");
      return verificationResult;
    } catch (error) {
      console.error("❌ Error verifying document:", error);

      if (error.message.includes("Document does not exist")) {
        return new VerificationResult({
          isValid: false,
          errors: ["Document not found on blockchain"],
        });
      }

      throw new Error(`Failed to verify document: ${error.message}`);
    }
  }

  /**
   * Revoke a document
   */
  async revokeDocument(documentHash) {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      console.log("🚫 Revoking document:", documentHash);

      const tx = await this.contract.revokeDocument(documentHash);

      console.log("⏳ Transaction submitted:", tx.hash);
      const receipt = await tx.wait();

      console.log("✅ Document revoked successfully");
      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      console.error("❌ Error revoking document:", error);
      throw new Error(`Failed to revoke document: ${error.message}`);
    }
  }

  /**
   * Get document metadata from IPFS
   */
  async getDocumentMetadata(documentHash) {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      const metadataURI = await this.contract.getDocumentMetadata(documentHash);

      if (metadataURI && metadataURI.startsWith("ipfs://")) {
        // In a real implementation, you would fetch from IPFS
        // For now, we'll return a placeholder
        console.log("📄 Metadata URI:", metadataURI);
        return metadataURI;
      }

      return null;
    } catch (error) {
      console.error("❌ Error getting document metadata:", error);
      return null;
    }
  }

  /**
   * Get contract statistics
   */
  async getContractStats() {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      const [totalDocuments, totalInstitutions] = await Promise.all([
        this.contract.getTotalDocuments(),
        this.contract.getTotalInstitutions(),
      ]);

      return {
        totalDocuments: totalDocuments.toNumber(),
        totalInstitutions: totalInstitutions.toNumber(),
      };
    } catch (error) {
      console.error("❌ Error getting contract stats:", error);
      return {
        totalDocuments: 0,
        totalInstitutions: 0,
      };
    }
  }

  /**
   * Listen to contract events
   */
  setupEventListeners(callbacks = {}) {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    // Listen for document issued events
    if (callbacks.onDocumentIssued) {
      this.contract.on(
        "DocumentIssued",
        (
          documentHash,
          issuer,
          recipientName,
          documentType,
          issuanceDate,
          event
        ) => {
          callbacks.onDocumentIssued({
            documentHash,
            issuer,
            recipientName,
            documentType,
            issuanceDate: new Date(issuanceDate.toNumber() * 1000),
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber,
          });
        }
      );
    }

    // Listen for document revoked events
    if (callbacks.onDocumentRevoked) {
      this.contract.on(
        "DocumentRevoked",
        (documentHash, issuer, revocationDate, event) => {
          callbacks.onDocumentRevoked({
            documentHash,
            issuer,
            revocationDate: new Date(revocationDate.toNumber() * 1000),
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber,
          });
        }
      );
    }

    // Listen for institution registered events
    if (callbacks.onInstitutionRegistered) {
      this.contract.on(
        "InstitutionRegistered",
        (institutionAddress, name, registrationDate, event) => {
          callbacks.onInstitutionRegistered({
            institutionAddress,
            name,
            registrationDate: new Date(registrationDate.toNumber() * 1000),
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber,
          });
        }
      );
    }

    // Listen for institution verified events
    if (callbacks.onInstitutionVerified) {
      this.contract.on(
        "InstitutionVerified",
        (institutionAddress, verified, event) => {
          callbacks.onInstitutionVerified({
            institutionAddress,
            verified,
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber,
          });
        }
      );
    }
  }

  /**
   * Remove all event listeners
   */
  removeEventListeners() {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
  }

  /**
   * Get transaction receipt and details
   */
  async getTransactionDetails(transactionHash) {
    try {
      const [transaction, receipt] = await Promise.all([
        this.provider.getTransaction(transactionHash),
        this.provider.getTransactionReceipt(transactionHash),
      ]);

      return {
        transaction,
        receipt,
        success: receipt.status === 1,
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber,
        confirmations: await transaction.confirmations(),
      };
    } catch (error) {
      console.error("❌ Error getting transaction details:", error);
      return null;
    }
  }

  /**
   * Estimate gas for operations
   */
  async estimateGas(operation, ...args) {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      const gasEstimate = await this.contract.estimateGas[operation](...args);
      return gasEstimate.toString();
    } catch (error) {
      console.error(`❌ Error estimating gas for ${operation}:`, error);
      return null;
    }
  }

  /**
   * Get current gas price
   */
  async getGasPrice() {
    try {
      const gasPrice = await this.provider.getGasPrice();
      return {
        wei: gasPrice.toString(),
        gwei: ethers.utils.formatUnits(gasPrice, "gwei"),
        eth: ethers.utils.formatEther(gasPrice),
      };
    } catch (error) {
      console.error("❌ Error getting gas price:", error);
      return null;
    }
  }
}

export default BlockchainService;
