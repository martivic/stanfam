"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import Swal from "sweetalert2";

import { auth } from "../../lib/auth";
import {
  addMember,
  closeOpportunity,
  createOpportunity,
  createFamilyIfMissing,
  getFamily,
  listMembers,
  listOpportunities,
  upsertFamily,
} from "../../lib/firestore";

type MemberView = {
  id: string;
  name: string;
  role: string;
  age: string;
  bio: string;
  isPublic: boolean;
};

export default function DashboardPage() {
  const [status, setStatus] = useState("Loading...");
  const [uid, setUid] = useState<string | null>(null);
  const [familyName, setFamilyName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [members, setMembers] = useState<MemberView[]>([]);
  const [memberName, setMemberName] = useState("");
  const [memberRole, setMemberRole] = useState("");
  const [memberAge, setMemberAge] = useState("");
  const [memberBio, setMemberBio] = useState("");
  const [memberPublic, setMemberPublic] = useState(true);
  const [oppTitle, setOppTitle] = useState("");
  const [oppCategory, setOppCategory] = useState("");
  const [oppDescription, setOppDescription] = useState("");
  const [oppLocation, setOppLocation] = useState("");
  const [oppSchedule, setOppSchedule] = useState("");
  const [oppRate, setOppRate] = useState("");
  const [oppType, setOppType] = useState<"job" | "event">("job");
  const [oppCapacity, setOppCapacity] = useState("1");
  const [opportunities, setOpportunities] = useState<
    Array<{
      id: string;
      title: string;
      status: string;
      rate: string;
      schedule: string;
      type: string;
      capacity: number;
    }>
  >([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUid(null);
        setStatus("Please login to manage your family.");
        return;
      }
      setUid(user.uid);
      setStatus("");
      await createFamilyIfMissing(user.uid);
      const family = await getFamily(user.uid);
      if (family) {
        setFamilyName(family.familyName ?? "");
        setBio(family.bio ?? "");
        setLocation(family.location ?? "");
        setIsPublic(!!family.isPublic);
      }
      const loadedMembers = await listMembers(user.uid);
      setMembers(loadedMembers as MemberView[]);
      const loadedOpportunities = await listOpportunities(user.uid);
      setOpportunities(
        loadedOpportunities.map((opp) => ({
          id: opp.id,
          title: opp.title,
          status: opp.status,
          rate: opp.rate,
          schedule: opp.schedule,
          type: opp.type,
          capacity: opp.capacity,
        })),
      );
    });
    return () => unsubscribe();
  }, []);

  const handleSaveFamily = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!uid) {
      setMessage("Login required.");
      return;
    }
    await upsertFamily(uid, { familyName, bio, location, isPublic });
    setMessage("Family profile saved.");
    Swal.fire({ icon: "success", title: "Profile saved" });
    setTimeout(() => setMessage(""), 2000);
  };

  const handleAddMember = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!uid) {
      setMessage("Login required.");
      return;
    }
    if (!memberName.trim()) {
      setMessage("Member name is required.");
      return;
    }
    await addMember(uid, {
      name: memberName,
      role: memberRole,
      age: memberAge,
      bio: memberBio,
      isPublic: memberPublic,
    });
    const loadedMembers = await listMembers(uid);
    setMembers(loadedMembers as MemberView[]);
    setMemberName("");
    setMemberRole("");
    setMemberAge("");
    setMemberBio("");
    setMemberPublic(true);
    setMessage("Member added.");
    Swal.fire({ icon: "success", title: "Member added" });
    setTimeout(() => setMessage(""), 2000);
  };

  const handlePostOpportunity = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!uid) {
      setMessage("Login required.");
      return;
    }
    if (!oppTitle.trim()) {
      setMessage("Opportunity title is required.");
      return;
    }
    await createOpportunity(uid, {
      familyName: familyName || "Family",
      title: oppTitle,
      category: oppCategory,
      description: oppDescription,
      location: oppLocation,
      schedule: oppSchedule,
      rate: oppRate,
      type: oppType,
      capacity: Number(oppCapacity) || 1,
    });
    setOppTitle("");
    setOppCategory("");
    setOppDescription("");
    setOppLocation("");
    setOppSchedule("");
    setOppRate("");
    setOppType("job");
    setOppCapacity("1");
    setMessage("Opportunity posted.");
    Swal.fire({ icon: "success", title: "Opportunity posted" });
    setTimeout(() => setMessage(""), 2000);
    const loadedOpportunities = await listOpportunities(uid);
    setOpportunities(
      loadedOpportunities.map((opp) => ({
        id: opp.id,
        title: opp.title,
        status: opp.status,
        rate: opp.rate,
        schedule: opp.schedule,
        type: opp.type,
        capacity: opp.capacity,
      })),
    );
  };

  const handleCloseOpportunity = async (oppId: string) => {
    if (!uid) {
      setMessage("Login required.");
      return;
    }
    await closeOpportunity(uid, oppId);
    Swal.fire({ icon: "success", title: "Opportunity closed" });
    const loadedOpportunities = await listOpportunities(uid);
    setOpportunities(
      loadedOpportunities.map((opp) => ({
        id: opp.id,
        title: opp.title,
        status: opp.status,
        rate: opp.rate,
        schedule: opp.schedule,
        type: opp.type,
        capacity: opp.capacity,
      })),
    );
  };

  return (
    <section className="page">
      <div className="card">
        <h1>Family Dashboard</h1>
        {status ? <p>{status}</p> : null}
        {message ? <p className="notice">{message}</p> : null}
        <form className="form-grid" onSubmit={handleSaveFamily}>
          <label htmlFor="familyName">Family Name</label>
          <input
            id="familyName"
            value={familyName}
            onChange={(event) => setFamilyName(event.target.value)}
          />
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            rows={4}
            value={bio}
            onChange={(event) => setBio(event.target.value)}
          />
          <label htmlFor="location">Location</label>
          <input
            id="location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
          <label className="checkbox">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(event) => setIsPublic(event.target.checked)}
            />
            Public profile
          </label>
          <button type="submit">Save profile</button>
        </form>
      </div>

      <div className="card">
        <h2>Members</h2>
        <form className="form-grid" onSubmit={handleAddMember}>
          <label htmlFor="memberName">Name</label>
          <input
            id="memberName"
            value={memberName}
            onChange={(event) => setMemberName(event.target.value)}
          />
          <label htmlFor="memberRole">Role</label>
          <input
            id="memberRole"
            value={memberRole}
            onChange={(event) => setMemberRole(event.target.value)}
          />
          <label htmlFor="memberAge">Age</label>
          <input
            id="memberAge"
            value={memberAge}
            onChange={(event) => setMemberAge(event.target.value)}
          />
          <label htmlFor="memberBio">Bio</label>
          <textarea
            id="memberBio"
            rows={3}
            value={memberBio}
            onChange={(event) => setMemberBio(event.target.value)}
          />
          <label className="checkbox">
            <input
              type="checkbox"
              checked={memberPublic}
              onChange={(event) => setMemberPublic(event.target.checked)}
            />
            Public member
          </label>
          <button type="submit">Add member</button>
        </form>

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
          <p>No members yet.</p>
        )}
      </div>

      <div className="card">
        <h2>Post an Opportunity</h2>
        <form className="form-grid" onSubmit={handlePostOpportunity}>
          <label htmlFor="oppTitle">Title</label>
          <input
            id="oppTitle"
            value={oppTitle}
            onChange={(event) => setOppTitle(event.target.value)}
          />
          <label htmlFor="oppCategory">Category</label>
          <input
            id="oppCategory"
            value={oppCategory}
            onChange={(event) => setOppCategory(event.target.value)}
            placeholder="Caregiving, chores, tutoring..."
          />
          <label htmlFor="oppDescription">Description</label>
          <textarea
            id="oppDescription"
            rows={4}
            value={oppDescription}
            onChange={(event) => setOppDescription(event.target.value)}
          />
          <label htmlFor="oppLocation">Location</label>
          <input
            id="oppLocation"
            value={oppLocation}
            onChange={(event) => setOppLocation(event.target.value)}
            placeholder="Denver or Remote"
          />
          <label htmlFor="oppSchedule">Schedule</label>
          <input
            id="oppSchedule"
            value={oppSchedule}
            onChange={(event) => setOppSchedule(event.target.value)}
            placeholder="Weekdays, 3-6pm"
          />
          <label htmlFor="oppRate">Rate</label>
          <input
            id="oppRate"
            value={oppRate}
            onChange={(event) => setOppRate(event.target.value)}
            placeholder="$25/hr or $200 flat"
          />
          <label htmlFor="oppType">Type</label>
          <select
            id="oppType"
            value={oppType}
            onChange={(event) => setOppType(event.target.value as "job" | "event")}
          >
            <option value="job">Job</option>
            <option value="event">Event</option>
          </select>
          <label htmlFor="oppCapacity">Capacity</label>
          <input
            id="oppCapacity"
            type="number"
            min="1"
            value={oppCapacity}
            onChange={(event) => setOppCapacity(event.target.value)}
          />
          <button type="submit">Post opportunity</button>
        </form>

        {opportunities.length ? (
          <div className="list">
            {opportunities.map((opp) => (
              <div key={opp.id} className="list__item">
                <div className="list__title">{opp.title}</div>
                <div className="list__meta">
                  {opp.status} · {opp.type}
                  {opp.rate ? ` • ${opp.rate}` : ""}
                  {opp.schedule ? ` • ${opp.schedule}` : ""}
                  {opp.type === "event" ? ` • cap ${opp.capacity}` : ""}
                </div>
                {opp.status !== "closed" ? (
                  <button
                    type="button"
                    className="list__action"
                    onClick={() => handleCloseOpportunity(opp.id)}
                  >
                    Close
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p>No opportunities posted yet.</p>
        )}
      </div>
    </section>
  );
}
