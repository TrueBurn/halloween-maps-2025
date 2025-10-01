import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { createClient } from "~/lib/supabase/server";

// Example locations spread around default center coordinates
// Uses environment variable for center point
import { env } from "~/env";

const EXAMPLE_LOCATIONS = [
  // Starting Points (with age groups)
  {
    latitude: env.NEXT_PUBLIC_DEFAULT_LAT,
    longitude: env.NEXT_PUBLIC_DEFAULT_LNG,
    address: "Example - Starting Point (Over 8)",
    is_start: true,
    is_participating: true,
    has_candy: false,
    location_type: "House" as const,
    route: "Over 8" as const,
    has_activity: false,
  },
  {
    latitude: env.NEXT_PUBLIC_DEFAULT_LAT + 0.0012,
    longitude: env.NEXT_PUBLIC_DEFAULT_LNG - 0.0008,
    address: "Example - Starting Point (Under 8)",
    is_start: true,
    is_participating: true,
    has_candy: false,
    location_type: "House" as const,
    route: "Under 8" as const,
    has_activity: false,
  },
  {
    latitude: env.NEXT_PUBLIC_DEFAULT_LAT - 0.0010,
    longitude: env.NEXT_PUBLIC_DEFAULT_LNG + 0.0012,
    address: "Example - Starting Point (Toddlers)",
    is_start: true,
    is_participating: true,
    has_candy: false,
    location_type: "House" as const,
    route: "Toddlers" as const,
    has_activity: false,
  },
  // Regular Participating Houses (no routes)
  {
    latitude: env.NEXT_PUBLIC_DEFAULT_LAT + 0.0007,
    longitude: env.NEXT_PUBLIC_DEFAULT_LNG + 0.0005,
    address: "Example - 15 Main Street",
    is_start: false,
    is_participating: true,
    has_candy: true,
    location_type: "House" as const,
    has_activity: true,
    activity_details: "Face painting",
  },
  {
    latitude: env.NEXT_PUBLIC_DEFAULT_LAT - 0.0006,
    longitude: env.NEXT_PUBLIC_DEFAULT_LNG - 0.0004,
    address: "Example - 23 Oak Avenue",
    is_start: false,
    is_participating: true,
    has_candy: false,
    location_type: "House" as const,
    has_activity: false,
  },
  {
    latitude: env.NEXT_PUBLIC_DEFAULT_LAT + 0.0004,
    longitude: env.NEXT_PUBLIC_DEFAULT_LNG - 0.0006,
    address: "Example - 42 Elm Road",
    is_start: false,
    is_participating: true,
    has_candy: true,
    location_type: "House" as const,
    has_activity: false,
  },
  {
    latitude: env.NEXT_PUBLIC_DEFAULT_LAT - 0.0008,
    longitude: env.NEXT_PUBLIC_DEFAULT_LNG + 0.0003,
    address: "Example - 67 Pine Road",
    is_start: false,
    is_participating: true,
    has_candy: true,
    location_type: "House" as const,
    has_activity: true,
    activity_details: "Pumpkin decorating",
  },
  // Special Locations (no routes)
  {
    latitude: env.NEXT_PUBLIC_DEFAULT_LAT + 0.0002,
    longitude: env.NEXT_PUBLIC_DEFAULT_LNG + 0.0010,
    address: "Example - Community Parking Area",
    is_start: false,
    is_participating: true,
    has_candy: false,
    location_type: "Parking" as const,
    has_activity: false,
  },
  {
    latitude: env.NEXT_PUBLIC_DEFAULT_LAT - 0.0003,
    longitude: env.NEXT_PUBLIC_DEFAULT_LNG + 0.0015,
    address: "Example - Refreshment Table",
    is_start: false,
    is_participating: true,
    has_candy: false,
    location_type: "Refreshments" as const,
    has_activity: true,
    activity_details: "Hot drinks and snacks",
  },
  {
    latitude: env.NEXT_PUBLIC_DEFAULT_LAT + 0.0009,
    longitude: env.NEXT_PUBLIC_DEFAULT_LNG - 0.0003,
    address: "Example - Game Station",
    is_start: false,
    is_participating: true,
    has_candy: false,
    location_type: "Table" as const,
    has_activity: true,
    activity_details: "Halloween games and prizes",
  },
];

export const devRouter = createTRPCRouter({
  seedLocations: publicProcedure.mutation(async () => {
    // Only allow in development
    if (process.env.NODE_ENV !== "development") {
      throw new Error("This endpoint is only available in development mode");
    }

    const supabase = await createClient();

    // Insert example locations
    const { data, error } = await supabase
      .from("locations")
      .insert(EXAMPLE_LOCATIONS)
      .select();

    if (error) {
      throw new Error(`Failed to seed locations: ${error.message}`);
    }

    return {
      success: true,
      count: data?.length || 0,
      message: `Successfully seeded ${data?.length || 0} example locations`,
    };
  }),

  clearExampleLocations: publicProcedure.mutation(async () => {
    // Only allow in development
    if (process.env.NODE_ENV !== "development") {
      throw new Error("This endpoint is only available in development mode");
    }

    const supabase = await createClient();

    // Delete only locations that have "Example - " in the address
    const { data, error } = await supabase
      .from("locations")
      .delete()
      .like("address", "Example - %")
      .select();

    if (error) {
      throw new Error(`Failed to clear example locations: ${error.message}`);
    }

    return {
      success: true,
      count: data?.length || 0,
      message: `Successfully cleared ${data?.length || 0} example locations`,
    };
  }),

  getStats: publicProcedure.query(async () => {
    // Only allow in development
    if (process.env.NODE_ENV !== "development") {
      throw new Error("This endpoint is only available in development mode");
    }

    const supabase = await createClient();

    const { count: totalCount } = await supabase
      .from("locations")
      .select("*", { count: "exact", head: true });

    const { count: exampleCount } = await supabase
      .from("locations")
      .select("*", { count: "exact", head: true })
      .like("address", "Example - %");

    return {
      total: totalCount || 0,
      examples: exampleCount || 0,
      real: (totalCount || 0) - (exampleCount || 0),
    };
  }),
});
