const { db, FieldValue } = require('../config/firebase');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class User {
  constructor({
    id,
    username,
    email,
    password,
    role = 'user',
    avatar = '/default-avatar.png',
    favorites = [],
    playlists = [],
    isEmailVerified = false,
    lastLoginAt = null,
    loginAttempts = 0,
    accountLocked = false,
    accountLockedUntil = null,
    resetPasswordToken = null,
    resetPasswordExpires = null,
    twoFactorEnabled = false,
    twoFactorSecret = null,
    preferences = {},
    socialProfiles = {},
    status = 'active',
    createdAt = new Date(),
    updatedAt = new Date(),
  }) {
    this.id = id || uuidv4();
    this.username = username;
    this.email = email;
    this.password = password;
    this.role = role;
    this.avatar = avatar;
    this.favorites = favorites;
    this.playlists = playlists;
    this.isEmailVerified = isEmailVerified;
    this.lastLoginAt = lastLoginAt
      ? lastLoginAt instanceof Date
        ? lastLoginAt
        : lastLoginAt.toDate()
      : null;
    this.loginAttempts = loginAttempts;
    this.accountLocked = accountLocked;
    this.accountLockedUntil = accountLockedUntil
      ? accountLockedUntil instanceof Date
        ? accountLockedUntil
        : accountLockedUntil.toDate()
      : null;
    this.resetPasswordToken = resetPasswordToken;
    this.resetPasswordExpires = resetPasswordExpires
      ? resetPasswordExpires instanceof Date
        ? resetPasswordExpires
        : resetPasswordExpires.toDate()
      : null;
    this.twoFactorEnabled = twoFactorEnabled;
    this.twoFactorSecret = twoFactorSecret;
    this.preferences = preferences;
    this.socialProfiles = socialProfiles;
    this.status = status;
    this.createdAt = createdAt instanceof Date ? createdAt : createdAt?.toDate?.() || new Date();
    this.updatedAt = updatedAt instanceof Date ? updatedAt : updatedAt?.toDate?.() || new Date();
  }

  // Convert to plain object
  toJSON() {
    const { password, twoFactorSecret, resetPasswordToken, resetPasswordExpires, ...user } = this;
    return user;
  }

  // Hash password before saving
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  // Verify password
  async verifyPassword(password) {
    return await bcrypt.compare(password, this.password);
  }

  // Generate auth token
  generateAuthToken(additionalClaims = {}) {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      {
        userId: this.id,
        role: this.role,
        email: this.email,
        ...additionalClaims,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  // Generate refresh token
  generateRefreshToken() {
    const jwt = require('jsonwebtoken');
    return jwt.sign({ userId: this.id }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
    });
  }

  // Increment login attempts and lock account if needed
  async handleFailedLogin() {
    const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
    const LOCK_TIME = parseInt(process.env.ACCOUNT_LOCK_TIME) || 30 * 60 * 1000; // 30 minutes

    this.loginAttempts += 1;

    if (this.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      this.accountLocked = true;
      this.accountLockedUntil = new Date(Date.now() + LOCK_TIME);
    }

    await this.save();
  }

  // Reset login attempts on successful login
  async handleSuccessfulLogin() {
    if (this.loginAttempts > 0 || this.accountLocked) {
      this.loginAttempts = 0;
      this.accountLocked = false;
      this.accountLockedUntil = null;
      this.lastLoginAt = new Date();
      await this.save();
    } else {
      this.lastLoginAt = new Date();
      await this.save();
    }
  }

  // Check if account is locked
  isAccountLocked() {
    if (this.accountLocked && this.accountLockedUntil) {
      if (this.accountLockedUntil > new Date()) {
        return true; // Still locked
      }
      // Lock has expired
      this.accountLocked = false;
      this.accountLockedUntil = null;
      this.save();
    }
    return false;
  }

  // Generate password reset token
  generatePasswordResetToken() {
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    this.resetPasswordExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    return resetToken;
  }

  // Clear password reset token
  clearPasswordResetToken() {
    this.resetPasswordToken = undefined;
    this.resetPasswordExpires = undefined;
  }

  // Save user to Firestore
  async save() {
    const userData = { ...this };
    delete userData.id; // Don't save the id in the document data

    await db
      .collection('users')
      .doc(this.id)
      .set(
        {
          ...userData,
          updatedAt: FieldValue.serverTimestamp(),
          createdAt: this.createdAt || FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    return this;
  }

  // Find user by ID
  static async findById(id) {
    const doc = await db.collection('users').doc(id).get();
    if (!doc.exists) return null;
    return new User({ id: doc.id, ...doc.data() });
  }

  // Find user by email
  static async findByEmail(email) {
    const snapshot = await db.collection('users').where('email', '==', email).limit(1).get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return new User({ id: doc.id, ...doc.data() });
  }

  // Find user by credentials
  static async findByCredentials(email, password) {
    const user = await User.findByEmail(email);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (user.isAccountLocked()) {
      throw new Error('Account is temporarily locked. Please try again later.');
    }

    const isMatch = await user.verifyPassword(password);

    if (!isMatch) {
      await user.handleFailedLogin();
      throw new Error('Invalid email or password');
    }

    await user.handleSuccessfulLogin();
    return user;
  }

  // Find user by ID
  static async findById(id) {
    const userDoc = await db.collection('users').doc(id).get();
    if (!userDoc.exists) {
      return null;
    }
    return new User({ id: userDoc.id, ...userDoc.data() });
  }

  // Find user by email
  static async findOne({ email }) {
    const userRef = db.collection('users').where('email', '==', email).limit(1);
    const snapshot = await userRef.get();

    if (snapshot.empty) {
      return null;
    }

    const userDoc = snapshot.docs[0];
    return new User({ id: userDoc.id, ...userDoc.data() });
  }

  // Save user to Firestore
  async save() {
    const userRef = db.collection('users').doc(this.id);
    await userRef.set(
      {
        username: this.username,
        email: this.email,
        password: this.password,
        role: this.role,
        avatar: this.avatar,
        favorites: this.favorites,
        playlists: this.playlists,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return this;
  }

  // Delete user from Firestore
  async delete() {
    await db.collection('users').doc(this.id).delete();
  }

  // Add track to favorites
  async addToFavorites(trackId) {
    if (!this.favorites.includes(trackId)) {
      this.favorites.push(trackId);
      await db
        .collection('users')
        .doc(this.id)
        .update({
          favorites: FieldValue.arrayUnion(trackId),
          updatedAt: FieldValue.serverTimestamp(),
        });
    }
    return this;
  }

  // Remove track from favorites
  async removeFromFavorites(trackId) {
    if (this.favorites.includes(trackId)) {
      this.favorites = this.favorites.filter((id) => id !== trackId);
      await db
        .collection('users')
        .doc(this.id)
        .update({
          favorites: FieldValue.arrayRemove(trackId),
          updatedAt: FieldValue.serverTimestamp(),
        });
    }
    return this;
  }
}

module.exports = User;
