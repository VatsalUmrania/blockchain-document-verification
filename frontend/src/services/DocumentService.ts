// services/DocumentService.ts
import { normalizeHash, createDocumentServiceHash } from './hashService';

// Define types for our document structures
interface StoredDocument {
  hash: string;
  fileName: string;
  timestamp: number;
  metadata: Record<string, any>;
  transactionHash?: string;
  status: string;
  blockchainStored?: boolean;
  localOnly?: boolean;
  retryable?: boolean;
  verifiedAt?: number;
  lastUpdated?: number;
  verificationData?: Record<string, any>;
  originalHash?: string;
  migrated?: boolean;
  migratedAt?: number;
  cleanedUp?: boolean;
}

interface VerificationData {
  method?: string;
  [key: string]: any;
}

interface DocumentStore {
  [key: string]: StoredDocument;
}

class DocumentService {
  private provider: any
  private signer: any

  constructor(provider?: any, signer?: any) {
    this.provider = provider;
    this.signer = signer;  
  }

  createDocumentHash(fileContent: string, fileName: string, metadata: Record<string, any> = {}): string {
    return createDocumentServiceHash(fileContent, fileName, metadata);
  }

  /**
   * Migrate old documents with 0x keys to normalized keys
   */
  migrateDocumentKeys(): void {
    try {
      const stored = localStorage.getItem('docverify_documents');
      if (!stored) return;
      
      const documents: DocumentStore = JSON.parse(stored);
      let migrated = false;
      
      const migratedDocs: DocumentStore = {};
      
      for (const [key, doc] of Object.entries(documents)) {
        const normalizedKey = normalizeHash(key);
        
        if (normalizedKey !== key && normalizedKey.length === 64) {
          // This is a 0x-prefixed key that needs migration
          migratedDocs[normalizedKey] = {
            ...doc,
            hash: normalizedKey, // Update hash field too
            originalHash: key, // Keep original for reference
            migrated: true,
            migratedAt: Date.now()
          };
          migrated = true;
        } else {
          // Keep as is
          migratedDocs[key] = doc;
        }
      }
      
      if (migrated) {
        localStorage.setItem('docverify_documents', JSON.stringify(migratedDocs));
        
        // Dispatch event to refresh stats
        window.dispatchEvent(new CustomEvent('documentStatsChanged', {
          detail: { action: 'migrate' }
        }));
      }
      
    } catch (error) {
      console.error('❌ Error migrating document keys:', error);
    }
  }

  getStoredDocuments(): DocumentStore {
    try {
      const stored = localStorage.getItem('docverify_documents');
      if (!stored) return {};
      
      const documents: DocumentStore = JSON.parse(stored);
      
      // Auto-migrate on first access
      const hasOldKeys = Object.keys(documents).some(key => key.startsWith('0x'));
      if (hasOldKeys) {
        this.migrateDocumentKeys();
        // Re-read after migration
        const migratedStored = localStorage.getItem('docverify_documents');
        return migratedStored ? JSON.parse(migratedStored) : {};
      }
      
      return documents;
    } catch (error) {
      console.error('❌ Error retrieving stored documents:', error);
      return {};
    }
  }

  getDocumentStatus(documentHash: string): { exists: boolean; status: string | null; document: StoredDocument | null } {
    const normalizedHash = normalizeHash(documentHash);
    const documents = this.getStoredDocuments();
    
    // Direct lookup with normalized hash
    if (documents[normalizedHash]) {
      return {
        exists: true,
        status: documents[normalizedHash].status,
        document: documents[normalizedHash]
      };
    }
    
    // Fallback: normalize all stored keys and compare
    for (const [storedHash, doc] of Object.entries(documents)) {
      const normalizedStoredHash = normalizeHash(storedHash);
      if (normalizedStoredHash === normalizedHash) {
        return {
          exists: true,
          status: doc.status,
          document: doc
        };
      }
    }
    
    return {
      exists: false,
      status: null,
      document: null
    };
  }

  markDocumentVerified(documentHash: string, verificationData: VerificationData = {}): boolean {
    const normalizedHash = normalizeHash(documentHash);
    const documents = this.getStoredDocuments();
    
    // Try to find the document
    let foundKey: string | null = null;
    let foundDoc: StoredDocument | null = null;
    
    // Direct lookup
    if (documents[normalizedHash]) {
      foundKey = normalizedHash;
      foundDoc = documents[normalizedHash];
    } else {
      // Search through all keys
      for (const [storedHash, doc] of Object.entries(documents)) {
        const normalizedStoredHash = normalizeHash(storedHash);
        if (normalizedStoredHash === normalizedHash) {
          foundKey = storedHash;
          foundDoc = doc;
          break;
        }
      }
    }
    
    if (!foundDoc) {
      console.error('❌ Document not found for hash:', normalizedHash);
      return false;
    }
    
    // Update the document (always store with normalized key)
    const normalizedKey = normalizeHash(foundKey);
    
    // Remove old key if it was different
    if (foundKey !== normalizedKey && foundKey !== null) {
      delete documents[foundKey];
    }
    
    documents[normalizedKey] = {
      ...foundDoc,
      hash: normalizedKey, // Ensure hash field is normalized
      status: 'verified',
      verifiedAt: Date.now(),
      lastUpdated: Date.now(),
      verificationData: {
        verifiedBy: 'verification_portal',
        verificationMethod: verificationData.method || 'hash_comparison',
        ...verificationData
      }
    };
    
    try {
      localStorage.setItem('docverify_documents', JSON.stringify(documents));
      
      // Dispatch custom event to notify React components
      window.dispatchEvent(new CustomEvent('documentStatsChanged', {
        detail: { action: 'verify', hash: normalizedKey }
      }));
      
      return true;
    } catch (error) {
      console.error('❌ Failed to save to localStorage:', error);
      return false;
    }
  }

  async storeDocumentAsPending(fileContent: string, fileName: string, metadata: Record<string, any> = {}): Promise<{ success: boolean; documentHash?: string; status?: string; error?: string }> {
    const documentHash = this.createDocumentHash(fileContent, fileName, metadata);
    const normalizedHash = normalizeHash(documentHash); // Always normalize
    
    const documents = this.getStoredDocuments();
    
    // Store with normalized hash as key
    documents[normalizedHash] = {
      hash: normalizedHash,
      fileName,
      timestamp: Date.now(),
      metadata: {
        ...metadata,
        uploadedVia: 'upload_page'
      },
      transactionHash: `pending_${Date.now()}`,
      status: 'pending',
      blockchainStored: false,
      localOnly: true,
      retryable: true
    };

    try {
      localStorage.setItem('docverify_documents', JSON.stringify(documents));
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('documentStatsChanged', {
        detail: { action: 'store', hash: normalizedHash }
      }));
      
      return {
        success: true,
        documentHash: normalizedHash,
        status: 'pending'
      };
    } catch (error: any) {
      console.error('❌ Failed to store document:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  getDocumentStats(): { totalDocuments: number; verifiedDocuments: number; pendingDocuments: number; totalVerifications: number } {
    try {
      const documents = this.getStoredDocuments();
      const documentArray = Object.values(documents);
      
      const stats = {
        totalDocuments: documentArray.length,
        verifiedDocuments: documentArray.filter(doc => doc.status === 'verified').length,
        pendingDocuments: documentArray.filter(doc => doc.status === 'pending').length,
        totalVerifications: documentArray.filter(doc => doc.status === 'verified').length
      };

      return stats;
    } catch (error) {
      console.error('❌ Error computing document stats:', error);
      return {
        totalDocuments: 0,
        verifiedDocuments: 0,
        pendingDocuments: 0,
        totalVerifications: 0
      };
    }
  }

  async verifyDocument(fileContent: string, fileName: string): Promise<{ isValid: boolean; status: string; documentData: StoredDocument | null; verificationTime: number; blockchainStored: boolean; transactionHash?: string; error?: string }> {
    try {
      const documentHash = this.createDocumentHash(fileContent, fileName);
      const normalizedHash = normalizeHash(documentHash);
      const documents = this.getStoredDocuments();
      
      // Direct lookup
      if (documents[normalizedHash]) {
        return {
          isValid: true,
          status: documents[normalizedHash].status,
          documentData: documents[normalizedHash],
          verificationTime: Date.now(),
          blockchainStored: documents[normalizedHash].blockchainStored || false,
          transactionHash: documents[normalizedHash].transactionHash
        };
      }
      
      // Search through all documents
      for (const [storedHash, doc] of Object.entries(documents)) {
        const normalizedStoredHash = normalizeHash(storedHash);
        if (normalizedStoredHash === normalizedHash) {
          return {
            isValid: true,
            status: doc.status,
            documentData: doc,
            verificationTime: Date.now(),
            blockchainStored: doc.blockchainStored || false,
            transactionHash: doc.transactionHash
          };
        }
      }
      
      return {
        isValid: false,
        status: 'not_found',
        documentData: null,
        verificationTime: Date.now(),
        blockchainStored: false
      };
    } catch (error: any) {
      console.error('❌ Error verifying document:', error);
      return {
        isValid: false,
        status: 'error',
        documentData: null,
        verificationTime: Date.now(),
        blockchainStored: false,
        error: error.message
      };
    }
  }

  // Method to manually clean up old 0x-prefixed keys
  cleanupOldKeys(): boolean {
    try {
      const documents = this.getStoredDocuments();
      let cleaned = false;
      
      for (const key of Object.keys(documents)) {
        if (key.startsWith('0x')) {
          const normalizedKey = normalizeHash(key);
          if (normalizedKey.length === 64) {
            // Move document to normalized key
            documents[normalizedKey] = {
              ...documents[key],
              hash: normalizedKey,
              cleanedUp: true
            };
            delete documents[key];
            cleaned = true;
          }
        }
      }
      
      if (cleaned) {
        localStorage.setItem('docverify_documents', JSON.stringify(documents));
        
        window.dispatchEvent(new CustomEvent('documentStatsChanged', {
          detail: { action: 'cleanup' }
        }));
      }
      
      return cleaned;
    } catch (error) {
      console.error('❌ Error cleaning up old keys:', error);
      return false;
    }
  }

  getRecentActivity(limit: number = 10): Array<{ id: string; type: string; message: string; timestamp: number; hash: string; status: string; localOnly: boolean; blockchainStored: boolean }> {
    try {
      const documents = this.getStoredDocuments();
      const activities: Array<{ id: string; type: string; message: string; timestamp: number; hash: string; status: string; localOnly: boolean; blockchainStored: boolean }> = [];
      
      Object.values(documents).forEach((doc, index) => {
        if (!doc || !doc.fileName) return; // Skip invalid documents
        
        const activity = {
          id: doc.transactionHash || doc.hash || `activity_${index}_${Date.now()}`,
          type: doc.status === 'verified' ? 'verification' : 'upload',
          message: doc.status === 'verified' 
            ? `Document "${doc.fileName}" verified successfully`
            : `Document "${doc.fileName}" uploaded (pending verification)`,
          timestamp: doc.verifiedAt || doc.timestamp || Date.now(),
          hash: (doc.transactionHash || doc.hash || '').substring(0, 10) + '...',
          status: doc.status,
          localOnly: doc.localOnly || false,
          blockchainStored: doc.blockchainStored || false
        };
        
        activities.push(activity);
      });
      
      return activities
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        .slice(0, limit);
    } catch (error) {
      console.error('❌ Error getting recent activity:', error);
      return [];
    }
  }

  findDocumentByHash(searchHash: string): StoredDocument | null {
    try {
      const normalizedSearchHash = normalizeHash(searchHash);
      const documents = this.getStoredDocuments();
      
      // Direct lookup first
      if (documents[normalizedSearchHash]) {
        return documents[normalizedSearchHash];
      }
      
      // Search all keys
      for (const [storedHash, doc] of Object.entries(documents)) {
        const normalizedStoredHash = normalizeHash(storedHash);
        if (normalizedStoredHash === normalizedSearchHash) {
          return doc;
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error finding document by hash:', error);
      return null;
    }
  }

  clearAllDocuments(): void {
    try {
      localStorage.removeItem('docverify_documents');
      window.dispatchEvent(new CustomEvent('documentStatsChanged', {
        detail: { action: 'clear' }
      }));
    } catch (error) {
      console.error('❌ Error clearing documents:', error);
    }
  }

  // Additional utility methods for better error handling
  isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      console.error('❌ localStorage not available:', error);
      return false;
    }
  }

  getStorageInfo(): { available: boolean; used: number; documentCount?: number; approximateTotal?: number } {
    try {
      if (!this.isStorageAvailable()) {
        return { available: false, used: 0 };
      }

      const documents = this.getStoredDocuments();
      const jsonString = JSON.stringify(documents);
      const used = new Blob([jsonString]).size;
      
      return {
        available: true,
        used: used,
        documentCount: Object.keys(documents).length,
        approximateTotal: 5 * 1024 * 1024 // ~5MB localStorage limit
      };
    } catch (error) {
      console.error('❌ Error getting storage info:', error);
      return { available: false, used: 0 };
    }
  }

  // Validate document integrity
  validateDocument(document: StoredDocument): boolean {
    try {
      if (!document) return false;
      if (!document.hash || !document.fileName) return false;
      if (!document.timestamp) return false;
      if (!document.status || !['pending', 'verified', 'failed'].includes(document.status)) return false;
      
      return true;
    } catch (error) {
      console.error('❌ Error validating document:', error);
      return false;
    }
  }

  // Repair corrupted documents
  repairDocuments(): boolean {
    try {
      const documents = this.getStoredDocuments();
      let repaired = false;
      
      for (const [hash, doc] of Object.entries(documents)) {
        if (!this.validateDocument(doc)) {
          // Try to repair common issues
          const repairedDoc: StoredDocument = {
            ...doc,
            hash: doc.hash || hash,
            fileName: doc.fileName || 'Unknown Document',
            timestamp: doc.timestamp || Date.now(),
            status: doc.status || 'pending'
          };
          
          if (this.validateDocument(repairedDoc)) {
            documents[hash] = repairedDoc;
            repaired = true;
          } else {
            // Remove irreparable documents
            delete documents[hash];
            repaired = true;
          }
        }
      }
      
      if (repaired) {
        localStorage.setItem('docverify_documents', JSON.stringify(documents));
        window.dispatchEvent(new CustomEvent('documentStatsChanged', {
          detail: { action: 'repair' }
        }));
      }
      
      return repaired;
    } catch (error) {
      console.error('❌ Error repairing documents:', error);
      return false;
    }
  }
}

export default DocumentService;