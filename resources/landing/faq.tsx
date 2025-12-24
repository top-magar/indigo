'use client';
import React, { useState } from 'react';
import { Plus, Minus, MessageCircle, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/lib/utils';

const faqs = [
  {
    q: "What kind of analytics does Pasaal provide?",
    a: "Pasaal integrates seamlessly with leading tools like Slack for team communication, Google Analytics for performance tracking, and local wallets for payment processing. We provide dashboards tailored for the Nepali market context."
  },
  {
    q: "Is there a limit to the number of users?",
    a: "Depending on your plan, there may be limits. The Growth and Enterprise plans support multiple team members with role-based access controls."
  },
  {
    q: "How does Pasaal help with team management?",
    a: "We provide role-based access control, activity logs, and performance metrics for each team member. You can track who fulfilled which order."
  },
  {
    q: "Can I customize my dashboard?",
    a: "Absolutely! You can drag and drop widgets, resize charts, and choose which metrics appear on your home screen to fit your workflow."
  },
  {
    q: "How do I contact customer support?",
    a: "Support is available 24/7 via email and chat for Growth and Enterprise users. Starter tier users have access to email support with a 24h response time."
  },
  {
    q: "Does Pasaal support multi-store management?",
    a: "Yes, you can connect multiple storefronts and manage inventory across all of them from a single dashboard. Perfect for businesses with branches in KTM and Pokhara."
  }
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px]" />
        <div className="absolute bottom-10 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-24">

          {/* Left Column: Header & Support CTA */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            <div className="sticky top-24">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wide mb-6 w-fit">
                Support
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6 leading-tight">
                Frequently Asked <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Questions</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Everything you need to know about Pasaal. Can't find the answer you're looking for?
              </p>

              <div className="flex flex-col gap-4">
                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-full bg-primary/10 text-primary">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">Chat to support</h4>
                      <p className="text-xs text-muted-foreground">We're here to help.</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full justify-between group">
                    Start live chat <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>

                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-full bg-blue-500/10 text-blue-600">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">Email us</h4>
                      <p className="text-xs text-muted-foreground">Detailed response within 24h.</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full justify-between group">
                    support@pasaal.com <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: FAQ List */}
          <div className="lg:col-span-7 space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className={cn(
                  "rounded-2xl border transition-all duration-300 overflow-hidden",
                  openIndex === idx
                    ? "bg-primary/5 border-primary/50 shadow-lg shadow-primary/5 ring-1 ring-primary/20"
                    : "bg-card border-border hover:border-primary/30"
                )}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
                >
                  <span className={cn(
                    "text-lg font-semibold transition-colors pr-8",
                    openIndex === idx ? "text-primary" : "text-foreground"
                  )}>
                    {faq.q}
                  </span>
                  <div className={cn(
                    "shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                    openIndex === idx ? "bg-primary text-white rotate-180" : "bg-muted text-muted-foreground"
                  )}>
                    {openIndex === idx ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>
                <div
                  className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    openIndex === idx ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-6 text-muted-foreground leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};