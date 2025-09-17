import * as jwt from 'jsonwebtoken';
import { config } from '../config/config';

export interface JWTPayload {
  userId: string;
  address: string;
  iat?: number;
  exp?: number;
}

export const generateToken = (userId: string, address: string): string => {
  if (!config.jwtSecret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  try {
    return jwt.sign(
      { userId, address },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
  } catch (error) {
    console.error('JWT generation failed:', error);
    throw new Error('Failed to generate authentication token');
  }
};

export const verifyToken = (token: string): JWTPayload => {
  if (!config.jwtSecret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.verify(token, config.jwtSecret) as JWTPayload;
};
