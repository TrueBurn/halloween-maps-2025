import posthog from "posthog-js";

/**
 * PostHog client-side singleton
 * Only initializes once per session
 */
export function getPostHogClient() {
  if (typeof window === "undefined") {
    return null;
  }

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!key || !host) {
    console.warn("PostHog credentials not configured");
    return null;
  }

  // Initialize PostHog if not already done
  if (!posthog.__loaded) {
    posthog.init(key, {
      api_host: host,
      person_profiles: "identified_only",
      capture_pageview: false, // We'll handle this manually in the provider
      capture_pageleave: true,
      loaded: (posthogInstance) => {
        // Register global properties for ALL events
        const neighborhood = process.env.NEXT_PUBLIC_NEIGHBORHOOD_NAME;
        const eventYear = process.env.NEXT_PUBLIC_EVENT_YEAR;

        posthogInstance.register({
          neighborhood: neighborhood ?? "Unknown",
          event_year: eventYear ?? "2025",
          deployment_url: window.location.origin,
        });

        if (process.env.NODE_ENV === "development") {
          console.log("PostHog initialized for neighborhood:", neighborhood);
        }
      },
    });
  }

  return posthog;
}

export { posthog };
