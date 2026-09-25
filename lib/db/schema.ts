import {
  pgTable,
  text,
  integer,
  timestamp,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";

export const listingStatusEnum = pgEnum("listing_status", [
  "draft",
  "posted",
  "sold",
]);

// A dealership account. Clerk owns the actual login/session; this table just
// links a Clerk organization (or user, for solo dealers) to their data.
export const dealers = pgTable("dealers", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkOrgId: text("clerk_org_id").unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// A user who can sign in and manage listings for a dealer. clerkUserId ties
// this row to Clerk's own user record.
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  dealerId: uuid("dealer_id")
    .notNull()
    .references(() => dealers.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role").notNull().default("owner"), // "owner" | "staff"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const listings = pgTable("listings", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealerId: uuid("dealer_id")
    .notNull()
    .references(() => dealers.id, { onDelete: "cascade" }),
  year: integer("year").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  mileage: integer("mileage").notNull(),
  price: integer("price").notNull(),
  description: text("description").default(""),
  status: listingStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const listingPhotos = pgTable("listing_photos", {
  id: uuid("id").primaryKey().defaultRandom(),
  listingId: uuid("listing_id")
    .notNull()
    .references(() => listings.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// One row per platform a listing has been connected/posted to.
export const platformConnections = pgTable("platform_connections", {
  id: uuid("id").primaryKey().defaultRandom(),
  listingId: uuid("listing_id")
    .notNull()
    .references(() => listings.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(), // "facebook" | "instagram" | "craigslist"
  status: text("status").notNull().default("pending"), // "pending" | "posted" | "failed"
  externalUrl: text("external_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const postingHistory = pgTable("posting_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  listingId: uuid("listing_id")
    .notNull()
    .references(() => listings.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(),
  action: text("action").notNull(), // "created" | "updated" | "removed"
  detail: text("detail"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
