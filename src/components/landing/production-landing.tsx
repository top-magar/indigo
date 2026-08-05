import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { landingContent } from "./landing-content";
import {
  CampaignLink,
  FaqList,
  HeroDemo,
  LandingNavigation,
  LandingTelemetry,
  StorefrontCompare,
} from "./landing-interactions";

function Crosshair({ className = "" }: { className?: string }) {
  return <span className={`indigo-crosshair ${className}`} aria-hidden="true" />;
}

function SectionHeading({
  title,
  body,
  invert = false,
  marker,
}: {
  title: React.ReactNode;
  body: string;
  invert?: boolean;
  marker?: { index: string; label: string };
}) {
  return (
    <div className={`indigo-section-heading ${invert ? "is-inverted" : ""}`}>
      {marker && (
        <p className="indigo-section-marker">
          <b>[ {marker.index} ]</b> · {marker.label}
        </p>
      )}
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  );
}

function ResponsiveBlueprint() {
  return (
    <div className="indigo-responsive-blueprint" aria-label="Responsive storefront layout diagram">
      <div className="indigo-ruler indigo-ruler--top"><span>1440</span><span>768</span><span>390</span></div>
      <div className="indigo-breakpoint indigo-breakpoint--desktop">
        <header><i /><i /><i /></header>
        <main><div /><div /><div /></main>
      </div>
      <div className="indigo-breakpoint indigo-breakpoint--tablet">
        <header><i /><i /></header>
        <main><div /><div /></main>
      </div>
      <div className="indigo-breakpoint indigo-breakpoint--mobile">
        <header><i /></header>
        <main><div /><div /><div /></main>
      </div>
      <svg viewBox="0 0 720 260" role="presentation">
        <path d="M92 38v-18h514v18M92 24h514" />
        <path d="M92 18v12M302 18v12M466 18v12M606 18v12" />
        <path className="is-accent" d="M94 224H610" />
      </svg>
    </div>
  );
}

function TokenSystem() {
  return (
    <div className="indigo-token-system" aria-label="Storefront design token controls">
      <div className="indigo-token-system__type">
        <span>Display / 64</span>
        <strong>Aa</strong>
        <p>Geist / Medium / 0.96</p>
      </div>
      <div className="indigo-token-system__palette">
        <span className="is-ink" /><span className="is-paper" /><span className="is-blue" /><span className="is-coral" />
      </div>
      <div className="indigo-token-system__scale">
        {[8, 12, 16, 24, 32, 48].map((size) => (
          <div key={size}><span style={{ width: `${Math.max(10, size * 1.7)}px` }} /><em>{size}</em></div>
        ))}
      </div>
    </div>
  );
}

function LayerTree() {
  return (
    <div className="indigo-layer-tree" aria-label="Page structure tree">
      <div><span>Home</span><em>Page</em></div>
      <div className="level-1"><span>Header</span><em>Global</em></div>
      <div className="level-1 is-active"><span>Product hero</span><em>Grid</em></div>
      <div className="level-2"><span>Copy</span><em>Text</em></div>
      <div className="level-2"><span>Media</span><em>Image</em></div>
      <div className="level-1"><span>Featured collection</span><em>Catalog</em></div>
      <div className="level-1"><span>Footer</span><em>Global</em></div>
    </div>
  );
}

function OrderRoute() {
  const stages = ["Placed", "Payment", "Confirmed", "Packed", "Delivered"];
  return (
    <div className="indigo-order-route" aria-label="Order lifecycle diagram">
      <svg viewBox="0 0 900 300" role="presentation">
        <path className="route-base" d="M70 166C170 166 165 74 270 74s100 150 205 150 104-112 210-112 95 54 150 54" />
        <path className="route-active" d="M70 166C170 166 165 74 270 74s100 150 205 150 104-112 210-112 95 54 150 54" />
        <g><circle cx="70" cy="166" r="7" /><circle cx="270" cy="74" r="7" /><circle cx="475" cy="224" r="7" /><circle cx="685" cy="112" r="7" /><circle cx="835" cy="166" r="7" /></g>
      </svg>
      <div className="indigo-order-route__labels">
        {stages.map((stage, index) => <span key={stage} className={index < 3 ? "is-complete" : ""}>{stage}</span>)}
      </div>
      <div className="indigo-order-route__ticket">
        <span>ORDER #1048</span><strong>NPR 8,400</strong><em>eSewa / verified</em>
      </div>
    </div>
  );
}

function ArchitectureMap() {
  return (
    <div className="indigo-architecture-map" aria-label="Indigo publishing architecture">
      <svg viewBox="0 0 1000 450" role="presentation">
        <path d="M185 92H420C470 92 470 140 520 140H815" />
        <path d="M185 225H815" />
        <path d="M185 358H420C470 358 470 310 520 310H815" />
        <path d="M315 92V358M685 92V358" />
        <circle cx="315" cy="225" r="7" /><circle cx="685" cy="225" r="7" />
      </svg>
      <div className="indigo-architecture-node node-catalog"><span>01</span><strong>Catalog</strong><em>Products + inventory</em></div>
      <div className="indigo-architecture-node node-editor"><span>02</span><strong>Visual editor</strong><em>Pages + theme tokens</em></div>
      <div className="indigo-architecture-node node-orders"><span>03</span><strong>Operations</strong><em>Orders + customers</em></div>
      <div className="indigo-architecture-node node-renderer"><span>04</span><strong>Store renderer</strong><em>Next.js storefront</em></div>
      <div className="indigo-architecture-node node-domain"><span>05</span><strong>Domain</strong><em>Published experience</em></div>
    </div>
  );
}

export function ProductionLanding() {
  return (
    <div className="landing-page">
      <LandingTelemetry />
      <LandingNavigation navigation={landingContent.navigation} />

      <main id="main-content">
        <section className="indigo-hero">
          <div className="indigo-frame indigo-hero__copy">
            <Crosshair className="is-top-left" />
            <Crosshair className="is-top-right" />
            <div>
              <p className="indigo-hero__signal">Storefront system / Nepal</p>
              <h1>{landingContent.hero.title}</h1>
            </div>
            <div className="indigo-hero__support">
              <p>{landingContent.hero.body}</p>
              <div className="indigo-hero__actions">
                <CampaignLink className="indigo-button" link={landingContent.hero.primaryCta}>
                  Start free <ArrowRight aria-hidden="true" />
                </CampaignLink>
                <Link className="indigo-button indigo-button--ghost" href={landingContent.hero.secondaryCta.href}>
                  {landingContent.hero.secondaryCta.label}
                </Link>
              </div>
              <p className="indigo-hero__note">No credit card required. Build before you publish.</p>
            </div>
          </div>
          <div className="indigo-frame indigo-hero__demo">
            <div className="indigo-hero__demo-label"><span>Live storefront composer</span><span>Change the layout</span></div>
            <HeroDemo variants={landingContent.hero.variants} />
            <Crosshair className="is-bottom-left" />
            <Crosshair className="is-bottom-right" />
          </div>
        </section>

        <section className="indigo-commerce-proof" aria-label="Commerce capabilities">
          <div className="indigo-frame">
            <div className="indigo-section-heading">
              <p className="indigo-section-marker"><b>[ 01 of 07 ]</b> · Metrics</p>
              <h2>Measurable from the first order.</h2>
            </div>
            <div className="indigo-commerce-proof__grid">
            {landingContent.commerceProof.map((proof) => (
              <article key={proof.label}>
                <span>{proof.label}</span>
                <strong>{proof.value}</strong>
                <p>{proof.detail}</p>
              </article>
            ))}
            </div>
          </div>
        </section>

        <section id="storefront" className="indigo-sheet indigo-storefront-system">
          <div className="indigo-frame">
            <SectionHeading
              marker={{ index: "02 of 07", label: "Storefront System" }}
              title={<>Design freedom,<br />held together by a system.</>}
              body="Indigo behaves like a design tool and a commerce platform at the same time. Every visual decision remains connected to responsive structure and live product data."
            />

            <div className="indigo-system-grid">
              <article className="indigo-system-grid__responsive">
                <div className="indigo-panel-copy"><h3>{landingContent.capabilities[0].title}</h3><p>{landingContent.capabilities[0].description}</p></div>
                <ResponsiveBlueprint />
              </article>
              <article className="indigo-system-grid__tokens">
                <div className="indigo-panel-copy"><h3>{landingContent.capabilities[1].title}</h3><p>{landingContent.capabilities[1].description}</p></div>
                <TokenSystem />
              </article>
              <article className="indigo-system-grid__blocks">
                <div className="indigo-panel-copy"><h3>{landingContent.capabilities[2].title}</h3><p>{landingContent.capabilities[2].description}</p></div>
                <div className="indigo-block-library" aria-label="Commerce block library">
                  <span className="is-wide">Navigation</span><span>Product</span><span>Media</span><span>Form</span><span className="is-wide">Collection</span>
                </div>
              </article>
              <article className="indigo-system-grid__layers">
                <div className="indigo-panel-copy"><h3>{landingContent.capabilities[3].title}</h3><p>{landingContent.capabilities[3].description}</p></div>
                <LayerTree />
              </article>
            </div>

            <div className="indigo-compare-band">
              <div className="indigo-panel-copy">
                <h3>Show the difference, not the feature list</h3>
                <p>Move the divider to compare a fixed template storefront with an Indigo composition using the same product catalog.</p>
              </div>
              <StorefrontCompare />
            </div>
          </div>
        </section>

        <section className="indigo-workflow">
          <div className="indigo-frame">
            <SectionHeading
              invert
              marker={{ index: "03 of 07", label: "Publish Workflow" }}
              title={<>One catalog.<br />A storefront ready to publish.</>}
              body="The path from product data to a branded storefront stays visible, reversible, and under the merchant's control."
            />
            <div className="indigo-workflow__track">
              <svg className="indigo-workflow__beam" viewBox="0 0 1000 120" role="presentation" aria-hidden="true">
                <path className="beam-base" d="M45 60H955" />
                <path className="beam-active" d="M45 60H955" />
                <g>
                  <circle cx="45" cy="60" r="5" />
                  <circle cx="348" cy="60" r="5" />
                  <circle cx="652" cy="60" r="5" />
                  <circle cx="955" cy="60" r="5" />
                </g>
              </svg>
              {landingContent.workflow.map((step, index) => (
                <article key={step.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div><h3>{step.title}</h3><p>{step.detail}</p></div>
                  {index < landingContent.workflow.length - 1 && <ArrowRight aria-hidden="true" />}
                </article>
              ))}
            </div>
            <div className="indigo-publish-console">
              <div className="indigo-publish-console__header"><span>publish / indigo-store</span><strong><i /> Ready</strong></div>
              <div className="indigo-publish-console__body">
                <div className="indigo-publish-console__log">
                  <p><span>09:42:10</span> validating page structure</p>
                  <p><span>09:42:11</span> resolving live catalog blocks</p>
                  <p><span>09:42:11</span> generating storefront output</p>
                  <p className="is-success"><span>09:42:12</span> published successfully</p>
                </div>
                <div className="indigo-publish-console__result">
                  <span>STORE URL</span><strong>your-store.indigo.store</strong><Link href="/signup">Open a workspace <ArrowRight aria-hidden="true" /></Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="operations" className="indigo-operations">
          <div className="indigo-frame">
            <SectionHeading
              invert
              marker={{ index: "04 of 07", label: "Operations" }}
              title={<>The storefront is only half the system.</>}
              body="Orders, payments, inventory, and customers move through the same tenant-isolated workspace behind every Indigo store."
            />
            <div className="indigo-operations__grid">
              <article className="indigo-operations__route">
                <div className="indigo-panel-copy"><h3>Every order has a route</h3><p>Follow payment and fulfilment status from checkout to delivery without losing the event trail.</p></div>
                <OrderRoute />
              </article>
              <article className="indigo-operations__payments">
                <div className="indigo-panel-copy"><h3>Local checkout, configured once</h3><p>Connect merchant credentials and choose the payment methods shown at checkout.</p></div>
                <div className="indigo-payment-switchboard">
                  <div><span className="is-green">e</span><strong>eSewa</strong><em>Connected</em><i /></div>
                  <div><span className="is-purple">k</span><strong>Khalti</strong><em>Connected</em><i /></div>
                  <div><span className="is-paper">₨</span><strong>Cash on delivery</strong><em>Available</em><i /></div>
                  <div><span className="is-paper">↗</span><strong>Bank transfer</strong><em>Optional</em><i /></div>
                </div>
              </article>
              <article className="indigo-operations__inventory">
                <div className="indigo-panel-copy"><h3>Inventory stays legible</h3><p>Product and variant quantities remain tied to the catalog used across the storefront.</p></div>
                <div className="indigo-stock-table">
                  <div><span>SKU</span><span>ON HAND</span><span>STATUS</span></div>
                  <div><strong>LOOM-INK</strong><em>24</em><span>Available</span></div>
                  <div><strong>LOOM-IVY</strong><em>08</em><span>Low stock</span></div>
                  <div><strong>WRAP-BLU</strong><em>31</em><span>Available</span></div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="architecture" className="indigo-sheet indigo-architecture">
          <div className="indigo-frame">
            <SectionHeading
              marker={{ index: "05 of 07", label: "Architecture" }}
              title={<>A visual workflow<br />with a real application underneath.</>}
              body="Indigo connects editor pages, product data, commerce operations, server-rendered storefronts, and domain routing instead of exporting a disconnected mockup."
            />
            <ArchitectureMap />
            <div className="indigo-architecture__facts">
              <article><span>Rendering</span><strong>Next.js storefronts</strong><p>Store pages are rendered from structured tenant data.</p></article>
              <article><span>Data</span><strong>Supabase + Postgres</strong><p>Merchant records stay scoped to the owning tenant.</p></article>
              <article><span>Publishing</span><strong>Versioned page output</strong><p>Editor pages can be previewed before they become public.</p></article>
            </div>
          </div>
        </section>

        <section id="pricing" className="indigo-offer">
          <div className="indigo-frame indigo-offer__grid">
            <div className="indigo-offer__copy">
              <p className="indigo-section-marker"><b>[ 06 of 07 ]</b> · Pricing</p>
              <h2>{landingContent.offer.title}</h2>
              <p>{landingContent.offer.body}</p>
              <CampaignLink className="indigo-button" link={landingContent.offer.cta} event="signup_started">
                {landingContent.offer.cta.label} <ArrowRight aria-hidden="true" />
              </CampaignLink>
            </div>
            <div className="indigo-offer__matrix">
              <div>
                <span>Included when you start</span>
                {landingContent.offer.included.map((item) => <p key={item}><Check aria-hidden="true" />{item}</p>)}
              </div>
              <div>
                <span>Available as you grow</span>
                {landingContent.offer.upgrade.map((item) => <p key={item}><Check aria-hidden="true" />{item}</p>)}
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="indigo-sheet indigo-faq">
          <div className="indigo-frame indigo-faq__grid">
            <div>
              <p className="indigo-section-marker"><b>[ 07 of 07 ]</b> · FAQ</p>
              <h2>Questions before you build.</h2><p>Direct answers about the current Indigo product.</p>
            </div>
            <FaqList faq={landingContent.faq} />
          </div>
        </section>

        <section className="indigo-final-cta">
          <div className="indigo-frame indigo-final-cta__inner">
            <Crosshair className="is-top-left" /><Crosshair className="is-bottom-right" />
            <h2>Make the first version unmistakably yours.</h2>
            <CampaignLink className="indigo-button indigo-button--light" link={landingContent.hero.primaryCta} event="signup_started">
              Start building <ArrowRight aria-hidden="true" />
            </CampaignLink>
          </div>
        </section>
      </main>

      <footer className="indigo-footer">
        <div className="indigo-frame indigo-footer__grid">
          <div className="indigo-footer__brand">
            <Link className="indigo-wordmark" href="/">Indigo</Link>
            <p>Storefront freedom with the commerce operations Nepal's merchants need.</p>
          </div>
          <div><span>Product</span><Link href="#storefront">Storefront</Link><Link href="#operations">Operations</Link><Link href="#architecture">Architecture</Link></div>
          <div><span>Account</span><Link href="/signup">Start free</Link><Link href="/login">Log in</Link><Link href="/blog">Blog</Link></div>
          <div><span>Legal</span><Link href="/legal/e-commerce-act-2081-en.pdf">E-commerce Act (EN)</Link><Link href="/legal/e-commerce-act-2081-np.pdf">E-commerce Act (NP)</Link></div>
        </div>
        <div className="indigo-frame indigo-footer__base"><span>© 2026 Indigo</span><span>Built for commerce in Nepal</span></div>
      </footer>
    </div>
  );
}
