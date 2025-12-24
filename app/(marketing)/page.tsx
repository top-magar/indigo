import {
    Navbar,
    Hero,
    Features,
    Testimonials,
    Operations,
    Workflow,
    Integrations,
    Pricing,
    FAQ,
    CTA,
    Footer,
} from "@/components/landing";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <Hero />
            <Features />
            <Testimonials />
            <Operations />
            <Workflow />
            <Integrations />
            <Pricing />
            <FAQ />
            <CTA />
            <Footer />
        </div>
    );
}
