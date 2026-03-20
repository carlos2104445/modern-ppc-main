import { db } from "./db";
import { cache } from "./redis";
import {
  users,
  blogPosts,
  adminCampaigns,
  withdrawalRequests,
  depositRequests,
  financialSettings,
  transactionLogs,
  transactions,
  passwordResetTokens,
  referralSettings,
  roles,
  staffMembers,
  subscriptionPlans,
  faqs,
  paymentMethods,
  auditLogs,
  chapaPayments,
  adViews,
  fraudDetectionSettings,
  maintenanceSettings,
  consentRecords,
  mfaBackupCodes,
  type User,
  type InsertUser,
  type BlogPost,
  type InsertBlogPost,
  type AdminCampaign,
  type InsertAdminCampaign,
  type WithdrawalRequest,
  type InsertWithdrawalRequest,
  type DepositRequest,
  type InsertDepositRequest,
  type FinancialSettings,
  type InsertFinancialSettings,
  type TransactionLog,
  type InsertTransactionLog,
  type PasswordResetToken,
  type InsertPasswordResetToken,
  type ReferralSettings,
  type InsertReferralSettings,
  type Role,
  type InsertRole,
  type StaffMember,
  type InsertStaffMember,
  type SubscriptionPlan,
  type InsertSubscriptionPlan,
  type Faq,
  type InsertFaq,
  type PaymentMethod,
  type InsertPaymentMethod,
  type AuditLog,
  type InsertAuditLog,
  type ChapaPayment,
  type InsertChapaPayment,
  type AdView,
  type InsertAdView,
  type FraudDetectionSettings,
  type InsertFraudDetectionSettings,
  type MaintenanceSettings,
  type InsertMaintenanceSettings,
  type ConsentRecord,
  type InsertConsentRecord,
} from "@shared/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import type { IStorage } from "./storage";
import bcrypt from "bcrypt";

const CACHE_TTL = 300; // 5 minutes

export class PostgreSQLStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const cacheKey = `user:${id}`;
    const cached = await cache.get<User>(cacheKey);
    if (cached) return cached;

    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    const user = result[0];
    if (user) {
      await cache.set(cacheKey, user, CACHE_TTL);
    }
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const nameParts = insertUser.fullName.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";
    const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        password: hashedPassword,
        firstName,
        lastName,
        referralCode,
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<any>): Promise<any | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    if (user) {
      await cache.del(`user:${id}`);
    }
    return user;
  }

  async updateUserPassword(userId: string, password: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId));
    await cache.del(`user:${userId}`);
  }

  async deleteUser(userId: string): Promise<void> {
    await db.delete(users).where(eq(users.id, userId));
    await cache.del(`user:${userId}`);
  }

  async anonymizeUser(userId: string): Promise<void> {
    const anonymizedEmail = `deleted_${userId}@anonymized.local`;
    const anonymizedName = `Anonymized User ${userId}`;
    const anonymizedUsername = `anon_${userId}`;

    await db
      .update(users)
      .set({
        email: anonymizedEmail,
        fullName: anonymizedName,
        username: anonymizedUsername,
        phoneNumber: "",
        dateOfBirth: null,
        firstName: "Anonymized",
        lastName: "User",
        twoFactorEnabled: false,
        kycStatus: "pending",
      })
      .where(eq(users.id, userId));

    await cache.del(`user:${userId}`);
  }

  // Blog posts
  async getAllBlogPosts(): Promise<BlogPost[]> {
    const cacheKey = "blog_posts:all";
    const cached = await cache.get<BlogPost[]>(cacheKey);
    if (cached) return cached;

    const posts = await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
    await cache.set(cacheKey, posts, CACHE_TTL);
    return posts;
  }

  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    const cacheKey = `blog_post:${id}`;
    const cached = await cache.get<BlogPost>(cacheKey);
    if (cached) return cached;

    const result = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
    const post = result[0];
    if (post) {
      await cache.set(cacheKey, post, CACHE_TTL);
    }
    return post;
  }

  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const [post] = await db.insert(blogPosts).values(insertPost).returning();
    await cache.del("blog_posts:all");
    return post;
  }

  async updateBlogPost(
    id: string,
    updates: Partial<InsertBlogPost>
  ): Promise<BlogPost | undefined> {
    const [post] = await db
      .update(blogPosts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    if (post) {
      await cache.del(`blog_post:${id}`);
      await cache.del("blog_posts:all");
    }
    return post;
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    const result = await db.delete(blogPosts).where(eq(blogPosts.id, id));
    await cache.del(`blog_post:${id}`);
    await cache.del("blog_posts:all");
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async incrementBlogPostViews(id: string): Promise<void> {
    await db
      .update(blogPosts)
      .set({ views: sql`${blogPosts.views} + 1` })
      .where(eq(blogPosts.id, id));
    await cache.del(`blog_post:${id}`);
  }

  // Admin campaigns
  async getAllAdminCampaigns(): Promise<AdminCampaign[]> {
    const cacheKey = "admin_campaigns:all";
    const cached = await cache.get<AdminCampaign[]>(cacheKey);
    if (cached) return cached;

    const campaigns = await db
      .select()
      .from(adminCampaigns)
      .orderBy(desc(adminCampaigns.createdAt));
    await cache.set(cacheKey, campaigns, CACHE_TTL);
    return campaigns;
  }

  async getAdminCampaign(id: string): Promise<AdminCampaign | undefined> {
    const result = await db.select().from(adminCampaigns).where(eq(adminCampaigns.id, id)).limit(1);
    return result[0];
  }

  async createAdminCampaign(insertCampaign: InsertAdminCampaign): Promise<AdminCampaign> {
    const [campaign] = await db.insert(adminCampaigns).values(insertCampaign).returning();
    await cache.del("admin_campaigns:all");
    return campaign;
  }

  async updateAdminCampaign(
    id: string,
    updates: Partial<InsertAdminCampaign>
  ): Promise<AdminCampaign | undefined> {
    const [campaign] = await db
      .update(adminCampaigns)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(adminCampaigns.id, id))
      .returning();
    if (campaign) {
      await cache.del("admin_campaigns:all");
    }
    return campaign;
  }

  async deleteAdminCampaign(id: string): Promise<boolean> {
    const result = await db.delete(adminCampaigns).where(eq(adminCampaigns.id, id));
    await cache.del("admin_campaigns:all");
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Withdrawal requests
  async getAllWithdrawalRequests(): Promise<WithdrawalRequest[]> {
    return await db.select().from(withdrawalRequests).orderBy(desc(withdrawalRequests.createdAt));
  }

  async getWithdrawalRequest(id: string): Promise<WithdrawalRequest | undefined> {
    const result = await db
      .select()
      .from(withdrawalRequests)
      .where(eq(withdrawalRequests.id, id))
      .limit(1);
    return result[0];
  }

  async createWithdrawalRequest(
    insertRequest: InsertWithdrawalRequest
  ): Promise<WithdrawalRequest> {
    const [request] = await db.insert(withdrawalRequests).values(insertRequest).returning();
    return request;
  }

  async updateWithdrawalRequest(
    id: string,
    updates: Partial<WithdrawalRequest>
  ): Promise<WithdrawalRequest | undefined> {
    const [request] = await db
      .update(withdrawalRequests)
      .set(updates)
      .where(eq(withdrawalRequests.id, id))
      .returning();
    return request;
  }

  // Deposit requests
  async getAllDepositRequests(): Promise<DepositRequest[]> {
    return await db.select().from(depositRequests).orderBy(desc(depositRequests.createdAt));
  }

  async getDepositRequest(id: string): Promise<DepositRequest | undefined> {
    const result = await db
      .select()
      .from(depositRequests)
      .where(eq(depositRequests.id, id))
      .limit(1);
    return result[0];
  }

  async createDepositRequest(insertRequest: InsertDepositRequest): Promise<DepositRequest> {
    const [request] = await db.insert(depositRequests).values(insertRequest).returning();
    return request;
  }

  async updateDepositRequest(
    id: string,
    updates: Partial<DepositRequest>
  ): Promise<DepositRequest | undefined> {
    const [request] = await db
      .update(depositRequests)
      .set(updates)
      .where(eq(depositRequests.id, id))
      .returning();
    return request;
  }

  // Financial settings
  async getFinancialSettings(): Promise<FinancialSettings> {
    const cacheKey = "financial_settings";
    const cached = await cache.get<FinancialSettings>(cacheKey);
    if (cached) return cached;

    const result = await db.select().from(financialSettings).limit(1);
    let settings = result[0];

    if (!settings) {
      [settings] = await db.insert(financialSettings).values({}).returning();
    }

    await cache.set(cacheKey, settings, CACHE_TTL);
    return settings;
  }

  async updateFinancialSettings(
    updates: Partial<InsertFinancialSettings>
  ): Promise<FinancialSettings> {
    const current = await this.getFinancialSettings();
    const [settings] = await db
      .update(financialSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(financialSettings.id, current.id))
      .returning();
    await cache.del("financial_settings");
    return settings;
  }

  // Transaction logs
  async getAllTransactionLogs(): Promise<TransactionLog[]> {
    return await db.select().from(transactionLogs).orderBy(desc(transactionLogs.createdAt));
  }

  async getTransactionLogByTxnId(transactionId: string): Promise<TransactionLog | undefined> {
    const result = await db
      .select()
      .from(transactionLogs)
      .where(eq(transactionLogs.transactionId, transactionId))
      .limit(1);
    return result[0];
  }

  async createTransactionLog(insertLog: InsertTransactionLog): Promise<TransactionLog> {
    const [log] = await db.insert(transactionLogs).values(insertLog).returning();
    return log;
  }

  // User transactions
  async getTransactionsByUserId(userId: string) {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(50);
  }

  async createPasswordResetToken(
    insertToken: InsertPasswordResetToken
  ): Promise<PasswordResetToken> {
    const [token] = await db.insert(passwordResetTokens).values(insertToken).returning();
    return token;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const result = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token))
      .limit(1);
    return result[0];
  }

  async markTokenAsUsed(tokenId: string): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, tokenId));
  }

  // Referral settings
  async getReferralSettings(): Promise<ReferralSettings> {
    const cacheKey = "referral_settings";
    const cached = await cache.get<ReferralSettings>(cacheKey);
    if (cached) return cached;

    const result = await db.select().from(referralSettings).limit(1);
    let settings = result[0];

    if (!settings) {
      [settings] = await db.insert(referralSettings).values({}).returning();
    }

    await cache.set(cacheKey, settings, CACHE_TTL);
    return settings;
  }

  async updateReferralSettings(
    updates: Partial<InsertReferralSettings>
  ): Promise<ReferralSettings> {
    const current = await this.getReferralSettings();
    const [settings] = await db
      .update(referralSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(referralSettings.id, current.id))
      .returning();
    await cache.del("referral_settings");
    return settings;
  }

  // Roles
  async getAllRoles(): Promise<Role[]> {
    const cacheKey = "roles:all";
    const cached = await cache.get<Role[]>(cacheKey);
    if (cached) return cached;

    const allRoles = await db.select().from(roles).orderBy(desc(roles.createdAt));
    await cache.set(cacheKey, allRoles, CACHE_TTL);
    return allRoles;
  }

  async getRole(id: string): Promise<Role | undefined> {
    const result = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
    return result[0];
  }

  async createRole(insertRole: InsertRole): Promise<Role> {
    const [role] = await db.insert(roles).values(insertRole).returning();
    await cache.del("roles:all");
    return role;
  }

  async updateRole(id: string, updates: Partial<InsertRole>): Promise<Role | undefined> {
    const [role] = await db
      .update(roles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(roles.id, id))
      .returning();
    if (role) {
      await cache.del("roles:all");
    }
    return role;
  }

  async deleteRole(id: string): Promise<boolean> {
    const result = await db.delete(roles).where(eq(roles.id, id));
    await cache.del("roles:all");
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Staff members
  async getAllStaffMembers(): Promise<StaffMember[]> {
    return await db.select().from(staffMembers).orderBy(desc(staffMembers.createdAt));
  }

  async getStaffMember(id: string): Promise<StaffMember | undefined> {
    const result = await db.select().from(staffMembers).where(eq(staffMembers.id, id)).limit(1);
    return result[0];
  }

  async createStaffMember(insertStaff: InsertStaffMember): Promise<StaffMember> {
    const [staff] = await db.insert(staffMembers).values(insertStaff).returning();
    return staff;
  }

  async updateStaffMember(
    id: string,
    updates: Partial<StaffMember>
  ): Promise<StaffMember | undefined> {
    const [staff] = await db
      .update(staffMembers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(staffMembers.id, id))
      .returning();
    return staff;
  }

  async deleteStaffMember(id: string): Promise<boolean> {
    const result = await db.delete(staffMembers).where(eq(staffMembers.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const cacheKey = "subscription_plans:all";
    const cached = await cache.get<SubscriptionPlan[]>(cacheKey);
    if (cached) return cached;

    const plans = await db.select().from(subscriptionPlans).orderBy(subscriptionPlans.displayOrder);
    await cache.set(cacheKey, plans, CACHE_TTL);
    return plans;
  }

  async getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined> {
    const result = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, id))
      .limit(1);
    return result[0];
  }

  async createSubscriptionPlan(insertPlan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [plan] = await db.insert(subscriptionPlans).values(insertPlan).returning();
    await cache.del("subscription_plans:all");
    return plan;
  }

  async updateSubscriptionPlan(
    id: string,
    updates: Partial<InsertSubscriptionPlan>
  ): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db
      .update(subscriptionPlans)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(subscriptionPlans.id, id))
      .returning();
    if (plan) {
      await cache.del("subscription_plans:all");
    }
    return plan;
  }

  async deleteSubscriptionPlan(id: string): Promise<boolean> {
    const result = await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    await cache.del("subscription_plans:all");
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    return await db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.userId, userId))
      .orderBy(desc(paymentMethods.createdAt));
  }

  async getPaymentMethod(id: string): Promise<PaymentMethod | undefined> {
    const result = await db.select().from(paymentMethods).where(eq(paymentMethods.id, id)).limit(1);
    return result[0];
  }

  async createPaymentMethod(insertMethod: InsertPaymentMethod): Promise<PaymentMethod> {
    const [method] = await db.insert(paymentMethods).values(insertMethod).returning();
    return method;
  }

  async updatePaymentMethod(
    id: string,
    updates: Partial<InsertPaymentMethod>
  ): Promise<PaymentMethod | undefined> {
    const [method] = await db
      .update(paymentMethods)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(paymentMethods.id, id))
      .returning();
    return method;
  }

  async deletePaymentMethod(id: string): Promise<boolean> {
    const result = await db.delete(paymentMethods).where(eq(paymentMethods.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async setDefaultPaymentMethod(userId: string, methodId: string): Promise<void> {
    await db
      .update(paymentMethods)
      .set({ isDefault: false })
      .where(eq(paymentMethods.userId, userId));

    await db.update(paymentMethods).set({ isDefault: true }).where(eq(paymentMethods.id, methodId));
  }

  // FAQs
  async getAllFaqs(): Promise<Faq[]> {
    const cacheKey = "faqs:all";
    const cached = await cache.get<Faq[]>(cacheKey);
    if (cached) return cached;

    const allFaqs = await db.select().from(faqs).orderBy(faqs.order);
    await cache.set(cacheKey, allFaqs, CACHE_TTL);
    return allFaqs;
  }

  async getFaq(id: string): Promise<Faq | undefined> {
    const result = await db.select().from(faqs).where(eq(faqs.id, id)).limit(1);
    return result[0];
  }

  async createFaq(insertFaq: InsertFaq): Promise<Faq> {
    const [faq] = await db.insert(faqs).values(insertFaq).returning();
    await cache.del("faqs:all");
    return faq;
  }

  async updateFaq(id: string, updates: Partial<InsertFaq>): Promise<Faq | undefined> {
    const [faq] = await db
      .update(faqs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(faqs.id, id))
      .returning();
    if (faq) {
      await cache.del("faqs:all");
    }
    return faq;
  }

  async deleteFaq(id: string): Promise<boolean> {
    const result = await db.delete(faqs).where(eq(faqs.id, id));
    await cache.del("faqs:all");
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getAllAuditLogs(): Promise<AuditLog[]> {
    return await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt));
  }

  async getAuditLogsByAdmin(adminId: string): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.adminId, adminId))
      .orderBy(desc(auditLogs.createdAt));
  }

  async getAuditLogsByResource(resource: string, resourceId?: string): Promise<AuditLog[]> {
    if (resourceId) {
      return await db
        .select()
        .from(auditLogs)
        .where(and(eq(auditLogs.resource, resource), eq(auditLogs.resourceId, resourceId)))
        .orderBy(desc(auditLogs.createdAt));
    }
    return await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.resource, resource))
      .orderBy(desc(auditLogs.createdAt));
  }

  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const [log] = await db.insert(auditLogs).values(insertLog).returning();
    return log;
  }

  async getAllChapaPayments(): Promise<ChapaPayment[]> {
    return await db.select().from(chapaPayments).orderBy(desc(chapaPayments.createdAt));
  }

  async getChapaPayment(id: string): Promise<ChapaPayment | undefined> {
    const result = await db.select().from(chapaPayments).where(eq(chapaPayments.id, id));
    return result[0];
  }

  async getChapaPaymentByTxRef(txRef: string): Promise<ChapaPayment | undefined> {
    const result = await db.select().from(chapaPayments).where(eq(chapaPayments.txRef, txRef));
    return result[0];
  }

  async getUserChapaPayments(userId: string): Promise<ChapaPayment[]> {
    return await db
      .select()
      .from(chapaPayments)
      .where(eq(chapaPayments.userId, userId))
      .orderBy(desc(chapaPayments.createdAt));
  }

  async createChapaPayment(insertPayment: InsertChapaPayment): Promise<ChapaPayment> {
    const [payment] = await db.insert(chapaPayments).values(insertPayment).returning();
    return payment;
  }

  async updateChapaPayment(
    id: string,
    updates: Partial<ChapaPayment>
  ): Promise<ChapaPayment | undefined> {
    const [payment] = await db
      .update(chapaPayments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(chapaPayments.id, id))
      .returning();
    return payment;
  }

  async createAdView(insertAdView: InsertAdView): Promise<AdView> {
    const [adView] = await db.insert(adViews).values(insertAdView).returning();
    return adView;
  }

  async getAdView(id: string): Promise<AdView | undefined> {
    const result = await db.select().from(adViews).where(eq(adViews.id, id)).limit(1);
    return result[0];
  }

  async getAdViewByToken(token: string): Promise<AdView | undefined> {
    const result = await db.select().from(adViews).where(eq(adViews.trackingToken, token)).limit(1);
    return result[0];
  }

  async updateAdView(id: string, updates: Partial<AdView>): Promise<AdView | undefined> {
    const [adView] = await db.update(adViews).set(updates).where(eq(adViews.id, id)).returning();
    return adView;
  }

  async getUserAdViews(userId: string): Promise<AdView[]> {
    return await db
      .select()
      .from(adViews)
      .where(eq(adViews.userId, userId))
      .orderBy(desc(adViews.createdAt));
  }

  async getCampaignAdViews(campaignId: string): Promise<AdView[]> {
    return await db
      .select()
      .from(adViews)
      .where(eq(adViews.campaignId, campaignId))
      .orderBy(desc(adViews.createdAt));
  }

  async getUserAdViewsSince(userId: string, since: Date): Promise<AdView[]> {
    return await db
      .select()
      .from(adViews)
      .where(sql`${adViews.userId} = ${userId} AND ${adViews.viewStarted} >= ${since}`)
      .orderBy(desc(adViews.createdAt));
  }

  async getAdViewsByIpSince(ipAddress: string, since: Date): Promise<AdView[]> {
    return await db
      .select()
      .from(adViews)
      .where(sql`${adViews.ipAddress} = ${ipAddress} AND ${adViews.viewStarted} >= ${since}`)
      .orderBy(desc(adViews.createdAt));
  }

  async getUserCampaignViews(userId: string, campaignId: string): Promise<AdView[]> {
    return await db
      .select()
      .from(adViews)
      .where(sql`${adViews.userId} = ${userId} AND ${adViews.campaignId} = ${campaignId}`)
      .orderBy(desc(adViews.createdAt));
  }

  async getFlaggedAdViews(): Promise<AdView[]> {
    return await db
      .select()
      .from(adViews)
      .where(eq(adViews.flaggedAsFraud, true))
      .orderBy(desc(adViews.createdAt));
  }

  async getFraudDetectionSettings(): Promise<FraudDetectionSettings> {
    const result = await db.select().from(fraudDetectionSettings).limit(1);
    if (result.length === 0) {
      const [settings] = await db
        .insert(fraudDetectionSettings)
        .values({
          maxViewsPerUserPerDay: 50,
          maxViewsPerIpPerDay: 100,
          maxViewsPerCampaignPerUser: 5,
          minViewDurationSeconds: 5,
          suspiciousUserAgentPatterns: [],
          blockVpnProxies: false,
          autoFlagThreshold: 80,
          enabled: true,
        })
        .returning();
      return settings;
    }
    return result[0];
  }

  async updateFraudDetectionSettings(
    settings: Partial<InsertFraudDetectionSettings>
  ): Promise<FraudDetectionSettings> {
    const existing = await this.getFraudDetectionSettings();
    const [updated] = await db
      .update(fraudDetectionSettings)
      .set({ ...settings, updatedAt: new Date() })
      .where(eq(fraudDetectionSettings.id, existing.id))
      .returning();
    return updated;
  }

  async getMaintenanceSettings(): Promise<MaintenanceSettings> {
    const result = await db.select().from(maintenanceSettings).limit(1);
    if (result.length === 0) {
      const [settings] = await db
        .insert(maintenanceSettings)
        .values({
          enabled: false,
          message: null,
          enabledAt: null,
          enabledBy: null,
          updatedBy: null,
        })
        .returning();
      return settings;
    }
    return result[0];
  }

  async updateMaintenanceSettings(
    settings: Partial<InsertMaintenanceSettings>
  ): Promise<MaintenanceSettings> {
    const existing = await this.getMaintenanceSettings();
    const [updated] = await db
      .update(maintenanceSettings)
      .set({ ...settings, updatedAt: new Date() })
      .where(eq(maintenanceSettings.id, existing.id))
      .returning();
    return updated;
  }

  async saveConsentRecords(records: InsertConsentRecord[]): Promise<void> {
    if (records.length === 0) return;
    await db.insert(consentRecords).values(records);
  }

  async getLatestConsentRecords(userId: string): Promise<ConsentRecord[]> {
    const allRecords = await db
      .select()
      .from(consentRecords)
      .where(eq(consentRecords.userId, userId))
      .orderBy(desc(consentRecords.timestamp));

    const latestRecords: ConsentRecord[] = [];
    const consentTypes = new Set<string>();

    for (const record of allRecords) {
      if (!consentTypes.has(record.consentType)) {
        latestRecords.push(record);
        consentTypes.add(record.consentType);
      }
    }

    return latestRecords;
  }

  async getConsentHistory(userId: string): Promise<ConsentRecord[]> {
    return await db
      .select()
      .from(consentRecords)
      .where(eq(consentRecords.userId, userId))
      .orderBy(desc(consentRecords.timestamp));
  }

  async markUserForDeletion(userId: string): Promise<void> {
    await db.update(users).set({ status: "pending_deletion" }).where(eq(users.id, userId));
    await cache.del(`user:${userId}`);
  }

  async saveMFABackupCodes(userId: string, codes: string[]): Promise<void> {
    const backupCodes = codes.map((code) => ({
      userId,
      code,
      used: false,
    }));
    await db.insert(mfaBackupCodes).values(backupCodes);
  }

  async getMFABackupCodes(userId: string): Promise<string[]> {
    const result = await db
      .select()
      .from(mfaBackupCodes)
      .where(and(eq(mfaBackupCodes.userId, userId), eq(mfaBackupCodes.used, false)));
    return result.map((row) => row.code);
  }

  async removeUsedBackupCode(userId: string, code: string): Promise<void> {
    await db
      .update(mfaBackupCodes)
      .set({ used: true })
      .where(and(eq(mfaBackupCodes.userId, userId), eq(mfaBackupCodes.code, code)));
  }

  async deleteMFABackupCodes(userId: string): Promise<void> {
    await db.delete(mfaBackupCodes).where(eq(mfaBackupCodes.userId, userId));
  }

  async getCampaignsByUserId(userId: string): Promise<any[]> {
    return await db.select().from(adminCampaigns).orderBy(desc(adminCampaigns.createdAt));
  }

  async getPaymentsByDateRange(startDate: Date, endDate: Date): Promise<any[]> {
    return await db
      .select()
      .from(chapaPayments)
      .where(
        and(
          sql`${chapaPayments.createdAt} >= ${startDate}`,
          sql`${chapaPayments.createdAt} <= ${endDate}`
        )
      )
      .orderBy(desc(chapaPayments.createdAt));
  }

  async getAllUsers(): Promise<any[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getPlatformStats(): Promise<any> {
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [campaignCount] = await db.select({ count: sql<number>`count(*)` }).from(adminCampaigns);
    const [paymentCount] = await db.select({ count: sql<number>`count(*)` }).from(chapaPayments);
    const [adViewCount] = await db.select({ count: sql<number>`count(*)` }).from(adViews);

    return {
      totalUsers: userCount.count,
      totalCampaigns: campaignCount.count,
      totalPayments: paymentCount.count,
      totalAdViews: adViewCount.count,
    };
  }

  async getAllAdViewingUpgrades(): Promise<any[]> {
    throw new Error("Not implemented");
  }

  async getAdViewingUpgrade(id: string): Promise<any | undefined> {
    throw new Error("Not implemented");
  }

  async getActiveAdViewingUpgrades(): Promise<any[]> {
    throw new Error("Not implemented");
  }

  async createAdViewingUpgrade(upgrade: any): Promise<any> {
    throw new Error("Not implemented");
  }

  async updateAdViewingUpgrade(id: string, updates: Partial<any>): Promise<any | undefined> {
    throw new Error("Not implemented");
  }

  async deleteAdViewingUpgrade(id: string): Promise<boolean> {
    throw new Error("Not implemented");
  }

  async getUserAdViewingUpgrades(userId: string): Promise<any[]> {
    throw new Error("Not implemented");
  }

  async getActiveUserUpgrade(userId: string): Promise<any | undefined> {
    throw new Error("Not implemented");
  }

  async createUserAdViewingUpgrade(userUpgrade: any): Promise<any> {
    throw new Error("Not implemented");
  }

  async updateUserAdViewingUpgrade(id: string, updates: Partial<any>): Promise<any | undefined> {
    throw new Error("Not implemented");
  }

  async expireUserUpgrades(): Promise<void> {
    throw new Error("Not implemented");
  }
}

export const pgStorage = new PostgreSQLStorage();
