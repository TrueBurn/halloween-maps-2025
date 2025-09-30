import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),

    // Neighborhood Configuration
    NEXT_PUBLIC_NEIGHBORHOOD_NAME: z.string().min(1),
    NEXT_PUBLIC_DEFAULT_LAT: z.string().transform(Number),
    NEXT_PUBLIC_DEFAULT_LNG: z.string().transform(Number),
    NEXT_PUBLIC_DEFAULT_ZOOM: z.string().transform(Number),

    // Event Configuration
    NEXT_PUBLIC_EVENT_YEAR: z.string().transform(Number),
    NEXT_PUBLIC_EVENT_DATE: z.string(),
    NEXT_PUBLIC_EVENT_START_TIME: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,

    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,

    // Neighborhood Configuration
    NEXT_PUBLIC_NEIGHBORHOOD_NAME: process.env.NEXT_PUBLIC_NEIGHBORHOOD_NAME,
    NEXT_PUBLIC_DEFAULT_LAT: process.env.NEXT_PUBLIC_DEFAULT_LAT,
    NEXT_PUBLIC_DEFAULT_LNG: process.env.NEXT_PUBLIC_DEFAULT_LNG,
    NEXT_PUBLIC_DEFAULT_ZOOM: process.env.NEXT_PUBLIC_DEFAULT_ZOOM,

    // Event Configuration
    NEXT_PUBLIC_EVENT_YEAR: process.env.NEXT_PUBLIC_EVENT_YEAR,
    NEXT_PUBLIC_EVENT_DATE: process.env.NEXT_PUBLIC_EVENT_DATE,
    NEXT_PUBLIC_EVENT_START_TIME: process.env.NEXT_PUBLIC_EVENT_START_TIME,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
