import { NextResponse } from 'next/server';
import { createClient } from '~/lib/supabase/server';
import { queryPostHog } from '~/lib/posthog/server';
import { getGPSPermissionStatsQuery } from '~/lib/posthog/queries';

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/gps-permissions
 * Get GPS permission stats (granted vs denied)
 * Requires authentication
 */
export async function GET() {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Query PostHog for GPS permission stats
    const result = await queryPostHog(getGPSPermissionStatsQuery());

    // Parse results
    let granted = 0;
    let denied = 0;

    (result.results || []).forEach((row: any) => {
      const status = row[0];
      const users = row[1] || 0;

      if (status === 'granted') {
        granted = users;
      } else if (status === 'denied') {
        denied = users;
      }
    });

    const total = granted + denied;
    const percentage = total > 0 ? Math.round((granted / total) * 100) : 0;

    return NextResponse.json({
      granted,
      denied,
      total,
      percentage,
      neighborhood: process.env.NEXT_PUBLIC_NEIGHBORHOOD_NAME,
    });
  } catch (error) {
    console.error('Error fetching GPS permission stats:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch analytics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
