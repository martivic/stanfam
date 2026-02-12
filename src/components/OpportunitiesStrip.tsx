"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../lib/auth";
import {
  acceptOpportunity,
  addRsvp,
  countRsvps,
  listAllOpportunities,
} from "../lib/firestore";

type OpportunityView = {
  id: string;
  title: string;
  familyName: string;
  location: string;
  schedule: string;
  rate: string;
  status: string;
  ownerUid: string;
  type: "job" | "event";
  capacity: number;
};

export default function OpportunitiesStrip() {
  const [status, setStatus] = useState("Loading...");
  const [opps, setOpps] = useState<OpportunityView[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [rsvpCounts, setRsvpCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const load = async () => {
      const results = await listAllOpportunities();
      setOpps(results as OpportunityView[]);
      setStatus(results.length ? "" : "No opportunities yet.");
      const counts: Record<string, number> = {};
      for (const opp of results) {
        if (opp.type === "event") {
          counts[opp.id] = await countRsvps(opp.ownerUid, opp.id);
        }
      }
      setRsvpCounts(counts);
    };

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserId(null);
        setStatus("Login to see opportunities.");
        setOpps([]);
        return;
      }
      setUserId(user.uid);
      await load();
    });
    return () => unsubscribe();
  }, []);

  const handleReserve = async (opp: OpportunityView) => {
    if (!userId) {
      setStatus("Login to reserve opportunities.");
      return;
    }
    if (opp.ownerUid === userId) {
      setStatus("You cannot reserve your own opportunity.");
      return;
    }
    await acceptOpportunity(opp.ownerUid, opp.id, userId);
    const results = await listAllOpportunities();
    setOpps(results as OpportunityView[]);
  };

  const handleRsvp = async (opp: OpportunityView) => {
    if (!userId) {
      setStatus("Login to reserve opportunities.");
      return;
    }
    if (opp.ownerUid === userId) {
      setStatus("You cannot RSVP to your own event.");
      return;
    }
    const currentCount = rsvpCounts[opp.id] ?? 0;
    if (currentCount >= opp.capacity) {
      setStatus("This event is full.");
      return;
    }
    await addRsvp(opp.ownerUid, opp.id, userId);
    const updated = await countRsvps(opp.ownerUid, opp.id);
    setRsvpCounts((prev) => ({ ...prev, [opp.id]: updated }));
  };

  return (
    <div className="card">
      <h2>Open Opportunities</h2>
      {status ? (
        <p className="muted">{status}</p>
      ) : (
        <div className="h-scroll">
          {opps.map((opp) => (
            <article key={opp.id} className="h-card">
              <div className="h-card__name">{opp.title}</div>
              <div className="h-card__meta">
                {opp.familyName || "Family"}
                {opp.location ? ` | ${opp.location}` : ""}
              </div>
              <p className="muted">
                {opp.schedule}
                {opp.rate ? ` | ${opp.rate}` : ""}
              </p>
              {opp.type === "event" ? (
                <p className="muted">
                  RSVP {rsvpCounts[opp.id] ?? 0} / {opp.capacity}
                </p>
              ) : null}
              <p className="muted">Status: {opp.status}</p>
              {opp.status === "open" && opp.type === "job" ? (
                <button
                  className="h-card__action"
                  type="button"
                  onClick={() => handleReserve(opp)}
                >
                  Reserve
                </button>
              ) : null}
              {opp.status === "open" && opp.type === "event" ? (
                <button
                  className="h-card__action"
                  type="button"
                  onClick={() => handleRsvp(opp)}
                >
                  RSVP
                </button>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
