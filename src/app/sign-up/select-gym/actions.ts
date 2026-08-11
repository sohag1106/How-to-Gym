"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ensureAppUser } from "@/lib/auth";

const schema = z.object({
  gymId: z.string().uuid(),
  phone: z.string().min(6, "Enter a valid phone number"),
});

export async function submitGymSelection(formData: FormData) {
  const appUser = await ensureAppUser();
  if (!appUser) redirect("/sign-in");

  const parsed = schema.safeParse({
    gymId: formData.get("gymId"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await db
    .update(users)
    .set({ gymId: parsed.data.gymId, phone: parsed.data.phone })
    .where(eq(users.id, appUser.id));

  redirect("/pending-approval");
}
