# Indigo

A modern, multi-tenant e-commerce platform built for Nepal. Launch your online store in minutes with local payment integrations, visual storefront editor, and everything you need to sell online.

## Features

- **Multi-tenant Architecture** — Each merchant gets their own isolated store
- **Visual Storefront Editor** — Drag-and-drop page builder with live preview
- **Local Payments** — eSewa, Khalti, FonePay + international cards via Stripe
- **Order Management** — Full order lifecycle with status tracking and activity timeline
- **Inventory Tracking** — Stock management with low-stock alerts
- **Customer Management** — Customer profiles, order history, and segmentation
- **Media Library** — Centralized asset management with folders and bulk operations
- **Analytics Dashboard** — Revenue charts, order metrics, and performance insights
- **Responsive Design** — Mobile-first dashboard and storefronts

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL) + [Drizzle ORM](https://orm.drizzle.team/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Hugeicons](https://hugeicons.com/) (Free tier)
- **Rich Text**: [TipTap](https://tiptap.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Payments**: [Stripe Connect](https://stripe.com/connect)
- **Auth**: Supabase Auth (Email + Google OAuth)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Supabase account
- Stripe account (for payments)

### Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Installation

```bash
# Install dependencies
pnpm install

# Run database migrations
pnpm drizzle-kit push

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (editor)/          # Visual editor routes
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Merchant dashboard
│   └── store/             # Public storefront
├── components/
│   ├── dashboard/         # Dashboard components
│   ├── landing/           # Marketing site components
│   ├── store/             # Storefront components
│   └── ui/                # Base UI components
├── db/                    # Database schema (Drizzle)
├── lib/                   # Utilities and services
└── types/                 # TypeScript types
```

## Key Features

### Visual Storefront Editor
- Block-based page builder
- Real-time preview (inline + iframe modes)
- Undo/redo with keyboard shortcuts
- Autosave with draft/publish workflow
- Mobile/tablet/desktop viewport switching

### Authentication
- Email/password signup with password strength indicator
- Google OAuth integration
- Onboarding flow for new merchants
- Setup checklist to guide store configuration

### Dashboard
- Real-time analytics and metrics
- Order pipeline visualization
- Activity feed
- Quick actions
- Low stock alerts

## Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm test         # Run tests
pnpm test:run     # Run tests once (no watch)
```

## Documentation

- [Architecture Overview](docs/architecture.md)
- [Development Plan](docs/development-plan.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Supabase Integration](docs/SUPABASE-INTEGRATION.md)

## License

All dependencies are MIT or Apache 2.0 licensed, suitable for commercial use.

---

Built with ❤️ for Nepali entrepreneurs
