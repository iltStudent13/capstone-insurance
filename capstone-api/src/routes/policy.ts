import express, { type Request, type Response } from "express";
import Policy from "../models/Policy.js";
import authenticate from "../middleware/auth.js";
import requireRole from "../middleware/authorize.js";
import {
  PolicyValidationRules,
  handleValidationErrors,
  ListPoliciesValidationRules,
} from "../middleware/validate.js";

const router = express.Router();

type PolicyQuery = Record<string, unknown> & {
  $or?: Array<Record<string, unknown>>;
};

// Create a new policy
router.post(
  "/",
  authenticate,
  requireRole("admin"),
  PolicyValidationRules,
  handleValidationErrors,
  async (req: Request, res: Response) => {
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
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Policy creation failed";
      res.status(400).json({ error: message });
    }
  },
);

// list policies with query filters type, status, search by holderName or policy number, and pagination (page, limit)
router.get(
  "/",
  authenticate,
  ListPoliciesValidationRules,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { type, status, search, page = 1, limit = 10 } = req.query;
      const query: PolicyQuery = {};
      if (typeof type === "string" && type) query.type = type;
      if (typeof status === "string" && status) query.status = status;
      if (typeof search === "string" && search.trim()) {
        const searchTerm = search.trim();
        query.$or = [
          { holderName: { $regex: searchTerm, $options: "i" } },
          { policyNumber: { $regex: searchTerm, $options: "i" } },
        ];
      }
      const policies = await Policy.find(query)
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));
      const total = await Policy.countDocuments(query);
      if (policies.length === 0) {
        res.json({ message: "No policies found", total: 0, policies: [] });
        return;
      }
      res.json({ policies, total });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Policy lookup failed";
      res.status(400).json({ error: message });
    }
  },
);

// Get policy by ID
router.get("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ error: "Policy not found" });
    }
    res.json(policy);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Policy lookup failed";
    res.status(400).json({ error: message });
  }
});

// Update a policy by ID
router.put(
  "/:id",
  authenticate,
  requireRole("admin"),
  PolicyValidationRules,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const policy = await Policy.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!policy) {
        return res.status(404).json({ error: "Policy not found" });
      }
      res.json(policy);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Policy update failed";
      res.status(400).json({ error: message });
    }
  },
);

// Delete a policy by ID
router.delete(
  "/:id",
  authenticate,
  requireRole("admin"),
  async (req: Request, res: Response) => {
    try {
      const policy = await Policy.findByIdAndDelete(req.params.id);
      if (!policy) {
        return res.status(404).json({ error: "Policy not found" });
      }
      res.json({ message: "Policy deleted successfully" });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Policy deletion failed";
      res.status(400).json({ error: message });
    }
  },
);

export default router;
