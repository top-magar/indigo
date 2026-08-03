"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ModularPattern,
  BlueprintCornerTicks,
  TechnicalAnnotation,
} from "./blueprint-primitives";

export function CtaBanner() {
  return (
    <section className="relative py-24 lg:py-32 bg-background overflow-hidden">
      {/* Full-width patterned engineering band */}
      <div className="absolute inset-0 pointer-events-none text-foreground">
        <ModularPattern opacity={0.05} />
      </div>

      {/* Top and bottom accent borders */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "#007fae", opacity: 0.4 }} />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 text-center flex flex-col items-center">
        {/* Corner ticks around the CTA container */}
        <div className="absolute inset-x-6 lg:inset-x-12 inset-y-8 pointer-events-none">
          <BlueprintCornerTicks color="rgba(0,127,174,0.5)" size={16} />
        </div>

        <TechnicalAnnotation
          label="BUILD STATUS"
          value="/ READY"
          accent
          className="mb-8"
        />

        <h2 className="font-payload-h2 text-foreground mb-6">
          We&apos;re building a better way.
        </h2>
        <p className="font-payload-body-lg text-muted-foreground max-w-2xl mb-10">
          Join thousands of forward-thinking merchants building the next
          generation of e-commerce storefronts on Indigo.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/signup">
            <Button className="h-12 px-8 text-base rounded-lg">
              Start your free trial
            </Button>
          </Link>
          <Link href="/api/contact">
            <Button variant="outline" className="h-12 px-8 text-base rounded-lg">
              Talk to sales
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
