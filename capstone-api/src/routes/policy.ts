import express from "express";
import Policy from "../models/Policy.js";
import authenticate from "../middleware/auth.js";
import requireRole from "../middleware/authorize.js";
import {
  PolicyValidationRules,
  handleValidationErrors,
  ListPoliciesValidationRules,
} from "../middleware/validate.js";

const router = express.Router();

// Create a new policy
router.post(
  "/",
  authenticate,
  requireRole("admin"),
  PolicyValidationRules,
  handleValidationErrors,
  async (req, res) => {
    try {
      const {
        holderName,
        type,
        premium,
        status,
        effectiveDate,
        expirationDate,
      } = req.body;
      const owner = req.user._id; // Set the owner to the authenticated user
      const policy = new Policy({
        holderName,
        type,
        premium,
        status,
        effectiveDate,
        expirationDate,
        owner,
      });
      await policy.save();
      res.status(201).json(policy);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
);

// list policies with query filters type, status, search by holderName or policy number, and pagination (page, limit)
router.get(
  "/",
  authenticate,
  ListPoliciesValidationRules,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { type, status, search, page = 1, limit = 10 } = req.query;
      const query = {};
      if (type) query.type = type;
      if (status) query.status = status;
      if (search) {
        query.$or = [
          { holderName: { $regex: search, $options: "i" } },
          { policyNumber: { $regex: search, $options: "i" } },
        ];
      }
      const policies = await Policy.find(query)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
      const total = await Policy.countDocuments(query);
      if (policies.length === 0) {
        res.json({ message: "No policies found", total: 0, policies: [] });
        return;
      }
      res.json({ policies, total });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
);

// Get policy by ID
router.get("/:id", authenticate, async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ error: "Policy not found" });
    }
    res.json(policy);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a policy by ID
router.put(
  "/:id",
  authenticate,
  requireRole("admin"),
  PolicyValidationRules,
  handleValidationErrors,
  async (req, res) => {
    try {
      const policy = await Policy.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!policy) {
        return res.status(404).json({ error: "Policy not found" });
      }
      res.json(policy);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
);

// Delete a policy by ID
router.delete("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const policy = await Policy.findByIdAndDelete(req.params.id);
    if (!policy) {
      return res.status(404).json({ error: "Policy not found" });
    }
    res.json({ message: "Policy deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
