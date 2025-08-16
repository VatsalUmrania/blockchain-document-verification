// services/DocumentService.js
import { ethers } from 'ethers';
import { normalizeHash, createDocumentServiceHash } from './hashService';

class DocumentService {
  constructor(provider, signer) {
    this.provider = provider;
    this.signer = signer;
  }

  createDocumentHash(fileContent, fileName, metadata = {}) {
    return createDocumentServiceHash(fileContent, fileName, metadata);
  }

  /**
   * Migrate old documents with 0x keys to normalized keys
   */
  migrateDocumentKeys() {
    try {
      const stored = localStorage.getItem('docverify_documents');
      if (!stored) return;
      
      const documents = JSON.parse(stored);
      let migrated = false;
      
      const migratedDocs = {};
      
      for (const [key, doc] of Object.entries(documents)) {
        const normalizedKey = normalizeHash(key);
        
        if (normalizedKey !== key && normalizedKey.length === 64) {
          // This is a 0x-prefixed key that needs migration
          console.log(`🔄 Migrating key: ${key} → ${normalizedKey}`);
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
        console.log('✅ Document keys migrated successfully');
        
        // Dispatch event to refresh stats
        window.dispatchEvent(new CustomEvent('documentStatsChanged', {
          detail: { action: 'migrate' }
        }));
      }
      
    } catch (error) {
      console.error('❌ Error migrating document keys:', error);
    }
  }

  getStoredDocuments() {
    try {
      const stored = localStorage.getItem('docverify_documents');
      if (!stored) return {};
      
      const documents = JSON.parse(stored);
      
      // Auto-migrate on first access
      const hasOldKeys = Object.keys(documents).some(key => key.startsWith('0x'));
      if (hasOldKeys) {
        console.log('🔄 Auto-migrating old document keys...');
        this.migrateDocumentKeys();
        // Re-read after migration
        const migratedStored = localStorage.getItem('docverify_documents');
        return migratedStored ? JSON.parse(migratedStored) : {};
      }
      
      console.log('📋 Retrieved documents from localStorage:', Object.keys(documents));
      return documents;
    } catch (error) {
      console.error('Error retrieving stored documents:', error);
      return {};
    }
  }

  getDocumentStatus(documentHash) {
    const normalizedHash = normalizeHash(documentHash);
    const documents = this.getStoredDocuments();
    
    console.log('🔍 getDocumentStatus called with:', documentHash);
    console.log('🔍 Normalized to:', normalizedHash);
    console.log('📋 Available document hashes:', Object.keys(documents));
    
    // Direct lookup with normalized hash
    if (documents[normalizedHash]) {
      console.log('✅ Found document with normalized hash');
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
        console.log('✅ Found document after normalizing stored key');
        return {
          exists: true,
          status: doc.status,
          document: doc
        };
      }
    }
    
    console.log('❌ No document found for hash:', normalizedHash);
    return {
      exists: false,
      status: null,
      document: null
    };
  }

  markDocumentVerified(documentHash, verificationData = {}) {
    const normalizedHash = normalizeHash(documentHash);
    const documents = this.getStoredDocuments();
    
    console.log('🔄 markDocumentVerified called with:', documentHash);
    console.log('🔄 Normalized to:', normalizedHash);
    console.log('📋 Available documents:', Object.keys(documents));
    
    // Try to find the document
    let foundKey = null;
    let foundDoc = null;
    
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

    console.log('📄 Document BEFORE update:', foundDoc);
    
    // Update the document (always store with normalized key)
    const normalizedKey = normalizeHash(foundKey);
    
    // Remove old key if it was different
    if (foundKey !== normalizedKey) {
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

    console.log('📄 Document AFTER update:', documents[normalizedKey]);
    
    try {
      localStorage.setItem('docverify_documents', JSON.stringify(documents));
      
      // Dispatch custom event to notify React components
      window.dispatchEvent(new CustomEvent('documentStatsChanged', {
        detail: { action: 'verify', hash: normalizedKey }
      }));
      
      console.log('✅ Document marked as verified and event dispatched');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to save to localStorage:', error);
      return false;
    }
  }

  async storeDocumentAsPending(fileContent, fileName, metadata = {}) {
    const documentHash = this.createDocumentHash(fileContent, fileName, metadata);
    const normalizedHash = normalizeHash(documentHash); // Always normalize
    
    console.log('📤 Storing document with normalized hash:', normalizedHash);
    
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

    localStorage.setItem('docverify_documents', JSON.stringify(documents));
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('documentStatsChanged', {
      detail: { action: 'store', hash: normalizedHash }
    }));

    console.log(`📄 Document stored as pending: ${fileName} (${normalizedHash})`);
    
    return {
      success: true,
      documentHash: normalizedHash,
      status: 'pending'
    };
  }

  getDocumentStats() {
    const documents = this.getStoredDocuments();
    const documentArray = Object.values(documents);
    
    console.log('📊 Computing stats for documents:', documentArray.length);
    console.log('📊 Document statuses:', documentArray.map(d => ({ 
      name: d.fileName, 
      status: d.status,
      hash: d.hash?.substring(0, 10) + '...'
    })));
    
    const stats = {
      totalDocuments: documentArray.length,
      verifiedDocuments: documentArray.filter(doc => doc.status === 'verified').length,
      pendingDocuments: documentArray.filter(doc => doc.status === 'pending').length,
      totalVerifications: documentArray.filter(doc => doc.status === 'verified').length
    };

    console.log('📊 Computed stats:', stats);
    return stats;
  }

  async verifyDocument(fileContent, fileName) {
    const documentHash = this.createDocumentHash(fileContent, fileName);
    const normalizedHash = normalizeHash(documentHash);
    const documents = this.getStoredDocuments();
    
    console.log('🔍 verifyDocument called with generated hash:', normalizedHash);
    
    // Direct lookup
    if (documents[normalizedHash]) {
      console.log('✅ Document found in verifyDocument (direct)');
      return {
        isValid: true,
        status: documents[normalizedHash].status,
        documentData: documents[normalizedHash],
        verificationTime: Date.now(),
        blockchainStored: documents[normalizedHash].blockchainStored,
        transactionHash: documents[normalizedHash].transactionHash
      };
    }
    
    // Search through all documents
    for (const [storedHash, doc] of Object.entries(documents)) {
      const normalizedStoredHash = normalizeHash(storedHash);
      if (normalizedStoredHash === normalizedHash) {
        console.log('✅ Document found in verifyDocument (search)');
        return {
          isValid: true,
          status: doc.status,
          documentData: doc,
          verificationTime: Date.now(),
          blockchainStored: doc.blockchainStored,
          transactionHash: doc.transactionHash
        };
      }
    }
    
    console.log('❌ Document not found in verifyDocument');
    return {
      isValid: false,
      status: 'not_found',
      documentData: null,
      verificationTime: Date.now(),
      blockchainStored: false
    };
  }

  // Method to manually clean up old 0x-prefixed keys
  cleanupOldKeys() {
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
        console.log('✅ Old keys cleaned up successfully');
        
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

  // Rest of methods remain the same...
  getRecentActivity(limit = 10) {
    const documents = this.getStoredDocuments();
    const activities = [];
    
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
  }

  findDocumentByHash(searchHash) {
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
  }

  clearAllDocuments() {
    localStorage.removeItem('docverify_documents');
    window.dispatchEvent(new CustomEvent('documentStatsChanged', {
      detail: { action: 'clear' }
    }));
    console.log('🧹 All documents cleared from storage');
  }
  
}


export default DocumentService;
