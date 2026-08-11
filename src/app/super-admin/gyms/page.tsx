import { desc, eq, and } from "drizzle-orm";
import { db } from "@/db";
import { gyms, users } from "@/db/schema";
import { CreateGymDialog } from "./create-gym-dialog";
import { GymCard } from "./gym-card";

export default async function GymsPage() {
  const allGyms = await db.select().from(gyms).orderBy(desc(gyms.createdAt));

  const gymsWithCounts = await Promise.all(
    allGyms.map(async (gym) => {
      const members = await db
        .select({ id: users.id })
        .from(users)
        .where(
          and(
            eq(users.gymId, gym.id),
            eq(users.role, "member"),
            eq(users.status, "approved")
          )
        );
      return { ...gym, memberCount: members.length };
    })
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Gyms</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create a gym and invite its owner. They&apos;ll get an email to
            set up their admin account.
          </p>
        </div>
        <CreateGymDialog />
      </div>

      {gymsWithCounts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
          No gyms yet. Create your first one to get started.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {gymsWithCounts.map((gym) => (
            <GymCard key={gym.id} gym={gym} />
          ))}
        </div>
      )}
    </div>
  );
}
