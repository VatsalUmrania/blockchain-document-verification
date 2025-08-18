// Document Types and Metadata Structures

/**
 * Document Types Enum
 */
export const DOCUMENT_TYPES = {
  DEGREE: 'degree',
  DIPLOMA: 'diploma',
  CERTIFICATE: 'certificate',
  TRANSCRIPT: 'transcript',
  LICENSE: 'license',
  CERTIFICATION: 'certification',
  AWARD: 'award',
  IDENTITY: 'identity',
  EMPLOYMENT: 'employment',
  OTHER: 'other'
};

/**
 * Document Status Enum
 */
export const DOCUMENT_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REVOKED: 'revoked',
  EXPIRED: 'expired'
};

/**
 * Institution Types
 */
export const INSTITUTION_TYPES = {
  UNIVERSITY: 'university',
  COLLEGE: 'college',
  SCHOOL: 'school',
  GOVERNMENT: 'government',
  CORPORATION: 'corporation',
  CERTIFICATION_BODY: 'certification_body',
  OTHER: 'other'
};

/**
 * Document Metadata Structure
 */
export class DocumentMetadata {
  constructor({
    // Basic Document Information
    documentType = '',
    title = '',
    description = '',
    
    // Recipient Information
    recipientName = '',
    recipientId = '',
    recipientEmail = '',
    
    // Issuer Information
    issuerName = '',
    issuerType = '',
    issuerRegistrationNumber = '',
    issuerAddress = '',
    issuerContact = '',
    issuerWebsite = '',
    
    // Academic/Professional Details
    program = '',
    major = '',
    minor = '',
    gpa = '',
    graduationDate = null,
    honors = [],
    
    // Dates
    issuanceDate = null,
    expirationDate = null,
    
    // Additional Metadata
    language = 'en',
    country = '',
    region = '',
    
    // Technical Details
    version = '1.0',
    standard = 'DocVerify-v1',
    
    // Custom Fields
    customFields = {}
  } = {}) {
    this.documentType = documentType;
    this.title = title;
    this.description = description;
    
    this.recipientName = recipientName;
    this.recipientId = recipientId;
    this.recipientEmail = recipientEmail;
    
    this.issuerName = issuerName;
    this.issuerType = issuerType;
    this.issuerRegistrationNumber = issuerRegistrationNumber;
    this.issuerAddress = issuerAddress;
    this.issuerContact = issuerContact;
    this.issuerWebsite = issuerWebsite;
    
    this.program = program;
    this.major = major;
    this.minor = minor;
    this.gpa = gpa;
    this.graduationDate = graduationDate;
    this.honors = honors;
    
    this.issuanceDate = issuanceDate || new Date();
    this.expirationDate = expirationDate;
    
    this.language = language;
    this.country = country;
    this.region = region;
    
    this.version = version;
    this.standard = standard;
    
    this.customFields = customFields;
  }

  /**
   * Validate the metadata
   */
  validate() {
    const errors = [];
    
    if (!this.documentType) errors.push('Document type is required');
    if (!this.title) errors.push('Document title is required');
    if (!this.recipientName) errors.push('Recipient name is required');
    if (!this.issuerName) errors.push('Issuer name is required');
    if (!this.issuanceDate) errors.push('Issuance date is required');
    
    // Validate dates
    if (this.expirationDate && this.issuanceDate && 
        new Date(this.expirationDate) <= new Date(this.issuanceDate)) {
      errors.push('Expiration date must be after issuance date');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Convert to JSON for storage
   */
  toJSON() {
    return {
      documentType: this.documentType,
      title: this.title,
      description: this.description,
      recipientName: this.recipientName,
      recipientId: this.recipientId,
      recipientEmail: this.recipientEmail,
      issuerName: this.issuerName,
      issuerType: this.issuerType,
      issuerRegistrationNumber: this.issuerRegistrationNumber,
      issuerAddress: this.issuerAddress,
      issuerContact: this.issuerContact,
      issuerWebsite: this.issuerWebsite,
      program: this.program,
      major: this.major,
      minor: this.minor,
      gpa: this.gpa,
      graduationDate: this.graduationDate,
      honors: this.honors,
      issuanceDate: this.issuanceDate,
      expirationDate: this.expirationDate,
      language: this.language,
      country: this.country,
      region: this.region,
      version: this.version,
      standard: this.standard,
      customFields: this.customFields
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(json) {
    return new DocumentMetadata(json);
  }
}

/**
 * Blockchain Document Structure
 */
export class BlockchainDocument {
  constructor({
    documentHash = '',
    transactionHash = '',
    blockNumber = 0,
    issuer = '',
    issuerName = '',
    documentType = '',
    recipientName = '',
    recipientId = '',
    issuanceDate = null,
    expirationDate = null,
    metadataURI = '',
    isActive = true,
    isValid = true,
    issuerSignature = '',
    verificationData = null
  } = {}) {
    this.documentHash = documentHash;
    this.transactionHash = transactionHash;
    this.blockNumber = blockNumber;
    this.issuer = issuer;
    this.issuerName = issuerName;
    this.documentType = documentType;
    this.recipientName = recipientName;
    this.recipientId = recipientId;
    this.issuanceDate = issuanceDate;
    this.expirationDate = expirationDate;
    this.metadataURI = metadataURI;
    this.isActive = isActive;
    this.isValid = isValid;
    this.issuerSignature = issuerSignature;
    this.verificationData = verificationData;
  }

  /**
   * Check if document is currently valid
   */
  isCurrentlyValid() {
    const now = new Date();
    const isNotExpired = !this.expirationDate || new Date(this.expirationDate) > now;
    return this.isActive && this.isValid && isNotExpired;
  }

  /**
   * Get verification status
   */
  getVerificationStatus() {
    if (!this.isActive) return DOCUMENT_STATUS.REVOKED;
    if (this.expirationDate && new Date(this.expirationDate) <= new Date()) {
      return DOCUMENT_STATUS.EXPIRED;
    }
    return this.isValid ? DOCUMENT_STATUS.VERIFIED : DOCUMENT_STATUS.PENDING;
  }
}

/**
 * Institution Structure
 */
export class Institution {
  constructor({
    address = '',
    name = '',
    type = '',
    registrationNumber = '',
    contactInfo = '',
    website = '',
    isVerified = false,
    registrationDate = null,
    verificationDate = null,
    logo = '',
    description = ''
  } = {}) {
    this.address = address;
    this.name = name;
    this.type = type;
    this.registrationNumber = registrationNumber;
    this.contactInfo = contactInfo;
    this.website = website;
    this.isVerified = isVerified;
    this.registrationDate = registrationDate;
    this.verificationDate = verificationDate;
    this.logo = logo;
    this.description = description;
  }
}

/**
 * Verification Result Structure
 */
export class VerificationResult {
  constructor({
    isValid = false,
    document = null,
    institution = null,
    verificationTime = null,
    blockchainConfirmed = false,
    errors = [],
    warnings = []
  } = {}) {
    this.isValid = isValid;
    this.document = document;
    this.institution = institution;
    this.verificationTime = verificationTime || new Date();
    this.blockchainConfirmed = blockchainConfirmed;
    this.errors = errors;
    this.warnings = warnings;
  }

  /**
   * Add error
   */
  addError(error) {
    this.errors.push(error);
    this.isValid = false;
  }

  /**
   * Add warning
   */
  addWarning(warning) {
    this.warnings.push(warning);
  }
}

/**
 * Document Templates for different types
 */
export const DOCUMENT_TEMPLATES = {
  [DOCUMENT_TYPES.DEGREE]: {
    title: 'Bachelor/Master/PhD Degree',
    requiredFields: ['program', 'major', 'graduationDate'],
    optionalFields: ['minor', 'gpa', 'honors']
  },
  [DOCUMENT_TYPES.CERTIFICATE]: {
    title: 'Certificate',
    requiredFields: ['program'],
    optionalFields: ['expirationDate']
  },
  [DOCUMENT_TYPES.TRANSCRIPT]: {
    title: 'Academic Transcript',
    requiredFields: ['program', 'gpa'],
    optionalFields: ['major', 'minor']
  },
  [DOCUMENT_TYPES.LICENSE]: {
    title: 'Professional License',
    requiredFields: ['expirationDate'],
    optionalFields: ['licenseNumber']
  }
};

/**
 * Utility functions
 */
export const DocumentUtils = {
  /**
   * Generate document hash from content and metadata
   */
  generateDocumentHash(fileContent, metadata) {
    const crypto = require('crypto');
    const combined = fileContent + JSON.stringify(metadata.toJSON());
    return crypto.createHash('sha256').update(combined).digest('hex');
  },

  /**
   * Format date for display
   */
  formatDate(date) {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  },

  /**
   * Get document type display name
   */
  getDocumentTypeDisplayName(type) {
    const names = {
      [DOCUMENT_TYPES.DEGREE]: 'Degree',
      [DOCUMENT_TYPES.DIPLOMA]: 'Diploma',
      [DOCUMENT_TYPES.CERTIFICATE]: 'Certificate',
      [DOCUMENT_TYPES.TRANSCRIPT]: 'Transcript',
      [DOCUMENT_TYPES.LICENSE]: 'License',
      [DOCUMENT_TYPES.CERTIFICATION]: 'Certification',
      [DOCUMENT_TYPES.AWARD]: 'Award',
      [DOCUMENT_TYPES.IDENTITY]: 'Identity Document',
      [DOCUMENT_TYPES.EMPLOYMENT]: 'Employment Document',
      [DOCUMENT_TYPES.OTHER]: 'Other'
    };
    return names[type] || type;
  }
};
