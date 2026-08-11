import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { memberProfiles } from "@/db/schema";
import { ensureAppUser } from "@/lib/auth";
import { OnboardingWizard } from "./onboarding-wizard";

export default async function OnboardingPage() {
  const appUser = await ensureAppUser();
  if (!appUser) redirect("/sign-in");
  if (appUser.role !== "member") redirect("/");
  if (appUser.status !== "approved") redirect("/pending-approval");

  const existing = await db.query.memberProfiles.findFirst({
    where: eq(memberProfiles.userId, appUser.id),
  });
  if (existing) redirect("/dashboard");

  return (
    <main className="min-h-dvh flex flex-col px-6 py-8 max-w-md mx-auto w-full">
      <OnboardingWizard />
    </main>
  );
}
