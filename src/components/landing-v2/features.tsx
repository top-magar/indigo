import { SectionHeading } from "./section-heading";

const cards = [
  {
    id: "event-stream",
    title: "Event stream",
    description: "Watch every page view, add-to-cart, checkout, and campaign event as it happens.",
    size: "lg" as const,
    visual: (
      <div className="lv2-mini-window">
        <div className="lv2-mini-window__bar"><i /><i /><i /></div>
        <div>
          <div className="lv2-event-row"><span>page_view</span><em>1s</em></div>
          <div className="lv2-event-row"><span>add_to_cart</span><em>2s</em></div>
          <div className="lv2-event-row"><span>checkout_start</span><em>3s</em></div>
          <div className="lv2-event-row"><span>purchase</span><em>4s</em></div>
        </div>
      </div>
    ),
  },
  {
    id: "conversion-funnels",
    title: "Conversion funnels",
    description: "See where shoppers drop off and which steps influence the purchase decision.",
    size: "sm" as const,
    visual: (
      <div className="lv2-funnel">
        <div className="lv2-funnel__stage"><span>10,000</span><div className="lv2-funnel__bar" style={{ width: "100%" }} /><em>100%</em></div>
        <div className="lv2-funnel__stage"><span>6,200</span><div className="lv2-funnel__bar" style={{ width: "62%" }} /><em>62%</em></div>
        <div className="lv2-funnel__stage"><span>2,400</span><div className="lv2-funnel__bar" style={{ width: "24%" }} /><em>24%</em></div>
        <div className="lv2-funnel__stage"><span>890</span><div className="lv2-funnel__bar" style={{ width: "9%" }} /><em>9%</em></div>
      </div>
    ),
  },
  {
    id: "heatmaps",
    title: "Heatmaps",
    description: "See where people tap, scroll, and hesitate before buying.",
    size: "sm" as const,
    visual: (
      <div className="lv2-heat">
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
    ),
  },
  {
    id: "dashboards",
    title: "Custom dashboards",
    description: "Compose views for founders, marketers, and operations with the same live dataset.",
    size: "sm" as const,
    visual: (
      <div className="lv2-mini-window">
        <div className="lv2-mini-window__bar"><i /><i /><i /></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div className="lv2-kpi"><div className="lv2-kpi__label">Sessions</div><div className="lv2-kpi__value">9,182</div></div>
            <div className="lv2-kpi"><div className="lv2-kpi__label">Orders</div><div className="lv2-kpi__value">418</div></div>
          </div>
          <div style={{ height: 48, borderRadius: 8, background: "var(--lv2-accent-soft)", border: "1px solid var(--lv2-accent-border)" }} />
        </div>
      </div>
    ),
  },
  {
    id: "integrations",
    title: "Tool integrations",
    description: "Connect gateways, email, messaging, and warehouses without glue code.",
    size: "sm" as const,
    visual: (
      <div className="lv2-integrations-grid">
        {["eSewa", "Khalti", "Slack", "Stripe"].map((name) => (
          <div className="lv2-integration" key={name}>
            <div className="lv2-integration__logo">{name.charAt(0)}</div>
            <div>
              <strong>{name}</strong>
              <small>Connected</small>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "cohort",
    title: "Cohort analysis",
    description: "Track repeat purchase behaviour and retention cohorts over time.",
    size: "lg" as const,
    visual: (
      <table className="lv2-cohort">
        <thead>
          <tr>
            <th>Week</th><th>W1</th><th>W2</th><th>W3</th><th>W4</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Jan</td><td data-hot="1">92%</td><td data-hot="2">74%</td><td data-hot="2">68%</td><td data-hot="3">51%</td></tr>
          <tr><td>Feb</td><td data-hot="1">88%</td><td data-hot="2">70%</td><td data-hot="3">54%</td><td data-hot="3">42%</td></tr>
          <tr><td>Mar</td><td data-hot="1">90%</td><td data-hot="2">73%</td><td data-hot="2">62%</td><td data-hot="3">47%</td></tr>
        </tbody>
      </table>
    ),
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="lv2-section" aria-labelledby="features-title">
      <div className="lv2-container">
        <SectionHeading
          index={2}
          total={10}
          label="Features"
          eyebrow="Main product"
          headline={<>Built to reduce<br />data blindspots</>}
          body="From event stream to cohort view, Indigo replaces fragmented tools with one structured workspace. Values below are sample UI content until live product benchmarks are finalized."
          id="features-title"
        />
        <div className="lv2-bento">
          {cards.map((card) => (
            <article
              key={card.id}
              className={card.size === "lg" ? "lv2-card lv2-bento__card lv2-bento__card--lg lv2-card--hover" : card.size === "sm" ? "lv2-card lv2-bento__card lv2-bento__card--sm lv2-card--hover" : "lv2-card lv2-bento__card lv2-card--hover"}
            >
              <div className="lv2-card-title">{card.title}</div>
              <p>{card.description}</p>
              <div className="lv2-bento__visual">{card.visual}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
