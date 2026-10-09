import { defineConfig } from "drizzle-kit";

try {
  process.loadEnvFile(".env.local");
} catch {
  // Env vars may come from the environment instead (e.g. CI).
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./src/drizzle",
  // Migrations run over a direct (non-pooled) connection.
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL! },
  strict: true,
  verbose: true,
});
