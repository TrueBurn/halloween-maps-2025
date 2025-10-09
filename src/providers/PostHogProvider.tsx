"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getPostHogClient } from "~/lib/posthog/client";

/**
 * Internal component that uses useSearchParams
 * Must be wrapped in Suspense
 */
function PostHogPageView() {
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

  return null;
}

/**
 * PostHog Provider
 * Initializes PostHog and tracks pageviews
 * Automatically registers neighborhood property for all events
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </>
  );
}

/**
 * Hook to access PostHog instance in components
 */
export function usePostHog() {
  return getPostHogClient();
}
