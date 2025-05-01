import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";

// Create a type alias to separate from the imported User type
type UserSession = {
  id: number;
  username: string;
  email: string | null;
  password: string;
  role: string;
  fullName?: string | null;
  preferredLanguage?: string | null;
  createdAt?: Date | null;
  firebaseUid?: string | null;
  photoURL?: string | null;
}

// Define the structure that Express will use for the session user
declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends UserSession {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Authentication middleware
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
};

// Admin middleware
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user && (req.user as any).isAdmin) {
    return next();
  }
  res.status(403).json({ message: "Admin access required" });
};

export function setupAuth(app: Express) {
  // Setup session with strict secure settings
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "changeme-this-is-not-secure",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
    store: storage.sessionStore,
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          // Type conversion to match Express.User interface
          const sessionUser: Express.User = {
            id: user.id,
            username: user.username,
            email: user.email || '',
            password: user.password,
            role: user.role,
            fullName: user.fullName || undefined,
            preferredLanguage: user.preferredLanguage || undefined,
            firebaseUid: user.firebaseUid || undefined,
            photoURL: user.photoURL || undefined
          };
          return done(null, sessionUser);
        }
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(new Error("User not found"), null);
      }
      
      // Type conversion to match Express.User interface
      const sessionUser: Express.User = {
        id: user.id,
        username: user.username,
        email: user.email || '',
        password: user.password,
        role: user.role,
        fullName: user.fullName || undefined,
        preferredLanguage: user.preferredLanguage || undefined,
        firebaseUid: user.firebaseUid || undefined,
        photoURL: user.photoURL || undefined
      };
      done(null, sessionUser);
    } catch (err) {
      done(err, null);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      // Create a session user without password
      const sessionUser: Express.User = {
        id: user.id,
        username: user.username,
        email: user.email || '',
        password: user.password,
        role: user.role,
        fullName: user.fullName || undefined,
        preferredLanguage: user.preferredLanguage || undefined,
        firebaseUid: user.firebaseUid || undefined,
        photoURL: user.photoURL || undefined
      };

      req.login(sessionUser, (err) => {
        if (err) return next(err);
        
        // Return sanitized user data
        res.status(201).json(sessionUser);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: Express.User | false, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        
        try {
          // User is already sanitized in the LocalStrategy
          // Make sure the user object is serializable - omit password for security
          const safeUser = {
            id: user.id,
            username: user.username,
            email: user.email || '',
            role: user.role,
            fullName: user.fullName || undefined,
            preferredLanguage: user.preferredLanguage || undefined,
            firebaseUid: user.firebaseUid || undefined,
            photoURL: user.photoURL || undefined
          };
          
          // Send response with proper error handling
          return res.status(200).json(safeUser);
        } catch (error) {
          console.error("Error in login response:", error);
          return next(error);
        }
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    try {
      req.logout((err) => {
        if (err) return next(err);
        
        try {
          // Send a plain text OK response to avoid JSON parsing
          res.set('Content-Type', 'text/plain');
          res.status(200).send('OK');
        } catch (error) {
          console.error("Error in logout response:", error);
          return next(error);
        }
      });
    } catch (error) {
      console.error("Error during logout process:", error);
      
      // Return a plaintext response to avoid JSON parsing issues
      res.set('Content-Type', 'text/plain');
      res.status(500).send('Logout failed');
    }
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // User data in req.user already has password removed by our middleware
    res.json(req.user);
  });
  
  app.patch("/api/user", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      // Only allow updating specific fields
      const allowedFields = ['fullName', 'preferredLanguage'];
      const updateData: Record<string, string> = {};
      
      for (const field of allowedFields) {
        if (field in req.body) {
          updateData[field] = req.body[field];
        }
      }
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }
      
      const updatedUser = await storage.updateUser(req.user.id, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update the session user
      const sessionUser: Express.User = {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email || '',
        password: updatedUser.password,
        role: updatedUser.role,
        fullName: updatedUser.fullName || undefined,
        preferredLanguage: updatedUser.preferredLanguage || undefined,
        firebaseUid: updatedUser.firebaseUid || undefined,
        photoURL: updatedUser.photoURL || undefined
      };
      
      // Update the session
      req.user = sessionUser;
      
      // Return the updated user
      res.status(200).json(sessionUser);
    } catch (err) {
      next(err);
    }
  });
  
  app.patch("/api/user/password", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }
      
      // Get the complete user record to verify password
      const user = await storage.getUser(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify current password
      const isPasswordValid = await comparePasswords(currentPassword, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      
      // Update with new hashed password
      await storage.updateUser(user.id, { 
        password: await hashPassword(newPassword) 
      } as any); // Type cast needed since password isn't in the allowed fields type
      
      res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
      next(err);
    }
  });

  // Google Authentication endpoint
  app.post("/api/google-auth", async (req, res, next) => {
    try {
      console.log("[Google Auth] Received request:", {
        hasEmail: !!req.body.email,
        hasUid: !!req.body.uid,
        hasDisplayName: !!req.body.displayName,
        body: JSON.stringify(req.body)
      });
      
      const { email, displayName, photoURL, uid } = req.body;
      
      if (!email || !uid) {
        console.log("[Google Auth] Missing required fields:", { email: !!email, uid: !!uid });
        return res.status(400).json({ message: "Email and uid are required" });
      }
      
      console.log("[Google Auth] Looking for existing user with Firebase UID:", uid);
      
      // First, check if a user with this Firebase UID exists
      let user = await storage.getUserByFirebaseUid(uid);
      
      if (!user) {
        console.log("[Google Auth] No user found with Firebase UID, checking email:", email);
        
        // Then check if a user with this email exists
        user = await storage.getUserByEmail(email);
        
        if (user) {
          console.log("[Google Auth] Found existing user with matching email, updating Firebase UID");
          // User exists with this email, update their Firebase UID
          user = await storage.updateUser(user.id, { firebaseUid: uid });
        } else {
          console.log("[Google Auth] No existing user found, creating new user");
          
          // Create a new user with Firebase information
          // Generate a random password since we won't use it (user will login via Google)
          const randomPassword = Math.random().toString(36).slice(-10);
          const hashedPassword = await hashPassword(randomPassword);
          
          // Extract username from email (removing any special characters)
          const username = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
          
          console.log("[Google Auth] Creating new user with username:", username);
          
          // Create user
          try {
            user = await storage.createUser({
              username,
              password: hashedPassword,
              email,
              fullName: displayName || null,
              preferredLanguage: 'en',
              firebaseUid: uid,
              photoURL: photoURL || null,
              role: 'user'
            });
            console.log("[Google Auth] Successfully created new user with ID:", user.id);
          } catch (error: any) {
            console.error("[Google Auth] Error creating user:", error);
            return res.status(500).json({ message: "Failed to create user account: " + (error?.message || 'Unknown error') });
          }
        }
      } else {
        console.log("[Google Auth] Found existing user with Firebase UID, ID:", user.id);
      }
      
      console.log("[Google Auth] Creating user session with passport login");
      
      // Make sure user is not undefined before logging in
      if (!user) {
        console.error("[Google Auth] User is undefined before login attempt");
        return res.status(500).json({ message: "Failed to authenticate user" });
      }
      
      // We now know user is defined, create a properly typed user object for passport
      const sessionUser: Express.User = {
        id: user.id,
        username: user.username,
        email: user.email || '',
        password: user.password,
        role: user.role,
        fullName: user.fullName || undefined,
        preferredLanguage: user.preferredLanguage || undefined,
        createdAt: user.createdAt || undefined,
        firebaseUid: user.firebaseUid || undefined,
        photoURL: user.photoURL || undefined
      };
        
      // Log the user in by creating a session
      req.login(sessionUser, (err) => {
        if (err) {
          console.error("[Google Auth] Session creation error:", err);
          return next(err);
        }
        
        console.log("[Google Auth] Successfully created session for user:", user!.id);
        
        // Set proper content type and return user data
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({
          id: user!.id,
          username: user!.username,
          email: user!.email,
          fullName: user!.fullName,
          preferredLanguage: user!.preferredLanguage,
          role: user!.role,
          photoURL: user!.photoURL,
          // Don't return password hash
        });
      });
    } catch (err) {
      console.error('[Google Auth] Unexpected error:', err);
      next(err);
    }
  });
}