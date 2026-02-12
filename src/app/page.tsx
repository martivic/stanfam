import FeaturedMembersStrip from "../components/FeaturedMembersStrip";
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
      <FeaturedMembersStrip />
      <OpportunitiesStrip />
    </section>
  );
}
