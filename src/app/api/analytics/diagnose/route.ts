import { NextResponse } from 'next/server';
import { createClient } from '~/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/diagnose
 * Diagnostic endpoint to check PostHog configuration
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

    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment_variables: {
        NEXT_PUBLIC_POSTHOG_KEY: {
          configured: !!process.env.NEXT_PUBLIC_POSTHOG_KEY,
          value: process.env.NEXT_PUBLIC_POSTHOG_KEY
            ? `${process.env.NEXT_PUBLIC_POSTHOG_KEY.substring(0, 8)}...`
            : 'NOT SET',
          starts_with_phc: process.env.NEXT_PUBLIC_POSTHOG_KEY?.startsWith('phc_') ?? false,
        },
        NEXT_PUBLIC_POSTHOG_HOST: {
          configured: !!process.env.NEXT_PUBLIC_POSTHOG_HOST,
          value: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'NOT SET',
        },
        POSTHOG_PERSONAL_API_KEY: {
          configured: !!process.env.POSTHOG_PERSONAL_API_KEY,
          value: process.env.POSTHOG_PERSONAL_API_KEY
            ? `${process.env.POSTHOG_PERSONAL_API_KEY.substring(0, 8)}...`
            : 'NOT SET',
          starts_with_phx: process.env.POSTHOG_PERSONAL_API_KEY?.startsWith('phx_') ?? false,
        },
        POSTHOG_PROJECT_ID: {
          configured: !!process.env.POSTHOG_PROJECT_ID,
          value: process.env.POSTHOG_PROJECT_ID ?? 'NOT SET',
        },
        NEXT_PUBLIC_NEIGHBORHOOD_NAME: {
          configured: !!process.env.NEXT_PUBLIC_NEIGHBORHOOD_NAME,
          value: process.env.NEXT_PUBLIC_NEIGHBORHOOD_NAME ?? 'NOT SET',
        },
      },
      issues: [] as string[],
      recommendations: [] as string[],
    };

    // Check for issues
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      diagnostics.issues.push('NEXT_PUBLIC_POSTHOG_KEY is not set');
      diagnostics.recommendations.push(
        'Set NEXT_PUBLIC_POSTHOG_KEY in your environment variables (get from PostHog Settings → Project API Key)'
      );
    } else if (!process.env.NEXT_PUBLIC_POSTHOG_KEY.startsWith('phc_')) {
      diagnostics.issues.push('NEXT_PUBLIC_POSTHOG_KEY does not start with "phc_"');
      diagnostics.recommendations.push(
        'Verify you are using the Project API Key (not Personal API Key). It should start with "phc_"'
      );
    }

    if (!process.env.NEXT_PUBLIC_POSTHOG_HOST) {
      diagnostics.issues.push('NEXT_PUBLIC_POSTHOG_HOST is not set');
      diagnostics.recommendations.push(
        'Set NEXT_PUBLIC_POSTHOG_HOST to either "https://us.posthog.com" or "https://eu.posthog.com"'
      );
    }

    if (!process.env.POSTHOG_PERSONAL_API_KEY) {
      diagnostics.issues.push('POSTHOG_PERSONAL_API_KEY is not set');
      diagnostics.recommendations.push(
        'Create a Personal API Key in PostHog Settings → Personal API Keys with "Query Read" permission'
      );
    } else if (!process.env.POSTHOG_PERSONAL_API_KEY.startsWith('phx_')) {
      diagnostics.issues.push('POSTHOG_PERSONAL_API_KEY does not start with "phx_"');
      diagnostics.recommendations.push(
        'Verify you are using a Personal API Key (not Project API Key). It should start with "phx_"'
      );
    }

    if (!process.env.POSTHOG_PROJECT_ID) {
      diagnostics.issues.push('POSTHOG_PROJECT_ID is not set');
      diagnostics.recommendations.push(
        'Set POSTHOG_PROJECT_ID (numeric ID from PostHog Settings → Project)'
      );
    }

    // Test PostHog API connection if all credentials are present
    if (
      process.env.POSTHOG_PERSONAL_API_KEY &&
      process.env.POSTHOG_PROJECT_ID &&
      process.env.NEXT_PUBLIC_POSTHOG_HOST
    ) {
      try {
        const testQuery = {
          query: {
            kind: 'HogQLQuery',
            query: 'SELECT 1',
          },
        };

        const testResponse = await fetch(
          `${process.env.NEXT_PUBLIC_POSTHOG_HOST}/api/projects/${process.env.POSTHOG_PROJECT_ID}/query/`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.POSTHOG_PERSONAL_API_KEY}`,
            },
            body: JSON.stringify(testQuery),
          }
        );

        if (testResponse.ok) {
          diagnostics.recommendations.push(
            '✅ PostHog API connection successful! All credentials are valid.'
          );
        } else {
          const errorText = await testResponse.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { detail: errorText };
          }

          diagnostics.issues.push(`PostHog API test failed: ${testResponse.status} ${testResponse.statusText}`);

          if (errorData.type === 'authentication_error') {
            diagnostics.recommendations.push(
              '🔑 Authentication failed. Please verify:',
              '1. Your Personal API Key is correct (copy-paste from PostHog dashboard)',
              '2. The key has "Query Read" permission enabled',
              '3. The key has not been revoked or expired',
              '4. You are using the correct PostHog host (us.posthog.com vs eu.posthog.com)'
            );
          } else if (errorData.type === 'validation_error') {
            diagnostics.recommendations.push(
              '📝 Validation error. Please verify:',
              '1. POSTHOG_PROJECT_ID matches your PostHog project (numeric ID)',
              '2. The query format is correct'
            );
          } else {
            diagnostics.recommendations.push(
              `❌ Unexpected error: ${JSON.stringify(errorData, null, 2)}`
            );
          }
        }
      } catch (error) {
        diagnostics.issues.push(`Failed to test PostHog connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
        diagnostics.recommendations.push(
          'Network error connecting to PostHog. Check that the host URL is correct and accessible.'
        );
      }
    }

    return NextResponse.json(diagnostics, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error in diagnostics:', error);
    return NextResponse.json(
      {
        error: 'Failed to run diagnostics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
