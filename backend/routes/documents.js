// routes/documents.js
const express = require('express');
const Document = require('../models/Document');
const router = express.Router();

// Get all documents for a user
router.get('/user/:walletAddress', async (req, res) => {
  try {
    const documents = await Document.find({ 
      userWalletAddress: req.params.walletAddress 
    }).sort({ createdAt: -1 });
    
    res.json({ success: true, documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get document stats for a user
router.get('/stats/:walletAddress', async (req, res) => {
  try {
    const userAddress = req.params.walletAddress;
    
    const totalDocuments = await Document.countDocuments({ userWalletAddress: userAddress });
    const verifiedDocuments = await Document.countDocuments({ 
      userWalletAddress: userAddress, 
      status: 'verified' 
    });
    const pendingDocuments = await Document.countDocuments({ 
      userWalletAddress: userAddress, 
      status: 'pending' 
    });
    
    res.json({
      success: true,
      stats: {
        totalDocuments,
        verifiedDocuments,
        pendingDocuments,
        totalVerifications: verifiedDocuments
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new document
router.post('/', async (req, res) => {
  try {
    const document = new Document(req.body);
    await document.save();
    res.status(201).json({ success: true, document });
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update document status to verified
router.put('/:documentHash/verify', async (req, res) => {
  try {
    const { documentHash } = req.params;
    const { userWalletAddress, verificationData } = req.body;
    
    const document = await Document.findOneAndUpdate(
      { 
        documentHash, 
        userWalletAddress,
        status: 'pending' 
      },
      { 
        status: 'verified',
        'verificationData.verifiedAt': new Date(),
        ...verificationData
      },
      { new: true }
    );
    
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        error: 'Document not found or already verified' 
      });
    }
    
    res.json({ success: true, document });
  } catch (error) {
    console.error('Error verifying document:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Check document status by hash
router.get('/status/:documentHash/:userWalletAddress', async (req, res) => {
  try {
    const { documentHash, userWalletAddress } = req.params;
    
    const document = await Document.findOne({ 
      documentHash, 
      userWalletAddress 
    });
    
    if (document) {
      res.json({
        success: true,
        exists: true,
        status: document.status,
        document
      });
    } else {
      res.json({
        success: true,
        exists: false,
        status: null,
        document: null
      });
    }
  } catch (error) {
    console.error('Error checking document status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get recent activity for user
router.get('/activity/:walletAddress/:limit?', async (req, res) => {
  try {
    const { walletAddress, limit = 10 } = req.params;
    
    const documents = await Document.find({ 
      userWalletAddress: walletAddress 
    })
    .sort({ 
      $or: [
        { 'verificationData.verifiedAt': -1 },
        { createdAt: -1 }
      ]
    })
    .limit(parseInt(limit));
    
    const activities = documents.map(doc => ({
      id: doc.transactionHash || doc._id,
      type: doc.status === 'verified' ? 'verification' : 'upload',
      message: doc.status === 'verified' 
        ? `Document "${doc.fileName}" verified successfully`
        : `Document "${doc.fileName}" uploaded (pending verification)`,
      timestamp: doc.verificationData?.verifiedAt || doc.createdAt,
      hash: (doc.transactionHash || doc.documentHash).substring(0, 10) + '...',
      status: doc.status,
      localOnly: doc.localOnly,
      blockchainStored: doc.blockchainStored
    }));
    
    res.json({ success: true, activities });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
