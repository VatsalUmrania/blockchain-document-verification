import CryptoJS from 'crypto-js';

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
        const fileHash = CryptoJS.SHA256(wordArray).toString();
        
        resolve({
          hash: fileHash, // Use file hash only for verification
          fullHash: CryptoJS.SHA256(wordArray.concat(CryptoJS.enc.Utf8.parse(JSON.stringify(sortedMetadata)))).toString(),
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

// Enhanced verification function with better error handling
export const verifyDocumentHash = async (file, expectedHash, options = {}) => {
  try {
    console.log('Starting verification for:', file.name);
    console.log('Expected hash:', expectedHash);
    
    const result = await generateDocumentHash(file, options.originalMetadata || {});
    
    console.log('Generated hash:', result.hash);
    console.log('Generated full hash:', result.fullHash);
    
    // Try multiple hash comparison strategies
    const strategies = [
      { name: 'File Content Only', hash: result.hash },
      { name: 'File + Metadata', hash: result.fullHash }
    ];
    
    let matchFound = false;
    let matchingStrategy = null;
    
    for (const strategy of strategies) {
      if (strategy.hash === expectedHash) {
        matchFound = true;
        matchingStrategy = strategy.name;
        break;
      }
    }
    
    return {
      isValid: matchFound,
      generatedHash: result.hash,
      generatedFullHash: result.fullHash,
      expectedHash,
      matchingStrategy,
      metadata: result.metadata,
      strategies: strategies,
      debugInfo: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        timestamp: Date.now()
      }
    };
  } catch (error) {
    console.error('Hash verification error:', error);
    return {
      isValid: false,
      error: error.message,
      generatedHash: null,
      expectedHash,
      debugInfo: {
        fileName: file?.name || 'Unknown',
        fileSize: file?.size || 0,
        error: error.message
      }
    };
  }
};

// Utility function to compare two files
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
