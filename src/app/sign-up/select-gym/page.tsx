import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { gyms } from "@/db/schema";
import { ensureAppUser } from "@/lib/auth";
import { SelectGymForm } from "./select-gym-form";

export default async function SelectGymPage() {
  const appUser = await ensureAppUser();
  if (!appUser) redirect("/sign-in");
  if (appUser.role !== "member") redirect("/");
  if (appUser.gymId) redirect("/pending-approval");

  const activeGyms = await db
    .select({ id: gyms.id, name: gyms.name })
    .from(gyms)
    .where(eq(gyms.active, true))
    .orderBy(gyms.name);

  return (
    <main className="flex min-h-dvh flex-col px-6 py-12 max-w-md mx-auto w-full">
      <h1 className="text-2xl font-semibold tracking-tight">
        One last step
      </h1>
      <p className="mt-2 text-muted-foreground">
        Tell us which gym you train at so we can build your plan around the
        equipment they actually have.
      </p>

      <div className="mt-8">
        <SelectGymForm gyms={activeGyms} />
      </div>
    </main>
  );
}
