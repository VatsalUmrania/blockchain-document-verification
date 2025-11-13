import express = require('express');
import session = require('express-session');
import cors = require('cors');
import { config } from './config/config';
import siweRoutes from './routes/siweRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import adminRoutes from './routes/adminRoutes';

const app = express();

// --- MIDDLEWARE SETUP ---

// 1. Enable CORS
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));

// 2. Enable JSON body parsing
app.use(express.json());

// 3. Enable Session Middleware
app.use(session({
  name: 'siwe-session',
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: config.nodeEnv === 'production',
    sameSite: 'lax' 
  },
}));

// --- TYPE DEFINITIONS for Express ---
declare module 'express-session' {
  interface SessionData {
    nonce?: string;
  }
}
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        address: string;
        role: string;
      };
    }
  }
}

// --- ROUTES ---
app.get('/', (req, res) => {
  res.send('Welcome to the Blockchain Document Verification API');
});

// All authentication routes are prefixed with /api/auth
app.use('/api/auth', siweRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

export default app;
