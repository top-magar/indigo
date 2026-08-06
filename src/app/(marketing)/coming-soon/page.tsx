import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import "../../landing-v2.css";

export const metadata = {
  title: "Coming Soon — Indigo",
  description: "This page is under construction. Check back soon.",
};

export default function ComingSoonPage() {
  return (
    <div className="lv2-page" data-theme="dark">
      <div className="lv2-coming-soon">
        <div className="lv2-coming-soon__frame">
          <span className="lv2-coming-soon__label">{"// under construction"}</span>
          <h1>Coming soon</h1>
          <p>
            This page is still on the drafting table. It will ship with the
            next Indigo release — check back soon.
          </p>
          <Link href="/" className="lv2-btn lv2-btn--primary">
            <ArrowLeft aria-hidden />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
