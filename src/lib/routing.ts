import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { memberProfiles } from "@/db/schema";
import type { AppUser } from "@/lib/auth";

/** Where a signed-in user should land, based on role/status/onboarding progress. */
export async function homePathForUser(user: AppUser): Promise<string> {
  if (user.role === "super_admin") return "/super-admin/gyms";

  if (user.role === "gym_owner") return "/admin/members";

  // member
  if (user.status === "pending") return "/pending-approval";
  if (user.status === "rejected") return "/pending-approval";

  const profile = await db.query.memberProfiles.findFirst({
    where: eq(memberProfiles.userId, user.id),
  });
  if (!profile) return "/onboarding";

  return "/dashboard";
}
