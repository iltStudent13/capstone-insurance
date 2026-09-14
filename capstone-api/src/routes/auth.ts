// Create auth routes /api/auth/register /api/auth/login /api/auth/me. Use the User model for registration and login. Return a JWT token on successful login. Verifies the token using jsonwebtoken attaches the user document to the request object for the /api/auth/me route. Use the authenticate middleware to protect the /api/auth/me route. Use the requireRole middleware to protect routes based on user roles.

import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import authenticate from "../middleware/auth.js";
import {
  validateRegistration,
  validateLogin,
  handleValidationErrors,
} from "../middleware/validate.js";

const router = express.Router();

// Register a new user
router.post(
  "/register",
  validateRegistration,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      const user = new User({ name, email, password, role });
      await user.save();
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });
      res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
);

// Login a user and return a JWT token
router.post(
  "/login",
  validateLogin,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email: `${email}` }).select(
        "+password",
      );
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

router.get("/me", authenticate, (req, res) => {
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
