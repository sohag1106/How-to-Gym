import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { equipment, exercises, memberExerciseRules, users } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { ExerciseRuleRow } from "./exercise-rule-row";

export default async function MemberRulesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const owner = await requireRole("gym_owner");
  const { id: memberId } = await params;

  const member = await db.query.users.findFirst({
    where: eq(users.id, memberId),
  });
  if (!member || member.gymId !== owner.gymId) notFound();

  const gymExercises = await db
    .select({
      id: exercises.id,
      name: exercises.name,
      equipmentName: equipment.name,
      muscleGroupId: equipment.muscleGroupId,
    })
    .from(exercises)
    .innerJoin(equipment, eq(exercises.equipmentId, equipment.id))
    .where(eq(equipment.gymId, owner.gymId!))
    .orderBy(asc(exercises.name));

  const rules = await db
    .select()
    .from(memberExerciseRules)
    .where(eq(memberExerciseRules.memberId, memberId));
  const ruleByExercise = new Map(rules.map((r) => [r.exerciseId, r.type]));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {member.name}&apos;s exercises
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          By default members see everything your gym offers. Assign specific
          exercises to restrict them to just those, or block a few they
          shouldn&apos;t do.
        </p>
      </div>

      {gymExercises.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
          Add equipment to your gym first.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {gymExercises.map((ex) => (
            <ExerciseRuleRow
              key={ex.id}
              memberId={memberId}
              exercise={ex}
              currentRule={ruleByExercise.get(ex.id) ?? "default"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
