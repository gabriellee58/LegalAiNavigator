import express, { Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { isAuthenticated } from '../auth';
import crypto from 'crypto';

const router = express.Router();

// Generate a random token
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Create custom expiration date (24 hours from now)
function createExpirationDate(): Date {
  const now = new Date();
  const expiration = new Date(now);
  expiration.setHours(now.getHours() + 24);
  return expiration;
}

// Hash password using scrypt
async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${derivedKey.toString('hex')}.${salt}`);
    });
  });
}

// Profile update schema
const updateProfileSchema = z.object({
  fullName: z.string().optional(),
  preferredLanguage: z.string().optional()
});

type UpdateProfileData = z.infer<typeof updateProfileSchema>;

// Get current user profile
router.get('/profile', isAuthenticated, async (req: Request, res: Response) => {
  try {
    // User data is already loaded in the session
    res.json(req.user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Failed to retrieve user profile' });
  }
});

// Update user profile
router.patch('/profile', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const validationResult = updateProfileSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid profile data', 
        errors: validationResult.error.errors 
      });
    }

    const updateData: UpdateProfileData = validationResult.data;
    const updatedUser = await storage.updateUser(req.user!.id, updateData);

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Failed to update user profile' });
  }
});

// Request password reset
router.post('/request-password-reset', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    const user = await storage.getUserByUsername(username);
    if (!user) {
      // Don't reveal if the user exists for security reasons
      return res.status(200).json({ message: 'If a user with that username exists, a password reset email has been sent.' });
    }

    // Generate reset token
    const token = generateToken();
    const expiresAt = createExpirationDate();
    
    await storage.createPasswordResetToken(user.id, token, expiresAt);

    // In a real application, you would send an email with the reset link
    // For this demo, we'll just return the token directly
    console.log(`Password reset requested for ${username}. Token: ${token}`);
    
    res.status(200).json({ 
      message: 'If a user with that username exists, a password reset email has been sent.',
      // Only including token in response for development purposes
      // In production, this should be sent via email
      token: token
    });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({ message: 'Failed to process password reset request' });
  }
});

// Reset password using token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    // Validate the token
    const resetToken = await storage.getPasswordResetToken(token);
    if (!resetToken) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Check if token is expired
    const now = new Date();
    if (resetToken.expiresAt < now) {
      await storage.deletePasswordResetToken(token);
      return res.status(400).json({ message: 'Token has expired' });
    }

    // Update user's password
    const hashedPassword = await hashPassword(newPassword);
    await storage.updateUser(resetToken.userId, { 
      password: hashedPassword 
    });

    // Delete the used token
    await storage.deletePasswordResetToken(token);

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

export default router;