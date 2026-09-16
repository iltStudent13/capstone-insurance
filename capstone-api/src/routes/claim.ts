import express, { json } from "express";
import type { Claim } from "../models/Claim.js";
import type { Policy } from "../models/Policy.js";
import authenticate from "../middleware/auth.js";
import requireRole from "../middleware/authorize.js";
import {
  CreateClaimValidationRules,
  handleValidationErrors,
  ListClaimsValidationRules,
  ValidateNote,
} from "../middleware/validate.js";

const router = express.Router();

const serializeClaim = (claim: any) => {
  const plainClaim = claim.toObject ? claim.toObject() : claim;

  if (plainClaim.policy && typeof plainClaim.policy === "object") {
    plainClaim.policyNumber = plainClaim.policy.policyNumber ?? null;
  }

  return plainClaim;
};

// GET /api/claims - Get all claims
router.get(
  "/",
  authenticate,
  ListClaimsValidationRules,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { status, search, page = 1, limit = 10 } = req.query;
      const query: Record<string, any> = {};

      if (status && status !== "all") {
        query.status = status;
      }

      if (search) {
        const searchTerm = String(search).trim();
        const matchingPolicies = await Policy.find({
          policyNumber: { $regex: searchTerm, $options: "i" },
        }).select("_id");

        query.$or = [
          { claimNumber: { $regex: searchTerm, $options: "i" } },
          { description: { $regex: searchTerm, $options: "i" } },
        ];

        if (matchingPolicies.length > 0) {
          query.$or.push({
            policy: { $in: matchingPolicies.map((p) => p._id) },
          });
        }
      }

      const skip = (Number(page) - 1) * Number(limit);
      const total = await Claim.countDocuments(query);
      const claims = await Claim.find(query)
        .populate("policy", "policyNumber")
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

      res.status(200).json({
        claims: claims.map(serializeClaim),
        totalPages: Math.max(1, Math.ceil(total / Number(limit))),
        total,
      });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/claims/stats count by status, total claim amount and total claims
router.get("/stats", authenticate, async (req, res, next) => {
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
});

// GET /api/claims/:id - Get a specific claim by ID
router.get("/:id", authenticate, async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id).populate(
      "policy",
      "policyNumber",
    );
    if (!claim) {
      return res.status(404).json({ error: "Claim not found" });
    }
    res.status(200).json(serializeClaim(claim));
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
      const { _id, policy, description, amount, incidentDate, notes } =
        req.body;
      const assignedTo = req.user._id;

      const claimPayload = {
        ...(_id ? { _id } : {}),
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
      await claim.populate("policy", "policyNumber");
      res.status(201).json(serializeClaim(claim));
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
      await claim.populate("policy", "policyNumber");
      res.status(200).json(serializeClaim(claim));
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/claims:id/notes - Add a note to a claim
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
