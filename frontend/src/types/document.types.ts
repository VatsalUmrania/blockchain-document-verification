// Enums
export enum DOCUMENT_STATUS {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REVOKED = 'revoked',
  EXPIRED = 'expired'
}
// ... (DOCUMENT_TYPE enum remains the same)
export enum DOCUMENT_TYPE {
  CERTIFICATE = 'certificate',
  DIPLOMA = 'diploma',
  DEGREE = 'degree',
  LICENSE = 'license',
  TRANSCRIPT = 'transcript',
  ID_CARD = 'id_card',
  OTHER = 'other'
}

// Base interfaces
export interface DocumentMetadataInput {
  // Required fields
  documentType: string;
  recipientName: string;
  
  // Institution fields
  issuerName?: string;
  issuerRegistrationNumber?: string;
  issuerContact?: string;
  issuerAddress?: string;
  issuerType?: string;
  
  // Document fields
  title?: string;
  recipientId?: string;
  issuanceDate?: Date | string;
  expirationDate?: Date | string;
  graduationDate?: Date | string;
  
  // Academic fields
  program?: string;
  major?: string;
  gpa?: string;
  
  // Additional fields
  description?: string;
  category?: string;
  tags?: string[];
  [key: string]: any;
}

export interface BlockchainDocumentInput {
  documentHash: string;
  issuer: string;
  issuerName: string;
  documentType: string;
  title: string;
  recipientName: string;
  recipientId?: string;
  issuanceDate: Date;
  expirationDate?: Date | null;
  metadataURI?: string;
  isActive: boolean;
  isVerified: boolean; // <-- ADDED
  issuerSignature?: string;
}

export interface InstitutionInput {
  address: string;
  name: string;
  registrationNumber: string;
  contactInfo: string;
  isVerified: boolean;
  registrationDate: Date;
}

export interface VerificationResultInput {
  isValid: boolean; // This represents the *overall* validity (verified, not revoked, not expired)
  document?: BlockchainDocument;
  errors?: string[];
  warnings?: string[];
  blockchainConfirmed?: boolean;
  transactionHash?: string;
  blockNumber?: number;
}

// Classes
export class DocumentMetadata {
  // ... (Constructor and validation methods remain the same)
  // Required fields
  public documentType: string;
  public recipientName: string;
  
  // Institution fields
  public issuerName?: string;
  public issuerRegistrationNumber?: string;
  public issuerContact?: string;
  public issuerAddress?: string;
  public issuerType?: string;
  
  // Document fields
  public title?: string;
  public recipientId?: string;
  public issuanceDate?: Date;
  public expirationDate?: Date;
  public graduationDate?: Date;
  
  // Academic fields
  public program?: string;
  public major?: string;
  public gpa?: string;
  
  // Additional fields
  public description?: string;
  public category?: string;
  public tags?: string[];

  constructor(input: DocumentMetadataInput) {
    // Required fields
    this.documentType = input.documentType;
    this.recipientName = input.recipientName;
    
    // Institution fields
    this.issuerName = input.issuerName;
    this.issuerRegistrationNumber = input.issuerRegistrationNumber;
    this.issuerContact = input.issuerContact;
    this.issuerAddress = input.issuerAddress;
    this.issuerType = input.issuerType;
    
    // Document fields
    this.title = input.title;
    this.recipientId = input.recipientId;
    this.issuanceDate = input.issuanceDate ? new Date(input.issuanceDate) : undefined;
    this.expirationDate = input.expirationDate ? new Date(input.expirationDate) : undefined;
    this.graduationDate = input.graduationDate ? new Date(input.graduationDate) : undefined;
    
    // Academic fields
    this.program = input.program;
    this.major = input.major;
    this.gpa = input.gpa;
    
    // Additional fields
    this.description = input.description;
    this.category = input.category;
    this.tags = input.tags || [];
  }

  /**
   * Validate required fields for document issuance
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.documentType) {
      errors.push('Document type is required');
    }

    if (!this.title) {
      errors.push('Document title is required');
    }

    if (!this.recipientName) {
      errors.push('Recipient name is required');
    }

    if (!this.issuerName) {
      errors.push('Issuer name is required');
    }

    if (!this.issuanceDate) {
      errors.push('Issuance date is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate institution registration fields
   */
  validateInstitution(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.issuerName || this.issuerName.trim() === '') {
      errors.push('Institution name is required');
    }

    if (!this.issuerRegistrationNumber || this.issuerRegistrationNumber.trim() === '') {
      errors.push('Registration number is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  toJSON(): Record<string, any> {
    return {
      // Required fields
      documentType: this.documentType,
      recipientName: this.recipientName,
      
      // Institution fields
      issuerName: this.issuerName,
      issuerRegistrationNumber: this.issuerRegistrationNumber,
      issuerContact: this.issuerContact,
      issuerAddress: this.issuerAddress,
      issuerType: this.issuerType,
      
      // Document fields
      title: this.title,
      recipientId: this.recipientId,
      issuanceDate: this.issuanceDate?.toISOString(),
      expirationDate: this.expirationDate?.toISOString(),
      graduationDate: this.graduationDate?.toISOString(),
      
      // Academic fields
      program: this.program,
      major: this.major,
      gpa: this.gpa,
      
      // Additional fields
      description: this.description,
      category: this.category,
      tags: this.tags,
    };
  }
}

export class BlockchainDocument {
  public documentHash: string;
  public issuer: string;
  public issuerName: string;
  public documentType: string;
  public title: string;
  public recipientName: string;
  public recipientId?: string;
  public issuanceDate: Date;
  public expirationDate?: Date | null;
  public metadataURI?: string;
  public isActive: boolean;
  public isVerified: boolean; // <-- ADDED
  public issuerSignature?: string;

  constructor(input: BlockchainDocumentInput) {
    this.documentHash = input.documentHash;
    this.issuer = input.issuer;
    this.issuerName = input.issuerName;
    this.documentType = input.documentType;
    this.title = input.title; // <-- ADDED
    this.recipientName = input.recipientName;
    this.recipientId = input.recipientId;
    this.issuanceDate = new Date(input.issuanceDate);
    this.expirationDate = input.expirationDate ? new Date(input.expirationDate) : null;
    this.metadataURI = input.metadataURI;
    this.isActive = input.isActive;
    this.isVerified = input.isVerified; // <-- ADDED
    this.issuerSignature = input.issuerSignature;
  }

  /**
   * @deprecated Use getStatus() instead. This only checks if it's currently valid.
   */
  isCurrentlyValid(): boolean {
    return this.getStatus() === DOCUMENT_STATUS.VERIFIED;
  }

  // --- MODIFICATION: Updated getStatus logic ---
  getStatus(): DOCUMENT_STATUS {
    if (!this.isActive) {
      return DOCUMENT_STATUS.REVOKED;
    }

    if (this.expirationDate && this.expirationDate <= new Date()) {
      return DOCUMENT_STATUS.EXPIRED;
    }

    if (this.isVerified) {
      return DOCUMENT_STATUS.VERIFIED;
    }

    // If not revoked, not expired, and not verified, it's pending.
    return DOCUMENT_STATUS.PENDING;
  }

  toJSON(): Record<string, any> {
    return {
      documentHash: this.documentHash,
      issuer: this.issuer,
      issuerName: this.issuerName,
      documentType: this.documentType,
      title: this.title, // <-- ADDED
      recipientName: this.recipientName,
      recipientId: this.recipientId,
      issuanceDate: this.issuanceDate.toISOString(),
      expirationDate: this.expirationDate?.toISOString() || null,
      metadataURI: this.metadataURI,
      isActive: this.isActive,
      isVerified: this.isVerified, // <-- ADDED
      issuerSignature: this.issuerSignature,
    };
  }
}

// ... (Institution class remains the same) ...
export class Institution {
  public address: string;
  public name: string;
  public registrationNumber: string;
  public contactInfo: string;
  public isVerified: boolean;
  public registrationDate: Date;

  constructor(input: InstitutionInput) {
    this.address = input.address;
    this.name = input.name;
    this.registrationNumber = input.registrationNumber;
    this.contactInfo = input.contactInfo;
    this.isVerified = input.isVerified;
    this.registrationDate = new Date(input.registrationDate);
  }

  toJSON(): Record<string, any> {
    return {
      address: this.address,
      name: this.name,
      registrationNumber: this.registrationNumber,
      contactInfo: this.contactInfo,
      isVerified: this.isVerified,
      registrationDate: this.registrationDate.toISOString(),
    };
  }
}


export class VerificationResult {
  public isValid: boolean;
  public document?: BlockchainDocument;
  public errors: string[];
  public warnings: string[];
  public blockchainConfirmed?: boolean;
  public transactionHash?: string;
  public blockNumber?: number;

  constructor(input: VerificationResultInput) {
    this.isValid = input.isValid;
    this.document = input.document;
    this.errors = input.errors || [];
    this.warnings = input.warnings || [];
    this.blockchainConfirmed = input.blockchainConfirmed;
    this.transactionHash = input.transactionHash;
    this.blockNumber = input.blockNumber;
  }

  addError(error: string): void {
    this.errors.push(error);
    this.isValid = false;
  }
  // ... (rest of VerificationResult class remains the same) ...
  addWarning(warning: string): void {
    this.warnings.push(warning);
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  hasWarnings(): boolean {
    return this.warnings.length > 0;
  }

  toJSON(): Record<string, any> {
    return {
      isValid: this.isValid,
      document: this.document?.toJSON(),
      errors: this.errors,
      warnings: this.warnings,
      blockchainConfirmed: this.blockchainConfirmed,
      transactionHash: this.transactionHash,
      blockNumber: this.blockNumber,
    };
  }
}

// ... (Other interfaces remain the same) ...
export interface Document {
  id: number;
  hash: string;
  metadata: DocumentMetadata;
  timestamp: Date;
  issuer: string;
}

export interface IssuanceResult {
  success: boolean;
  documentHash: string;
  transactionHash?: string;
  blockNumber?: number;
  gasUsed?: string; 
  error?: string;
  metadata?: any;
}

export interface ContractResult {
  success: boolean;
  transactionHash: string;
  blockNumber: number;
  gasUsed: string;
  documentHash?: string;
}

export type DocumentMetadataType = DocumentMetadata;
export type BlockchainDocumentType = BlockchainDocument;
export type InstitutionType = Institution;
export type VerificationResultType = VerificationResult;

export interface DocumentStats {
  totalDocuments: number;
  verifiedDocuments: number;
  pendingDocuments: number;
  totalVerifications: number;
}

export interface ActivityItem {
  id: string;
  type: 'verification' | 'upload';
  message: string;
  timestamp: number;
  hash: string;
  status: string;
  localOnly: boolean;
  blockchainStored: boolean;
}

export interface StorageInfo {
  available: boolean;
  used: number;
  total?: number;
  documentCount?: number;
  approximateTotal?: number;
}