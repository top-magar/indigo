import { createElement, type ElementType, type ReactNode } from "react";
import { cn } from "@/shared/utils";

type SectionHeadingProps = {
  /** One-based section number rendered inside the bracket block, e.g. 1 → `[ 01 of 07 ]`. */
  index: number | string;
  /** Total number of sections rendered inside the bracket block. */
  total: number | string;
  /** Label rendered after the bracket block separator: `[ 01 of 07 ] · Label`. */
  label: string;
  /** Small overline rendered above the headline. */
  eyebrow?: ReactNode;
  /** Main headline. Rendered as the configured heading level. */
  headline?: ReactNode;
  title?: ReactNode;
  /** Supporting body copy rendered below the headline. */
  body?: ReactNode;
  /** Text alignment. Defaults to `left`. */
  align?: "left" | "center";
  /** Heading element to render the headline with. Defaults to `h2`. */
  as?: ElementType;
  /** Set false to omit the numbered bracket marker (hero, final CTA). */
  numbered?: boolean;
  className?: string;
  id?: string;
};

const pad = (value: number | string) => String(value).padStart(2, "0");

/**
 * Landing section heading — the numbered bracket block `[ xx of xx ] · Label`
 * followed by an optional eyebrow, headline, and body copy.
 *
 * All visual styling is delegated to `lv2-*` classes (styled by the
 * landing-v2 stylesheet); only layout hooks are applied inline/Tailwind-safe.
 */
export function SectionHeading({
  index,
  total,
  label,
  eyebrow,
  headline,
  title,
  body,
  align = "left",
  as = "h2",
  numbered = true,
  className,
  id,
}: SectionHeadingProps) {
  const marker = (
    <p className="lv2-section-heading__marker">
      <span className="lv2-section-heading__sq" aria-hidden />
      <b>{pad(index)}</b>
      <span className="lv2-section-heading__div" aria-hidden>
        /
      </span>
      <span className="lv2-section-heading__label">{label}</span>
    </p>
  );

  return (
    <div
      id={id}
      className={cn(
        "lv2-section-heading",
        align === "center" && "lv2-section-heading--center",
        className,
      )}
    >
      {numbered ? marker : null}
      {eyebrow ? <p className="lv2-section-heading__eyebrow">{eyebrow}</p> : null}
      {(headline ?? title)
        ? createElement(
            as,
            { className: "lv2-section-heading__headline" },
            headline ?? title,
          )
        : null}
      {body ? <p className="lv2-section-heading__body">{body}</p> : null}
    </div>
  );
}
