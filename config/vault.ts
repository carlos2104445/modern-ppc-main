import axios from "axios";

const VAULT_ADDR = process.env.VAULT_ADDR || "http://localhost:8200";
const VAULT_TOKEN = process.env.VAULT_TOKEN;
const VAULT_NAMESPACE = process.env.VAULT_NAMESPACE || "";

interface VaultClient {
  read(path: string): Promise<any>;
  write(path: string, data: any): Promise<void>;
}

class VaultService implements VaultClient {
  private baseURL: string;
  private token: string;
  private namespace: string;

  constructor(addr: string, token: string, namespace: string = "") {
    this.baseURL = addr;
    this.token = token;
    this.namespace = namespace;
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      "X-Vault-Token": this.token,
    };
    if (this.namespace) {
      headers["X-Vault-Namespace"] = this.namespace;
    }
    return headers;
  }

  async read(path: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/v1/${path}`, {
        headers: this.getHeaders(),
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error reading from Vault path ${path}:`, error);
      throw error;
    }
  }

  async write(path: string, data: any): Promise<void> {
    try {
      await axios.post(
        `${this.baseURL}/v1/${path}`,
        { data },
        {
          headers: this.getHeaders(),
        }
      );
    } catch (error) {
      console.error(`Error writing to Vault path ${path}:`, error);
      throw error;
    }
  }
}

export const vaultClient = new VaultService(VAULT_ADDR, VAULT_TOKEN || "", VAULT_NAMESPACE);

export async function loadSecretsFromVault() {
  if (process.env.USE_VAULT !== "true" || !VAULT_TOKEN) {
    return;
  }

  try {
    const secretPath = process.env.VAULT_SECRET_PATH || "secret/data/modern-ppc/production";
    const secrets = await vaultClient.read(secretPath);

    process.env.JWT_SECRET = secrets.JWT_SECRET;
    process.env.JWT_REFRESH_SECRET = secrets.JWT_REFRESH_SECRET;
    process.env.DATABASE_URL = secrets.DATABASE_URL;
    process.env.REDIS_URL = secrets.REDIS_URL;
    process.env.CHAPA_SECRET_KEY = secrets.CHAPA_SECRET_KEY;

    console.log("Successfully loaded secrets from HashiCorp Vault");
  } catch (error) {
    console.error("Failed to load secrets from Vault:", error);
    throw error;
  }
}
