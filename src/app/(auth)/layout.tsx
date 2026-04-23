import { Store } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh bg-background">
      {/* Left — brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground text-background flex-col justify-between p-16 relative overflow-hidden">
        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h40v40H0z\' fill=\'none\' stroke=\'white\' stroke-width=\'.5\'/%3E%3C/svg%3E")' }} />

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-md bg-background/10 ring-1 ring-background/10">
            <Store className="size-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">Indigo</span>
        </div>

        <div className="relative z-10 space-y-8">
          <h2 className="text-3xl font-semibold tracking-tight leading-[1.15]">
            Everything you need<br />to sell online.
          </h2>

          {/* Testimonial */}
          <div className="space-y-4 max-w-[380px]">
            <p className="text-sm text-background/60 leading-relaxed italic">
              &ldquo;We set up our store in one afternoon and had our first order the same day. The dashboard is simple and the eSewa integration just works.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-full bg-background/10 ring-1 ring-background/10 flex items-center justify-center text-xs font-medium">
                R
              </div>
              <div>
                <p className="text-xs font-medium">Ramesh K.</p>
                <p className="text-[11px] text-background/40">Handmade Nepal, Kathmandu</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-[11px] text-background/25">
          <span>© {new Date().getFullYear()} Indigo</span>
          <span>Terms</span>
          <span>Privacy</span>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex flex-1 items-center justify-center p-8">
        {children}
      </div>
    </div>
  )
}
