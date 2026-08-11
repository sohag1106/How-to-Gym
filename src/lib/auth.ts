import "server-only";
import { currentUser } from "@clerk/nextjs/server";
import { eq, count } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, type userRoleEnum } from "@/db/schema";

export type AppUser = typeof users.$inferSelect;

/**
 * Looks up the signed-in Clerk user's row in our `users` table, creating it
 * on first sight. The very first user ever created becomes super_admin
 * (bootstrap). Gym owners arrive via an invitation that stamps Clerk
 * publicMetadata.role/gymId, which we read here instead of trusting the client.
 */
export async function ensureAppUser(): Promise<AppUser | null> {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const existing = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkUser.id),
  });
  if (existing) return existing;

  const [{ value: userCount }] = await db.select({ value: count() }).from(users);
  const isFirstUser = userCount === 0;

  const metadata = clerkUser.publicMetadata as
    | { role?: (typeof userRoleEnum.enumValues)[number]; gymId?: string }
    | undefined;

  const role = isFirstUser
    ? "super_admin"
    : metadata?.role === "gym_owner"
      ? "gym_owner"
      : "member";
  const status = role === "member" ? "pending" : "approved";

  const name =
    `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() ||
    clerkUser.username ||
    "New user";

  const [created] = await db
    .insert(users)
    .values({
      clerkId: clerkUser.id,
      role,
      gymId: role === "gym_owner" ? (metadata?.gymId ?? null) : null,
      name,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      phone: clerkUser.phoneNumbers[0]?.phoneNumber ?? null,
      status,
      approvedAt: status === "approved" ? new Date() : null,
    })
    .returning();

  return created;
}

/**
 * Guards a route to a single role, redirecting anyone else to their own
 * home. Use at the top of a server layout/page for role-scoped sections
 * (/super-admin, /admin, member-only routes).
 */
export async function requireRole(
  role: (typeof userRoleEnum.enumValues)[number]
): Promise<AppUser> {
  const appUser = await ensureAppUser();
  if (!appUser) redirect("/sign-in");
  if (appUser.role !== role) {
    const { homePathForUser } = await import("@/lib/routing");
    redirect(await homePathForUser(appUser));
  }
  return appUser;
}
