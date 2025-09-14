// Enums
export enum DOCUMENT_STATUS {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REVOKED = 'revoked',
  EXPIRED = 'expired'
}

export enum DOCUMENT_TYPE {
  CERTIFICATE = 'certificate',
  DIPLOMA = 'diploma',
  LICENSE = 'license',
  TRANSCRIPT = 'transcript',
  ID_CARD = 'id_card',
  OTHER = 'other'
}

// Base interfaces
export interface DocumentMetadataInput {
  documentType: string;
  title?: string;
  recipientName: string;
  recipientId?: string;
  issuerName?: string;
  issuanceDate?: Date | string;
  expirationDate?: Date | string;
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
  recipientName: string;
  recipientId?: string;
  issuanceDate: Date;
  expirationDate?: Date | null;
  metadataURI?: string;
  isActive: boolean;
  isValid: boolean;
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
  isValid: boolean;
  document?: BlockchainDocument;
  errors?: string[];
  warnings?: string[];
  blockchainConfirmed?: boolean;
  transactionHash?: string;
  blockNumber?: number;
}

// Classes
export class DocumentMetadata {
  public documentType: string;
  public title?: string;
  public recipientName: string;
  public recipientId?: string;
  public issuerName?: string;
  public issuanceDate?: Date;
  public expirationDate?: Date;
  public description?: string;
  public category?: string;
  public tags?: string[];

  constructor(input: DocumentMetadataInput) {
    this.documentType = input.documentType;
    this.title = input.title;
    this.recipientName = input.recipientName;
    this.recipientId = input.recipientId;
    this.issuerName = input.issuerName;
    this.issuanceDate = input.issuanceDate ? new Date(input.issuanceDate) : undefined;
    this.expirationDate = input.expirationDate ? new Date(input.expirationDate) : undefined;
    this.description = input.description;
    this.category = input.category;
    this.tags = input.tags || [];
  }

  toJSON(): Record<string, any> {
    return {
      documentType: this.documentType,
      title: this.title,
      recipientName: this.recipientName,
      recipientId: this.recipientId,
      issuerName: this.issuerName,
      issuanceDate: this.issuanceDate?.toISOString(),
      expirationDate: this.expirationDate?.toISOString(),
      description: this.description,
      category: this.category,
      tags: this.tags,
    };
  }

  static fromJSON(data: Record<string, any>): DocumentMetadata {
    return new DocumentMetadata({
      documentType: data.documentType,
      title: data.title,
      recipientName: data.recipientName,
      recipientId: data.recipientId,
      issuerName: data.issuerName,
      issuanceDate: data.issuanceDate ? new Date(data.issuanceDate) : undefined,
      expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
      description: data.description,
      category: data.category,
      tags: data.tags || [],
    });
  }
}

export class BlockchainDocument {
  public documentHash: string;
  public issuer: string;
  public issuerName: string;
  public documentType: string;
  public recipientName: string;
  public recipientId?: string;
  public issuanceDate: Date;
  public expirationDate?: Date | null;
  public metadataURI?: string;
  public isActive: boolean;
  public isValid: boolean;
  public issuerSignature?: string;

  constructor(input: BlockchainDocumentInput) {
    this.documentHash = input.documentHash;
    this.issuer = input.issuer;
    this.issuerName = input.issuerName;
    this.documentType = input.documentType;
    this.recipientName = input.recipientName;
    this.recipientId = input.recipientId;
    this.issuanceDate = new Date(input.issuanceDate);
    this.expirationDate = input.expirationDate ? new Date(input.expirationDate) : null;
    this.metadataURI = input.metadataURI;
    this.isActive = input.isActive;
    this.isValid = input.isValid;
    this.issuerSignature = input.issuerSignature;
  }

  isCurrentlyValid(): boolean {
    if (!this.isValid || !this.isActive) {
      return false;
    }

    // Check if document has expired
    if (this.expirationDate && this.expirationDate <= new Date()) {
      return false;
    }

    return true;
  }

  getStatus(): DOCUMENT_STATUS {
    if (!this.isActive) {
      return DOCUMENT_STATUS.REVOKED;
    }

    if (this.expirationDate && this.expirationDate <= new Date()) {
      return DOCUMENT_STATUS.EXPIRED;
    }

    if (this.isValid) {
      return DOCUMENT_STATUS.VERIFIED;
    }

    return DOCUMENT_STATUS.PENDING;
  }

  toJSON(): Record<string, any> {
    return {
      documentHash: this.documentHash,
      issuer: this.issuer,
      issuerName: this.issuerName,
      documentType: this.documentType,
      recipientName: this.recipientName,
      recipientId: this.recipientId,
      issuanceDate: this.issuanceDate.toISOString(),
      expirationDate: this.expirationDate?.toISOString() || null,
      metadataURI: this.metadataURI,
      isActive: this.isActive,
      isValid: this.isValid,
      issuerSignature: this.issuerSignature,
    };
  }
}

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

// Export types for use in other files
export type DocumentMetadataType = DocumentMetadata;
export type BlockchainDocumentType = BlockchainDocument;
export type InstitutionType = Institution;
export type VerificationResultType = VerificationResult;
