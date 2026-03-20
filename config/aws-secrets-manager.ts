import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({
  region: process.env.AWS_REGION || "us-east-1",
});

export async function getSecret(secretName: string): Promise<string> {
  try {
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: secretName,
      })
    );

    if (response.SecretString) {
      return response.SecretString;
    }

    throw new Error("Secret not found");
  } catch (error) {
    console.error(`Error retrieving secret ${secretName}:`, error);
    throw error;
  }
}

export async function getSecretJSON(secretName: string): Promise<any> {
  const secretString = await getSecret(secretName);
  return JSON.parse(secretString);
}

export async function loadSecretsFromAWS() {
  if (process.env.USE_AWS_SECRETS !== "true") {
    return;
  }

  try {
    const secrets = await getSecretJSON(process.env.AWS_SECRET_NAME || "modern-ppc/production");

    process.env.JWT_SECRET = secrets.JWT_SECRET;
    process.env.JWT_REFRESH_SECRET = secrets.JWT_REFRESH_SECRET;
    process.env.DATABASE_URL = secrets.DATABASE_URL;
    process.env.REDIS_URL = secrets.REDIS_URL;
    process.env.CHAPA_SECRET_KEY = secrets.CHAPA_SECRET_KEY;

    console.log("Successfully loaded secrets from AWS Secrets Manager");
  } catch (error) {
    console.error("Failed to load secrets from AWS:", error);
    throw error;
  }
}
