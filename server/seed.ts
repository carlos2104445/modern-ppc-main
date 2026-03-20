import dotenv from "dotenv";
dotenv.config();

import { db, pool } from "./db";
import {
  users,
  transactionLogs,
  roles,
  staffMembers,
  subscriptionPlans,
  faqs,
  financialSettings,
  referralSettings,
} from "@shared/schema";
import bcrypt from "bcrypt";
import { sql } from "drizzle-orm";

async function seed() {
  try {
    console.log("Starting database seeding...");

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const [admin] = await db
      .insert(users)
      .values({
        username: "admin",
        email: "admin@adconnect.com",
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        fullName: "Admin User",
        phoneNumber: "+251911000000",
        dateOfBirth: null,
        role: "admin",
        balance: "0",
        lifetimeEarnings: "0",
        lifetimeSpending: "0",
        reputationScore: 100,
        referralCode: "ADMIN001",
        referredBy: null,
        status: "active",
        kycStatus: "approved",
        twoFactorEnabled: false,
        xp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        streakFreezes: 0,
      })
      .returning();

    console.log("✓ Admin user created");

    await db.insert(financialSettings).values({}).onConflictDoNothing();
    console.log("✓ Financial settings created");

    await db.insert(referralSettings).values({}).onConflictDoNothing();
    console.log("✓ Referral settings created");

    const sampleLogs = [
      {
        transactionId: "TXN-2025-001234",
        userId: admin.id,
        type: "deposit",
        amount: "1000.00",
        fee: "20.00",
        tax: "30.00",
        netAmount: "950.00",
        method: "Bank Transfer",
        status: "completed",
        description: "Monthly deposit",
      },
      {
        transactionId: "TXN-2025-001235",
        userId: admin.id,
        type: "withdrawal",
        amount: "500.00",
        fee: "10.00",
        tax: "15.00",
        netAmount: "475.00",
        method: "Mobile Money",
        status: "completed",
        description: "Withdrawal request",
      },
    ];

    await db.insert(transactionLogs).values(sampleLogs);
    console.log("✓ Sample transaction logs created");

    const roleData = [
      {
        name: "Super Administrator",
        description: "Full system access with all permissions",
        permissions: [
          "view_users",
          "manage_users",
          "view_financials",
          "process_withdrawals",
          "manage_deposits",
          "review_ads",
          "approve_publishers",
          "view_tickets",
          "reply_tickets",
          "manage_roles",
          "send_communications",
          "view_analytics",
        ],
      },
      {
        name: "Finance Manager",
        description: "Manage financial operations and transactions",
        permissions: ["view_financials", "process_withdrawals", "manage_deposits", "view_users"],
      },
      {
        name: "Support Agent",
        description: "Handle customer support and tickets",
        permissions: ["view_tickets", "reply_tickets", "view_users"],
      },
      {
        name: "Content Moderator",
        description: "Review and approve content",
        permissions: ["review_ads", "approve_publishers"],
      },
    ];

    const createdRoles = await db.insert(roles).values(roleData).returning();
    console.log("✓ Roles created");

    await db.insert(staffMembers).values({
      userId: admin.id,
      roleId: createdRoles[0].id,
      status: "active",
      assignedBy: null,
    });
    console.log("✓ Staff member assignment created");

    const plans = [
      {
        name: "Free",
        description: "Perfect for getting started",
        price: "0.00",
        billingCycle: "monthly",
        features: ["10 ads per day", "Basic support", "Standard campaigns"],
        dailyAdViewLimit: 10,
        maxCampaigns: 1,
        maxActiveAds: 3,
        withdrawalFeeDiscount: "0",
        referralBonusMultiplier: "1.00",
        prioritySupport: false,
        adReviewPriority: false,
        status: "active",
        displayOrder: 1,
      },
      {
        name: "Starter",
        description: "For individuals and small teams",
        price: "9.99",
        billingCycle: "monthly",
        features: [
          "50 ads per day",
          "Priority support",
          "Advanced campaigns",
          "Analytics dashboard",
        ],
        dailyAdViewLimit: 50,
        maxCampaigns: 5,
        maxActiveAds: 15,
        withdrawalFeeDiscount: "10",
        referralBonusMultiplier: "1.50",
        prioritySupport: true,
        adReviewPriority: false,
        status: "active",
        displayOrder: 2,
      },
      {
        name: "Professional",
        description: "For growing businesses",
        price: "29.99",
        billingCycle: "monthly",
        features: [
          "Unlimited ads",
          "Premium support",
          "Custom campaigns",
          "Advanced analytics",
          "Priority ad review",
        ],
        dailyAdViewLimit: 0,
        maxCampaigns: 0,
        maxActiveAds: 0,
        withdrawalFeeDiscount: "25",
        referralBonusMultiplier: "2.00",
        prioritySupport: true,
        adReviewPriority: true,
        status: "active",
        displayOrder: 3,
      },
    ];

    await db.insert(subscriptionPlans).values(plans);
    console.log("✓ Subscription plans created");

    const faqData = [
      {
        question: "How do I get started with AdConnect?",
        answer:
          "Getting started is easy! Simply sign up for an account, verify your email, and you can start viewing ads or creating campaigns right away.",
        category: "Getting Started",
        order: 1,
        isPublished: true,
      },
      {
        question: "How do I earn money on AdConnect?",
        answer:
          "You can earn money by viewing ads from our advertisers. Each ad view earns you credits based on the advertiser's payout rate.",
        category: "Earnings",
        order: 2,
        isPublished: true,
      },
      {
        question: "What is the minimum withdrawal amount?",
        answer:
          "The minimum withdrawal amount is $10. Once you reach this threshold, you can request a withdrawal to your preferred payment method.",
        category: "Payments",
        order: 3,
        isPublished: true,
      },
    ];

    await db.insert(faqs).values(faqData);
    console.log("✓ FAQs created");

    console.log("\nDatabase seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

seed();
