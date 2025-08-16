// services/hashService.js
import CryptoJS from 'crypto-js';

/**
 * Normalize hash by removing '0x' prefix if present and converting to lowercase
 */
export const normalizeHash = (hash) => {
  if (!hash) return '';
  let normalized = hash.toString().toLowerCase();
  return normalized.startsWith('0x') ? normalized.slice(2) : normalized;
};

/**
 * Generate document hash with proper normalization
 */
export const generateDocumentHash = (file, metadata = {}) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const arrayBuffer = event.target.result;
        const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
        
        // Create consistent metadata object (order matters for hash consistency)
        const consistentMetadata = {
          name: file.name, // Always use actual file name
          size: file.size, // Always use actual file size
          type: file.type, // Always use actual file type
          timestamp: metadata.timestamp || Date.now(),
          // Only include user-provided metadata if it exists
          ...(metadata.description && { description: metadata.description }),
          ...(metadata.category && { category: metadata.category }),
          ...(metadata.uploader && { uploader: metadata.uploader })
        };
        
        // Sort metadata keys to ensure consistent ordering
        const sortedMetadata = Object.keys(consistentMetadata)
          .sort()
          .reduce((result, key) => {
            result[key] = consistentMetadata[key];
            return result;
          }, {});
        
        // Create hash from file content only (more reliable)
        const rawFileHash = CryptoJS.SHA256(wordArray).toString();
        const rawFullHash = CryptoJS.SHA256(
          wordArray.concat(CryptoJS.enc.Utf8.parse(JSON.stringify(sortedMetadata)))
        ).toString();
        
        // Normalize all hashes to ensure 64-character format
        const fileHash = normalizeHash(rawFileHash);
        const fullHash = normalizeHash(rawFullHash);
        
        resolve({
          hash: fileHash, // Use file hash only for verification (64 chars)
          fullHash: fullHash, // File + metadata hash (64 chars)
          metadata: sortedMetadata,
          fileOnly: true,
          file: {
            name: file.name,
            size: file.size,
            type: file.type,
          }
        });
      } catch (error) {
        console.error('Hash generation error:', error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error('File reading error:', error);
      reject(error);
    };
    
    // Read as ArrayBuffer for consistent binary data
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Enhanced verification function with proper hash normalization
 */
export const verifyDocumentHash = async (file, expectedHash, options = {}) => {
  try {
    console.log('🔍 Starting verification for:', file.name);
    console.log('📝 Expected hash:', expectedHash);
    
    // Normalize expected hash first
    const normalizedExpectedHash = normalizeHash(expectedHash);
    console.log('📝 Normalized expected hash:', normalizedExpectedHash, `(${normalizedExpectedHash.length} chars)`);
    
    const result = await generateDocumentHash(file, options.originalMetadata || {});
    
    console.log('🔢 Generated hash:', result.hash, `(${result.hash.length} chars)`);
    console.log('🔢 Generated full hash:', result.fullHash, `(${result.fullHash.length} chars)`);
    
    // Try multiple hash comparison strategies with normalized hashes
    const strategies = [
      { name: 'file_content_only', hash: result.hash, description: 'File Content Only' },
      { name: 'file_with_metadata', hash: result.fullHash, description: 'File + Metadata' }
    ];
    
    let matchFound = false;
    let matchingStrategy = null;
    
    for (const strategy of strategies) {
      if (strategy.hash === normalizedExpectedHash) {
        matchFound = true;
        matchingStrategy = strategy.name;
        console.log(`✅ Match found using strategy: ${strategy.description}`);
        break;
      }
    }
    
    if (!matchFound) {
      console.log('❌ No matching strategy found');
      console.log('🔍 Hash comparison details:');
      strategies.forEach(strategy => {
        console.log(`   ${strategy.description}: ${strategy.hash}`);
      });
    }
    
    return {
      isValid: matchFound,
      generatedHash: result.hash,
      generatedFullHash: result.fullHash,
      expectedHash: normalizedExpectedHash,
      originalExpectedHash: expectedHash,
      matchingStrategy: matchingStrategy,
      metadata: result.metadata,
      strategies: strategies.map(s => ({ name: s.name, hash: s.hash, description: s.description })),
      debugInfo: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        expectedHashLength: normalizedExpectedHash.length,
        generatedHashLength: result.hash.length,
        hadPrefix: expectedHash.toLowerCase().startsWith('0x'),
        timestamp: Date.now()
      }
    };
  } catch (error) {
    console.error('Hash verification error:', error);
    return {
      isValid: false,
      error: error.message,
      generatedHash: null,
      expectedHash: normalizeHash(expectedHash),
      originalExpectedHash: expectedHash,
      debugInfo: {
        fileName: file?.name || 'Unknown',
        fileSize: file?.size || 0,
        error: error.message
      }
    };
  }
};

/**
 * Utility function to compare two files
 */
export const compareFiles = async (file1, file2) => {
  try {
    const [hash1, hash2] = await Promise.all([
      generateDocumentHash(file1),
      generateDocumentHash(file2)
    ]);
    
    return {
      identical: hash1.hash === hash2.hash,
      hash1: hash1.hash,
      hash2: hash2.hash,
      file1Info: hash1.file,
      file2Info: hash2.file
    };
  } catch (error) {
    return {
      identical: false,
      error: error.message
    };
  }
};

/**
 * Create a consistent hash for DocumentService integration
 */
export const createDocumentServiceHash = (fileContent, fileName, metadata = {}) => {
  const documentData = {
    contentSample: fileContent.substring(0, 1000), // First 1KB for consistency
    fileName: fileName,
    timestamp: Date.now(),
    metadata: {
      category: metadata.category || 'general',
      uploader: metadata.uploader || 'unknown'
    }
  };
  
  // Create hash and normalize it
  const rawHash = CryptoJS.SHA256(JSON.stringify(documentData)).toString();
  return normalizeHash(rawHash);
};

/**
 * Validate hash format
 */
export const validateHashFormat = (hash) => {
  const normalized = normalizeHash(hash);
  return {
    isValid: /^[a-f0-9]{64}$/i.test(normalized),
    length: normalized.length,
    normalized: normalized,
    hadPrefix: hash?.toLowerCase().startsWith('0x')
  };
};
