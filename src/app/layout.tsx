import "~/styles/globals.css";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { env } from "~/env";

export const metadata: Metadata = {
  title: `${env.NEXT_PUBLIC_NEIGHBORHOOD_NAME} Halloween ${env.NEXT_PUBLIC_EVENT_YEAR}`,
  description: `Interactive Halloween trick-or-treating map for ${env.NEXT_PUBLIC_NEIGHBORHOOD_NAME}. Find participating houses, candy availability, and walking directions.`,
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-touch-icon.svg',
  },
  openGraph: {
    title: `${env.NEXT_PUBLIC_NEIGHBORHOOD_NAME} Halloween ${env.NEXT_PUBLIC_EVENT_YEAR}`,
    description: `Interactive Halloween trick-or-treating map for ${env.NEXT_PUBLIC_NEIGHBORHOOD_NAME}. Find participating houses, candy availability, and walking directions.`,
    images: ['/preview.png'],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${env.NEXT_PUBLIC_NEIGHBORHOOD_NAME} Halloween ${env.NEXT_PUBLIC_EVENT_YEAR}`,
    description: `Interactive Halloween trick-or-treating map for ${env.NEXT_PUBLIC_NEIGHBORHOOD_NAME}`,
    images: ['/preview.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.cdnfonts.com" />
        <link rel="stylesheet" href="https://fonts.cdnfonts.com/css/bloody" />
      </head>
      <body className="bg-background text-text-primary font-sans">
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
