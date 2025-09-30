# Halloween Maps 2025

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
- **Maps**: Leaflet.js + OpenStreetMap
- **Icons**: Lucide React
- **State**: TanStack Query + tRPC

## 📚 Documentation

All project documentation is in the [`docs/`](./docs) folder:

- **[Setup Guide](./docs/SETUP.md)** - Setup instructions and environment configuration
- **[PRD](./docs/PRD.md)** - Complete product requirements and specifications
- **[PRD Summary](./docs/PRD-SUMMARY.md)** - Quick reference and design decisions
- **[Admin Setup](./docs/ADMIN-SETUP.md)** - Creating admin users with Supabase Auth
- **[Progress](./docs/PROGRESS.md)** - Completed features and next steps
- **[Claude Notes](./CLAUDE.md)** - Developer notes and technical details

## 🏃 Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm
- Supabase account (for database)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/halloween-maps-2025.git
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
```

4. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🗄️ Database Setup

See [docs/SETUP.md](./docs/SETUP.md#supabase-setup-instructions) for detailed Supabase setup instructions, including:
- Creating a Supabase project
- Running database migrations
- Configuring Row Level Security (RLS)
- Generating TypeScript types

## 🏗️ Project Status

### ✅ Completed - Production Ready!

**Core Features:**
- ✅ T3 App initialized with TypeScript, Tailwind, tRPC
- ✅ Supabase database with RLS policies
- ✅ Interactive map view with Leaflet
- ✅ Custom location markers with Lucide icons
- ✅ Walking directions with OSRM
- ✅ GPS user location tracking
- ✅ Location list with filtering and sorting
- ✅ Admin panel with full CRUD operations
- ✅ Admin authentication with Supabase Auth
- ✅ Coordinate picker (interactive map)
- ✅ Export to CSV and JSON
- ✅ Bulk actions (reset candy status)
- ✅ Real-time updates across all views
- ✅ Mobile-first responsive design

**Next Steps:**
- 🎯 Deploy to Vercel
- 🎯 Configure production environment variables
- 🎯 Create admin user accounts

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
- **Seed Locations** - Add 8 example locations around default coordinates
- **Clear Example Locations** - Remove all example locations (prefix: "Example - ")
- **Database Stats** - View location counts with auto-refresh

All dev endpoints are protected and only work in development mode.

## 🌐 Multi-Instance Deployment

This application supports multiple neighborhood deployments:
- Each neighborhood gets its own Vercel project
- Separate Supabase database per neighborhood
- Configuration via environment variables
- Custom domain per deployment

See [docs/PRD.md](./docs/PRD.md#multi-instance-architecture) for details.

## 🤝 Contributing

This is a private project for specific neighborhoods, but contributions are welcome for bug fixes and improvements.

## 📄 License

See [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Create T3 App](https://create.t3.gg/)
- Map tiles from [OpenStreetMap](https://www.openstreetmap.org/)
- Icons from [Lucide](https://lucide.dev/)
