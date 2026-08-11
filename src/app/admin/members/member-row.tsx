"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, X, Settings2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { approveMember, rejectMember } from "./actions";

type Member = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: "pending" | "approved" | "rejected";
};

export function MemberRow({ member }: { member: Member }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
      <Avatar>
        <AvatarFallback>{member.name.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium leading-tight truncate">{member.name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {member.email}
          {member.phone ? ` · ${member.phone}` : ""}
        </p>
        {error && <p className="text-xs text-destructive mt-0.5">{error}</p>}
      </div>

      {member.status === "pending" && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const res = await approveMember(member.id);
                if (res?.error) setError(res.error);
              })
            }
            className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50"
          >
            <Check className="size-4" />
          </button>
          <button
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const res = await rejectMember(member.id);
                if (res?.error) setError(res.error);
              })
            }
            className="size-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {member.status === "approved" && (
        <Link
          href={`/admin/members/${member.id}/rules`}
          className="shrink-0 size-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center hover:bg-accent hover:text-accent-foreground"
        >
          <Settings2 className="size-4" />
        </Link>
      )}

      {member.status === "rejected" && (
        <Badge variant="secondary" className="shrink-0">
          Rejected
        </Badge>
      )}
    </div>
  );
}
