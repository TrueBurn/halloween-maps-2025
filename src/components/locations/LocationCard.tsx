import { Home, Coffee, Car, Square as SquareParking, Table, MapPin, Navigation, Store, Heart } from 'lucide-react';
import Link from 'next/link';
import type { Tables } from '~/types/database.types';
import { calculateDistance, formatDistance } from '~/lib/utils/distance';
import type { UserLocation } from '~/lib/hooks/useUserLocation';
import { usePostHog } from '~/providers/PostHogProvider';

type Location = Tables<'locations'>;

interface LocationCardProps {
  location: Location;
  userLocation?: UserLocation | null;
}

function getIcon(locationType: Location['location_type']) {
  const iconProps = { className: 'h-5 w-5', strokeWidth: 2.5 };

  switch (locationType) {
    case 'House':
      return <Home {...iconProps} />;
    case 'Refreshments':
      return <Coffee {...iconProps} />;
    case 'Car':
      return <Car {...iconProps} />;
    case 'Store':
      return <Store {...iconProps} />;
    case 'Parking':
      return <SquareParking {...iconProps} />;
    case 'Table':
      return <Table {...iconProps} />;
    case 'AnimalCharity':
      return <Heart {...iconProps} />;
    default:
      return <Home {...iconProps} />;
  }
}

export function LocationCard({ location, userLocation }: LocationCardProps) {
  const posthog = usePostHog();

  // Calculate distance if user location is available
  const distance = userLocation
    ? calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        location.latitude,
        location.longitude
      )
    : null;

  return (
    <div className="bg-surface rounded-lg shadow-lg border border-gray-800 p-4 hover:shadow-xl hover:border-gray-700 transition-all">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary">
          {getIcon(location.location_type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Address */}
          <h3 className="text-base font-semibold text-text-primary">
            {location.address}
          </h3>

          {/* Type & Distance */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-sm text-text-secondary">{location.location_type}</span>
            {distance !== null && (
              <>
                <span className="text-gray-600">•</span>
                <div className="flex items-center gap-1 text-sm text-text-secondary">
                  <Navigation className="h-3 w-3" />
                  {formatDistance(distance)}
                </div>
              </>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-2">
            {location.is_start && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success/20 text-success border border-success/30">
                ⭐ Starting point{location.route ? ` for ${location.route}` : ''}
              </span>
            )}
            {location.has_candy ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success/20 text-success border border-success/30">
                ✓ Has Candy
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-error/20 text-error border border-error/30">
                No Candy
              </span>
            )}
            {location.has_activity && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-warning/20 text-warning border border-warning/30">
                🎃 Activity
              </span>
            )}
          </div>

          {/* Activity Details */}
          {location.activity_details && (
            <p className="text-sm text-text-secondary mt-2">
              {location.activity_details}
            </p>
          )}
        </div>

        {/* View on Map Button */}
        <Link
          href={`/?lat=${location.latitude}&lng=${location.longitude}`}
          className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-primary hover:bg-primary/20 transition-colors"
          title="View on map"
          onClick={() => {
            posthog?.capture('location_card_clicked', {
              location_id: location.id,
              location_type: location.location_type,
              has_candy: location.has_candy,
              address: location.address,
            });
          }}
        >
          <MapPin className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
