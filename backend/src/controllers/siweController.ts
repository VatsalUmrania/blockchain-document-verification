import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/User';
import { Session } from '../models/Session';
import { generateToken } from '../utils/jwt';

// Add ethers import with fallback
let ethers: any;
try {
  ethers = require('ethers');
} catch (error) {
  console.error('Failed to import ethers:', error);
}

// Custom SIWE message parser for backend
interface ParsedSiweMessage {
  domain: string;
  address: string;
  statement: string;
  uri: string;
  version: string;
  chainId: number;
  nonce: string;
  issuedAt: string;
}

const parseSiweMessage = (messageString: string): ParsedSiweMessage | null => {
  try {
    const lines = messageString.split('\n').map(line => line.trim());
    
    // Parse header
    const headerMatch = lines[0].match(/^(.+) wants you to sign in with your Ethereum account:$/);
    if (!headerMatch) {
      console.error('Header parsing failed:', lines[0]);
      return null;
    }
    
    const domain = headerMatch[1];
    const address = lines[1];
    
    // Find statement (optional)
    let statement = '';
    let bodyStartIndex = 2;
    
    // Skip empty line after address
    while (bodyStartIndex < lines.length && lines[bodyStartIndex] === '') {
      bodyStartIndex++;
    }
    
    // Check if next line is statement (not starting with known prefixes)
    if (bodyStartIndex < lines.length && 
        !lines[bodyStartIndex].startsWith('URI:') &&
        !lines[bodyStartIndex].startsWith('Version:') &&
        lines[bodyStartIndex] !== '') {
      statement = lines[bodyStartIndex];
      bodyStartIndex++;
    }
    
    // Skip another empty line
    while (bodyStartIndex < lines.length && lines[bodyStartIndex] === '') {
      bodyStartIndex++;
    }
    
    // Parse body
    const bodyLines = lines.slice(bodyStartIndex);
    const params: any = { domain, address, statement };
    
    bodyLines.forEach(line => {
      if (line.startsWith('URI: ')) params.uri = line.substring(5);
      else if (line.startsWith('Version: ')) params.version = line.substring(9);
      else if (line.startsWith('Chain ID: ')) params.chainId = parseInt(line.substring(10));
      else if (line.startsWith('Nonce: ')) params.nonce = line.substring(7);
      else if (line.startsWith('Issued At: ')) params.issuedAt = line.substring(11);
    });
    
    // Validate required fields
    if (!params.domain || !params.address || !params.uri || !params.version || 
        !params.chainId || !params.nonce || !params.issuedAt) {
      console.error('Missing required fields:', params);
      return null;
    }
    
    return params as ParsedSiweMessage;
  } catch (error) {
    console.error('Error parsing SIWE message:', error);
    return null;
  }
};

const verifySiweSignature = (message: string, signature: string, expectedAddress: string): boolean => {
  try {
    if (!ethers) {
      console.error('Ethers not available for signature verification');
      return false;
    }
    
    const recoveredAddress = ethers.verifyMessage(message, signature);
    const isValid = recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    
    console.log('Signature verification:', {
      expected: expectedAddress.toLowerCase(),
      recovered: recoveredAddress.toLowerCase(),
      isValid
    });
    
    return isValid;
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
};

export const generateNonce = async (req: Request, res: Response) => {
  try {
    const nonce = uuidv4();
    
    console.log('📤 Generated nonce:', nonce);
    
    // Store nonce in session with 10 minutes expiry
    await Session.create({
      userId: 'temp',
      nonce,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    res.json({ nonce });
  } catch (error) {
    console.error('❌ Nonce generation error:', error);
    res.status(500).json({ error: 'Failed to generate nonce' });
  }
};

export const siweLogin = async (req: Request, res: Response) => {
  try {
    console.log('📥 SIWE login request received');
    console.log('Request body keys:', Object.keys(req.body));
    
    const { message, signature, address } = req.body;

    if (!message || !signature || !address) {
      console.error('Missing fields:', { 
        hasMessage: !!message, 
        hasSignature: !!signature, 
        hasAddress: !!address 
      });
      return res.status(400).json({ 
        error: 'Missing required fields: message, signature, address' 
      });
    }

    // Normalize address to checksum format
    let checksumAddress: string;
    try {
      if (!ethers) {
        throw new Error('Ethers library not available');
      }
      checksumAddress = ethers.getAddress(address.toLowerCase());
      console.log('✅ Address normalized:', checksumAddress);
    } catch (error) {
      console.error('Address normalization failed:', error);
      return res.status(400).json({ error: 'Invalid Ethereum address format' });
    }

    console.log('📝 Parsing SIWE message...');
    console.log('Message length:', message.length);
    console.log('Message preview:', message.substring(0, 200));
    
    // Parse SIWE message using custom parser
    const parsedMessage = parseSiweMessage(message);
    if (!parsedMessage) {
      console.error('❌ Message parsing failed');
      return res.status(400).json({ 
        error: 'Invalid SIWE message format' 
      });
    }

    console.log('✅ Message parsed successfully:', {
      domain: parsedMessage.domain,
      address: parsedMessage.address,
      nonce: parsedMessage.nonce,
      chainId: parsedMessage.chainId
    });

    // Verify the signature
    const isValidSignature = verifySiweSignature(message, signature, checksumAddress);
    if (!isValidSignature) {
      console.error('❌ Signature verification failed');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    console.log('✅ Signature verified successfully');

    // Check if nonce exists and is not used
    const session = await Session.findOne({ 
      nonce: parsedMessage.nonce, 
      isUsed: false 
    });

    if (!session) {
      console.error('❌ Nonce not found:', parsedMessage.nonce);
      return res.status(400).json({ error: 'Invalid nonce' });
    }

    if (session.expiresAt < new Date()) {
      console.error('❌ Nonce expired:', { 
        expiresAt: session.expiresAt, 
        now: new Date() 
      });
      return res.status(400).json({ error: 'Expired nonce' });
    }

    // Mark nonce as used
    session.isUsed = true;
    await session.save();
    console.log('✅ Nonce validated and marked as used');

    // Find or create user with checksummed address
    let user = await User.findOne({ address: checksumAddress.toLowerCase() });
    
    if (!user) {
      user = await User.create({
        address: checksumAddress.toLowerCase(),
        nonce: uuidv4(),
        lastLoginAt: new Date()
      });
      console.log('✅ New user created:', user._id);
    } else {
      user.lastLoginAt = new Date();
      user.nonce = uuidv4();
      await user.save();
      console.log('✅ Existing user updated:', user._id);
    }

    // Generate JWT
    const token = generateToken(user._id.toString(), checksumAddress);

    console.log('🎉 SIWE login successful for:', checksumAddress);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        address: checksumAddress,
        ensName: user.ensName,
        lastLoginAt: user.lastLoginAt
      }
    });

  } catch (error) {
    console.error('❌ SIWE login error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Authentication failed', details: error.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};
