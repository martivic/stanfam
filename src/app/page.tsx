import OpportunitiesStrip from "../components/OpportunitiesStrip";

export default function HomePage() {
  return (
    <section className="page">
      <div className="card hero">
        <h1>Rent-A-Family</h1>
        <p>
          Book trusted families for caregiving, tutoring, and hands-on help.
        </p>
      </div>
      <div className="card">
        <h2>Featured Family Members</h2>
        <div className="h-scroll">
          {[
            {
              name: "Victor Martinez",
              role: "Caregiver",
              location: "Denver",
              bio: "15 years of elder care with a warm, practical style.",
            },
            {
              name: "Lina Park",
              role: "Tutor",
              location: "Remote",
              bio: "Math + science tutor, patient and project-based.",
            },
            {
              name: "DeShawn Wells",
              role: "Chore Captain",
              location: "Austin",
              bio: "Handy for deep cleans, yard care, and errands.",
            },
            {
              name: "Mia Flores",
              role: "Childcare",
              location: "Miami",
              bio: "Play-based childcare with bilingual support.",
            },
          ].map((member) => (
            <article key={member.name} className="h-card">
              <div className="h-card__name">{member.name}</div>
              <div className="h-card__meta">
                {member.role} · {member.location}
              </div>
              <p>{member.bio}</p>
            </article>
          ))}
        </div>
      </div>
      <OpportunitiesStrip />
    </section>
  );
}
