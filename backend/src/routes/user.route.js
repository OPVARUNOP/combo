const express = require('express');
const router = express.Router();
const database = require('../services/database.service');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { validate, registerRules, loginRules } = require('../middleware/validation.middleware');
const ApiResponse = require('../utils/apiResponse');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const SALT_ROUNDS = 10;

router.post('/register', validate(registerRules()), async (req, res) => {
  const apiResponse = new ApiResponse(res);

  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUsers = await database.findUserByEmail(email);
    if (existingUsers.length > 0) {
      return apiResponse.error('Email already in use', 400);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create the user
    const user = await database.createUser({
      email,
      name,
      password: hashedPassword,
      role: 'user',
      isActive: true
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Don't send password in response
    const { password: _, ...userWithoutPassword } = user;

    apiResponse.created({
      user: userWithoutPassword,
      token
    }, 'User registered successfully');
  } catch (error) {
    console.error('Registration error:', error);
    apiResponse.serverError('Registration failed');
  }
});

router.post('/login', validate(loginRules()), async (req, res) => {
  const apiResponse = new ApiResponse(res);

  try {
    const { email, password } = req.body;

    // Find user by email
    const users = await database.findUserByEmail(email);
    if (users.length === 0) {
      return apiResponse.unauthorized('Invalid credentials');
    }

    const user = users[0];

    // Check if user is active
    if (!user.isActive) {
      return apiResponse.unauthorized('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return apiResponse.unauthorized('Invalid credentials');
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Don't send password in response
    const { password: _, ...userWithoutPassword } = user;

    apiResponse.success({
      user: userWithoutPassword,
      token
    }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    apiResponse.serverError('Login failed');
  }
});

router.get('/me', authenticate, (req, res) => {
  const apiResponse = new ApiResponse(res);
  const { password, ...userWithoutPassword } = req.user;
  apiResponse.success(userWithoutPassword, 'User profile retrieved successfully');
});

router.put('/me', authenticate, async (req, res) => {
  const apiResponse = new ApiResponse(res);

  try {
    const { name, email } = req.body;

    // Check if email is already taken by another user
    if (email && email !== req.user.email) {
      const existingUsers = await database.findUserByEmail(email);
      if (existingUsers.length > 0) {
        return apiResponse.error('Email already in use', 400);
      }
    }

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;

    await database.updateUser(req.user.id, updates);

    // Get updated user
    const updatedUser = await database.getUser(req.user.id);
    const { password, ...userWithoutPassword } = updatedUser;

    apiResponse.success(userWithoutPassword, 'Profile updated successfully');
  } catch (error) {
    console.error('Profile update error:', error);
    apiResponse.serverError('Failed to update profile');
  }
});

router.get('/', authenticate, authorize(['admin']), async (req, res) => {
  const apiResponse = new ApiResponse(res);

  try {
    const users = await database.list('users');
    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    apiResponse.success(usersWithoutPasswords, 'Users retrieved successfully');
  } catch (error) {
    console.error('Get users error:', error);
    apiResponse.serverError('Failed to retrieve users');
  }
});

module.exports = router;
