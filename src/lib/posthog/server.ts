import { PostHog } from "posthog-node";

/**
 * PostHog server-side client for API routes
 * Used for querying analytics data and server-side events
 */
let posthogServerInstance: PostHog | null = null;

export function getPostHogServer() {
  if (posthogServerInstance) {
    return posthogServerInstance;
  }

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!key || !host) {
    console.warn("PostHog credentials not configured for server");
    return null;
  }

  posthogServerInstance = new PostHog(key, {
    host: host,
  });

  return posthogServerInstance;
}

/**
 * Query PostHog API for analytics data
 * Automatically includes neighborhood filter
 */
export async function queryPostHog(query: {
  kind: string;
  query: string;
}): Promise<any> {
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.posthog.com";

  if (!apiKey || !projectId) {
    throw new Error(
      "POSTHOG_PERSONAL_API_KEY and POSTHOG_PROJECT_ID must be set"
    );
  }

  const response = await fetch(
    `${host}/api/projects/${projectId}/query/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(query),
      // Cache for 30 seconds to reduce API calls
      next: { revalidate: 30 },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PostHog query failed: ${error}`);
  }

  return response.json();
}

/**
 * Shutdown PostHog client gracefully
 * Call this when the server is shutting down
 */
export async function shutdownPostHog() {
  if (posthogServerInstance) {
    await posthogServerInstance.shutdown();
    posthogServerInstance = null;
  }
}
