// routes/documents.js
const express = require("express");
const Document = require("../models/Document");
const auth = require("../middleware/auth");
const router = express.Router();

// Get all documents for a user (with auth middleware applied to this specific route)
router.get("/user/:walletAddress", auth, async (req, res) => {
  try {
    // Ensure user can only access their own documents
    if (req.user.walletAddress !== req.params.walletAddress) {
      return res.status(403).json({
        success: false,
        error: "Access denied. You can only access your own documents.",
      });
    }

    const documents = await Document.find({
      userWalletAddress: req.params.walletAddress,
    }).sort({ createdAt: -1 });

    res.json({ success: true, documents });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get document stats for a user
router.get("/stats/:walletAddress", auth, async (req, res) => {
  try {
    // Ensure user can only access their own stats
    if (req.user.walletAddress !== req.params.walletAddress) {
      return res.status(403).json({
        success: false,
        error: "Access denied. You can only access your own stats.",
      });
    }

    const userAddress = req.params.walletAddress;

    const totalDocuments = await Document.countDocuments({
      userWalletAddress: userAddress,
    });
    const verifiedDocuments = await Document.countDocuments({
      userWalletAddress: userAddress,
      status: "verified",
    });
    const pendingDocuments = await Document.countDocuments({
      userWalletAddress: userAddress,
      status: "pending",
    });

    res.json({
      success: true,
      stats: {
        totalDocuments,
        verifiedDocuments,
        pendingDocuments,
        totalVerifications: verifiedDocuments,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new document
router.post("/", auth, async (req, res) => {
  try {
    // Ensure user can only create documents for themselves
    if (req.user.walletAddress !== req.body.userWalletAddress) {
      return res.status(403).json({
        success: false,
        error: "Access denied. You can only create documents for yourself.",
      });
    }

    const document = new Document(req.body);
    await document.save();
    res.status(201).json({ success: true, document });
  } catch (error) {
    console.error("Error creating document:", error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update document status to verified
router.put("/:documentHash/verify", auth, async (req, res) => {
  try {
    const { documentHash } = req.params;
    const { userWalletAddress, verificationData } = req.body;

    // Ensure user can only verify their own documents
    if (req.user.walletAddress !== userWalletAddress) {
      return res.status(403).json({
        success: false,
        error: "Access denied. You can only verify your own documents.",
      });
    }

    const document = await Document.findOneAndUpdate(
      {
        documentHash,
        userWalletAddress,
        status: "pending",
      },
      {
        status: "verified",
        "verificationData.verifiedAt": new Date(),
        ...verificationData,
      },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or already verified",
      });
    }

    res.json({ success: true, document });
  } catch (error) {
    console.error("Error verifying document:", error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Check document status by hash (public route - no auth required)
router.get("/status/:documentHash/:userWalletAddress", async (req, res) => {
  try {
    const { documentHash, userWalletAddress } = req.params;

    // Allow anyone to check document status (public verification)
    const document = await Document.findOne({
      documentHash,
      userWalletAddress,
    });

    if (document) {
      res.json({
        success: true,
        exists: true,
        status: document.status,
        document,
      });
    } else {
      res.json({
        success: true,
        exists: false,
        status: null,
        document: null,
      });
    }
  } catch (error) {
    console.error("Error checking document status:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get recent activity for user (with optional limit parameter)
router.get("/activity/:walletAddress", auth, async (req, res) => {
  try {
    // Ensure user can only access their own activity
    if (req.user.walletAddress !== req.params.walletAddress) {
      return res.status(403).json({
        success: false,
        error: "Access denied. You can only access your own activity.",
      });
    }

    const walletAddress = req.params.walletAddress;
    // Get limit from query parameters instead of route parameters
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    const documents = await Document.find({
      userWalletAddress: walletAddress,
    })
      .sort({ createdAt: -1 }) // Fixed: Removed invalid $or operator from sort
      .limit(limit);

    const activities = documents.map((doc) => ({
      id: doc.transactionHash || doc._id,
      type: doc.status === "verified" ? "verification" : "upload",
      message:
        doc.status === "verified"
          ? `Document "${doc.fileName}" verified successfully`
          : `Document "${doc.fileName}" uploaded (pending verification)`,
      timestamp: doc.verificationData?.verifiedAt || doc.createdAt,
      hash: (doc.transactionHash || doc.documentHash).substring(0, 10) + "...",
      status: doc.status,
      localOnly: doc.localOnly,
      blockchainStored: doc.blockchainStored,
    }));

    res.json({ success: true, activities });
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
