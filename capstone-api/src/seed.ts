import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Policy from "./models/Policy.js";
import Claim from "./models/Claim.js";
import connectDB from "./config/db.js";

dotenv.config();

async function seedUsers() {
  try {
    await connectDB(
      process.env.MONGODB_URI || "mongodb://localhost:27017/policy-claims",
    );

    await User.deleteMany({});

    const admin = new User({
      name: "Admin User",
      email: "admin@example.com",
      password: "Password123!",
      role: "admin",
    });

    const regularUser = new User({
      name: "First User",
      email: "user@example.com",
      password: "Password123!",
    });

    const anotherRegularUser = new User({
      name: "Second User",
      email: "anotheruser@example.com",
      password: "Password123!",
    });

    await admin.save();
    console.log("Admin seeded successfully");

    await regularUser.save();
    console.log("Regular user seeded successfully");

    await anotherRegularUser.save();
    console.log("Second user seeded successfully");
  } catch (error) {
    console.error("Error seeding users:", error);
    throw error;
  }
}

// The below code can be used to seed initial policies and claims if needed in the future.

async function seedPoliciesAndClaims() {
  try {
    await connectDB(
      process.env.MONGODB_URI || "mongodb://localhost:27017/policy-claims",
    );

    // clear existing policies and claims first
    await Policy.deleteMany({});
    await Claim.deleteMany({});

    const adminUser = await User.findOne({ email: "admin@example.com" });
    const regularUser = await User.findOne({ email: "user@example.com" });
    const secondUser = await User.findOne({ email: "anotheruser@example.com" });

    if (!adminUser || !regularUser || !secondUser) {
      throw new Error("Seeded users are missing. Run the user seed first.");
    }

    const policies = [
      {
        holderName: "John Doe",
        type: "life",
        premium: 1000,
        status: "active",
        effectiveDate: new Date(),
        expirationDate: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1),
        ),
        owner: adminUser._id,
      },
      {
        holderName: "Jane Smith",
        type: "auto",
        premium: 500,
        status: "active",
        effectiveDate: new Date(),
        expirationDate: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1),
        ),
        owner: regularUser._id,
      },
      {
        holderName: "Folty Foles",
        type: "life",
        premium: 10000,
        status: "active",
        effectiveDate: new Date(),
        expirationDate: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1),
        ),
        owner: adminUser._id,
      },
      {
        holderName: "Patrick Holmes",
        type: "home",
        premium: 1950,
        status: "active",
        effectiveDate: new Date(),
        expirationDate: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1),
        ),
        owner: secondUser._id,
      },
    ];

    const savedPolicies = [];
    for (const policyData of policies) {
      const policy = new Policy(policyData);
      const savedPolicy = await policy.save();
      savedPolicies.push(savedPolicy);
    }

    if (savedPolicies.length < 4) {
      throw new Error("Expected at least 4 policies to be seeded");
    }

    console.log("Policies seeded successfully");

    const claims = [
      {
        policy: savedPolicies[0]!._id,
        description: "Life insurance payout request",
        assignedTo: adminUser._id,
        amount: 5000,
        status: "approved",
        incidentDate: new Date(),
        notes: [
          {
            author: regularUser._id,
            text: "Claim for life insurance payout",
            createdAt: new Date(),
          },
        ],
      },
      {
        policy: savedPolicies[1]!._id,
        description: "Auto damage claim",
        assignedTo: regularUser._id,
        amount: 2000,
        status: "submitted",
        incidentDate: new Date(),
        notes: [],
      },
      {
        policy: savedPolicies[2]!._id,
        description: "Denial review for life policy",
        assignedTo: secondUser._id,
        amount: 2000,
        status: "denied",
        incidentDate: new Date(),
        notes: [
          {
            author: adminUser._id,
            text: "Initial review completed and claim denied.",
            createdAt: new Date(),
          },
        ],
      },
      {
        policy: savedPolicies[2]!._id,
        description: "Updated life claim submission",
        assignedTo: regularUser._id,
        amount: 2000,
        status: "submitted",
        incidentDate: new Date(),
        notes: [
          {
            author: secondUser._id,
            text: "Claim for auto insurance payout",
            createdAt: new Date(),
          },
        ],
      },
      {
        policy: savedPolicies[3]!._id,
        description: "Home policy claim",
        assignedTo: adminUser._id,
        amount: 2000,
        status: "closed",
        incidentDate: new Date(),
        notes: [
          {
            author: regularUser._id,
            text: "Claim for auto insurance payout",
            createdAt: new Date(),
          },
        ],
      },
    ];

    for (const claimData of claims) {
      const claim = new Claim(claimData);
      await claim.save();
    }
    console.log("Claims seeded successfully");
  } catch (error) {
    console.error("Error seeding policies and claims:", error);
    throw error;
  }
}

async function runSeed() {
  try {
    await seedUsers();
    await seedPoliciesAndClaims();

    const users = await User.find({}, "name").sort({ name: 1 });
    const userNames = users.map((user) => user.name);

    console.log("Users added:");
    userNames.forEach((name) => console.log(`- ${name}`));
    const policies = await Policy.find({}, "policyNumber").sort({
      policyNumber: 1,
    });
    const policyNumbers = policies.map((policy) => policy.policyNumber);

    console.log("Policies added:");
    policyNumbers.forEach((policyNumber) => console.log(`- ${policyNumber}`));

    const claims = await Claim.find({}, "claimNumber").sort({ claimNumber: 1 });
    const claimNumbers = claims.map((claim) => claim.claimNumber);

    console.log("Claims added:");
    claimNumbers.forEach((claimNumber) => console.log(`- ${claimNumber}`));

    console.log("Database seed complete");
    process.exit(0);
  } catch (error) {
    console.error("Seed run failed:", error);
    process.exit(1);
  }
}

runSeed();
