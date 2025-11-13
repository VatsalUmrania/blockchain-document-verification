import { Request, Response } from 'express';
import { SiweMessage, generateNonce } from 'siwe';
import User, { UserRole } from '../models/User';
import { generateToken } from '../utils/jwt';
import { blockchainService } from '../services/blockchainService';

/**
 * @desc Generates a unique nonce for the SIWE message.
 * @route GET /api/auth/nonce
 * @access Public
 */
export const getNonce = (req: Request, res: Response) => {
  try {
    const nonce = generateNonce();
    req.session.nonce = nonce;
    
    console.log('📝 Nonce generated:', nonce);
    
    // Ensure the session is saved before sending the response
    req.session.save((err) => {
      if (err) {
        console.error('❌ Session save error:', err);
        return res.status(500).json({ 
          success: false,
          error: 'Failed to save session' 
        });
      }
      
      // Return JSON response
      res.json({ 
        success: true,
        nonce: req.session.nonce 
      });
    });
  } catch (error) {
    console.error('❌ Error generating nonce:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate nonce' 
    });
  }
};

/**
 * @desc Verifies a signed SIWE message, creates or updates a user, and returns a JWT.
 * @route POST /api/auth/verify
 * @access Public
 */
export const verify = async (req: Request, res: Response) => {
  try {
    console.log('🔐 === SIWE VERIFICATION START ===');
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    
    const { message, signature } = req.body;
    
    if (!message || !signature) {
      console.error('❌ Missing message or signature');
      return res.status(400).json({ 
        success: false,
        error: 'Message and signature are required.' 
      });
    }

    // Get nonce from session
    const nonce = req.session.nonce;
    console.log('🔑 Session nonce:', nonce);
    console.log('🔑 Session ID:', req.sessionID);
    
    if (!nonce) {
      console.error('❌ No nonce found in session');
      return res.status(400).json({ 
        success: false,
        error: 'No nonce found in session. Please request a new nonce.' 
      });
    }

    console.log('📝 Parsing SIWE message...');
    console.log('   Message type:', typeof message);
    console.log('   Message preview:', message.substring ? message.substring(0, 100) : 'Not a string');

    // Parse the SIWE message
    let siweMessage: SiweMessage;
    try {
      if (typeof message === 'string') {
        siweMessage = new SiweMessage(message);
      } else {
        siweMessage = new SiweMessage(message);
      }
      console.log('✅ SIWE message parsed successfully');
    } catch (parseError: any) {
      console.error('❌ Failed to parse SIWE message:', parseError);
      return res.status(400).json({
        success: false,
        error: 'Invalid SIWE message format',
        details: parseError.message
      });
    }

    console.log('🔐 Verifying signature...');
    console.log('   Address:', siweMessage.address);
    console.log('   Domain:', siweMessage.domain);
    console.log('   Nonce from message:', siweMessage.nonce);
    console.log('   Nonce from session:', nonce);

    // Verify the message signature and nonce
    let fields;
    try {
      fields = await siweMessage.verify({
        signature: signature,
        nonce: nonce,
      });
      console.log('✅ Signature verification result:', fields.success);
    } catch (verifyError: any) {
      console.error('❌ Signature verification failed:', verifyError);
      return res.status(401).json({
        success: false,
        error: 'Signature verification failed',
        details: verifyError.message
      });
    }

    if (!fields.success) {
      console.error('❌ Signature verification returned false');
      return res.status(401).json({ 
        success: false,
        error: 'Invalid signature' 
      });
    }

    console.log('✅ Signature verified for address:', fields.data.address);

    const userAddress = fields.data.address.toLowerCase();
    console.log('👤 Normalized address:', userAddress);
    
    // Check the blockchain for the user's role
    console.log('🔗 Checking blockchain for institution verification...');
    let isInstitute = false;
    try {
      isInstitute = await blockchainService.isInstitutionVerified(userAddress);
      console.log('✅ Blockchain check complete. Is institution:', isInstitute);
    } catch (blockchainError: any) {
      console.error('⚠️  Blockchain check failed, defaulting to Individual:', blockchainError.message);
    }
    
    const userRole = isInstitute ? UserRole.INSTITUTE : UserRole.INDIVIDUAL;
    console.log('📊 User role determined:', userRole);

    // Find or create user
    console.log('💾 Looking up user in database...');
    let user = await User.findOne({ address: userAddress });

    if (!user) {
      console.log('📝 Creating new user...');
      try {
        user = new User({
          address: userAddress,
          role: userRole,
          ensName: fields.data.address,
          lastLoginAt: new Date(),
        });
        await user.save();
        console.log('✅ New user created:', user._id);
      } catch (dbError: any) {
        console.error('❌ Failed to create user:', dbError);
        return res.status(500).json({
          success: false,
          error: 'Failed to create user',
          details: dbError.message
        });
      }
    } else {
      console.log('📝 Updating existing user:', user._id);
      try {
        user.role = userRole;
        user.lastLoginAt = new Date();
        await user.save();
        console.log('✅ User updated');
      } catch (dbError: any) {
        console.error('❌ Failed to update user:', dbError);
        return res.status(500).json({
          success: false,
          error: 'Failed to update user',
          details: dbError.message
        });
      }
    }
    
    console.log('🎟️  Generating JWT token...');
    console.log('   User ID:', user._id.toString());
    console.log('   Address:', user.address);
    console.log('   Role:', user.role);

    // Generate JWT token
    let token;
    try {
      token = generateToken(
        user._id.toString(),
        user.address,
        user.role
      );
      console.log('✅ JWT token generated successfully');
    } catch (tokenError: any) {
      console.error('❌ Failed to generate token:', tokenError);
      return res.status(500).json({
        success: false,
        error: 'Failed to generate authentication token',
        details: tokenError.message
      });
    }

    // Clear the used nonce from session
    console.log('🧹 Clearing used nonce from session...');
    delete req.session.nonce;

    console.log('✅ === SIWE VERIFICATION COMPLETE ===');

    // Send success response
    return res.status(200).json({ 
      success: true,
      token, 
      user: {
        id: user._id.toString(),
        address: user.address,
        role: user.role,
        ensName: user.ensName,
        lastLoginAt: user.lastLoginAt
      }
    });

  } catch (error: any) {
    console.error('❌ === SIWE VERIFICATION ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      success: false,
      error: 'Login verification failed.', 
      details: error.message 
    });
  }
};

/**
 * @desc Gets the profile of the currently authenticated user.
 * @route GET /api/auth/me
 * @access Private
 */
export const getMe = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: 'Not authenticated' 
      });
    }

    const user = await User.findById(req.user.id).select('-__v'); 
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    
    res.status(200).json({ 
      success: true,
      user: user.toObject() 
    });
  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch user profile' 
    });
  }
};

/**
 * @desc Logs the user out by destroying the session.
 * @route POST /api/auth/logout
 * @access Public
 */
export const logout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('❌ Logout error:', err);
      return res.status(500).json({ 
        success: false,
        error: 'Could not log out.' 
      });
    }
    
    console.log('✅ User logged out successfully');
    res.status(200).json({ 
      success: true,
      message: 'Logged out successfully' 
    });
  });
};

// Export all functions
export default {
  getNonce,
  verify,
  getMe,
  logout
};
