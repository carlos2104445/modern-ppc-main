import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  decimal,
  integer,
  timestamp,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  fullName: text("full_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  dateOfBirth: text("date_of_birth"),
  role: text("role").notNull().default("user"),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default("0.00"),
  lifetimeEarnings: decimal("lifetime_earnings", { precision: 10, scale: 2 })
    .notNull()
    .default("0.00"),
  lifetimeSpending: decimal("lifetime_spending", { precision: 10, scale: 2 })
    .notNull()
    .default("0.00"),
  reputationScore: integer("reputation_score").notNull().default(0),
  referralCode: text("referral_code").notNull().unique(),
  referredBy: varchar("referred_by"),
  status: text("status").notNull().default("active"),
  kycStatus: text("kyc_status").notNull().default("pending"),
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActivityDate: timestamp("last_activity_date"),
  streakFreezes: integer("streak_freezes").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const campaigns = pgTable(
  "campaigns",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    name: text("name").notNull(),
    budget: decimal("budget", { precision: 10, scale: 2 }).notNull(),
    spent: decimal("spent", { precision: 10, scale: 2 }).notNull().default("0.00"),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("campaigns_user_id_idx").on(table.userId),
    statusIdx: index("campaigns_status_idx").on(table.status),
  })
);

export const ads = pgTable(
  "ads",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    campaignId: varchar("campaign_id")
      .notNull()
      .references(() => campaigns.id),
    title: text("title").notNull(),
    description: text("description").notNull(),
    url: text("url").notNull(),
    imageUrl: text("image_url"),
    payoutPerClick: decimal("payout_per_click", { precision: 10, scale: 2 }).notNull(),
    duration: integer("duration").notNull(),
    clicks: integer("clicks").notNull().default(0),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    campaignIdIdx: index("ads_campaign_id_idx").on(table.campaignId),
    statusIdx: index("ads_status_idx").on(table.status),
  })
);

export const transactions = pgTable(
  "transactions",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    type: text("type").notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    description: text("description").notNull(),
    status: text("status").notNull().default("completed"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("transactions_user_id_idx").on(table.userId),
    statusIdx: index("transactions_status_idx").on(table.status),
    createdAtIdx: index("transactions_created_at_idx").on(table.createdAt),
  })
);

export const tickets = pgTable(
  "tickets",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    subject: text("subject").notNull(),
    status: text("status").notNull().default("open"),
    priority: text("priority").notNull().default("medium"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("tickets_user_id_idx").on(table.userId),
    statusIdx: index("tickets_status_idx").on(table.status),
  })
);

export const ticketReplies = pgTable(
  "ticket_replies",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    ticketId: varchar("ticket_id")
      .notNull()
      .references(() => tickets.id),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    message: text("message").notNull(),
    isStaff: boolean("is_staff").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    ticketIdIdx: index("ticket_replies_ticket_id_idx").on(table.ticketId),
    userIdIdx: index("ticket_replies_user_id_idx").on(table.userId),
  })
);

export const blogPosts = pgTable(
  "blog_posts",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    title: text("title").notNull(),
    author: text("author").notNull(),
    category: text("category").notNull(),
    status: text("status").notNull().default("draft"),
    publishedDate: text("published_date"),
    excerpt: text("excerpt").notNull(),
    content: text("content"),
    views: integer("views").notNull().default(0),
    featured: boolean("featured").notNull().default(false),
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    statusIdx: index("blog_posts_status_idx").on(table.status),
    categoryIdx: index("blog_posts_category_idx").on(table.category),
    featuredIdx: index("blog_posts_featured_idx").on(table.featured),
  })
);

export const adminCampaigns = pgTable(
  "admin_campaigns",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    type: text("type").notNull(),
    url: text("url").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    budget: decimal("budget", { precision: 10, scale: 2 }).notNull(),
    cpc: decimal("cpc", { precision: 10, scale: 2 }).notNull(),
    duration: integer("duration").notNull().default(15),
    clicks: integer("clicks").notNull().default(0),
    status: text("status").notNull().default("active"),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    statusIdx: index("admin_campaigns_status_idx").on(table.status),
    typeIdx: index("admin_campaigns_type_idx").on(table.type),
  })
);

export const withdrawalRequests = pgTable(
  "withdrawal_requests",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    method: text("method").notNull(),
    accountDetails: text("account_details").notNull(),
    status: text("status").notNull().default("pending"),
    rejectionReason: text("rejection_reason"),
    reviewedBy: varchar("reviewed_by"),
    reviewedAt: timestamp("reviewed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("withdrawal_requests_user_id_idx").on(table.userId),
    statusIdx: index("withdrawal_requests_status_idx").on(table.status),
  })
);

export const depositRequests = pgTable(
  "deposit_requests",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    method: text("method").notNull(),
    status: text("status").notNull().default("pending"),
    transactionId: text("transaction_id"),
    failureReason: text("failure_reason"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    completedAt: timestamp("completed_at"),
  },
  (table) => ({
    userIdIdx: index("deposit_requests_user_id_idx").on(table.userId),
    statusIdx: index("deposit_requests_status_idx").on(table.status),
  })
);

export const financialSettings = pgTable("financial_settings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  taxPercentage: decimal("tax_percentage", { precision: 5, scale: 2 }).notNull().default("0"),
  withdrawalFeePercentage: decimal("withdrawal_fee_percentage", { precision: 5, scale: 2 })
    .notNull()
    .default("0"),
  depositFeePercentage: decimal("deposit_fee_percentage", { precision: 5, scale: 2 })
    .notNull()
    .default("0"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: varchar("updated_by"),
});

export const transactionLogs = pgTable(
  "transaction_logs",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    transactionId: text("transaction_id").notNull(),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    type: text("type").notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    fee: decimal("fee", { precision: 10, scale: 2 }).notNull().default("0"),
    tax: decimal("tax", { precision: 10, scale: 2 }).notNull().default("0"),
    netAmount: decimal("net_amount", { precision: 10, scale: 2 }).notNull(),
    method: text("method").notNull(),
    status: text("status").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("transaction_logs_user_id_idx").on(table.userId),
    transactionIdIdx: index("transaction_logs_transaction_id_idx").on(table.transactionId),
    createdAtIdx: index("transaction_logs_created_at_idx").on(table.createdAt),
  })
);

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    used: boolean("used").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("password_reset_tokens_user_id_idx").on(table.userId),
    tokenIdx: uniqueIndex("password_reset_tokens_token_idx").on(table.token),
  })
);

export const referralSettings = pgTable("referral_settings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  level1Percentage: decimal("level1_percentage", { precision: 5, scale: 2 })
    .notNull()
    .default("10.00"),
  level2Percentage: decimal("level2_percentage", { precision: 5, scale: 2 })
    .notNull()
    .default("5.00"),
  level3Percentage: decimal("level3_percentage", { precision: 5, scale: 2 })
    .notNull()
    .default("2.00"),
  level4Percentage: decimal("level4_percentage", { precision: 5, scale: 2 })
    .notNull()
    .default("1.00"),
  level5Percentage: decimal("level5_percentage", { precision: 5, scale: 2 })
    .notNull()
    .default("0.50"),
  enabled: boolean("enabled").notNull().default(true),
  maxLevels: integer("max_levels").notNull().default(5),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: varchar("updated_by"),
});

export const roles = pgTable("roles", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  permissions: text("permissions").array().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const staffMembers = pgTable("staff_members", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  roleId: varchar("role_id")
    .notNull()
    .references(() => roles.id),
  status: text("status").notNull().default("active"),
  assignedBy: varchar("assigned_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const notifications = pgTable(
  "notifications",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    type: text("type").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    actionUrl: text("action_url"),
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("notifications_user_id_idx").on(table.userId),
    readIdx: index("notifications_read_idx").on(table.read),
  })
);

export const subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  billingCycle: text("billing_cycle").notNull().default("monthly"),
  features: text("features").array().notNull(),
  dailyAdViewLimit: integer("daily_ad_view_limit").notNull().default(0),
  maxCampaigns: integer("max_campaigns").notNull().default(0),
  maxActiveAds: integer("max_active_ads").notNull().default(0),
  withdrawalFeeDiscount: decimal("withdrawal_fee_discount", { precision: 5, scale: 2 })
    .notNull()
    .default("0"),
  referralBonusMultiplier: decimal("referral_bonus_multiplier", { precision: 5, scale: 2 })
    .notNull()
    .default("1.00"),
  prioritySupport: boolean("priority_support").notNull().default(false),
  adReviewPriority: boolean("ad_review_priority").notNull().default(false),
  status: text("status").notNull().default("active"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const adViewingUpgrades = pgTable("ad_viewing_upgrades", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration").notNull(),
  rewardMultiplier: decimal("reward_multiplier", { precision: 5, scale: 2 })
    .notNull()
    .default("1.00"),
  dailyAdViewBonus: integer("daily_ad_view_bonus").notNull().default(0),
  viewDurationReduction: integer("view_duration_reduction").notNull().default(0),
  priorityAccess: boolean("priority_access").notNull().default(false),
  icon: text("icon"),
  color: text("color"),
  status: text("status").notNull().default("active"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userAdViewingUpgrades = pgTable(
  "user_ad_viewing_upgrades",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    upgradeId: varchar("upgrade_id")
      .notNull()
      .references(() => adViewingUpgrades.id),
    purchaseDate: timestamp("purchase_date").notNull().defaultNow(),
    expiryDate: timestamp("expiry_date").notNull(),
    status: text("status").notNull().default("active"),
    transactionId: varchar("transaction_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("user_ad_viewing_upgrades_user_id_idx").on(table.userId),
    upgradeIdIdx: index("user_ad_viewing_upgrades_upgrade_id_idx").on(table.upgradeId),
    statusIdx: index("user_ad_viewing_upgrades_status_idx").on(table.status),
    expiryDateIdx: index("user_ad_viewing_upgrades_expiry_date_idx").on(table.expiryDate),
  })
);

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  fullName: true,
  phoneNumber: true,
  dateOfBirth: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).pick({
  name: true,
  budget: true,
});

export const insertAdSchema = createInsertSchema(ads).pick({
  campaignId: true,
  title: true,
  description: true,
  url: true,
  imageUrl: true,
  payoutPerClick: true,
  duration: true,
});

export const insertTicketSchema = createInsertSchema(tickets).pick({
  subject: true,
  priority: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdminCampaignSchema = createInsertSchema(adminCampaigns).omit({
  id: true,
  clicks: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWithdrawalRequestSchema = createInsertSchema(withdrawalRequests).omit({
  id: true,
  createdAt: true,
  reviewedBy: true,
  reviewedAt: true,
});

export const insertDepositRequestSchema = createInsertSchema(depositRequests).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertFinancialSettingsSchema = createInsertSchema(financialSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertTransactionLogSchema = createInsertSchema(transactionLogs).omit({
  id: true,
  createdAt: true,
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
});

export const insertReferralSettingsSchema = createInsertSchema(referralSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStaffMemberSchema = createInsertSchema(staffMembers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdViewingUpgradeSchema = createInsertSchema(adViewingUpgrades).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserAdViewingUpgradeSchema = createInsertSchema(userAdViewingUpgrades).omit({
  id: true,
  createdAt: true,
});

export const faqs = pgTable("faqs", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").notNull(),
  order: integer("order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertFaqSchema = createInsertSchema(faqs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const paymentMethods = pgTable("payment_methods", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  type: text("type").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  cardholderName: text("cardholder_name"),
  lastFourDigits: text("last_four_digits").notNull(),
  expiryMonth: text("expiry_month"),
  expiryYear: text("expiry_year"),
  cardBrand: text("card_brand"),
  accountHolderName: text("account_holder_name"),
  bankName: text("bank_name"),
  accountType: text("account_type"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  adminId: varchar("admin_id")
    .notNull()
    .references(() => users.id),
  adminEmail: text("admin_email").notNull(),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  resourceId: text("resource_id"),
  details: text("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export const achievements = pgTable(
  "achievements",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    description: text("description").notNull(),
    icon: text("icon"),
    category: text("category").notNull(),
    rarity: text("rarity").notNull().default("common"),
    userType: text("user_type").notNull().default("both"),
    conditions: text("conditions").notNull(),
    rewardBirr: decimal("reward_birr", { precision: 10, scale: 2 }).notNull().default("0.00"),
    rewardXP: integer("reward_xp").notNull().default(0),
    status: text("status").notNull().default("active"),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    statusIdx: index("achievements_status_idx").on(table.status),
    userTypeIdx: index("achievements_user_type_idx").on(table.userType),
  })
);

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const userAchievements = pgTable(
  "user_achievements",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    achievementId: varchar("achievement_id")
      .notNull()
      .references(() => achievements.id),
    progress: integer("progress").notNull().default(0),
    unlockedAt: timestamp("unlocked_at"),
    rewardClaimed: boolean("reward_claimed").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("user_achievements_user_id_idx").on(table.userId),
    achievementIdIdx: index("user_achievements_achievement_id_idx").on(table.achievementId),
    userAchievementUnique: uniqueIndex("user_achievements_user_achievement_unique").on(
      table.userId,
      table.achievementId
    ),
  })
);

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  createdAt: true,
});

export const challenges = pgTable(
  "challenges",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    description: text("description").notNull(),
    icon: text("icon").default("🎯"),
    type: text("type").notNull().default("daily"),
    targetAudience: text("target_audience").notNull().default("earners"),
    metricType: text("metric_type").notNull(),
    targetValue: integer("target_value").notNull(),
    rewardBirr: decimal("reward_birr", { precision: 10, scale: 2 }).notNull().default("0.00"),
    rewardXP: integer("reward_xp").notNull().default(0),
    difficulty: text("difficulty").notNull().default("easy"),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    autoRepeat: boolean("auto_repeat").notNull().default(false),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    statusIdx: index("challenges_status_idx").on(table.status),
    typeIdx: index("challenges_type_idx").on(table.type),
    targetAudienceIdx: index("challenges_target_audience_idx").on(table.targetAudience),
  })
);

export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const userChallenges = pgTable(
  "user_challenges",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    challengeId: varchar("challenge_id")
      .notNull()
      .references(() => challenges.id),
    progress: integer("progress").notNull().default(0),
    completed: boolean("completed").notNull().default(false),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("user_challenges_user_id_idx").on(table.userId),
    challengeIdIdx: index("user_challenges_challenge_id_idx").on(table.challengeId),
    completedIdx: index("user_challenges_completed_idx").on(table.completed),
    userChallengeUnique: uniqueIndex("user_challenges_user_challenge_unique").on(
      table.userId,
      table.challengeId
    ),
  })
);

export const insertUserChallengeSchema = createInsertSchema(userChallenges).omit({
  id: true,
  createdAt: true,
});

export const levels = pgTable("levels", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  level: integer("level").notNull().unique(),
  minXP: integer("min_xp").notNull(),
  maxXP: integer("max_xp").notNull(),
  title: text("title").notNull(),
  earningsBoostPercent: integer("earnings_boost_percent").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLevelSchema = createInsertSchema(levels).omit({
  id: true,
  createdAt: true,
});

export const events = pgTable("events", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  multiplier: decimal("multiplier", { precision: 5, scale: 2 }).notNull().default("1.00"),
  appliesTo: text("applies_to").notNull().default("all"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  repeatPattern: text("repeat_pattern"),
  bannerText: text("banner_text"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const leaderboardSettings = pgTable("leaderboard_settings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  type: text("type").notNull().unique(),
  firstPrize: decimal("first_prize", { precision: 10, scale: 2 }).notNull().default("0.00"),
  secondThirdPrize: decimal("second_third_prize", { precision: 10, scale: 2 })
    .notNull()
    .default("0.00"),
  fourthToTenthPrize: decimal("fourth_to_tenth_prize", { precision: 10, scale: 2 })
    .notNull()
    .default("0.00"),
  requireKYC: boolean("require_kyc").notNull().default(false),
  minimumActivity: integer("minimum_activity").notNull().default(0),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertLeaderboardSettingsSchema = createInsertSchema(leaderboardSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const chapaPayments = pgTable(
  "chapa_payments",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    txRef: text("tx_ref").notNull().unique(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("ETB"),
    email: text("email").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    phoneNumber: text("phone_number"),
    status: text("status").notNull().default("pending"),
    chapaReference: text("chapa_reference"),
    paymentMethod: text("payment_method"),
    charge: decimal("charge", { precision: 10, scale: 2 }),
    mode: text("mode"),
    type: text("type"),
    checkoutUrl: text("checkout_url"),
    metadata: text("metadata"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    completedAt: timestamp("completed_at"),
  },
  (table) => ({
    userIdIdx: index("chapa_payments_user_id_idx").on(table.userId),
    statusIdx: index("chapa_payments_status_idx").on(table.status),
    txRefIdx: uniqueIndex("chapa_payments_tx_ref_idx").on(table.txRef),
  })
);

export const adViews = pgTable(
  "ad_views",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    campaignId: varchar("campaign_id")
      .notNull()
      .references(() => adminCampaigns.id),
    trackingToken: text("tracking_token").notNull().unique(),
    viewStarted: timestamp("view_started").notNull().defaultNow(),
    viewCompleted: timestamp("view_completed"),
    linkClicked: boolean("link_clicked").notNull().default(false),
    linkClickedAt: timestamp("link_clicked_at"),
    rewardClaimed: boolean("reward_claimed").notNull().default(false),
    rewardClaimedAt: timestamp("reward_claimed_at"),
    rewardAmount: decimal("reward_amount", { precision: 10, scale: 2 }),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    fraudScore: integer("fraud_score").notNull().default(0),
    flaggedAsFraud: boolean("flagged_as_fraud").notNull().default(false),
    fraudReason: text("fraud_reason"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("ad_views_user_id_idx").on(table.userId),
    campaignIdIdx: index("ad_views_campaign_id_idx").on(table.campaignId),
    trackingTokenIdx: uniqueIndex("ad_views_tracking_token_idx").on(table.trackingToken),
    ipAddressIdx: index("ad_views_ip_address_idx").on(table.ipAddress),
    fraudFlagIdx: index("ad_views_fraud_flag_idx").on(table.flaggedAsFraud),
  })
);

export const fraudDetectionSettings = pgTable("fraud_detection_settings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  maxViewsPerUserPerDay: integer("max_views_per_user_per_day").notNull().default(50),
  maxViewsPerIpPerDay: integer("max_views_per_ip_per_day").notNull().default(100),
  maxViewsPerCampaignPerUser: integer("max_views_per_campaign_per_user").notNull().default(5),
  minViewDurationSeconds: integer("min_view_duration_seconds").notNull().default(5),
  suspiciousUserAgentPatterns: text("suspicious_user_agent_patterns")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  blockVpnProxies: boolean("block_vpn_proxies").notNull().default(false),
  autoFlagThreshold: integer("auto_flag_threshold").notNull().default(80),
  enabled: boolean("enabled").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: varchar("updated_by"),
});

export const insertChapaPaymentSchema = createInsertSchema(chapaPayments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdViewSchema = createInsertSchema(adViews).omit({
  id: true,
  createdAt: true,
});

export const insertFraudDetectionSettingsSchema = createInsertSchema(fraudDetectionSettings).omit({
  id: true,
  updatedAt: true,
});

export const maintenanceSettings = pgTable("maintenance_settings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  enabled: boolean("enabled").notNull().default(false),
  message: text("message"),
  enabledAt: timestamp("enabled_at"),
  enabledBy: varchar("enabled_by"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: varchar("updated_by"),
});

export const consentRecords = pgTable(
  "consent_records",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    consentType: text("consent_type").notNull(),
    granted: boolean("granted").notNull(),
    timestamp: timestamp("timestamp").notNull().defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    version: text("version").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("consent_records_user_id_idx").on(table.userId),
    consentTypeIdx: index("consent_records_consent_type_idx").on(table.consentType),
    timestampIdx: index("consent_records_timestamp_idx").on(table.timestamp),
  })
);

export const mfaBackupCodes = pgTable(
  "mfa_backup_codes",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    code: text("code").notNull(),
    used: boolean("used").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("mfa_backup_codes_user_id_idx").on(table.userId),
  })
);

export const insertMaintenanceSettingsSchema = createInsertSchema(maintenanceSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertConsentRecordSchema = createInsertSchema(consentRecords).omit({
  id: true,
  createdAt: true,
});

export const insertMFABackupCodeSchema = createInsertSchema(mfaBackupCodes).omit({
  id: true,
  createdAt: true,
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type InsertAdminCampaign = z.infer<typeof insertAdminCampaignSchema>;
export type InsertWithdrawalRequest = z.infer<typeof insertWithdrawalRequestSchema>;
export type InsertDepositRequest = z.infer<typeof insertDepositRequestSchema>;
export type InsertFinancialSettings = z.infer<typeof insertFinancialSettingsSchema>;
export type InsertTransactionLog = z.infer<typeof insertTransactionLogSchema>;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type InsertReferralSettings = z.infer<typeof insertReferralSettingsSchema>;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type InsertStaffMember = z.infer<typeof insertStaffMemberSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type InsertAdViewingUpgrade = z.infer<typeof insertAdViewingUpgradeSchema>;
export type InsertUserAdViewingUpgrade = z.infer<typeof insertUserAdViewingUpgradeSchema>;
export type InsertFaq = z.infer<typeof insertFaqSchema>;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type InsertUserChallenge = z.infer<typeof insertUserChallengeSchema>;
export type InsertLevel = z.infer<typeof insertLevelSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertLeaderboardSettings = z.infer<typeof insertLeaderboardSettingsSchema>;
export type InsertChapaPayment = z.infer<typeof insertChapaPaymentSchema>;
export type InsertAdView = z.infer<typeof insertAdViewSchema>;
export type InsertFraudDetectionSettings = z.infer<typeof insertFraudDetectionSettingsSchema>;
export type InsertMaintenanceSettings = z.infer<typeof insertMaintenanceSettingsSchema>;
export type InsertConsentRecord = z.infer<typeof insertConsentRecordSchema>;
export type InsertMFABackupCode = z.infer<typeof insertMFABackupCodeSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetConfirm = z.infer<typeof passwordResetConfirmSchema>;
export type User = typeof users.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type Ad = typeof ads.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Ticket = typeof tickets.$inferSelect;
export type TicketReply = typeof ticketReplies.$inferSelect;
export type BlogPost = typeof blogPosts.$inferSelect;
export type AdminCampaign = typeof adminCampaigns.$inferSelect;
export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;
export type DepositRequest = typeof depositRequests.$inferSelect;
export type FinancialSettings = typeof financialSettings.$inferSelect;
export type TransactionLog = typeof transactionLogs.$inferSelect;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type ReferralSettings = typeof referralSettings.$inferSelect;
export type Role = typeof roles.$inferSelect;
export type StaffMember = typeof staffMembers.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type AdViewingUpgrade = typeof adViewingUpgrades.$inferSelect;
export type UserAdViewingUpgrade = typeof userAdViewingUpgrades.$inferSelect;
export type Faq = typeof faqs.$inferSelect;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type Challenge = typeof challenges.$inferSelect;
export type UserChallenge = typeof userChallenges.$inferSelect;
export type Level = typeof levels.$inferSelect;
export type Event = typeof events.$inferSelect;
export type LeaderboardSettings = typeof leaderboardSettings.$inferSelect;
export type ChapaPayment = typeof chapaPayments.$inferSelect;
export type AdView = typeof adViews.$inferSelect;
export type FraudDetectionSettings = typeof fraudDetectionSettings.$inferSelect;
export type MaintenanceSettings = typeof maintenanceSettings.$inferSelect;
export type ConsentRecord = typeof consentRecords.$inferSelect;
export type MFABackupCode = typeof mfaBackupCodes.$inferSelect;
