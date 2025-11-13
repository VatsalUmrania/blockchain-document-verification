require('dotenv').config();

const requiredEnv = (varName: string): string => {
  const value = process.env[varName];
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${varName}`);
  }
  return value;
};

const optionalEnv = (varName: string, defaultValue: string = ''): string => {
  return process.env[varName] || defaultValue;
};

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: optionalEnv('NODE_ENV', 'development'),
  mongoUri: requiredEnv('MONGO_URI'),
  jwtSecret: requiredEnv('JWT_SECRET'),
  jwtExpiresIn: optionalEnv('JWT_EXPIRES_IN', '7d') as string, // Explicitly typed as string
  sessionSecret: optionalEnv('SESSION_SECRET', requiredEnv('JWT_SECRET')),
  contractAddress: requiredEnv('CONTRACT_ADDRESS'),
  rpcUrl: requiredEnv('RPC_URL'),
  privateKey: optionalEnv('PRIVATE_KEY', ''),
  frontendUrl: optionalEnv('FRONTEND_URL', 'http://localhost:5173'),
  adminPrivateKey : requiredEnv('ADMIN_PRIVATE_KEY')
};
