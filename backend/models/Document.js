// models/Document.js
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userWalletAddress: {
    type: String,
    required: true,
    index: true
  },
  documentHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number
  },
  fileType: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'verified'],
    default: 'pending',
    index: true
  },
  metadata: {
    description: String,
    category: String,
    tags: [String],
    isPrivate: Boolean,
    uploadedVia: String
  },
  verificationData: {
    verifiedBy: String,
    verificationMethod: String,
    verifiedAt: Date,
    fileVerified: String
  },
  transactionHash: {
    type: String
  },
  blockchainStored: {
    type: Boolean,
    default: false
  },
  localOnly: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Create indexes for better performance
documentSchema.index({ userWalletAddress: 1, status: 1 });
documentSchema.index({ documentHash: 1, userWalletAddress: 1 });

module.exports = mongoose.model('Document', documentSchema);
