import { db } from "./db";
import { users, transactions } from "@shared/schema";
import { eq, sql, and } from "drizzle-orm";
import { cache } from "./redis";

/**
 * Gamification Service
 *
 * Handles XP granting, streak management, level-ups,
 * achievement checking, and daily/weekly challenges.
 */

// ==========================================
// Level Definitions
// ==========================================

export interface LevelDef {
  level: number;
  name: string;
  minXP: number;
  maxXP: number | null;
  earningsBoostPercent: number;
  maxDailyAds: number;
  priorityAdReview: boolean;
  prioritySupport: boolean;
}

export const LEVELS: LevelDef[] = [
  { level: 1, name: "Beginner",      minXP: 0,    maxXP: 100,  earningsBoostPercent: 0,  maxDailyAds: 50,  priorityAdReview: false, prioritySupport: false },
  { level: 2, name: "Explorer",      minXP: 100,  maxXP: 300,  earningsBoostPercent: 5,  maxDailyAds: 75,  priorityAdReview: false, prioritySupport: false },
  { level: 3, name: "Achiever",      minXP: 300,  maxXP: 600,  earningsBoostPercent: 10, maxDailyAds: 100, priorityAdReview: false, prioritySupport: false },
  { level: 4, name: "Professional",  minXP: 600,  maxXP: 1000, earningsBoostPercent: 15, maxDailyAds: 150, priorityAdReview: true,  prioritySupport: false },
  { level: 5, name: "Expert",        minXP: 1000, maxXP: 1500, earningsBoostPercent: 20, maxDailyAds: 200, priorityAdReview: true,  prioritySupport: true  },
  { level: 6, name: "Master",        minXP: 1500, maxXP: null, earningsBoostPercent: 25, maxDailyAds: 300, priorityAdReview: true,  prioritySupport: true  },
];

// ==========================================
// Achievement Definitions
// ==========================================

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "earner" | "advertiser" | "both";
  rarity: "common" | "rare" | "epic" | "legendary";
  target: number;
  rewardBirr: number;
  rewardXP: number;
  checkType: "ads_viewed" | "total_earned" | "streak_days" | "referrals" | "campaigns_created" | "level_reached";
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "welcome_earner",     name: "Welcome Earner",     description: "View your first ad",             icon: "HandHeart",  category: "earner",     rarity: "common",    target: 1,     rewardBirr: 5,    rewardXP: 10,   checkType: "ads_viewed" },
  { id: "consistent_clicker", name: "Consistent Clicker", description: "View 10 ads",                    icon: "Target",     category: "earner",     rarity: "common",    target: 10,    rewardBirr: 10,   rewardXP: 25,   checkType: "ads_viewed" },
  { id: "dedicated_worker",   name: "Dedicated Worker",   description: "View 100 ads",                   icon: "Zap",        category: "earner",     rarity: "rare",      target: 100,   rewardBirr: 50,   rewardXP: 100,  checkType: "ads_viewed" },
  { id: "ad_master",          name: "Ad Master",          description: "View 1,000 ads",                 icon: "Trophy",     category: "earner",     rarity: "epic",      target: 1000,  rewardBirr: 500,  rewardXP: 500,  checkType: "ads_viewed" },
  { id: "earnings_100",       name: "Earnings Milestone",  description: "Earn 100 Birr total",            icon: "Coins",      category: "earner",     rarity: "rare",      target: 100,   rewardBirr: 25,   rewardXP: 75,   checkType: "total_earned" },
  { id: "big_earner",         name: "Big Earner",          description: "Earn 1,000 Birr total",          icon: "Gem",        category: "earner",     rarity: "legendary", target: 1000,  rewardBirr: 200,  rewardXP: 500,  checkType: "total_earned" },
  { id: "streak_7",           name: "Streak Master",       description: "View ads 7 days in a row",       icon: "Flame",      category: "earner",     rarity: "rare",      target: 7,     rewardBirr: 100,  rewardXP: 150,  checkType: "streak_days" },
  { id: "streak_30",          name: "Monthly Warrior",     description: "View ads 30 days in a row",      icon: "Swords",     category: "earner",     rarity: "legendary", target: 30,    rewardBirr: 500,  rewardXP: 1000, checkType: "streak_days" },
  { id: "referrer_5",         name: "Social Influencer",   description: "Refer 5 active users",           icon: "UserPlus",   category: "both",       rarity: "epic",      target: 5,     rewardBirr: 200,  rewardXP: 250,  checkType: "referrals" },
  { id: "verified_user",      name: "Verified User",       description: "Complete KYC verification",      icon: "BadgeCheck", category: "both",       rarity: "rare",      target: 1,     rewardBirr: 100,  rewardXP: 200,  checkType: "level_reached" },
  { id: "campaign_creator",   name: "Campaign Creator",    description: "Launch your first campaign",     icon: "Rocket",     category: "advertiser", rarity: "common",    target: 1,     rewardBirr: 0,    rewardXP: 50,   checkType: "campaigns_created" },
  { id: "level_5",            name: "Expert Status",       description: "Reach Level 5",                  icon: "Crown",      category: "both",       rarity: "epic",      target: 5,     rewardBirr: 250,  rewardXP: 0,    checkType: "level_reached" },
];

// ==========================================
// Challenge Definitions
// ==========================================

export interface ChallengeDef {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly";
  icon: string;
  target: number;
  rewardBirr: number;
  rewardXP: number;
  checkType: "ads_viewed_today" | "earned_today" | "streak_active" | "ads_viewed_week" | "referrals_week";
}

export const DAILY_CHALLENGES: ChallengeDef[] = [
  { id: "daily_20_ads",  title: "Daily Ad Viewer",  description: "View 20 ads today",        type: "daily",  icon: "MousePointerClick", target: 20, rewardBirr: 25,  rewardXP: 50,  checkType: "ads_viewed_today" },
  { id: "daily_50_birr", title: "Quick Earner",      description: "Earn 50 Birr today",       type: "daily",  icon: "Coins",             target: 50, rewardBirr: 10,  rewardXP: 30,  checkType: "earned_today" },
  { id: "daily_streak",  title: "Daily Streak",      description: "Complete your daily streak", type: "daily", icon: "Target",            target: 1,  rewardBirr: 15,  rewardXP: 25,  checkType: "streak_active" },
];

export const WEEKLY_CHALLENGES: ChallengeDef[] = [
  { id: "weekly_150_ads",   title: "Weekly Warrior",    description: "View 150 ads this week",     type: "weekly", icon: "TrendingUp", target: 150, rewardBirr: 150, rewardXP: 200, checkType: "ads_viewed_week" },
  { id: "weekly_3_referrals", title: "Social Connector", description: "Refer 3 new users this week", type: "weekly", icon: "Users",      target: 3,   rewardBirr: 100, rewardXP: 150, checkType: "referrals_week" },
];

// ==========================================
// Gamification Service
// ==========================================

export class GamificationService {

  /**
   * Get the level definition for a given XP amount.
   */
  getLevelForXP(xp: number): LevelDef {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (xp >= LEVELS[i].minXP) return LEVELS[i];
    }
    return LEVELS[0];
  }

  /**
   * Grant XP to a user and handle level-ups.
   * Returns the new XP total and whether a level-up occurred.
   */
  async grantXP(userId: string, amount: number, reason: string = "activity"): Promise<{
    newXP: number;
    newLevel: number;
    leveledUp: boolean;
    levelName: string;
  }> {
    // Get current user state
    const [user] = await db
      .select({ xp: users.xp, level: users.level })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) throw new Error("User not found");

    const oldLevel = user.level;
    const newXP = user.xp + amount;
    const newLevelDef = this.getLevelForXP(newXP);
    const leveledUp = newLevelDef.level > oldLevel;

    // Update user XP and level
    await db
      .update(users)
      .set({
        xp: newXP,
        level: newLevelDef.level,
      })
      .where(eq(users.id, userId));

    // If leveled up, log a transaction for the level-up bonus
    if (leveledUp) {
      const levelUpBonus = newLevelDef.level * 5; // ETB 5 per level
      await db.transaction(async (tx) => {
        await tx
          .update(users)
          .set({
            balance: sql`CAST(${users.balance} AS numeric) + ${levelUpBonus}`,
          })
          .where(eq(users.id, userId));

        await tx.insert(transactions).values({
          userId,
          type: "level_up_bonus",
          amount: levelUpBonus.toFixed(2),
          description: `Level up! Reached Level ${newLevelDef.level}: ${newLevelDef.name}`,
          status: "completed",
        });
      });
    }

    await cache.del(`user:${userId}`).catch(() => {});

    return {
      newXP,
      newLevel: newLevelDef.level,
      leveledUp,
      levelName: newLevelDef.name,
    };
  }

  /**
   * Update streak for a user. Call this when user views an ad.
   * Only increments once per calendar day.
   */
  async updateStreak(userId: string): Promise<{
    currentStreak: number;
    longestStreak: number;
    streakUpdated: boolean;
  }> {
    const [user] = await db
      .select({
        currentStreak: users.currentStreak,
        longestStreak: users.longestStreak,
        lastActivityDate: users.lastActivityDate,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) throw new Error("User not found");

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (user.lastActivityDate) {
      const lastDate = new Date(user.lastActivityDate);
      const lastDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
      const diffDays = Math.floor((today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Already active today — no streak change
        return {
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          streakUpdated: false,
        };
      }

      if (diffDays === 1) {
        // Consecutive day — increment streak
        const newStreak = user.currentStreak + 1;
        const newLongest = Math.max(newStreak, user.longestStreak);

        await db
          .update(users)
          .set({
            currentStreak: newStreak,
            longestStreak: newLongest,
            lastActivityDate: now,
          })
          .where(eq(users.id, userId));

        await cache.del(`user:${userId}`).catch(() => {});

        return { currentStreak: newStreak, longestStreak: newLongest, streakUpdated: true };
      }

      // Streak broken (missed more than 1 day)
      await db
        .update(users)
        .set({
          currentStreak: 1,
          lastActivityDate: now,
        })
        .where(eq(users.id, userId));

      await cache.del(`user:${userId}`).catch(() => {});

      return { currentStreak: 1, longestStreak: user.longestStreak, streakUpdated: true };
    }

    // First ever activity
    await db
      .update(users)
      .set({
        currentStreak: 1,
        longestStreak: Math.max(1, user.longestStreak),
        lastActivityDate: now,
      })
      .where(eq(users.id, userId));

    await cache.del(`user:${userId}`).catch(() => {});

    return { currentStreak: 1, longestStreak: Math.max(1, user.longestStreak), streakUpdated: true };
  }

  /**
   * Get user stats needed for achievements and challenges.
   */
  async getUserStats(userId: string): Promise<{
    adsViewed: number;
    totalEarned: number;
    currentStreak: number;
    longestStreak: number;
    referralCount: number;
    campaignsCreated: number;
    level: number;
    xp: number;
    adsViewedToday: number;
    earnedToday: number;
    adsViewedThisWeek: number;
    referralsThisWeek: number;
  }> {
    const [user] = await db
      .select({
        xp: users.xp,
        level: users.level,
        currentStreak: users.currentStreak,
        longestStreak: users.longestStreak,
        lifetimeEarnings: users.lifetimeEarnings,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) throw new Error("User not found");

    // Count total ads viewed (click_earning transactions)
    const [adsResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        sql`${transactions.type} = 'click_earning'`
      ));

    // Count ads viewed today
    const [adsTodayResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        sql`${transactions.type} = 'click_earning'`,
        sql`DATE(${transactions.createdAt}) = CURRENT_DATE`
      ));

    // Sum earned today
    const [earnedTodayResult] = await db
      .select({ total: sql<string>`COALESCE(SUM(CAST(amount AS numeric)), 0)` })
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        sql`${transactions.type} = 'click_earning'`,
        sql`DATE(${transactions.createdAt}) = CURRENT_DATE`
      ));

    // Count ads viewed this week
    const [adsWeekResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        sql`${transactions.type} = 'click_earning'`,
        sql`${transactions.createdAt} >= date_trunc('week', CURRENT_DATE)`
      ));

    // Count referrals
    const [refResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(eq(users.referredBy, userId));

    // Count referrals this week
    const [refWeekResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(and(
        eq(users.referredBy, userId),
        sql`${users.createdAt} >= date_trunc('week', CURRENT_DATE)`
      ));

    // Count campaigns created
    const [campResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        sql`${transactions.type} = 'campaign_escrow'`
      ));

    return {
      xp: user.xp,
      level: user.level,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      totalEarned: parseFloat(user.lifetimeEarnings) || 0,
      adsViewed: Number(adsResult?.count) || 0,
      adsViewedToday: Number(adsTodayResult?.count) || 0,
      earnedToday: parseFloat(earnedTodayResult?.total as string) || 0,
      adsViewedThisWeek: Number(adsWeekResult?.count) || 0,
      referralCount: Number(refResult?.count) || 0,
      referralsThisWeek: Number(refWeekResult?.count) || 0,
      campaignsCreated: Number(campResult?.count) || 0,
    };
  }

  /**
   * Check and return achievement progress for the user.
   * Automatically unlocks and credits rewards for newly completed achievements.
   */
  async getAchievements(userId: string): Promise<{
    achievements: Array<AchievementDef & { progress: number; unlocked: boolean; unlockedAt?: string }>;
    newlyUnlocked: string[];
  }> {
    const stats = await this.getUserStats(userId);
    const newlyUnlocked: string[] = [];

    // Check which achievements are already claimed (stored as transactions)
    const [claimedResult] = await db
      .select({
        claimed: sql<string>`COALESCE(string_agg(DISTINCT description, '||'), '')`,
      })
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        sql`${transactions.type} = 'achievement_reward'`
      ));

    const claimedStr = claimedResult?.claimed || "";

    const results = ACHIEVEMENTS.map((ach) => {
      let progress = 0;
      switch (ach.checkType) {
        case "ads_viewed":        progress = stats.adsViewed; break;
        case "total_earned":      progress = stats.totalEarned; break;
        case "streak_days":       progress = stats.longestStreak; break;
        case "referrals":         progress = stats.referralCount; break;
        case "campaigns_created": progress = stats.campaignsCreated; break;
        case "level_reached":     progress = stats.level; break;
      }

      const unlocked = progress >= ach.target;
      const alreadyClaimed = claimedStr.includes(`achievement:${ach.id}`);

      // Auto-credit reward if newly unlocked and not already claimed
      if (unlocked && !alreadyClaimed && (ach.rewardBirr > 0 || ach.rewardXP > 0)) {
        newlyUnlocked.push(ach.id);
        // Credit reward async (don't block response)
        this.creditAchievementReward(userId, ach).catch(() => {});
      }

      return {
        ...ach,
        progress: Math.min(progress, ach.target),
        unlocked,
      };
    });

    return { achievements: results, newlyUnlocked };
  }

  private async creditAchievementReward(userId: string, ach: AchievementDef): Promise<void> {
    await db.transaction(async (tx) => {
      if (ach.rewardBirr > 0) {
        await tx
          .update(users)
          .set({ balance: sql`CAST(${users.balance} AS numeric) + ${ach.rewardBirr}` })
          .where(eq(users.id, userId));
      }

      await tx.insert(transactions).values({
        userId,
        type: "achievement_reward",
        amount: ach.rewardBirr.toFixed(2),
        description: `achievement:${ach.id} — ${ach.name} unlocked`,
        status: "completed",
      });
    });

    // Grant XP from achievement (this also checks level-up)
    if (ach.rewardXP > 0) {
      await this.grantXP(userId, ach.rewardXP, `achievement: ${ach.name}`);
    }

    await cache.del(`user:${userId}`).catch(() => {});
  }

  /**
   * Get daily and weekly challenge progress.
   */
  async getChallenges(userId: string): Promise<{
    daily: Array<ChallengeDef & { progress: number; completed: boolean; claimed: boolean }>;
    weekly: Array<ChallengeDef & { progress: number; completed: boolean; claimed: boolean }>;
  }> {
    const stats = await this.getUserStats(userId);

    // Check which challenges are already claimed today/this week
    const [claimedResult] = await db
      .select({
        claimed: sql<string>`COALESCE(string_agg(DISTINCT description, '||'), '')`,
      })
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        sql`${transactions.type} = 'challenge_reward'`,
        sql`DATE(${transactions.createdAt}) >= date_trunc('week', CURRENT_DATE)`
      ));

    const claimedStr = claimedResult?.claimed || "";

    const mapChallenge = (ch: ChallengeDef) => {
      let progress = 0;
      switch (ch.checkType) {
        case "ads_viewed_today": progress = stats.adsViewedToday; break;
        case "earned_today":     progress = stats.earnedToday; break;
        case "streak_active":    progress = stats.currentStreak > 0 ? 1 : 0; break;
        case "ads_viewed_week":  progress = stats.adsViewedThisWeek; break;
        case "referrals_week":   progress = stats.referralsThisWeek; break;
      }

      return {
        ...ch,
        progress: Math.min(progress, ch.target),
        completed: progress >= ch.target,
        claimed: claimedStr.includes(`challenge:${ch.id}`),
      };
    };

    return {
      daily: DAILY_CHALLENGES.map(mapChallenge),
      weekly: WEEKLY_CHALLENGES.map(mapChallenge),
    };
  }

  /**
   * Claim a challenge reward. Only works if challenge is completed and not yet claimed.
   */
  async claimChallengeReward(userId: string, challengeId: string): Promise<{
    success: boolean;
    message: string;
    rewardBirr?: number;
    rewardXP?: number;
  }> {
    const allChallenges = [...DAILY_CHALLENGES, ...WEEKLY_CHALLENGES];
    const challenge = allChallenges.find((c) => c.id === challengeId);
    if (!challenge) return { success: false, message: "Challenge not found" };

    const challengeData = await this.getChallenges(userId);
    const all = [...challengeData.daily, ...challengeData.weekly];
    const current = all.find((c) => c.id === challengeId);

    if (!current) return { success: false, message: "Challenge not found" };
    if (!current.completed) return { success: false, message: "Challenge not completed yet" };
    if (current.claimed) return { success: false, message: "Reward already claimed" };

    // Credit the reward
    await db.transaction(async (tx) => {
      if (challenge.rewardBirr > 0) {
        await tx
          .update(users)
          .set({ balance: sql`CAST(${users.balance} AS numeric) + ${challenge.rewardBirr}` })
          .where(eq(users.id, userId));
      }

      await tx.insert(transactions).values({
        userId,
        type: "challenge_reward",
        amount: challenge.rewardBirr.toFixed(2),
        description: `challenge:${challenge.id} — ${challenge.title}`,
        status: "completed",
      });
    });

    // Grant XP
    if (challenge.rewardXP > 0) {
      await this.grantXP(userId, challenge.rewardXP, `challenge: ${challenge.title}`);
    }

    await cache.del(`user:${userId}`).catch(() => {});

    return {
      success: true,
      message: `Reward claimed: ${challenge.rewardBirr} ETB + ${challenge.rewardXP} XP`,
      rewardBirr: challenge.rewardBirr,
      rewardXP: challenge.rewardXP,
    };
  }

  /**
   * Called after every ad view to handle all gamification in one call.
   */
  async onAdViewCompleted(userId: string): Promise<void> {
    // 1. Update streak
    await this.updateStreak(userId);

    // 2. Grant XP for viewing an ad (10 XP per view)
    await this.grantXP(userId, 10, "ad view");

    // 3. Check achievements (auto-credits newly unlocked ones)
    await this.getAchievements(userId);
  }
}

export const gamificationService = new GamificationService();
