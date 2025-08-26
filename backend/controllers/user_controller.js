import User from '../models/user_model.js';
import generateToken from '../utils/generateToken.js';
import jwt from 'jsonwebtoken';

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
export async function register(req, res, next) {
    try {
        const { email, password, role = 'user' } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ 
                error: 'User already exists with this email' 
            });
        }

        // Create new user
        const user = await User.create({
            email,
            password,
            role
        });

        if (user) {
            // Generate JWT token
            generateToken(res, user._id);
            
            res.status(201).json({
                _id: user._id,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            });
        } else {
            res.status(400).json({ error: 'Invalid user data' });
        }
    } catch (e) {
        next(e);
    }
}

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
export async function login(req, res, next) {
    console.log(req.body);
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).json({ 
                error: 'Invalid email or password' 
            });
        }

        // Check if password matches
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ 
                error: 'Invalid email or password' 
            });
        }

        // Generate JWT token
        generateToken(res, user._id);

        res.json({
            _id: user._id,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        });
    } catch (e) {
        next(e);
    }
}

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Private
export async function logout(req, res, next) {
    try {
        res.cookie('jwt', '', {
            httpOnly: true,
            expires: new Date(0),
        });
        
        res.json({ message: 'Logged out successfully' });
    } catch (e) {
        next(e);
    }
}

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export async function getUser(req, res, next) {
    try {
        const user = await User.findById(req.user._id).select('-password');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (e) {
        next(e);
    }
}

// @desc    Get user by ID (admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
export async function getUserById(req, res, next) {
    try {
        const user = await User.findById(req.params.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (e) {
        next(e);
    }
}

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export async function updateUser(req, res, next) {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update fields
        user.email = req.body.email || user.email;
        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            email: updatedUser.email,
            role: updatedUser.role,
            createdAt: updatedUser.createdAt
        });
    } catch (e) {
        next(e);
    }
}

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
export async function getAllUsers(req, res, next) {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (e) {
        next(e);
    }
}

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export async function deleteUser(req, res, next) {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User removed successfully' });
    } catch (e) {
        next(e);
    }
}

