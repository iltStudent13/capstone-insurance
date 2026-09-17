import express, { type Request, type Response } from "express";
import jwt, { type SignOptions } from "jsonwebtoken";
import User from "../models/User.js";
import authenticate from "../middleware/auth.js";
import {
  validateRegistration,
  validateLogin,
  handleValidationErrors,
} from "../middleware/validate.js";

const router = express.Router();

type LoginUser = {
  _id: string;
  name: string;
  email: string;
  role: "adjuster" | "admin";
  comparePassword: (candidatePassword: string) => Promise<boolean>;
};

const getJwtSecret = () => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwtSecret;
};

const getJwtOptions = (): SignOptions | undefined => {
  const expiresIn = process.env.JWT_EXPIRES_IN as
    | SignOptions["expiresIn"]
    | undefined;

  return expiresIn ? { expiresIn } : undefined;
};

// Register a new user
router.post(
  "/register",
  validateRegistration,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { name, email, password, role } = req.body;
      const user = new User({ name, email, password, role });
      await user.save();
      const token = jwt.sign(
        { userId: user._id },
        getJwtSecret(),
        getJwtOptions(),
      );
      res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      res.status(400).json({ error: message });
    }
  },
);

// Login a user and return a JWT token
router.post(
  "/login",
  validateLogin,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const user = (await User.findOne({ email: `${email}` }).select(
        "+password",
      )) as LoginUser | null;
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign(
        { userId: user._id },
        getJwtSecret(),
        getJwtOptions(),
      );

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      res.status(500).json({ error: message });
    }
  },
);

router.get("/me", authenticate, (req: Request, res: Response) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

export default router;
