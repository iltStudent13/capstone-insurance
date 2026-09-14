import User from "../models/User.js";
import { body, validationResult } from "express-validator";
import Claim from "../models/Claim.js";
import Policy from "../models/Policy.js";

export const validateRegistration = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error("Email already registered");
      }
    }),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  body("role")
    .optional()
    .isIn(["adjuster", "admin"])
    .withMessage("Role must be either 'adjuster' or 'admin'"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const validateLogin = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const PolicyValidationRules = [
  body("policyNumber")
    .notEmpty()
    .withMessage("Policy number is required")
    .custom(async (value) => {
      const policy = await Policy.findOne({ policyNumber: value });
      if (policy) {
        throw new Error("Policy number already exists");
      }
    }),
  body("holderName").notEmpty().withMessage("Holder name is required"),
  body("type")
    .isIn(["auto", "home", "life"])
    .withMessage("Type must be one of 'auto', 'home', or 'life'"),
  body("premium")
    .isFloat({ min: 0 })
    .withMessage("Premium must be a positive number"),
  body("status")
    .isIn(["active", "expired", "cancelled"])
    .withMessage("Status must be one of 'active', 'expired', or 'cancelled'"),
  body("effectiveDate")
    .isISO8601()
    .toDate()
    .withMessage("Effective date must be a valid date"),
  body("expirationDate")
    .isISO8601()
    .toDate()
    .withMessage("Expiration date must be a valid date"),
];

export const ListPoliciesValidationRules = [
  body("type")
    .optional()
    .isIn(["auto", "home", "life"])
    .withMessage("Type must be one of 'auto', 'home', or 'life'"),
  body("status")
    .optional()
    .isIn(["active", "expired", "cancelled"])
    .withMessage("Status must be one of 'active', 'expired', or 'cancelled'"),
  body("search").optional().isString().withMessage("Search must be a string"),
  body("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  body("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Limit must be a positive integer"),
];

export const ListClaimsValidationRules = [
  body("status")
    .optional()
    .isIn(["submitted", "under-review", "approved", "denied", "closed"])
    .withMessage(
      "Status must be one of 'submitted', 'under-review', 'approved', 'denied', or 'closed'",
    ),
  body("search").optional().isString().withMessage("Search must be a string"),
  body("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  body("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Limit must be a positive integer"),
];

export const CreateClaimValidationRules = [
  body("claimNumber")
    .optional()
    .custom(async (value) => {
      const claim = await Claim.findOne({ claimNumber: value });
      if (claim) {
        throw new Error("Claim number already exists");
      }
    }),
  body("policy").notEmpty().withMessage("Policy ID is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("incidentDate")
    .isISO8601()
    .toDate()
    .withMessage("Incident date must be a valid date"),
  body("amount")
    .isFloat({ min: 0 })
    .withMessage("Amount must be a positive number"),
];

export const ValidateNote = [
  body("text").trim().isLength({ min: 1 }).withMessage("Note text is required"),
];

export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}
