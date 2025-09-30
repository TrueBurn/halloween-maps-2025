# Supabase Migrations

This directory contains SQL migration files for the Halloween Maps database schema.

## Migrations

### 1. `20250930075234_create_enums.sql`
Creates the custom enum types:
- `location_type`: House, Table, Car, Parking, Refreshments
- `route`: Over 8, Under 8, Toddlers

### 2. `20250930075249_create_locations_table.sql`
Creates the main `locations` table with:
- 15 columns for location data
- Indexes on coordinates and participating status
- Default values for boolean fields

### 3. `20250930075259_setup_rls_policies.sql`
Sets up Row Level Security policies:
- Public read access for participating locations
- Admin-only write access (insert, update, delete)

## Running Migrations

### For New Supabase Project

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Go to the SQL Editor in your Supabase dashboard

3. Run each migration file in order:
   ```sql
   -- Copy and paste contents of each file:
   -- 1. 20250930075234_create_enums.sql
   -- 2. 20250930075249_create_locations_table.sql
   -- 3. 20250930075259_setup_rls_policies.sql
   ```

### Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Link to your project
supabase link --project-ref your-project-id

# Apply all migrations
supabase db push
```

### Using Supabase MCP (Claude Code)

```typescript
// Migrations are automatically applied via MCP
// Check migration status:
mcp__supabase__list_migrations()

// Apply new migration:
mcp__supabase__apply_migration({
  name: "migration_name",
  query: "SQL here"
})
```

## Generate TypeScript Types

After running migrations, generate TypeScript types:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts
```

Or use the MCP:
```typescript
mcp__supabase__generate_typescript_types()
```

## Backup Current Schema

To backup your current database schema:

```bash
# Using Supabase CLI
supabase db dump -f supabase/schema_backup.sql

# Or export from Supabase dashboard:
# Settings > Database > Database Settings > Export Schema
```

## Resetting Database

⚠️ **Warning**: This will delete all data!

```sql
-- Drop all policies
DROP POLICY IF EXISTS "Public locations are viewable by everyone" ON locations;
DROP POLICY IF EXISTS "Authenticated users can insert locations" ON locations;
DROP POLICY IF EXISTS "Authenticated users can update locations" ON locations;
DROP POLICY IF EXISTS "Authenticated users can delete locations" ON locations;

-- Drop table
DROP TABLE IF EXISTS locations;

-- Drop enums
DROP TYPE IF EXISTS route;
DROP TYPE IF EXISTS location_type;

-- Then run migrations again
```

## Multi-Instance Setup

For deploying multiple neighborhoods:

1. Create separate Supabase project for each neighborhood
2. Run migrations in each project
3. Each project gets its own:
   - Project URL
   - Anon key
   - Database
4. Configure environment variables in Vercel per deployment

Example:
```
Neighborhood A: project-a-id.supabase.co
Neighborhood B: project-b-id.supabase.co
```
