import CryptoJS from 'crypto-js';

export const generateDocumentHash = (file, metadata = {}) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const arrayBuffer = event.target.result;
        const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
        
        // Include metadata in hash
        const metadataString = JSON.stringify({
          name: metadata.name || file.name,
          size: file.size,
          type: file.type,
          timestamp: metadata.timestamp || Date.now(),
          description: metadata.description || '',
        });
        
        const combinedData = wordArray.concat(CryptoJS.enc.Utf8.parse(metadataString));
        const hash = CryptoJS.SHA256(combinedData).toString();
        
        resolve({
          hash,
          metadata: JSON.parse(metadataString),
          file: {
            name: file.name,
            size: file.size,
            type: file.type,
          }
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

export const verifyDocumentHash = async (file, expectedHash) => {
  try {
    const result = await generateDocumentHash(file);
    return {
      isValid: result.hash === expectedHash,
      generatedHash: result.hash,
      expectedHash,
      metadata: result.metadata
    };
  } catch (error) {
    console.error('Hash verification error:', error);
    return {
      isValid: false,
      error: error.message
    };
  }
};
