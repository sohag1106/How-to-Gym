import { and, eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { gyms, users } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { MemberRow } from "./member-row";
import { AutoApproveToggle } from "./auto-approve-toggle";

export default async function MembersPage() {
  const owner = await requireRole("gym_owner");
  const [gym] = await db.select().from(gyms).where(eq(gyms.id, owner.gymId!));

  const allMembers = await db
    .select()
    .from(users)
    .where(and(eq(users.gymId, owner.gymId!), eq(users.role, "member")))
    .orderBy(desc(users.createdAt));

  const pending = allMembers.filter((m) => m.status === "pending");
  const approved = allMembers.filter((m) => m.status === "approved");
  const rejected = allMembers.filter((m) => m.status === "rejected");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {approved.length} / {gym.memberLimit} members approved
        </p>
      </div>

      <AutoApproveToggle initialEnabled={gym.autoApproveMembers} />

      {pending.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Pending approval ({pending.length})
          </h2>
          <div className="flex flex-col gap-2">
            {pending.map((m) => (
              <MemberRow key={m.id} member={m} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">
          Roster ({approved.length})
        </h2>
        {approved.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
            No approved members yet.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {approved.map((m) => (
              <MemberRow key={m.id} member={m} />
            ))}
          </div>
        )}
      </section>

      {rejected.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            Rejected ({rejected.length})
          </h2>
          <div className="flex flex-col gap-2">
            {rejected.map((m) => (
              <MemberRow key={m.id} member={m} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
