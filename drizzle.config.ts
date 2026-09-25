import { defineConfig } from "drizzle-kit";

// "db:generate" only reads the schema file and doesn't need a live
// connection, so it's fine for DATABASE_URL to be unset for that command.
// "db:push" and "db:studio" DO need a real DATABASE_URL in .env.local.
export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://placeholder/placeholder",
  },
});
