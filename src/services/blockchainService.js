// services/blockchainService.js
import { ethers } from 'ethers';

class BlockchainService {
  constructor(provider, signer) {
    this.provider = provider;
    this.signer = signer;
  }

  // Create document hash
  createDocumentHash(fileContent) {
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(fileContent));
  }

  // Store document hash on blockchain (simplified - you'd deploy a smart contract)
  async storeDocumentHash(documentHash, metadata) {
    try {
      // For now, we'll create a transaction with the hash in the data field
      const tx = await this.signer.sendTransaction({
        to: await this.signer.getAddress(), // Send to self
        value: ethers.utils.parseEther('0'), // No ETH transfer
        data: ethers.utils.hexlify(ethers.utils.toUtf8Bytes(
          JSON.stringify({
            type: 'DOCUMENT_UPLOAD',
            hash: documentHash,
            timestamp: Date.now(),
            metadata
          })
        ))
      });

      await tx.wait(); // Wait for confirmation
      return tx.hash;
    } catch (error) {
      console.error('Error storing document hash:', error);
      throw error;
    }
  }

  // Verify document against blockchain
  async verifyDocument(documentHash) {
    // In a real implementation, you'd query your smart contract
    // For now, we'll simulate verification
    try {
      const currentTime = Date.now();
      return {
        isValid: true,
        timestamp: currentTime - Math.random() * 86400000, // Random time within last day
        verificationHash: ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes(documentHash + currentTime)
        )
      };
    } catch (error) {
      console.error('Error verifying document:', error);
      return { isValid: false, timestamp: null, verificationHash: null };
    }
  }

  // Get document activity from transaction history
  async getDocumentActivity(transactions) {
    const activities = [];
    
    for (const tx of transactions) {
      try {
        // Try to decode transaction data
        if (tx.data && tx.data !== '0x') {
          const decodedData = ethers.utils.toUtf8String(tx.data);
          const parsedData = JSON.parse(decodedData);
          
          if (parsedData.type === 'DOCUMENT_UPLOAD') {
            activities.push({
              id: tx.hash,
              type: 'upload',
              message: `Document uploaded to blockchain`,
              timestamp: parsedData.timestamp,
              hash: tx.hash,
              documentHash: parsedData.hash,
              metadata: parsedData.metadata
            });
          }
        }
      } catch (error) {
        // Ignore transactions that aren't document-related
        continue;
      }
    }
    
    return activities;
  }
}

export default BlockchainService;
