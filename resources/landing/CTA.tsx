'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

export const CTA: React.FC = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background border border-border shadow-sm mb-8 animate-pulse">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-medium">Start selling in minutes</span>
        </div>
        <h2 className="text-4xl sm:text-6xl font-bold text-foreground mb-6 tracking-tight">
          Ready to launch your <br />
          <span className="text-primary">Dream Pasaal?</span>
        </h2>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Join 12,000+ Nepali businesses growing with us. No credit card required for the 14-day trial.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/sign-up">
            <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-1">
              Start Free Trial
            </Button>
          </Link>
          <Link href="mailto:sales@pasaal.com">
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full bg-background hover:bg-muted hover:-translate-y-1 transition-all">
              Talk to Sales <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
