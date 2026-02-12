"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { listPublicFamilies } from "../../lib/firestore";

type FamilyView = {
  id: string;
  familyName: string;
  bio: string;
  location: string;
};

export default function DirectoryPage() {
  const [status, setStatus] = useState("Loading...");
  const [families, setFamilies] = useState<FamilyView[]>([]);

  useEffect(() => {
    const load = async () => {
      const results = await listPublicFamilies();
      setFamilies(results as FamilyView[]);
      setStatus(results.length ? "" : "No public families yet.");
    };

    load();
  }, []);

  return (
    <section className="page">
      <div className="card">
        <h1>Family Directory</h1>
        <p className="muted">Browse public families on the platform.</p>
      </div>
      {status ? (
        <div className="card">
          <p>{status}</p>
        </div>
      ) : (
        <div className="list">
          {families.map((family) => (
            <Link
              key={family.id}
              className="list__item list__item--link"
              href={`/family/${family.id}`}
            >
              <div className="list__title">
                {family.familyName || "Family"}
              </div>
              <div className="list__meta">
                {family.location || "Location pending"}
              </div>
              {family.bio ? <p>{family.bio}</p> : null}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
