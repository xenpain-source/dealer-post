import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "./client";
import { dealers, users } from "./schema";

/**
 * Returns the dealer + user row for whoever is currently signed in via
 * Clerk, creating them on first login (just-in-time provisioning) so there's
 * no separate "finish setting up your account" step and no dependency on
 * Clerk webhooks for the MVP.
 *
 * Throws if nobody is signed in — call this only from routes/pages already
 * behind the auth middleware.
 */
export async function getCurrentDealer() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("getCurrentDealer() called without an authenticated user");
  }

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, userId))
    .limit(1);

  if (existing) {
    const [dealer] = await db
      .select()
      .from(dealers)
      .where(eq(dealers.id, existing.dealerId))
      .limit(1);
    if (!dealer) {
      throw new Error(`User ${userId} points at a missing dealer row`);
    }
    return { dealer, user: existing };
  }

  // First time this Clerk user has hit the app — create their dealer + user
  // rows now. A solo dealer gets a dealer named after their email; swap this
  // for an org-creation flow later if multi-seat dealerships need it.
  const clerkUser = await currentUser();
  const email = clerkUser?.primaryEmailAddress?.emailAddress ?? "New dealer";

  const [dealer] = await db
    .insert(dealers)
    .values({ name: email.split("@")[0] || "New dealer" })
    .returning();

  const [user] = await db
    .insert(users)
    .values({
      clerkUserId: userId,
      dealerId: dealer.id,
      email,
      role: "owner",
    })
    .returning();

  return { dealer, user };
}
