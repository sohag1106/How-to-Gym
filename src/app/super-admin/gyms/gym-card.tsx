"use client";

import { useState, useTransition } from "react";
import { Users, Mail, Phone, Link2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { toggleGymActive, updateMemberLimit, resendInvite } from "./actions";

type Gym = {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  memberLimit: number;
  active: boolean;
  memberCount: number;
  invitationUrl: string | null;
};

export function GymCard({ gym }: { gym: Gym }) {
  const [active, setActive] = useState(gym.active);
  const [limit, setLimit] = useState(gym.memberLimit);
  const [isPending, startTransition] = useTransition();
  const [isResending, startResendTransition] = useTransition();

  function copyInviteLink() {
    if (!gym.invitationUrl) return;
    navigator.clipboard
      .writeText(gym.invitationUrl)
      .then(() => toast.success("Invite link copied"))
      .catch(() => toast.error("Couldn't copy — try again"));
  }

  function resend() {
    startResendTransition(async () => {
      const res = await resendInvite(gym.id);
      if (res?.error) toast.error(res.error);
      else toast.success("New invite created");
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium leading-tight">{gym.name}</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {gym.ownerName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={active ? "default" : "secondary"}>
            {active ? "Active" : "Inactive"}
          </Badge>
          <Switch
            checked={active}
            disabled={isPending}
            onCheckedChange={(v) => {
              setActive(v);
              startTransition(() => toggleGymActive(gym.id, v));
            }}
          />
        </div>
      </div>

      <div className="text-sm text-muted-foreground flex flex-col gap-1">
        <span className="flex items-center gap-1.5">
          <Mail className="size-3.5" /> {gym.ownerEmail}
        </span>
        <span className="flex items-center gap-1.5">
          <Phone className="size-3.5" /> {gym.ownerPhone}
        </span>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          disabled={!gym.invitationUrl}
          onClick={copyInviteLink}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border py-2 text-xs font-medium hover:bg-accent hover:text-accent-foreground disabled:opacity-40"
        >
          <Link2 className="size-3.5" />
          Copy invite link
        </button>
        <button
          type="button"
          disabled={isResending}
          onClick={resend}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-border py-2 px-3 text-xs font-medium hover:bg-accent hover:text-accent-foreground disabled:opacity-40"
        >
          <RefreshCw className={isResending ? "size-3.5 animate-spin" : "size-3.5"} />
          Resend
        </button>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="text-sm flex items-center gap-1.5 text-muted-foreground">
          <Users className="size-4" />
          {gym.memberCount} / {gym.memberLimit} members
        </span>
        <form
          action={(fd) => startTransition(() => updateMemberLimit(fd))}
          className="flex items-center gap-1.5"
        >
          <input type="hidden" name="gymId" value={gym.id} />
          <Input
            name="memberLimit"
            type="number"
            min={1}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="h-8 w-20 rounded-lg text-sm"
          />
          <button
            type="submit"
            className="text-xs text-brand font-medium hover:underline"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
}
