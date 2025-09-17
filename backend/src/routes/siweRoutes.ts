import * as express from 'express';
import { generateNonce, siweLogin, logout } from '../controllers/siweController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/nonce', generateNonce);
router.post('/login', siweLogin);
router.post('/logout', authenticateToken, logout);

export default router;
