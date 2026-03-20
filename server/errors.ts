export enum ErrorCode {
  AUTH_REQUIRED = 1000,
  INVALID_CREDENTIALS = 1001,
  INVALID_USER = 1002,
  INVALID_TOKEN = 1003,
  TOKEN_EXPIRED = 1004,
  INSUFFICIENT_PERMISSIONS = 1005,

  VALIDATION_ERROR = 1100,
  MISSING_REQUIRED_FIELD = 1101,
  INVALID_INPUT = 1102,
  INVALID_FORMAT = 1103,

  RESOURCE_NOT_FOUND = 1200,
  RESOURCE_ALREADY_EXISTS = 1201,
  RESOURCE_CONFLICT = 1202,

  AD_VIEW_NOT_FOUND = 1300,
  AD_VIEW_ALREADY_COMPLETED = 1301,
  REWARD_ALREADY_CLAIMED = 1302,
  AD_VIEW_NOT_COMPLETED = 1303,
  INVALID_TRACKING_TOKEN = 1304,
  CAMPAIGN_NOT_FOUND = 1305,

  FRAUD_DETECTED = 1400,
  FRAUD_SCORE_TOO_HIGH = 1401,
  REWARD_CLAIM_DENIED_FRAUD = 1402,
  SUSPICIOUS_ACTIVITY = 1403,

  RATE_LIMIT_EXCEEDED = 1500,
  TOO_MANY_REQUESTS = 1501,

  INSUFFICIENT_BALANCE = 1600,
  CAMPAIGN_BUDGET_EXCEEDED = 1601,
  MIN_VIEW_DURATION_NOT_MET = 1602,
  MAX_REWARDS_PER_CAMPAIGN_REACHED = 1603,
  USER_ELIGIBILITY_FAILED = 1604,

  INTERNAL_SERVER_ERROR = 1700,
  DATABASE_ERROR = 1701,
  EXTERNAL_SERVICE_ERROR = 1702,
  CONFIGURATION_ERROR = 1703,
}

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: any;
  timestamp: string;
  path?: string;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: any;
  public readonly isOperational: boolean;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    details?: any,
    isOperational: boolean = true
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export function createApiError(
  code: ErrorCode,
  message: string,
  path?: string,
  details?: any
): ApiError {
  return {
    code,
    message,
    details,
    timestamp: new Date().toISOString(),
    path,
  };
}

export const AuthErrors = {
  required: () =>
    new AppError(
      ErrorCode.AUTH_REQUIRED,
      "Authentication required. Please provide valid credentials.",
      401
    ),

  invalidCredentials: () =>
    new AppError(ErrorCode.INVALID_CREDENTIALS, "Invalid email or password.", 401),

  invalidUser: (userId?: string) =>
    new AppError(ErrorCode.INVALID_USER, "User not found or invalid.", 401, { userId }),

  invalidToken: () =>
    new AppError(ErrorCode.INVALID_TOKEN, "Invalid or malformed authentication token.", 401),

  tokenExpired: () =>
    new AppError(
      ErrorCode.TOKEN_EXPIRED,
      "Authentication token has expired. Please login again.",
      401
    ),

  insufficientPermissions: (required: string) =>
    new AppError(
      ErrorCode.INSUFFICIENT_PERMISSIONS,
      `Insufficient permissions. Required role: ${required}`,
      403,
      { requiredRole: required }
    ),
};

export const ValidationErrors = {
  missingField: (field: string) =>
    new AppError(ErrorCode.MISSING_REQUIRED_FIELD, `Missing required field: ${field}`, 400, {
      field,
    }),

  invalidInput: (fieldOrMessage: string, reason?: string) => {
    if (reason) {
      return new AppError(
        ErrorCode.INVALID_INPUT,
        `Invalid input for field '${fieldOrMessage}': ${reason}`,
        400,
        { field: fieldOrMessage, reason }
      );
    } else {
      return new AppError(ErrorCode.INVALID_INPUT, fieldOrMessage, 400);
    }
  },

  invalidFormat: (field: string, expectedFormat: string) =>
    new AppError(
      ErrorCode.INVALID_FORMAT,
      `Invalid format for field '${field}'. Expected: ${expectedFormat}`,
      400,
      { field, expectedFormat }
    ),
};

export const ResourceErrors = {
  notFound: (resource: string, id?: string) =>
    new AppError(
      ErrorCode.RESOURCE_NOT_FOUND,
      `${resource} not found${id ? ` with ID: ${id}` : ""}`,
      404,
      { resource, id }
    ),

  alreadyExists: (resource: string, identifier: string) =>
    new AppError(
      ErrorCode.RESOURCE_ALREADY_EXISTS,
      `${resource} already exists: ${identifier}`,
      409,
      { resource, identifier }
    ),
};

export const AdTrackingErrors = {
  adViewNotFound: (token?: string) =>
    new AppError(ErrorCode.AD_VIEW_NOT_FOUND, "Ad view not found.", 404, { trackingToken: token }),

  alreadyCompleted: () =>
    new AppError(
      ErrorCode.AD_VIEW_ALREADY_COMPLETED,
      "Ad view has already been marked as completed.",
      400
    ),

  rewardAlreadyClaimed: () =>
    new AppError(
      ErrorCode.REWARD_ALREADY_CLAIMED,
      "Reward has already been claimed for this ad view.",
      400
    ),

  notCompleted: () =>
    new AppError(
      ErrorCode.AD_VIEW_NOT_COMPLETED,
      "Ad view must be completed before claiming reward.",
      400
    ),

  invalidToken: () =>
    new AppError(ErrorCode.INVALID_TRACKING_TOKEN, "Invalid or expired tracking token.", 404),

  campaignNotFound: (campaignId: string) =>
    new AppError(ErrorCode.CAMPAIGN_NOT_FOUND, "Campaign not found.", 404, { campaignId }),
};

export const FraudErrors = {
  detected: (reason: string, score: number) =>
    new AppError(ErrorCode.FRAUD_DETECTED, "Suspicious activity detected.", 403, {
      reason,
      fraudScore: score,
    }),

  scoreThreshold: (score: number, threshold: number) =>
    new AppError(
      ErrorCode.FRAUD_SCORE_TOO_HIGH,
      `Fraud score (${score}) exceeds threshold (${threshold}).`,
      403,
      { fraudScore: score, threshold }
    ),

  rewardDenied: () =>
    new AppError(
      ErrorCode.REWARD_CLAIM_DENIED_FRAUD,
      "Reward claim denied due to fraud detection.",
      403
    ),
};

export const BusinessLogicErrors = {
  budgetExceeded: (remaining: string) =>
    new AppError(ErrorCode.CAMPAIGN_BUDGET_EXCEEDED, "Campaign budget has been exceeded.", 400, {
      remainingBudget: remaining,
    }),

  minDurationNotMet: (actual: number, required: number) =>
    new AppError(
      ErrorCode.MIN_VIEW_DURATION_NOT_MET,
      `Minimum view duration of ${required} seconds not met. Actual: ${actual} seconds`,
      400,
      { actualDuration: actual, requiredDuration: required }
    ),

  maxRewardsReached: (limit: number) =>
    new AppError(
      ErrorCode.MAX_REWARDS_PER_CAMPAIGN_REACHED,
      `Maximum ${limit} rewards per campaign already claimed.`,
      400,
      { limit }
    ),
};

export const RateLimitErrors = {
  exceeded: (retryAfter: number) =>
    new AppError(
      ErrorCode.RATE_LIMIT_EXCEEDED,
      "Rate limit exceeded. Please try again later.",
      429,
      { retryAfter }
    ),
};
