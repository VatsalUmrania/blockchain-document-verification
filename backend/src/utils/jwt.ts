import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/config';
import { UserRole } from '../models/User';

export interface JWTPayload {
  userId: string;
  address: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/**
 * Generate JWT token for authenticated user
 */
export const generateToken = (userId: string, address: string, role: UserRole): string => {
  if (!config.jwtSecret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  // Ensure userId is a string
  const userIdString = typeof userId === 'string' ? userId : String(userId);
  
  if (!userIdString || !address) {
    throw new Error('userId and address are required to generate token');
  }

  try {
    const payload: JWTPayload = { 
      userId: userIdString, 
      address: address.toLowerCase(), 
      role 
    };
    
    // Ensure expiresIn is a valid string
    const expiresIn = config.jwtExpiresIn && config.jwtExpiresIn.trim() !== '' 
      ? config.jwtExpiresIn 
      : '7d';  // Default to 7 days
    
    console.log('🔐 Generating token with payload:', payload);
    console.log('⏰ Token expires in:', expiresIn);
    
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: expiresIn as any });
    return token;
  } catch (error) {
    console.error('❌ JWT generation failed:', error);
    throw new Error('Failed to generate authentication token');
  }
};

/**
 * Verify and decode JWT token
 */
export const verifyToken = (token: string): JWTPayload => {
  if (!config.jwtSecret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  if (!token) {
    throw new Error('Token is required for verification');
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;
    
    // Ensure userId is a string
    if (typeof decoded.userId !== 'string') {
      throw new Error('Invalid token payload: userId must be a string');
    }
    
    return decoded;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      console.error('❌ JWT verification failed:', error);
      throw new Error('Token verification failed');
    }
  }
};

/**
 * Decode token without verification (useful for debugging)
 */
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('❌ JWT decode failed:', error);
    return null;
  }
};
