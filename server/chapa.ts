import dotenv from "dotenv";
import crypto from "crypto";
dotenv.config();

export interface ChapaPaymentRequest {
  amount: string;
  currency: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  tx_ref: string;
  callback_url: string;
  return_url: string;
  customization?: {
    title?: string;
    description?: string;
    logo?: string;
  };
}

export interface ChapaPaymentResponse {
  message: string;
  status: string;
  data: {
    checkout_url: string;
  };
}

export interface ChapaVerificationResponse {
  message: string;
  status: string;
  data: {
    first_name: string;
    last_name: string;
    email: string;
    currency: string;
    amount: string;
    charge: string;
    mode: string;
    method: string;
    type: string;
    status: string;
    reference: string;
    tx_ref: string;
    customization: {
      title: string;
      description: string;
      logo: string;
    };
    meta: any;
    created_at: string;
    updated_at: string;
  };
}

export interface ChapaWebhookPayload {
  event: string;
  data: {
    first_name: string;
    last_name: string;
    email: string;
    currency: string;
    amount: string;
    charge: string;
    mode: string;
    method: string;
    type: string;
    status: string;
    reference: string;
    tx_ref: string;
    customization: {
      title: string;
      description: string;
      logo: string;
    };
    meta: any;
    created_at: string;
    updated_at: string;
  };
}

class ChapaService {
  private secretKey: string;
  private baseUrl: string;

  constructor() {
    this.secretKey = process.env.CHAPA_SECRET_KEY || "";
    this.baseUrl = "https://api.chapa.co/v1";

    if (!this.secretKey) {
      console.warn("CHAPA_SECRET_KEY is not set in environment variables");
    }
  }

  private async makeRequest(
    endpoint: string,
    method: "GET" | "POST" = "GET",
    data?: any
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.secretKey}`,
      "Content-Type": "application/json",
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (data && method === "POST") {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Chapa API request failed");
    }

    return result;
  }

  async initializePayment(paymentData: ChapaPaymentRequest): Promise<ChapaPaymentResponse> {
    return this.makeRequest("/transaction/initialize", "POST", paymentData);
  }

  async verifyPayment(txRef: string): Promise<ChapaVerificationResponse> {
    return this.makeRequest(`/transaction/verify/${txRef}`);
  }

  async getBanks(): Promise<any> {
    return this.makeRequest("/banks");
  }

  async createSubaccount(data: {
    business_name: string;
    account_name: string;
    bank_code: string;
    account_number: string;
    split_type: "percentage" | "flat";
    split_value: number;
  }): Promise<any> {
    return this.makeRequest("/subaccount", "POST", data);
  }

  generateTxRef(): string {
    return `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const webhookSecret = process.env.CHAPA_WEBHOOK_SECRET || "";

    if (!webhookSecret) {
      console.warn("CHAPA_WEBHOOK_SECRET is not set");
      return false;
    }

    const hash = crypto.createHmac("sha256", webhookSecret).update(payload).digest("hex");

    return hash === signature;
  }
}

export const chapaService = new ChapaService();
