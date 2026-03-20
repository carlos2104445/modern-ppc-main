import {
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
  type AdViewingUpgrade,
  type InsertAdViewingUpgrade,
  type UserAdViewingUpgrade,
  type InsertUserAdViewingUpgrade,
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

// modify the interface with any CRUD methods
// you might need

/* eslint-disable no-unused-vars */
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Blog posts
  getAllBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(id: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: string): Promise<boolean>;
  incrementBlogPostViews(id: string): Promise<void>;

  // Admin campaigns
  getAllAdminCampaigns(): Promise<AdminCampaign[]>;
  getAdminCampaign(id: string): Promise<AdminCampaign | undefined>;
  createAdminCampaign(campaign: InsertAdminCampaign): Promise<AdminCampaign>;
  updateAdminCampaign(
    id: string,
    campaign: Partial<InsertAdminCampaign>
  ): Promise<AdminCampaign | undefined>;
  deleteAdminCampaign(id: string): Promise<boolean>;

  // Withdrawal requests
  getAllWithdrawalRequests(): Promise<WithdrawalRequest[]>;
  getWithdrawalRequest(id: string): Promise<WithdrawalRequest | undefined>;
  createWithdrawalRequest(request: InsertWithdrawalRequest): Promise<WithdrawalRequest>;
  updateWithdrawalRequest(
    id: string,
    request: Partial<WithdrawalRequest>
  ): Promise<WithdrawalRequest | undefined>;

  // Deposit requests
  getAllDepositRequests(): Promise<DepositRequest[]>;
  getDepositRequest(id: string): Promise<DepositRequest | undefined>;
  createDepositRequest(request: InsertDepositRequest): Promise<DepositRequest>;
  updateDepositRequest(
    id: string,
    request: Partial<DepositRequest>
  ): Promise<DepositRequest | undefined>;

  // Financial settings
  getFinancialSettings(): Promise<FinancialSettings>;
  updateFinancialSettings(settings: Partial<InsertFinancialSettings>): Promise<FinancialSettings>;

  // Transaction logs
  getAllTransactionLogs(): Promise<TransactionLog[]>;
  getTransactionLogByTxnId(transactionId: string): Promise<TransactionLog | undefined>;
  createTransactionLog(log: InsertTransactionLog): Promise<TransactionLog>;

  // Authentication
  getUserByEmail(email: string): Promise<User | undefined>;
  createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markTokenAsUsed(tokenId: string): Promise<void>;
  updateUserPassword(userId: string, password: string): Promise<void>;
  deleteUser(userId: string): Promise<void>;
  anonymizeUser(userId: string): Promise<void>;

  // Referral settings
  getReferralSettings(): Promise<ReferralSettings>;
  updateReferralSettings(settings: Partial<InsertReferralSettings>): Promise<ReferralSettings>;

  // Roles
  getAllRoles(): Promise<Role[]>;
  getRole(id: string): Promise<Role | undefined>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: string, role: Partial<InsertRole>): Promise<Role | undefined>;
  deleteRole(id: string): Promise<boolean>;

  // Staff members
  getAllStaffMembers(): Promise<StaffMember[]>;
  getStaffMember(id: string): Promise<StaffMember | undefined>;
  createStaffMember(staff: InsertStaffMember): Promise<StaffMember>;
  updateStaffMember(id: string, staff: Partial<StaffMember>): Promise<StaffMember | undefined>;
  deleteStaffMember(id: string): Promise<boolean>;

  // Subscription Plans
  getAllSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  updateSubscriptionPlan(
    id: string,
    plan: Partial<InsertSubscriptionPlan>
  ): Promise<SubscriptionPlan | undefined>;
  deleteSubscriptionPlan(id: string): Promise<boolean>;

  // Payment Methods
  getUserPaymentMethods(userId: string): Promise<PaymentMethod[]>;
  getPaymentMethod(id: string): Promise<PaymentMethod | undefined>;
  createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod>;
  updatePaymentMethod(
    id: string,
    method: Partial<InsertPaymentMethod>
  ): Promise<PaymentMethod | undefined>;
  deletePaymentMethod(id: string): Promise<boolean>;
  setDefaultPaymentMethod(userId: string, methodId: string): Promise<void>;

  // FAQs
  getAllFaqs(): Promise<Faq[]>;
  getFaq(id: string): Promise<Faq | undefined>;
  createFaq(faq: InsertFaq): Promise<Faq>;
  updateFaq(id: string, faq: Partial<InsertFaq>): Promise<Faq | undefined>;
  deleteFaq(id: string): Promise<boolean>;

  // Audit Logs
  getAllAuditLogs(): Promise<AuditLog[]>;
  getAuditLogsByAdmin(adminId: string): Promise<AuditLog[]>;
  getAuditLogsByResource(resource: string, resourceId?: string): Promise<AuditLog[]>;
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;

  getAllChapaPayments(): Promise<ChapaPayment[]>;
  getChapaPayment(id: string): Promise<ChapaPayment | undefined>;
  getChapaPaymentByTxRef(txRef: string): Promise<ChapaPayment | undefined>;
  getUserChapaPayments(userId: string): Promise<ChapaPayment[]>;
  createChapaPayment(payment: InsertChapaPayment): Promise<ChapaPayment>;
  updateChapaPayment(id: string, payment: Partial<ChapaPayment>): Promise<ChapaPayment | undefined>;

  createAdView(adView: InsertAdView): Promise<AdView>;
  getAdView(id: string): Promise<AdView | undefined>;
  getAdViewByToken(token: string): Promise<AdView | undefined>;
  updateAdView(id: string, updates: Partial<AdView>): Promise<AdView | undefined>;
  getUserAdViews(userId: string): Promise<AdView[]>;
  getCampaignAdViews(campaignId: string): Promise<AdView[]>;
  getUserAdViewsSince(userId: string, since: Date): Promise<AdView[]>;
  getAdViewsByIpSince(ipAddress: string, since: Date): Promise<AdView[]>;
  getUserCampaignViews(userId: string, campaignId: string): Promise<AdView[]>;
  getFlaggedAdViews(): Promise<AdView[]>;

  getFraudDetectionSettings(): Promise<FraudDetectionSettings>;
  updateFraudDetectionSettings(
    settings: Partial<InsertFraudDetectionSettings>
  ): Promise<FraudDetectionSettings>;

  getMaintenanceSettings(): Promise<MaintenanceSettings>;
  updateMaintenanceSettings(
    settings: Partial<InsertMaintenanceSettings>
  ): Promise<MaintenanceSettings>;

  saveConsentRecords(records: InsertConsentRecord[]): Promise<void>;
  getLatestConsentRecords(userId: string): Promise<ConsentRecord[]>;
  getConsentHistory(userId: string): Promise<ConsentRecord[]>;
  markUserForDeletion(userId: string): Promise<void>;

  saveMFABackupCodes(userId: string, codes: string[]): Promise<void>;
  getMFABackupCodes(userId: string): Promise<string[]>;
  removeUsedBackupCode(userId: string, code: string): Promise<void>;
  deleteMFABackupCodes(userId: string): Promise<void>;

  getCampaignsByUserId(userId: string): Promise<any[]>;
  getPaymentsByDateRange(startDate: Date, endDate: Date): Promise<any[]>;
  getAllUsers(): Promise<User[]>;
  getPlatformStats(): Promise<any>;

  getAllAdViewingUpgrades(): Promise<any[]>;
  getAdViewingUpgrade(id: string): Promise<any | undefined>;
  getActiveAdViewingUpgrades(): Promise<any[]>;
  createAdViewingUpgrade(upgrade: any): Promise<any>;
  updateAdViewingUpgrade(id: string, upgrade: Partial<any>): Promise<any | undefined>;
  deleteAdViewingUpgrade(id: string): Promise<boolean>;

  getUserAdViewingUpgrades(userId: string): Promise<any[]>;
  getActiveUserUpgrade(userId: string): Promise<any | undefined>;
  createUserAdViewingUpgrade(userUpgrade: any): Promise<any>;
  updateUserAdViewingUpgrade(id: string, updates: Partial<any>): Promise<any | undefined>;
  expireUserUpgrades(): Promise<void>;
}
/* eslint-enable no-unused-vars */

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private blogPosts: Map<string, BlogPost>;
  private adminCampaigns: Map<string, AdminCampaign>;
  private withdrawalRequests: Map<string, WithdrawalRequest>;
  private depositRequests: Map<string, DepositRequest>;
  private financialSettings: FinancialSettings;
  private transactionLogs: Map<string, TransactionLog>;
  private passwordResetTokens: Map<string, PasswordResetToken>;
  private referralSettings: ReferralSettings;
  private roles: Map<string, Role>;
  private staffMembers: Map<string, StaffMember>;
  private subscriptionPlans: Map<string, SubscriptionPlan>;
  private faqs: Map<string, Faq>;
  private paymentMethods: Map<string, PaymentMethod>;
  private auditLogs: Map<string, AuditLog>;
  private chapaPayments: Map<string, ChapaPayment>;
  private adViews: Map<string, AdView>;
  private fraudDetectionSettings: FraudDetectionSettings;
  private maintenanceSettings: MaintenanceSettings;
  private consentRecords: Map<string, ConsentRecord>;
  private mfaBackupCodes: Map<string, string[]>;
  private adViewingUpgrades: Map<string, AdViewingUpgrade>;
  private userAdViewingUpgrades: Map<string, UserAdViewingUpgrade>;

  constructor() {
    this.users = new Map();
    this.blogPosts = new Map();
    this.adminCampaigns = new Map();
    this.withdrawalRequests = new Map();
    this.depositRequests = new Map();
    this.financialSettings = {
      id: randomUUID(),
      taxPercentage: "0",
      withdrawalFeePercentage: "0",
      depositFeePercentage: "0",
      updatedAt: new Date(),
      updatedBy: null,
    };
    this.transactionLogs = new Map();
    this.passwordResetTokens = new Map();
    this.paymentMethods = new Map();
    this.auditLogs = new Map();
    this.chapaPayments = new Map();
    this.adViews = new Map();
    this.consentRecords = new Map();
    this.mfaBackupCodes = new Map();
    this.adViewingUpgrades = new Map();
    this.userAdViewingUpgrades = new Map();
    this.referralSettings = {
      id: randomUUID(),
      level1Percentage: "10.00",
      level2Percentage: "5.00",
      level3Percentage: "2.00",
      level4Percentage: "1.00",
      level5Percentage: "0.50",
      enabled: true,
      maxLevels: 5,
      updatedAt: new Date(),
      updatedBy: null,
    };
    this.roles = new Map();
    this.staffMembers = new Map();
    this.subscriptionPlans = new Map();
    this.faqs = new Map();
    this.fraudDetectionSettings = {
      id: randomUUID(),
      maxViewsPerUserPerDay: 50,
      maxViewsPerIpPerDay: 100,
      maxViewsPerCampaignPerUser: 5,
      minViewDurationSeconds: 5,
      suspiciousUserAgentPatterns: [],
      blockVpnProxies: false,
      autoFlagThreshold: 80,
      enabled: true,
      updatedAt: new Date(),
      updatedBy: null,
    };
    this.maintenanceSettings = {
      id: randomUUID(),
      enabled: false,
      message: null,
      enabledAt: null,
      enabledBy: null,
      updatedAt: new Date(),
      updatedBy: null,
    };

    // Initialize with default subscription plans
    this.initializeDefaultPlans();
    this.seedTransactionLogs();
    this.seedAdminUser();
    this.seedRolesAndStaff();
    this.seedFaqs();
  }

  private seedAdminUser() {
    const adminId = randomUUID();
    const hashedPassword = bcrypt.hashSync("admin123", 10);
    const admin: User = {
      id: adminId,
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
      createdAt: new Date(),
    };
    this.users.set(adminId, admin);
  }

  private seedTransactionLogs() {
    const sampleLogs = [
      {
        transactionId: "TXN-2025-001234",
        userId: "user-001",
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
        userId: "user-002",
        type: "withdrawal",
        amount: "500.00",
        fee: "10.00",
        tax: "15.00",
        netAmount: "475.00",
        method: "Mobile Money",
        status: "completed",
        description: "Withdrawal request",
      },
      {
        transactionId: "TXN-2025-001236",
        userId: "user-003",
        type: "deposit",
        amount: "750.00",
        fee: "15.00",
        tax: "22.50",
        netAmount: "712.50",
        method: "Credit Card",
        status: "failed",
        description: "Payment failed",
      },
      {
        transactionId: "TXN-2025-001237",
        userId: "user-001",
        type: "withdrawal",
        amount: "300.00",
        fee: "6.00",
        tax: "9.00",
        netAmount: "285.00",
        method: "Bank Transfer",
        status: "pending",
        description: "Pending withdrawal",
      },
    ];

    sampleLogs.forEach((log) => {
      const id = randomUUID();
      const now = new Date();
      this.transactionLogs.set(id, {
        id,
        ...log,
        createdAt: now,
      });
    });
  }

  private seedRolesAndStaff() {
    const now = new Date();

    // Seed roles
    const superAdminId = randomUUID();
    const financeManagerId = randomUUID();
    const supportAgentId = randomUUID();
    const contentModeratorId = randomUUID();

    this.roles.set(superAdminId, {
      id: superAdminId,
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
      createdAt: now,
      updatedAt: now,
    });

    this.roles.set(financeManagerId, {
      id: financeManagerId,
      name: "Finance Manager",
      description: "Manage financial operations and transactions",
      permissions: ["view_financials", "process_withdrawals", "manage_deposits", "view_users"],
      createdAt: now,
      updatedAt: now,
    });

    this.roles.set(supportAgentId, {
      id: supportAgentId,
      name: "Support Agent",
      description: "Handle customer support and tickets",
      permissions: ["view_tickets", "reply_tickets", "view_users"],
      createdAt: now,
      updatedAt: now,
    });

    this.roles.set(contentModeratorId, {
      id: contentModeratorId,
      name: "Content Moderator",
      description: "Review and approve content",
      permissions: ["review_ads", "approve_publishers"],
      createdAt: now,
      updatedAt: now,
    });

    // Get admin user
    const adminUser = Array.from(this.users.values()).find(
      (u) => u.email === "admin@adconnect.com"
    );
    if (adminUser) {
      const staffId = randomUUID();
      this.staffMembers.set(staffId, {
        id: staffId,
        userId: adminUser.id,
        roleId: superAdminId,
        status: "active",
        assignedBy: null,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const nameParts = insertUser.fullName.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const hashedPassword = await bcrypt.hash(insertUser.password, 10);

    const user: User = {
      id,
      username: insertUser.username,
      email: insertUser.email,
      password: hashedPassword,
      firstName,
      lastName,
      fullName: insertUser.fullName,
      phoneNumber: insertUser.phoneNumber,
      dateOfBirth: insertUser.dateOfBirth || null,
      role: "user",
      balance: "0.00",
      lifetimeEarnings: "0.00",
      lifetimeSpending: "0.00",
      reputationScore: 0,
      referralCode: randomUUID().substring(0, 8).toUpperCase(),
      referredBy: null,
      status: "active",
      kycStatus: "pending",
      twoFactorEnabled: false,
      xp: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      streakFreezes: 0,
      createdAt: now,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    const updated: User = { ...existing, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  async getAllBlogPosts(): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values());
  }

  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }

  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const id = randomUUID();
    const now = new Date();
    const post: BlogPost = {
      id,
      title: insertPost.title,
      author: insertPost.author,
      category: insertPost.category,
      status: insertPost.status || "draft",
      publishedDate: insertPost.publishedDate || null,
      excerpt: insertPost.excerpt,
      content: insertPost.content || null,
      views: insertPost.views || 0,
      featured: insertPost.featured || false,
      metaTitle: insertPost.metaTitle || null,
      metaDescription: insertPost.metaDescription || null,
      createdAt: now,
      updatedAt: now,
    };
    this.blogPosts.set(id, post);
    return post;
  }

  async updateBlogPost(
    id: string,
    updates: Partial<InsertBlogPost>
  ): Promise<BlogPost | undefined> {
    const existing = this.blogPosts.get(id);
    if (!existing) return undefined;

    const updated: BlogPost = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.blogPosts.set(id, updated);
    return updated;
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    return this.blogPosts.delete(id);
  }

  async incrementBlogPostViews(id: string): Promise<void> {
    const post = this.blogPosts.get(id);
    if (post) {
      post.views += 1;
      this.blogPosts.set(id, post);
    }
  }

  async getAllAdminCampaigns(): Promise<AdminCampaign[]> {
    return Array.from(this.adminCampaigns.values());
  }

  async getAdminCampaign(id: string): Promise<AdminCampaign | undefined> {
    return this.adminCampaigns.get(id);
  }

  async createAdminCampaign(insertCampaign: InsertAdminCampaign): Promise<AdminCampaign> {
    const id = randomUUID();
    const now = new Date();
    const campaign: AdminCampaign = {
      id,
      name: insertCampaign.name,
      type: insertCampaign.type,
      url: insertCampaign.url,
      title: insertCampaign.title,
      description: insertCampaign.description || "",
      budget: insertCampaign.budget,
      cpc: insertCampaign.cpc,
      duration: insertCampaign.duration || 15,
      clicks: 0,
      status: insertCampaign.status || "active",
      imageUrl: insertCampaign.imageUrl || null,
      createdAt: now,
      updatedAt: now,
    };
    this.adminCampaigns.set(id, campaign);
    return campaign;
  }

  async updateAdminCampaign(
    id: string,
    updates: Partial<InsertAdminCampaign>
  ): Promise<AdminCampaign | undefined> {
    const existing = this.adminCampaigns.get(id);
    if (!existing) return undefined;

    const updated: AdminCampaign = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.adminCampaigns.set(id, updated);
    return updated;
  }

  async deleteAdminCampaign(id: string): Promise<boolean> {
    return this.adminCampaigns.delete(id);
  }

  async getAllWithdrawalRequests(): Promise<WithdrawalRequest[]> {
    return Array.from(this.withdrawalRequests.values());
  }

  async getWithdrawalRequest(id: string): Promise<WithdrawalRequest | undefined> {
    return this.withdrawalRequests.get(id);
  }

  async createWithdrawalRequest(
    insertRequest: InsertWithdrawalRequest
  ): Promise<WithdrawalRequest> {
    const id = randomUUID();
    const now = new Date();
    const request: WithdrawalRequest = {
      id,
      userId: insertRequest.userId,
      amount: insertRequest.amount,
      method: insertRequest.method,
      accountDetails: insertRequest.accountDetails,
      status: insertRequest.status || "pending",
      rejectionReason: insertRequest.rejectionReason || null,
      reviewedBy: null,
      reviewedAt: null,
      createdAt: now,
    };
    this.withdrawalRequests.set(id, request);
    return request;
  }

  async updateWithdrawalRequest(
    id: string,
    updates: Partial<WithdrawalRequest>
  ): Promise<WithdrawalRequest | undefined> {
    const existing = this.withdrawalRequests.get(id);
    if (!existing) return undefined;

    const updated: WithdrawalRequest = {
      ...existing,
      ...updates,
    };
    this.withdrawalRequests.set(id, updated);
    return updated;
  }

  async getAllDepositRequests(): Promise<DepositRequest[]> {
    return Array.from(this.depositRequests.values());
  }

  async getDepositRequest(id: string): Promise<DepositRequest | undefined> {
    return this.depositRequests.get(id);
  }

  async createDepositRequest(insertRequest: InsertDepositRequest): Promise<DepositRequest> {
    const id = randomUUID();
    const now = new Date();
    const request: DepositRequest = {
      id,
      userId: insertRequest.userId,
      amount: insertRequest.amount,
      method: insertRequest.method,
      status: insertRequest.status || "pending",
      transactionId: insertRequest.transactionId || null,
      failureReason: insertRequest.failureReason || null,
      createdAt: now,
      completedAt: null,
    };
    this.depositRequests.set(id, request);
    return request;
  }

  async updateDepositRequest(
    id: string,
    updates: Partial<DepositRequest>
  ): Promise<DepositRequest | undefined> {
    const existing = this.depositRequests.get(id);
    if (!existing) return undefined;

    const updated: DepositRequest = {
      ...existing,
      ...updates,
    };
    this.depositRequests.set(id, updated);
    return updated;
  }

  async getFinancialSettings(): Promise<FinancialSettings> {
    return this.financialSettings;
  }

  async updateFinancialSettings(
    updates: Partial<InsertFinancialSettings>
  ): Promise<FinancialSettings> {
    this.financialSettings = {
      ...this.financialSettings,
      ...updates,
      updatedAt: new Date(),
    };
    return this.financialSettings;
  }

  async getAllTransactionLogs(): Promise<TransactionLog[]> {
    return Array.from(this.transactionLogs.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getTransactionLogByTxnId(transactionId: string): Promise<TransactionLog | undefined> {
    return Array.from(this.transactionLogs.values()).find(
      (log) => log.transactionId === transactionId
    );
  }

  async createTransactionLog(insertLog: InsertTransactionLog): Promise<TransactionLog> {
    const id = randomUUID();
    const now = new Date();
    const log: TransactionLog = {
      id,
      transactionId: insertLog.transactionId,
      userId: insertLog.userId,
      type: insertLog.type,
      amount: insertLog.amount,
      fee: insertLog.fee || "0",
      tax: insertLog.tax || "0",
      netAmount: insertLog.netAmount,
      method: insertLog.method,
      status: insertLog.status,
      description: insertLog.description || null,
      createdAt: now,
    };
    this.transactionLogs.set(id, log);
    return log;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async createPasswordResetToken(
    insertToken: InsertPasswordResetToken
  ): Promise<PasswordResetToken> {
    const id = randomUUID();
    const now = new Date();
    const token: PasswordResetToken = {
      id,
      userId: insertToken.userId,
      token: insertToken.token,
      expiresAt: insertToken.expiresAt,
      used: false,
      createdAt: now,
    };
    this.passwordResetTokens.set(id, token);
    return token;
  }

  async getPasswordResetToken(tokenString: string): Promise<PasswordResetToken | undefined> {
    return Array.from(this.passwordResetTokens.values()).find(
      (token) => token.token === tokenString && !token.used
    );
  }

  async markTokenAsUsed(tokenId: string): Promise<void> {
    const token = this.passwordResetTokens.get(tokenId);
    if (token) {
      this.passwordResetTokens.set(tokenId, { ...token, used: true });
    }
  }

  async updateUserPassword(userId: string, password: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      this.users.set(userId, { ...user, password: hashedPassword });
    }
  }

  async deleteUser(userId: string): Promise<void> {
    this.users.delete(userId);
  }

  async anonymizeUser(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      this.users.set(userId, {
        ...user,
        email: `deleted_${userId}@anonymized.local`,
        fullName: `Anonymized User ${userId}`,
        username: `anon_${userId}`,
        phoneNumber: "",
        dateOfBirth: null,
        firstName: "Anonymized",
        lastName: "User",
        twoFactorEnabled: false,
        kycStatus: "pending",
      });
    }
  }

  async getReferralSettings(): Promise<ReferralSettings> {
    return this.referralSettings;
  }

  async updateReferralSettings(
    updates: Partial<InsertReferralSettings>
  ): Promise<ReferralSettings> {
    this.referralSettings = {
      ...this.referralSettings,
      ...updates,
      updatedAt: new Date(),
    };
    return this.referralSettings;
  }

  // Role methods
  async getAllRoles(): Promise<Role[]> {
    return Array.from(this.roles.values()).sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
  }

  async getRole(id: string): Promise<Role | undefined> {
    return this.roles.get(id);
  }

  async createRole(insertRole: InsertRole): Promise<Role> {
    const id = randomUUID();
    const now = new Date();
    const role: Role = {
      id,
      name: insertRole.name,
      description: insertRole.description || null,
      permissions: insertRole.permissions,
      createdAt: now,
      updatedAt: now,
    };
    this.roles.set(id, role);
    return role;
  }

  async updateRole(id: string, updates: Partial<InsertRole>): Promise<Role | undefined> {
    const existing = this.roles.get(id);
    if (!existing) return undefined;

    const updated: Role = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.roles.set(id, updated);
    return updated;
  }

  async deleteRole(id: string): Promise<boolean> {
    return this.roles.delete(id);
  }

  // Staff member methods
  async getAllStaffMembers(): Promise<StaffMember[]> {
    return Array.from(this.staffMembers.values()).sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
  }

  async getStaffMember(id: string): Promise<StaffMember | undefined> {
    return this.staffMembers.get(id);
  }

  async createStaffMember(insertStaff: InsertStaffMember): Promise<StaffMember> {
    const id = randomUUID();
    const now = new Date();
    const staff: StaffMember = {
      id,
      userId: insertStaff.userId,
      roleId: insertStaff.roleId,
      status: insertStaff.status || "active",
      assignedBy: insertStaff.assignedBy || null,
      createdAt: now,
      updatedAt: now,
    };
    this.staffMembers.set(id, staff);
    return staff;
  }

  async updateStaffMember(
    id: string,
    updates: Partial<StaffMember>
  ): Promise<StaffMember | undefined> {
    const existing = this.staffMembers.get(id);
    if (!existing) return undefined;

    const updated: StaffMember = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.staffMembers.set(id, updated);
    return updated;
  }

  async deleteStaffMember(id: string): Promise<boolean> {
    return this.staffMembers.delete(id);
  }

  // FAQ seed method
  private seedFaqs() {
    const faqs: InsertFaq[] = [
      {
        question: "How do I start earning money on AdConnect?",
        answer:
          "To start earning, simply sign up for a free account, browse available ads in the 'Earn Money' section, and click on ads that interest you. You'll earn money for each ad you view based on the advertiser's rate.",
        category: "Getting Started",
        order: 1,
        isPublished: true,
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept various payment methods including bank transfers, mobile money (M-Pesa, Telebirr), and digital wallets. You can manage your preferred payment method in your wallet settings.",
        category: "Payments",
        order: 2,
        isPublished: true,
      },
      {
        question: "How long does it take to withdraw my earnings?",
        answer:
          "Withdrawal requests are typically processed within 24-48 hours during business days. The actual time to receive funds may vary depending on your chosen payment method.",
        category: "Payments",
        order: 3,
        isPublished: true,
      },
      {
        question: "What is the minimum withdrawal amount?",
        answer:
          "The minimum withdrawal amount is ETB 100. This helps us keep transaction fees low and ensures efficient processing of your payments.",
        category: "Payments",
        order: 4,
        isPublished: true,
      },
      {
        question: "How do I create an advertising campaign?",
        answer:
          "Go to the 'Campaigns' section, click 'Create Campaign', choose your ad type (Link, YouTube Video, or Banner Image), set your budget and cost-per-click, and submit for approval. Once approved, your ad will start running.",
        category: "Advertising",
        order: 5,
        isPublished: true,
      },
      {
        question: "How does the referral program work?",
        answer:
          "Share your unique referral link with friends. When they sign up and start earning, you'll receive a commission from their earnings across multiple levels. Check the 'Referrals' page for your commission structure and earnings.",
        category: "Referrals",
        order: 6,
        isPublished: true,
      },
    ];

    faqs.forEach((faqData) => {
      const id = randomUUID();
      const now = new Date();
      const faq: Faq = {
        id,
        question: faqData.question,
        answer: faqData.answer,
        category: faqData.category,
        order: faqData.order ?? 0,
        isPublished: faqData.isPublished ?? true,
        createdAt: now,
        updatedAt: now,
      };
      this.faqs.set(id, faq);
    });
  }

  // Initialize default subscription plans
  private initializeDefaultPlans() {
    const plans = [
      {
        name: "Free",
        description: "Perfect for getting started with ad viewing",
        price: "0.00",
        billingCycle: "monthly",
        features: ["10 ads per day", "Basic support", "Standard referral commission"],
        dailyAdViewLimit: 10,
        maxCampaigns: 0,
        maxActiveAds: 0,
        withdrawalFeeDiscount: "0",
        referralBonusMultiplier: "1.00",
        prioritySupport: false,
        adReviewPriority: false,
        status: "active",
        displayOrder: 1,
      },
      {
        name: "Premium",
        description: "Maximize your earnings with more ads and benefits",
        price: "299.00",
        billingCycle: "monthly",
        features: [
          "50 ads per day",
          "5 active campaigns",
          "10 active ads",
          "Priority support",
          "10% withdrawal fee discount",
          "1.5x referral bonus",
        ],
        dailyAdViewLimit: 50,
        maxCampaigns: 5,
        maxActiveAds: 10,
        withdrawalFeeDiscount: "10.00",
        referralBonusMultiplier: "1.50",
        prioritySupport: true,
        adReviewPriority: false,
        status: "active",
        displayOrder: 2,
      },
      {
        name: "Business",
        description: "For serious advertisers and earners",
        price: "999.00",
        billingCycle: "monthly",
        features: [
          "Unlimited ads per day",
          "Unlimited campaigns",
          "Unlimited active ads",
          "24/7 priority support",
          "25% withdrawal fee discount",
          "2x referral bonus",
          "Priority ad review",
        ],
        dailyAdViewLimit: -1,
        maxCampaigns: -1,
        maxActiveAds: -1,
        withdrawalFeeDiscount: "25.00",
        referralBonusMultiplier: "2.00",
        prioritySupport: true,
        adReviewPriority: true,
        status: "active",
        displayOrder: 3,
      },
    ];

    plans.forEach((planData) => {
      const id = randomUUID();
      const now = new Date();
      const plan: SubscriptionPlan = {
        id,
        ...planData,
        createdAt: now,
        updatedAt: now,
      };
      this.subscriptionPlans.set(id, plan);
    });
  }

  // Subscription Plans methods
  async getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return Array.from(this.subscriptionPlans.values()).sort(
      (a, b) => a.displayOrder - b.displayOrder
    );
  }

  async getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined> {
    return this.subscriptionPlans.get(id);
  }

  async createSubscriptionPlan(insertPlan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const id = randomUUID();
    const now = new Date();
    const plan: SubscriptionPlan = {
      id,
      name: insertPlan.name,
      description: insertPlan.description,
      price: insertPlan.price,
      billingCycle: insertPlan.billingCycle ?? "monthly",
      features: insertPlan.features,
      dailyAdViewLimit: insertPlan.dailyAdViewLimit ?? 0,
      maxCampaigns: insertPlan.maxCampaigns ?? 0,
      maxActiveAds: insertPlan.maxActiveAds ?? 0,
      withdrawalFeeDiscount: insertPlan.withdrawalFeeDiscount ?? "0",
      referralBonusMultiplier: insertPlan.referralBonusMultiplier ?? "1.00",
      prioritySupport: insertPlan.prioritySupport ?? false,
      adReviewPriority: insertPlan.adReviewPriority ?? false,
      status: insertPlan.status ?? "active",
      displayOrder: insertPlan.displayOrder ?? 0,
      createdAt: now,
      updatedAt: now,
    };
    this.subscriptionPlans.set(id, plan);
    return plan;
  }

  async updateSubscriptionPlan(
    id: string,
    updates: Partial<InsertSubscriptionPlan>
  ): Promise<SubscriptionPlan | undefined> {
    const existing = this.subscriptionPlans.get(id);
    if (!existing) return undefined;

    const updated: SubscriptionPlan = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.subscriptionPlans.set(id, updated);
    return updated;
  }

  async deleteSubscriptionPlan(id: string): Promise<boolean> {
    return this.subscriptionPlans.delete(id);
  }

  // Payment Methods methods
  async getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    const methods = Array.from(this.paymentMethods.values()).filter(
      (method) => method.userId === userId
    );
    return methods;
  }

  async getPaymentMethod(id: string): Promise<PaymentMethod | undefined> {
    return this.paymentMethods.get(id);
  }

  async createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod> {
    const id = randomUUID();
    const newMethod: PaymentMethod = {
      id,
      userId: method.userId,
      type: method.type,
      isDefault: method.isDefault ?? false,
      cardholderName: method.cardholderName ?? null,
      lastFourDigits: method.lastFourDigits,
      expiryMonth: method.expiryMonth ?? null,
      expiryYear: method.expiryYear ?? null,
      cardBrand: method.cardBrand ?? null,
      accountHolderName: method.accountHolderName ?? null,
      bankName: method.bankName ?? null,
      accountType: method.accountType ?? null,
      status: method.status || "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.paymentMethods.set(id, newMethod);
    return newMethod;
  }

  async updatePaymentMethod(
    id: string,
    method: Partial<InsertPaymentMethod>
  ): Promise<PaymentMethod | undefined> {
    const existing = this.paymentMethods.get(id);
    if (!existing) return undefined;

    const updated: PaymentMethod = {
      ...existing,
      ...method,
      updatedAt: new Date(),
    };
    this.paymentMethods.set(id, updated);
    return updated;
  }

  async deletePaymentMethod(id: string): Promise<boolean> {
    return this.paymentMethods.delete(id);
  }

  async setDefaultPaymentMethod(userId: string, methodId: string): Promise<void> {
    const userMethods = Array.from(this.paymentMethods.values()).filter(
      (method) => method.userId === userId
    );

    for (const method of userMethods) {
      if (method.id === methodId) {
        method.isDefault = true;
      } else {
        method.isDefault = false;
      }
      this.paymentMethods.set(method.id, method);
    }
  }

  // FAQ methods
  async getAllFaqs(): Promise<Faq[]> {
    return Array.from(this.faqs.values()).sort((a, b) => a.order - b.order);
  }

  async getFaq(id: string): Promise<Faq | undefined> {
    return this.faqs.get(id);
  }

  async createFaq(insertFaq: InsertFaq): Promise<Faq> {
    const id = randomUUID();
    const now = new Date();
    const faq: Faq = {
      id,
      question: insertFaq.question,
      answer: insertFaq.answer,
      category: insertFaq.category,
      order: insertFaq.order ?? 0,
      isPublished: insertFaq.isPublished ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.faqs.set(id, faq);
    return faq;
  }

  async updateFaq(id: string, updates: Partial<InsertFaq>): Promise<Faq | undefined> {
    const existing = this.faqs.get(id);
    if (!existing) return undefined;

    const updated: Faq = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.faqs.set(id, updated);
    return updated;
  }

  async deleteFaq(id: string): Promise<boolean> {
    return this.faqs.delete(id);
  }

  // Audit Logs methods
  async getAllAuditLogs(): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getAuditLogsByAdmin(adminId: string): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values())
      .filter((log) => log.adminId === adminId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAuditLogsByResource(resource: string, resourceId?: string): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values())
      .filter((log) => {
        if (resourceId) {
          return log.resource === resource && log.resourceId === resourceId;
        }
        return log.resource === resource;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const id = randomUUID();
    const newLog: AuditLog = {
      id,
      adminId: log.adminId,
      adminEmail: log.adminEmail,
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId ?? null,
      details: log.details ?? null,
      ipAddress: log.ipAddress ?? null,
      userAgent: log.userAgent ?? null,
      createdAt: new Date(),
    };
    this.auditLogs.set(id, newLog);
    return newLog;
  }

  async getAllChapaPayments(): Promise<ChapaPayment[]> {
    return Array.from(this.chapaPayments.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getChapaPayment(id: string): Promise<ChapaPayment | undefined> {
    return this.chapaPayments.get(id);
  }

  async getChapaPaymentByTxRef(txRef: string): Promise<ChapaPayment | undefined> {
    return Array.from(this.chapaPayments.values()).find((payment) => payment.txRef === txRef);
  }

  async getUserChapaPayments(userId: string): Promise<ChapaPayment[]> {
    return Array.from(this.chapaPayments.values())
      .filter((payment) => payment.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createChapaPayment(insertPayment: InsertChapaPayment): Promise<ChapaPayment> {
    const id = randomUUID();
    const now = new Date();
    const payment: ChapaPayment = {
      id,
      userId: insertPayment.userId,
      txRef: insertPayment.txRef,
      amount: insertPayment.amount,
      currency: insertPayment.currency || "ETB",
      email: insertPayment.email,
      firstName: insertPayment.firstName,
      lastName: insertPayment.lastName,
      phoneNumber: insertPayment.phoneNumber || null,
      status: insertPayment.status || "pending",
      chapaReference: insertPayment.chapaReference || null,
      paymentMethod: insertPayment.paymentMethod || null,
      charge: insertPayment.charge || null,
      mode: insertPayment.mode || null,
      type: insertPayment.type || null,
      checkoutUrl: insertPayment.checkoutUrl || null,
      metadata: insertPayment.metadata || null,
      createdAt: now,
      updatedAt: now,
      completedAt: insertPayment.completedAt || null,
    };
    this.chapaPayments.set(id, payment);
    return payment;
  }

  async updateChapaPayment(
    id: string,
    updates: Partial<ChapaPayment>
  ): Promise<ChapaPayment | undefined> {
    const existing = this.chapaPayments.get(id);
    if (!existing) return undefined;

    const updated: ChapaPayment = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.chapaPayments.set(id, updated);
    return updated;
  }

  async createAdView(insertAdView: InsertAdView): Promise<AdView> {
    const id = randomUUID();
    const now = new Date();
    const adView: AdView = {
      id,
      userId: insertAdView.userId,
      campaignId: insertAdView.campaignId,
      trackingToken: insertAdView.trackingToken,
      viewStarted: insertAdView.viewStarted || now,
      viewCompleted: insertAdView.viewCompleted || null,
      linkClicked: insertAdView.linkClicked || false,
      linkClickedAt: insertAdView.linkClickedAt || null,
      rewardClaimed: insertAdView.rewardClaimed || false,
      rewardClaimedAt: insertAdView.rewardClaimedAt || null,
      rewardAmount: insertAdView.rewardAmount || null,
      ipAddress: insertAdView.ipAddress || null,
      userAgent: insertAdView.userAgent || null,
      fraudScore: insertAdView.fraudScore || 0,
      flaggedAsFraud: insertAdView.flaggedAsFraud || false,
      fraudReason: insertAdView.fraudReason || null,
      createdAt: now,
    };
    this.adViews.set(id, adView);
    return adView;
  }

  async getAdView(id: string): Promise<AdView | undefined> {
    return this.adViews.get(id);
  }

  async getAdViewByToken(token: string): Promise<AdView | undefined> {
    return Array.from(this.adViews.values()).find((adView) => adView.trackingToken === token);
  }

  async updateAdView(id: string, updates: Partial<AdView>): Promise<AdView | undefined> {
    const existing = this.adViews.get(id);
    if (!existing) return undefined;

    const updated: AdView = {
      ...existing,
      ...updates,
    };
    this.adViews.set(id, updated);
    return updated;
  }

  async getUserAdViews(userId: string): Promise<AdView[]> {
    return Array.from(this.adViews.values()).filter((adView) => adView.userId === userId);
  }

  async getCampaignAdViews(campaignId: string): Promise<AdView[]> {
    return Array.from(this.adViews.values()).filter((adView) => adView.campaignId === campaignId);
  }

  async getUserAdViewsSince(userId: string, since: Date): Promise<AdView[]> {
    return Array.from(this.adViews.values()).filter(
      (adView) => adView.userId === userId && adView.viewStarted >= since
    );
  }

  async getAdViewsByIpSince(ipAddress: string, since: Date): Promise<AdView[]> {
    return Array.from(this.adViews.values()).filter(
      (adView) => adView.ipAddress === ipAddress && adView.viewStarted >= since
    );
  }

  async getUserCampaignViews(userId: string, campaignId: string): Promise<AdView[]> {
    return Array.from(this.adViews.values()).filter(
      (adView) => adView.userId === userId && adView.campaignId === campaignId
    );
  }

  async getFlaggedAdViews(): Promise<AdView[]> {
    return Array.from(this.adViews.values()).filter((adView) => adView.flaggedAsFraud === true);
  }

  async getFraudDetectionSettings(): Promise<FraudDetectionSettings> {
    return this.fraudDetectionSettings;
  }

  async updateFraudDetectionSettings(
    settings: Partial<InsertFraudDetectionSettings>
  ): Promise<FraudDetectionSettings> {
    this.fraudDetectionSettings = {
      ...this.fraudDetectionSettings,
      ...settings,
      updatedAt: new Date(),
    };
    return this.fraudDetectionSettings;
  }

  async getMaintenanceSettings(): Promise<MaintenanceSettings> {
    return this.maintenanceSettings;
  }

  async updateMaintenanceSettings(
    settings: Partial<InsertMaintenanceSettings>
  ): Promise<MaintenanceSettings> {
    this.maintenanceSettings = {
      ...this.maintenanceSettings,
      ...settings,
      updatedAt: new Date(),
    };
    return this.maintenanceSettings;
  }

  async saveConsentRecords(records: InsertConsentRecord[]): Promise<void> {
    for (const record of records) {
      const consentRecord: ConsentRecord = {
        id: randomUUID(),
        userId: record.userId,
        consentType: record.consentType,
        granted: record.granted,
        timestamp: record.timestamp || new Date(),
        ipAddress: record.ipAddress || null,
        userAgent: record.userAgent || null,
        version: record.version,
        createdAt: new Date(),
      };
      this.consentRecords.set(consentRecord.id, consentRecord);
    }
  }

  async getLatestConsentRecords(userId: string): Promise<ConsentRecord[]> {
    const userRecords = Array.from(this.consentRecords.values())
      .filter((record) => record.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const latestRecords: ConsentRecord[] = [];
    const consentTypes = new Set<string>();

    for (const record of userRecords) {
      if (!consentTypes.has(record.consentType)) {
        latestRecords.push(record);
        consentTypes.add(record.consentType);
      }
    }

    return latestRecords;
  }

  async getConsentHistory(userId: string): Promise<ConsentRecord[]> {
    return Array.from(this.consentRecords.values())
      .filter((record) => record.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async markUserForDeletion(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.status = "pending_deletion";
      this.users.set(userId, user);
    }
  }

  async saveMFABackupCodes(userId: string, codes: string[]): Promise<void> {
    this.mfaBackupCodes.set(userId, codes);
  }

  async getMFABackupCodes(userId: string): Promise<string[]> {
    return this.mfaBackupCodes.get(userId) || [];
  }

  async removeUsedBackupCode(userId: string, code: string): Promise<void> {
    const codes = this.mfaBackupCodes.get(userId) || [];
    const updatedCodes = codes.filter((c) => c !== code);
    this.mfaBackupCodes.set(userId, updatedCodes);
  }

  async deleteMFABackupCodes(userId: string): Promise<void> {
    this.mfaBackupCodes.delete(userId);
  }

  async getCampaignsByUserId(userId: string): Promise<any[]> {
    return Array.from(this.adminCampaigns.values());
  }

  async getPaymentsByDateRange(startDate: Date, endDate: Date): Promise<any[]> {
    return Array.from(this.chapaPayments.values()).filter((payment) => {
      const paymentDate = new Date(payment.createdAt);
      return paymentDate >= startDate && paymentDate <= endDate;
    });
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getPlatformStats(): Promise<any> {
    return {
      totalUsers: this.users.size,
      totalCampaigns: this.adminCampaigns.size,
      totalPayments: this.chapaPayments.size,
      totalAdViews: this.adViews.size,
    };
  }

  async getAllAdViewingUpgrades(): Promise<AdViewingUpgrade[]> {
    return Array.from(this.adViewingUpgrades.values());
  }

  async getAdViewingUpgrade(id: string): Promise<AdViewingUpgrade | undefined> {
    return this.adViewingUpgrades.get(id);
  }

  async getActiveAdViewingUpgrades(): Promise<AdViewingUpgrade[]> {
    return Array.from(this.adViewingUpgrades.values()).filter((u) => u.status === "active");
  }

  async createAdViewingUpgrade(upgrade: InsertAdViewingUpgrade): Promise<AdViewingUpgrade> {
    const newUpgrade: AdViewingUpgrade = {
      id: randomUUID(),
      name: upgrade.name,
      description: upgrade.description,
      price: upgrade.price,
      duration: upgrade.duration,
      rewardMultiplier: upgrade.rewardMultiplier ?? "1.00",
      dailyAdViewBonus: upgrade.dailyAdViewBonus ?? 0,
      viewDurationReduction: upgrade.viewDurationReduction ?? 0,
      priorityAccess: upgrade.priorityAccess ?? false,
      icon: upgrade.icon ?? null,
      color: upgrade.color ?? null,
      status: upgrade.status ?? "active",
      displayOrder: upgrade.displayOrder ?? 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.adViewingUpgrades.set(newUpgrade.id, newUpgrade);
    return newUpgrade;
  }

  async updateAdViewingUpgrade(
    id: string,
    upgrade: Partial<InsertAdViewingUpgrade>
  ): Promise<AdViewingUpgrade | undefined> {
    const existing = this.adViewingUpgrades.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...upgrade, updatedAt: new Date() };
    this.adViewingUpgrades.set(id, updated);
    return updated;
  }

  async deleteAdViewingUpgrade(id: string): Promise<boolean> {
    return this.adViewingUpgrades.delete(id);
  }

  async getUserAdViewingUpgrades(userId: string): Promise<UserAdViewingUpgrade[]> {
    return Array.from(this.userAdViewingUpgrades.values()).filter((u) => u.userId === userId);
  }

  async getActiveUserUpgrade(userId: string): Promise<UserAdViewingUpgrade | undefined> {
    const now = new Date();
    return Array.from(this.userAdViewingUpgrades.values()).find(
      (u) => u.userId === userId && u.status === "active" && new Date(u.expiryDate) > now
    );
  }

  async createUserAdViewingUpgrade(
    userUpgrade: InsertUserAdViewingUpgrade
  ): Promise<UserAdViewingUpgrade> {
    const newUserUpgrade: UserAdViewingUpgrade = {
      id: randomUUID(),
      userId: userUpgrade.userId,
      upgradeId: userUpgrade.upgradeId,
      purchaseDate: userUpgrade.purchaseDate ?? new Date(),
      expiryDate: userUpgrade.expiryDate,
      status: userUpgrade.status ?? "active",
      transactionId: userUpgrade.transactionId ?? null,
      createdAt: new Date(),
    };
    this.userAdViewingUpgrades.set(newUserUpgrade.id, newUserUpgrade);
    return newUserUpgrade;
  }

  async updateUserAdViewingUpgrade(
    id: string,
    updates: Partial<UserAdViewingUpgrade>
  ): Promise<UserAdViewingUpgrade | undefined> {
    const existing = this.userAdViewingUpgrades.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.userAdViewingUpgrades.set(id, updated);
    return updated;
  }

  async expireUserUpgrades(): Promise<void> {
    const now = new Date();
    for (const [id, upgrade] of Array.from(this.userAdViewingUpgrades.entries())) {
      if (upgrade.status === "active" && new Date(upgrade.expiryDate) <= now) {
        upgrade.status = "expired";
        this.userAdViewingUpgrades.set(id, upgrade);
      }
    }
  }
}

export const memStorage = new MemStorage();

// Use PostgreSQL storage for all routes
import { pgStorage } from "./pg-storage";
export const storage = pgStorage;
