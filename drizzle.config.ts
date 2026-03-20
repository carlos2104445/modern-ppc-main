import { defineConfig } from "drizzle-kit";

const sslMode = process.env.DATABASE_SSL === "false" ? "disable" : "require";
const dbUrl =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}?sslmode=${sslMode}`;

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
});
