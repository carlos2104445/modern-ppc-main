import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useToast } from "@/hooks/use-toast";

interface FraudAlert {
  id: string;
  userId: string;
  campaignId: string;
  fraudScore: number;
  fraudReason: string | null;
  ipAddress: string | null;
  timestamp: string;
}

export function useFraudAlerts(userId: string | null, isAdmin: boolean = false) {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!isAdmin || !userId) {
      return;
    }

    const newSocket = io(window.location.origin, {
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket");
      newSocket.emit("join-admin", { userId });
    });

    newSocket.on("fraud-alert", (alert: FraudAlert) => {
      console.log("Fraud alert received:", alert);

      setAlerts((prev) => [alert, ...prev].slice(0, 50));

      toast({
        title: "⚠️ Fraud Alert",
        description: `High-risk activity detected (Score: ${alert.fraudScore})`,
        variant: "destructive",
      });
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from WebSocket");
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [userId, isAdmin, toast]);

  return { alerts, socket };
}
