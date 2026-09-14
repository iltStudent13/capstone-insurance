// Claim routes /api/claims require authentication and authorization for users and admins. Users can create claims, view their own claims, and update their own claims. Admins can view all claims and update any claim.
import express, { json } from "express";
import Claim from "../models/Claim.js";
import authenticate from "../middleware/auth.js";
import requireRole from "../middleware/authorize.js";
import {
  CreateClaimValidationRules,
  handleValidationErrors,
  ListClaimsValidationRules,
  ValidateNote,
} from "../middleware/validate.js";

const router = express.Router();

// GET /api/claims - Get all claims
router.get(
  "/",
  authenticate,
  ListClaimsValidationRules,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const claims = await Claim.find();
      res.status(200).json(claims);
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/claims/stats count by status, total claim amount and total claims
router.get(
  "/stats",
  authenticate,
  requireRole("admin"),
  async (req, res, next) => {
    try {
      const stats = await Claim.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalAmount: { $sum: "$amount" },
          },
        },
      ]);
      res.json(stats);
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/claims/:id - Get a specific claim by ID
router.get("/:id", authenticate, async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ error: "Claim not found" });
    }
    res.status(200).json(claim);
  } catch (err) {
    next(err);
  }
});

// POST /api/claims - Create a new claim, auto assign to the authenticated user
router.post(
  "/",
  authenticate,
  CreateClaimValidationRules,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { _id, policy, description, amount, incidentDate, notes } = req.body;
      const assignedTo = req.user._id;

      const claimPayload = {
        ...( _id ? { _id } : {}),
        policy,
        description,
        amount,
        incidentDate,
        assignedTo,
      };

      if (notes) {
        claimPayload.notes = [
          {
            author: assignedTo,
            text: notes,
          },
        ];
      }

      const claim = new Claim(claimPayload);
      await claim.save();
      res.status(201).json(claim);
    } catch (err) {
      next(err);
    }
  },
);

// PUT /api/claims/:id - Update a claim by ID, only the admin can update
router.put(
  "/:id",
  authenticate,
  requireRole("admin"),
  async (req, res, next) => {
    try {
      const claim = await Claim.findById(req.params.id);
      if (!claim) {
        return res.status(404).json({ error: "Claim not found" });
      }

      const { claimNumber, ...updateFields } = req.body;

      Object.assign(claim, updateFields);
      await claim.save();
      res.status(200).json(claim);
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/claims:id/notes - Add a note to a claim, only the admin can add notes
router.post(
  "/:id/notes",
  authenticate,
  ValidateNote,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const claim = await Claim.findById(req.params.id);
      if (!claim) {
        return res.status(404).json({ error: "Claim not found" });
      }

      const { text } = req.body;

      claim.notes.push({
        author: req.user._id,
        text,
      });
      await claim.save();
      res.status(201).json(claim);
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /api/claims/:id - Delete a claim by ID, only the admin can delete
router.delete(
  "/:id",
  authenticate,
  requireRole("admin"),
  async (req, res, next) => {
    try {
      const claim = await Claim.findByIdAndDelete(req.params.id);
      if (!claim) {
        return res.status(404).json({ error: "Claim not found" });
      }
      res.json({ message: "Claim deleted successfully" });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
