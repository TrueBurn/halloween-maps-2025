# Halloween Maps 2025

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3fcf8e?logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-See%20LICENSE-orange)](./LICENSE)
[![GitHub](https://img.shields.io/github/stars/TrueBurn/halloween-maps-2025?style=social)](https://github.com/TrueBurn/halloween-maps-2025)

A mobile-first interactive mapping application for organizing neighborhood Halloween trick-or-treating events. Built with the [T3 Stack](https://create.t3.gg/).

## 🎃 Project Overview

Halloween Maps helps neighborhoods coordinate trick-or-treating by displaying:
- Participating houses and distribution points
- Real-time candy availability
- Walking directions optimized for foot traffic
- Age-appropriate routes
- Special activities and starting points

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Maps**: Leaflet.js + Leaflet.markercluster + OpenStreetMap
- **Icons**: Custom SVG (map markers) + Lucide React (UI elements)
- **State**: TanStack Query + tRPC
- **Analytics**: PostHog (optional, for visitor insights)

## 📚 Documentation

All project documentation is in the [`docs/`](./docs) folder:

- **[Progress](./docs/PROGRESS.md)** - Current status, completed features and deployment steps
- **[PRD](./docs/PRD.md)** - Complete product requirements and specifications
- **[PRD Summary](./docs/PRD-SUMMARY.md)** - Quick reference and design decisions
- **[Admin Setup](./docs/ADMIN-SETUP.md)** - Creating admin users with Supabase Auth
- **[Analytics Guide](./docs/ANALYTICS.md)** - PostHog analytics setup (optional)
- **[AI Image Prompts](./docs/AI-IMAGE-PROMPTS.md)** - AI-generated image prompts and social media requirements

## 🏃 Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm
- Supabase account (for database)

### Installation

1. Clone the repository
```bash
git clone https://github.com/TrueBurn/halloween-maps-2025.git
cd halloween-maps-2025
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your Supabase credentials and configuration
# Optional: Add PostHog credentials for analytics (see docs/ANALYTICS.md)
```

4. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🗄️ Database Setup

Database migrations are in `supabase/migrations/`. To set up:

1. Create a Supabase project
2. Run migrations using MCP server or Supabase CLI
3. Generate TypeScript types: `npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts`

See [docs/PROGRESS.md](./docs/PROGRESS.md) for detailed setup and migration status.

## 🏗️ Project Status

### ✅ Completed - Production Ready!

**Core Features:**
- ✅ T3 App initialized with TypeScript, Tailwind, tRPC
- ✅ **Multi-neighborhood architecture** with separate Supabase databases
- ✅ Database migrations (enums, tables, RLS policies)
- ✅ Interactive map view with Leaflet
- ✅ **Custom SVG location markers** (25 markers: 4 location types × 4 states + 3 static + shadow)
  - States: Normal (orange), Starting Point (green), Activity (pink), No Candy (purple)
  - Static types: Parking, Refreshments, AnimalCharity
  - Priority rendering: No candy > Starting point > Activity > Normal
- ✅ Walking directions with OSRM
- ✅ GPS user location tracking
- ✅ Location list with filtering and sorting
- ✅ Admin panel with full CRUD operations
- ✅ Admin authentication with Supabase Auth
- ✅ Password reset & user invites (email-based auth flow)
- ✅ Coordinate picker (interactive map)
- ✅ Export to CSV and JSON
- ✅ Bulk actions (reset candy status)
- ✅ Real-time updates across all views
- ✅ Mobile-first responsive design
- ✅ Dark Halloween theme 🎃
- ✅ **Performance optimizations** (localStorage caching, smart map updates)
- ✅ **Mobile browser compatibility** (safe area insets, dvh viewport height)
- ✅ **Marker clustering** (Halloween-themed with 🦇🕷️👻 emojis)
- ✅ **Social media sharing** (WhatsApp-optimized preview images, Open Graph tags)
- ✅ **PostHog analytics (optional)** - Live visitor tracking, session stats, location popularity
- ✅ **First-visit info modal** - Auto-opens event info with localStorage tracking
- ✅ **Map location counter** - Shows only candy-giving locations (filters out parking/refreshments)

**Next Steps:**
- 🎯 Deploy to Vercel (once per neighborhood)
- 🎯 Configure production environment variables
- 🎯 (Optional) Set up PostHog analytics - see [Analytics Guide](./docs/ANALYTICS.md)
- 🎯 Test WhatsApp sharing with Facebook Sharing Debugger
- 🎯 Create admin user accounts in each Supabase project

## 📦 Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server

# Code quality
npm run typecheck    # TypeScript type checking
npm run lint         # ESLint
npm run format       # Prettier (if configured)
```

### 🛠️ Development Tools

Access development tools at `http://localhost:3000/dev` (dev mode only):
- **Seed Locations** - Add example locations (starting points dynamically generated from `NEXT_PUBLIC_ROUTES`)
- **Clear Example Locations** - Remove all example locations (prefix: "Example - ")
- **Database Stats** - View location counts with auto-refresh

All dev endpoints are protected and only work in development mode.

## 🌐 Multi-Instance Architecture

**This application is designed for multiple independent neighborhood deployments.**

### Key Architecture Decisions

✅ **Complete Data Isolation**
- Each neighborhood has its own Supabase project
- Zero shared data between instances
- Independent admin access and authentication

✅ **Separate Deployments**
- Each neighborhood gets its own Vercel project
- Custom domain per deployment
- Independent environment variable configuration

✅ **Scalable Design**
- Same codebase deployed multiple times
- Configure via environment variables:
  - Map coordinates and neighborhood name
  - **Dynamic routes/age groups** (`NEXT_PUBLIC_ROUTES` - comma-separated, e.g., "All Ages" or "Over 8,Under 8,Toddlers")
  - Supabase credentials
  - Optional PostHog analytics
- No code changes needed for new neighborhoods

### Deployment Process

For each neighborhood:
1. Create a new Supabase project
2. Run all database migrations
3. Create a Vercel project
4. Set environment variables (Supabase credentials + neighborhood config + optional PostHog)
5. (Optional) Configure PostHog analytics - see [Analytics Guide](./docs/ANALYTICS.md)
6. Deploy with custom domain
7. Create admin user in Supabase Auth

See [docs/PROGRESS.md](./docs/PROGRESS.md#deployment-two-separate-instances) for detailed deployment checklist.

## 🤝 Contributing

This is a private project for specific neighborhoods, but contributions are welcome for bug fixes and improvements.

## 📄 License

See [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Create T3 App](https://create.t3.gg/)
- Maps powered by [Leaflet](https://leafletjs.com/) and [OpenStreetMap](https://www.openstreetmap.org/)
- Marker clustering by [Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster)
- Routing via [Leaflet Routing Machine](https://www.liedman.net/leaflet-routing-machine/) and [OSRM](http://project-osrm.org/)
- UI icons from [Lucide](https://lucide.dev/)
- Database and authentication by [Supabase](https://supabase.com/)
- Analytics (optional) by [PostHog](https://posthog.com/)
