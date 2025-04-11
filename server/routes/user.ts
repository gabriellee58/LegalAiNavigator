import express from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { asyncHandler } from '../utils/asyncHandler';

const router = express.Router();
const scryptAsync = promisify(scrypt);

// Helper function for password hashing
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

// User profile update schema
const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  password: z.string().min(8).optional(),
  preferredLanguage: z.enum(['en', 'fr']).optional(),
});

type UpdateProfileData = z.infer<typeof updateProfileSchema>;

// Get current user
router.get('/', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  res.json(req.user);
});

// Update user profile
router.put('/profile', asyncHandler(async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  // Validate the request body
  const validationResult = updateProfileSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({
      message: 'Invalid data',
      errors: validationResult.error.errors,
    });
  }
  
  const updateData: UpdateProfileData = validationResult.data;
  const userId = req.user!.id;
  
  // If password is included, hash it
  if (updateData.password) {
    updateData.password = await hashPassword(updateData.password);
  }
  
  // Update the user
  const updatedUser = await storage.updateUser(userId, updateData);
  
  // Remove the password from the response
  const { password, ...userWithoutPassword } = updatedUser;
  
  res.json(userWithoutPassword);
}));

// Password reset request
router.post('/reset-password-request', asyncHandler(async (req, res) => {
  const email = req.body.email;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  
  // Check if user exists
  const user = await storage.getUserByUsername(email);
  if (!user) {
    // Don't reveal if the user exists for security reasons
    return res.status(200).json({ message: 'If your email is registered, you will receive a password reset link.' });
  }
  
  // Generate token
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // Token valid for 1 hour
  
  // Store token in the database
  await storage.createPasswordResetToken(user.id, token, expiresAt);
  
  // In a real app, send an email with the reset link
  // For this demo, just return the token in the response
  res.status(200).json({
    message: 'If your email is registered, you will receive a password reset link.',
    // This would be removed in production
    debug: {
      token,
      resetLink: `/auth/reset-password?token=${token}`
    }
  });
}));

// Reset password with token
router.post('/reset-password', asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  
  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required' });
  }
  
  // Validate password
  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }
  
  // Find token in the database
  const resetToken = await storage.getPasswordResetToken(token);
  
  if (!resetToken) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }
  
  // Check if token is expired
  if (new Date() > resetToken.expiresAt) {
    await storage.deletePasswordResetToken(token);
    return res.status(400).json({ message: 'Token has expired' });
  }
  
  // Hash the new password
  const hashedPassword = await hashPassword(newPassword);
  
  // Update the user's password
  await storage.updateUser(resetToken.userId, { password: hashedPassword });
  
  // Delete the used token
  await storage.deletePasswordResetToken(token);
  
  res.status(200).json({ message: 'Password has been reset successfully' });
}));

export default router;