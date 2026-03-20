import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { Redis } from "ioredis";
import { storage } from "./storage";
import { jwtService } from "./jwt";
import { logger } from "./logger";

let io: SocketIOServer | null = null;

export function initializeWebSocket(server: HTTPServer): SocketIOServer {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:5000",
    "http://localhost:3000",
  ];

  io = new SocketIOServer(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
    maxHttpBufferSize: 1e6,
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  const pubClient = new Redis(redisUrl);
  const subClient = pubClient.duplicate();

  Promise.all([pubClient.connect(), subClient.connect()])
    .then(() => {
      io!.adapter(createAdapter(pubClient, subClient));
      logger.info("Socket.IO Redis adapter configured for horizontal scaling");
    })
    .catch((err) => {
      logger.error("Failed to configure Socket.IO Redis adapter", { error: err.message });
    });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication required"));
      }

      const payload = await jwtService.verifyAccessTokenWithBlacklist(token);
      socket.data.userId = payload.userId;
      socket.data.userRole = payload.role;
      next();
    } catch {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    logger.info("Client connected", { socketId: socket.id, userId: socket.data.userId });

    socket.on("join-admin", async () => {
      try {
        const userId = socket.data.userId;
        const user = await storage.getUser(userId);
        if (user && (user.role === "admin" || user.role === "staff")) {
          socket.join("admin-room");
          logger.info("Admin joined admin room", { email: user.email, userId: user.id });
        } else {
          socket.emit("error", { message: "Insufficient permissions" });
        }
      } catch (error) {
        logger.error("Error joining admin room", error);
        socket.emit("error", { message: "Failed to join admin room" });
      }
    });

    socket.on("disconnect", () => {
      logger.info("Client disconnected", { socketId: socket.id });
    });
  });

  return io;
}

export function emitFraudAlert(adView: any) {
  if (!io) {
    logger.warn("WebSocket not initialized");
    return;
  }

  io.to("admin-room").emit("fraud-alert", {
    id: adView.id,
    userId: adView.userId,
    campaignId: adView.campaignId,
    fraudScore: adView.fraudScore,
    fraudReason: adView.fraudReason,
    ipAddress: adView.ipAddress,
    timestamp: new Date().toISOString(),
  });

  logger.info("Fraud alert emitted", { adViewId: adView.id, fraudScore: adView.fraudScore });
}

export function getIO(): SocketIOServer | null {
  return io;
}
