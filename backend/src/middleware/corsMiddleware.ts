import cors from 'cors';
import { config } from '../config/config';

export const corsMiddleware = cors({
  origin: [config.frontendUrl, 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});