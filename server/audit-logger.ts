import { storage } from "./storage";
import type { Request } from "express";
import type { User } from "@shared/schema";

interface LogOptions {
  adminUser: User;
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  req?: Request;
}

export async function logAdminAction(options: LogOptions): Promise<void> {
  const { adminUser, action, resource, resourceId, details, req } = options;

  try {
    await storage.createAuditLog({
      adminId: adminUser.id,
      adminEmail: adminUser.email,
      action,
      resource,
      resourceId: resourceId || null,
      details: details || null,
      ipAddress: req?.ip || req?.socket.remoteAddress || null,
      userAgent: req?.get("user-agent") || null,
    });
  } catch (error) {
    // Log error but don't fail the request
    console.error("Failed to create audit log:", error);
  }
}
