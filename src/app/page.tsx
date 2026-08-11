import Link from "next/link";
import { redirect } from "next/navigation";
import { Dumbbell, Camera, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ensureAppUser } from "@/lib/auth";
import { homePathForUser } from "@/lib/routing";

export default async function LandingPage() {
  const user = await ensureAppUser();
  if (user) {
    redirect(await homePathForUser(user));
  }

  return (
    <main className="flex min-h-dvh flex-col">
      <div className="flex-1 flex flex-col justify-between px-6 pt-12 pb-8 max-w-md mx-auto w-full">
        <div>
          <div className="flex items-center gap-2 text-brand">
            <Dumbbell className="size-6" strokeWidth={2.5} />
            <span className="font-semibold tracking-tight">How to Gym</span>
          </div>

          <h1 className="mt-10 text-4xl font-semibold tracking-tight text-balance">
            Never guess what
            <br />
            equipment to use again.
          </h1>
          <p className="mt-4 text-muted-foreground text-lg text-balance">
            Your gym&apos;s exact equipment, a plan built around it, and a
            3D walkthrough for every move.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-4">
            <Feature
              icon={<Camera className="size-5" />}
              title="Recognize by photo"
              body="Not sure what it's called? Just see it — every machine in your gym, photographed."
            />
            <Feature
              icon={<Sparkles className="size-5" />}
              title="A plan built for you"
              body="Tell us your goal, days, and off-days — we build the split, sets, and reps."
            />
            <Feature
              icon={<Clock className="size-5" />}
              title="Fits your time today"
              body="Only got 20 minutes? Your workout trims itself to fit, automatically."
            />
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3">
          <Button
            render={<Link href="/sign-up" />}
            nativeButton={false}
            size="lg"
            className="h-13 text-base rounded-2xl"
          >
            Get started
          </Button>
          <Button
            render={<Link href="/sign-in" />}
            nativeButton={false}
            variant="ghost"
            size="lg"
            className="h-13 text-base rounded-2xl"
          >
            I already have an account
          </Button>
        </div>
      </div>
    </main>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-border bg-card p-4">
      <div className="shrink-0 size-10 rounded-xl bg-accent text-accent-foreground flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="font-medium leading-tight">{title}</p>
        <p className="text-sm text-muted-foreground mt-1 leading-snug">
          {body}
        </p>
      </div>
    </div>
  );
}
