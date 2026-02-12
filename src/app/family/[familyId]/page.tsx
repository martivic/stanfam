"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { getFamily, listMembers } from "../../../lib/firestore";

type MemberView = {
  id: string;
  name: string;
  role: string;
  age: string;
  bio: string;
  isPublic: boolean;
};

export default function FamilyProfilePage() {
  const params = useParams<{ familyId: string }>();
  const familyId = params?.familyId ?? "";
  const [status, setStatus] = useState("Loading...");
  const [familyName, setFamilyName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [members, setMembers] = useState<MemberView[]>([]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!familyId) {
        setStatus("Family not found.");
        return;
      }
      const family = await getFamily(familyId);
      if (!family || !family.isPublic) {
        setStatus("Profile is not public.");
        return;
      }
      setFamilyName(family.familyName ?? "Family");
      setBio(family.bio ?? "");
      setLocation(family.location ?? "");
      const loadedMembers = await listMembers(familyId);
      const publicMembers = loadedMembers.filter((member) => member.isPublic);
      setMembers(publicMembers as MemberView[]);
      setStatus("");
    };

    loadProfile();
  }, [familyId]);

  if (status) {
    return (
      <section className="page">
        <div className="card">
          <p>{status}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="card">
        <h1>{familyName}</h1>
        {location ? <p className="muted">{location}</p> : null}
        {bio ? <p>{bio}</p> : null}
      </div>
      <div className="card">
        <h2>Members</h2>
        {members.length ? (
          <div className="list">
            {members.map((member) => (
              <div key={member.id} className="list__item">
                <div className="list__title">{member.name}</div>
                <div className="list__meta">
                  {member.role || "Member"}
                  {member.age ? ` • ${member.age}` : ""}
                </div>
                {member.bio ? <p>{member.bio}</p> : null}
              </div>
            ))}
          </div>
        ) : (
          <p>No public members yet.</p>
        )}
      </div>
    </section>
  );
}
