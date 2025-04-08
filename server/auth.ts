import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";

// Create a type alias to separate from the imported User type
type UserSession = {
  id: number;
  username: string;
  fullName?: string;
  preferredLanguage?: string;
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
            fullName: user.fullName || undefined,
            preferredLanguage: user.preferredLanguage || undefined
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
        fullName: user.fullName || undefined,
        preferredLanguage: user.preferredLanguage || undefined
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
        fullName: user.fullName || undefined,
        preferredLanguage: user.preferredLanguage || undefined
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
        
        // User is already sanitized in the LocalStrategy
        res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
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
        fullName: updatedUser.fullName || undefined,
        preferredLanguage: updatedUser.preferredLanguage || undefined
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
}