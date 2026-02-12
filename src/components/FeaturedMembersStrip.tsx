"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { listPublicMembers } from "../lib/firestore";

type MemberView = {
  id: string;
  familyId: string;
  name: string;
  role: string;
  bio: string;
  isPublic: boolean;
};

export default function FeaturedMembersStrip() {
  const [status, setStatus] = useState("Loading...");
  const [members, setMembers] = useState<MemberView[]>([]);

  useEffect(() => {
    const load = async () => {
      const results = await listPublicMembers();
      setMembers(results as MemberView[]);
      setStatus(results.length ? "" : "No public members yet.");
    };

    load();
  }, []);

  return (
    <div className="card">
      <h2>Featured Family Members</h2>
      {status ? (
        <p className="muted">{status}</p>
      ) : (
        <div className="h-scroll">
          {members.map((member) => (
            <Link
              key={member.id}
              href={member.familyId ? `/family/${member.familyId}` : "/directory"}
              className="h-card h-card--link"
            >
              <div className="h-card__name">{member.name}</div>
              <div className="h-card__meta">
                {member.role || "Member"}
              </div>
              {member.bio ? <p>{member.bio}</p> : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
