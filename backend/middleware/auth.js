import jwt from 'jsonwebtoken';
import User from '../models/user_model.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
    let token;

    // Check for token in cookies
    if (req.cookies && req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ error: 'Not authorized, no token' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from token
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ error: 'Not authorized, user not found' });
        }

        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({ error: 'Not authorized, token failed' });
    }
};

// Admin middleware
export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Not authorized as admin' });
    }
};

// Optional auth middleware - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
    let token;

    // Check for token in cookies
    if (req.cookies && req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token
            req.user = await User.findById(decoded.id).select('-password');
        } catch (error) {
            // Token is invalid, but we don't fail the request
            console.error('Optional auth token verification error:', error);
        }
    }

    next();
};
