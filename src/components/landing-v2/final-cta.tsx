import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "./section-heading";

export function FinalCtaSection() {
  return (
    <section className="lv2-final-cta lv2-grid-bg" aria-labelledby="final-cta-title">
      <div className="lv2-final-cta__bg" aria-hidden />
      <div className="lv2-container" style={{ position: "relative" }}>
        <SectionHeading
          index={8}
          total={8}
          label="Get Started"
          numbered={false}
          eyebrow="Take the next step"
          headline={<>Move faster with<br />data confidence</>}
          body="Spin up a store, connect payments, and start seeing live analytics from day one. Sample copy until launch messaging is finalized."
          align="center"
          id="final-cta-title"
        />
        <div className="lv2-final-cta__ctas">
          <Link href="/demo" className="lv2-btn lv2-btn--primary lv2-btn--lg">
            Request Demo <ArrowRight aria-hidden />
          </Link>
          <Link href="/waitlist" className="lv2-btn lv2-btn--ghost lv2-btn--lg">
            Join Waitlist
          </Link>
        </div>
      </div>
    </section>
  );
}
