"use client";

import { cn } from "@/lib/utils";

/* ═══ Blueprint Pattern SVGs ═══ */

/** Fine square grid pattern */
export function GridPattern({ className, opacity = 0.04 }: { className?: string; opacity?: number }) {
  return (
    <svg
      className={cn("absolute inset-0 w-full h-full pointer-events-none", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="bp-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#bp-grid)" opacity={opacity} />
    </svg>
  );
}

/** Technical dot matrix pattern */
export function DotPattern({ className, opacity = 0.05 }: { className?: string; opacity?: number }) {
  return (
    <svg
      className={cn("absolute inset-0 w-full h-full pointer-events-none", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="bp-dots" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.5" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#bp-dots)" opacity={opacity} />
    </svg>
  );
}

/** Diagonal engineering hatch pattern */
export function HatchPattern({ className, opacity = 0.04 }: { className?: string; opacity?: number }) {
  return (
    <svg
      className={cn("absolute inset-0 w-full h-full pointer-events-none", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="bp-hatch" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="16" stroke="currentColor" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#bp-hatch)" opacity={opacity} />
    </svg>
  );
}

/** Modular square blueprint pattern */
export function ModularPattern({ className, opacity = 0.04 }: { className?: string; opacity?: number }) {
  return (
    <svg
      className={cn("absolute inset-0 w-full h-full pointer-events-none", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="bp-modular" width="64" height="64" patternUnits="userSpaceOnUse">
          <rect width="64" height="64" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <rect width="32" height="32" fill="none" stroke="currentColor" strokeWidth="0.3" />
          <rect x="32" y="32" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#bp-modular)" opacity={opacity} />
    </svg>
  );
}

/* ═══ Blueprint Corner Ticks ═══ */

interface CornerTicksProps {
  className?: string;
  color?: string;
  size?: number;
  corners?: ("tl" | "tr" | "bl" | "br")[];
}

export function BlueprintCornerTicks({
  className,
  color = "currentColor",
  size = 12,
  corners = ["tl", "tr", "bl", "br"],
}: CornerTicksProps) {
  const tickStyle = {
    width: size,
    height: size,
    borderColor: color,
  };

  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}>
      {corners.includes("tl") && (
        <div
          className="absolute top-0 left-0 border-l border-t"
          style={tickStyle}
        />
      )}
      {corners.includes("tr") && (
        <div
          className="absolute top-0 right-0 border-r border-t"
          style={tickStyle}
        />
      )}
      {corners.includes("bl") && (
        <div
          className="absolute bottom-0 left-0 border-l border-b"
          style={tickStyle}
        />
      )}
      {corners.includes("br") && (
        <div
          className="absolute bottom-0 right-0 border-r border-b"
          style={tickStyle}
        />
      )}
    </div>
  );
}

/* ═══ Technical Annotation ═══ */

interface TechnicalAnnotationProps {
  label: string;
  value?: string;
  className?: string;
  accent?: boolean;
}

export function TechnicalAnnotation({
  label,
  value,
  className,
  accent = false,
}: TechnicalAnnotationProps) {
  return (
    <div className={cn("font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60", className)}>
      <span>{label}</span>
      {value && (
        <span className={cn("ml-1.5", accent ? "text-[#007fae]" : "text-muted-foreground/40")}>
          {value}
        </span>
      )}
    </div>
  );
}

/* ═══ Structural Band ═══ */

interface StructuralBandProps {
  className?: string;
  variant?: "solid" | "dashed" | "dotted" | "gradient";
  accent?: boolean;
}

export function StructuralBand({
  className,
  variant = "solid",
  accent = false,
}: StructuralBandProps) {
  const borderColor = accent ? "#007fae" : "var(--border)";

  return (
    <div className={cn("relative w-full h-px", className)}>
      <div
        className="absolute inset-0"
        style={{
          borderTop: variant === "solid"
            ? `1px solid ${borderColor}`
            : variant === "dashed"
            ? `1px dashed ${borderColor}`
            : variant === "dotted"
            ? `1px dotted ${borderColor}`
            : `1px solid ${borderColor}`,
        }}
      />
      {/* Registration tick */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-2 h-2 border"
        style={{ borderColor, left: "50%", transform: "translate(-50%, -50%)" }}
      />
    </div>
  );
}

/* ═══ Measurement Line ═══ */

interface MeasurementLineProps {
  className?: string;
  direction?: "horizontal" | "vertical";
  length?: string;
  accent?: boolean;
}

export function MeasurementLine({
  className,
  direction = "horizontal",
  length = "100%",
  accent = false,
}: MeasurementLineProps) {
  const color = accent ? "#007fae" : "var(--border)";

  if (direction === "vertical") {
    return (
      <div className={cn("relative", className)} style={{ height: length }}>
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px" style={{ backgroundColor: color, opacity: 0.3 }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-px" style={{ backgroundColor: color }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-px" style={{ backgroundColor: color }} />
      </div>
    );
  }

  return (
    <div className={cn("relative h-px", className)} style={{ width: length }}>
      <div className="absolute inset-0" style={{ backgroundColor: color, opacity: 0.3 }} />
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-1.5" style={{ backgroundColor: color }} />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-1.5" style={{ backgroundColor: color }} />
    </div>
  );
}
