/**
 * Social proof — startup credibility: stats + trust signals.
 * Mercury/Opal pattern: numbers that prove traction.
 */
export function LogoBar() {
    const stats = [
        { value: "12,000+", label: "Stores launched" },
        { value: "Rs 2.1B+", label: "Payments processed" },
        { value: "75", label: "Districts reached" },
        { value: "4.8★", label: "Average rating" },
    ];

    return (
        <section className="py-16 border-y border-border/50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16">
                    {stats.map((s) => (
                        <div key={s.label} className="text-center">
                            <p className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight">
                                {s.value}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2 tracking-wide">
                                {s.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
