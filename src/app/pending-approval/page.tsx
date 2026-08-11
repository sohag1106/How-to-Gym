import { redirect } from "next/navigation";
import { Hourglass, XCircle } from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ensureAppUser } from "@/lib/auth";
import { homePathForUser } from "@/lib/routing";

export default async function PendingApprovalPage() {
  const appUser = await ensureAppUser();
  if (!appUser) redirect("/sign-in");
  if (appUser.status === "approved") redirect(await homePathForUser(appUser));

  const rejected = appUser.status === "rejected";

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="size-16 rounded-full bg-accent flex items-center justify-center text-accent-foreground">
        {rejected ? (
          <XCircle className="size-8" />
        ) : (
          <Hourglass className="size-8" />
        )}
      </div>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">
        {rejected ? "Request not approved" : "Waiting for approval"}
      </h1>
      <p className="mt-2 text-muted-foreground max-w-xs text-balance">
        {rejected
          ? "Your gym's admin didn't approve this signup. Reach out to them directly if you think this is a mistake."
          : "Your gym's admin needs to approve your account before you can get your workout plan. This usually doesn't take long."}
      </p>
      <SignOutButton>
        <Button variant="outline" className="mt-8 rounded-2xl h-12 px-6">
          Sign out
        </Button>
      </SignOutButton>
    </main>
  );
}
