import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { memberProfiles } from "@/db/schema";
import { ensureAppUser } from "@/lib/auth";
import { MemberShell } from "@/components/nav/member-shell";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const appUser = await ensureAppUser();
  if (!appUser) redirect("/sign-in");
  if (appUser.role !== "member") redirect("/");
  if (appUser.status !== "approved") redirect("/pending-approval");

  const profile = await db.query.memberProfiles.findFirst({
    where: eq(memberProfiles.userId, appUser.id),
  });
  if (!profile) redirect("/onboarding");

  return <MemberShell>{children}</MemberShell>;
}
