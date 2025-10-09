"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getPostHogClient } from "~/lib/posthog/client";

/**
 * PostHog Provider
 * Initializes PostHog and tracks pageviews
 * Automatically registers neighborhood property for all events
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const posthog = getPostHogClient();
    if (!posthog) return;

    // Track pageview on route change
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    posthog.capture("$pageview", {
      $current_url: url,
    });
  }, [pathname, searchParams]);

  return <>{children}</>;
}

/**
 * Hook to access PostHog instance in components
 */
export function usePostHog() {
  return getPostHogClient();
}
