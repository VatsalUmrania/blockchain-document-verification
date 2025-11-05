import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import User, { UserRole } from '../models/User';

/**
 * Main authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        error: 'Authorization token required' 
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify and decode the token
    const decoded = verifyToken(token);
    
    // Debug log to see what we're getting
    console.log('🔍 Decoded token:', decoded);
    console.log('🔍 decoded.userId type:', typeof decoded.userId);
    console.log('🔍 decoded.userId value:', decoded.userId);
    
    // Handle both string and object cases (for backwards compatibility)
    let userId: string;
    
    if (typeof decoded.userId === 'string') {
      userId = decoded.userId;
    } else if (typeof decoded.userId === 'object' && decoded.userId !== null) {
      // If it's an object, try to extract the id
      userId = (decoded.userId as any).id || (decoded.userId as any)._id?.toString() || '';
      if (!userId) {
        console.error('❌ Could not extract userId from object:', decoded.userId);
        return res.status(401).json({ 
          success: false,
          error: 'Invalid token payload - userId is malformed' 
        });
      }
    } else {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token payload - userId is missing or malformed' 
      });
    }

    console.log('🔍 Final userId to query:', userId);

    // Validate MongoDB ObjectId format (24 hex characters)
    if (!/^[a-f\d]{24}$/i.test(userId)) {
      console.error('❌ Invalid MongoDB ObjectId format:', userId);
      return res.status(401).json({ 
        success: false,
        error: 'Invalid user ID format' 
      });
    }

    // Find the user in MongoDB by their userId from the token
    const user = await User.findById(userId);

    if (!user) {
      console.error('❌ User not found for ID:', userId);
      return res.status(401).json({ 
        success: false,
        error: 'User not found or token invalid' 
      });
    }

    // Update last login time (don't await to avoid blocking)
    user.lastLoginAt = new Date();
    user.save().catch(err => console.error('Failed to update lastLoginAt:', err));
    
    // Attach user information to the request object
    req.user = {
      id: user._id.toString(),
      address: user.address,
      role: user.role
    };

    console.log('✅ User authenticated:', req.user);
    next();
  } catch (error: any) {
    console.error('❌ Auth middleware error:', error);
    return res.status(401).json({ 
      success: false,
      error: error.message || 'Invalid or expired token' 
    });
  }
};

/**
 * Middleware to check if user has specific role(s)
 * Usage: app.get('/admin', authMiddleware, requireRole(UserRole.INSTITUTE), handler)
 */
export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required' 
      });
    }

    if (!roles.includes(req.user.role as UserRole)) {
      return res.status(403).json({ 
        success: false,
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
};

/**
 * Middleware specifically for institute-only routes
 * Usage: app.post('/issue-document', authMiddleware, requireInstitute, handler)
 */
export const requireInstitute = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      error: 'Authentication required' 
    });
  }

  if (req.user.role !== UserRole.INSTITUTE) {
    return res.status(403).json({ 
      success: false,
      error: 'Only verified institutions and individuals can access this resource',
      currentRole: req.user.role
  });
}


  next();
};

/**
 * Middleware for individual-only routes
 * Usage: app.get('/my-documents', authMiddleware, requireIndividual, handler)
 */
export const requireIndividual = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      error: 'Authentication required' 
    });
  }

  if (req.user.role !== UserRole.INDIVIDUAL) {
    return res.status(403).json({ 
      success: false,
      error: 'This resource is only accessible to individuals',
      currentRole: req.user.role
    });
  }

  next();
};

// ====================================================================
// 4. ADDED THIS NEW MIDDLEWARE
// ====================================================================
/**
 * Middleware specifically for admin-only routes
 * Usage: app.post('/admin/verify', authMiddleware, requireAdmin, handler)
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      error: 'Authentication required' 
    });
  }

  if (req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ 
      success: false,
      error: 'Administrator access only',
      currentRole: req.user.role
    });
  }

  next();
};

/**
 * Optional auth - doesn't fail if no token, but populates req.user if token exists
 * Usage: app.get('/public-with-optional-auth', optionalAuth, handler)
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      
      let userId: string;
      
      if (typeof decoded.userId === 'string') {
        userId = decoded.userId;
      } else if (typeof decoded.userId === 'object' && decoded.userId !== null) {
        userId = (decoded.userId as any).id || (decoded.userId as any)._id?.toString() || '';
      } else {
        // Invalid token format, but don't fail - just continue without user
        return next();
      }

      if (userId && /^[a-f\d]{24}$/i.test(userId)) {
        const user = await User.findById(userId);

        if (user) {
          req.user = {
            id: user._id.toString(),
            address: user.address,
            role: user.role
          };
        }
      }
    }

    next();
  } catch (error) {
    // Don't fail - just continue without user
    console.log('⚠️  Optional auth failed, continuing without user:', error);
    next();
  }
};

/**
 * Middleware to check if the authenticated user is the owner of a resource
 * Usage: app.get('/users/:id', authMiddleware, requireSelf, handler)
 */
export const requireSelf = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      error: 'Authentication required' 
    });
  }

  const resourceUserId = req.params.id || req.params.userId;

  if (!resourceUserId) {
    return res.status(400).json({ 
      success: false,
      error: 'User ID parameter is required' 
    });
  }

  if (req.user.id !== resourceUserId) {
    return res.status(403).json({ 
      success: false,
      error: 'You can only access your own resources' 
    });
  }

  next();
};

/**
 * Middleware to check if user is either the owner OR has a specific role
 * Usage: app.get('/users/:id', authMiddleware, requireSelfOrRole(UserRole.INSTITUTE), handler)
 */
export const requireSelfOrRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required' 
      });
    }

    const resourceUserId = req.params.id || req.params.userId;

    // Check if user is the owner
    const isSelf = resourceUserId && req.user.id === resourceUserId;

    // Check if user has required role
    const hasRole = roles.includes(req.user.role as UserRole);

    if (!isSelf && !hasRole) {
      return res.status(4403).json({ 
        success: false,
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
};

/**
 * Rate limiting middleware (optional - can be used with auth)
 * Usage: app.post('/api/resource', rateLimitByUser, handler)
 */
const userRequestCounts = new Map<string, { count: number; resetAt: number }>();

export const rateLimitByUser = (maxRequests: number = 100, windowMs: number = 60000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(); // Skip rate limiting for unauthenticated requests
    }

    const userId = req.user.id;
    const now = Date.now();

    const userLimit = userRequestCounts.get(userId);

    if (!userLimit || now > userLimit.resetAt) {
      // Reset or create new limit
      userRequestCounts.set(userId, {
        count: 1,
        resetAt: now + windowMs
      });
      return next();
    }

    if (userLimit.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((userLimit.resetAt - now) / 1000)
      });
    }

    userLimit.count++;
    next();
  };
};

// Export all middleware
export default {
  authMiddleware,
  requireRole,
  requireInstitute,
  requireIndividual,
  requireAdmin, // 5. ADDED to export
  optionalAuth,
  requireSelf,
  requireSelfOrRole,
  rateLimitByUser
};