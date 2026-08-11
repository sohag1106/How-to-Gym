import { eq } from "drizzle-orm";
import { db } from "@/db";
import { gyms, memberProfiles } from "@/db/schema";
import { ensureAppUser } from "@/lib/auth";
import { ProfileForm } from "./profile-form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default async function ProfilePage() {
  const appUser = await ensureAppUser();
  if (!appUser) return null;

  const [profile, gym] = await Promise.all([
    db.query.memberProfiles.findFirst({ where: eq(memberProfiles.userId, appUser.id) }),
    appUser.gymId
      ? db.query.gyms.findFirst({ where: eq(gyms.id, appUser.gymId) })
      : Promise.resolve(undefined),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Avatar className="size-14">
          <AvatarFallback className="text-lg">
            {appUser.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-medium text-lg truncate">{appUser.name}</p>
          <p className="text-sm text-muted-foreground truncate">{gym?.name}</p>
        </div>
      </div>

      {profile && <ProfileForm profile={profile} />}

      <SignOutButton>
        <Button variant="outline" className="rounded-2xl h-12">
          Sign out
        </Button>
      </SignOutButton>
    </div>
  );
}
