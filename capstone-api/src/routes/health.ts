import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import authenticate from "../middleware/auth.js";
const router = express.Router();
// GET /api/health - Check the health of the API and return status ok when healthy.

router.get("/health", authenticate, async (req, res) => {
  try {
    // Check if the user is authenticated and has a valid token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Token missing" });
    }

    // Verify the token
    jwt.verify(
      token,
      process.env.JWT_SECRET as string,
      async (err, decoded) => {
        if (err) {
          return res.status(401).json({ error: "Invalid token" });
        }

        // Check if the user exists in the database
        const user = await User.findById((decoded as any).id);
        if (!user) {
          return res.status(401).json({ error: "User not found" });
        }

        // If everything is fine, return status ok
        res.json({ status: "ok" });
      },
    );
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
