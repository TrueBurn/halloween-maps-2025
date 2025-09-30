import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import { Home, Coffee, Car, Square as SquareParking, Table } from 'lucide-react';
import type { Tables } from '~/types/database.types';

type Location = Tables<'locations'>;

function getIconComponent(locationType: Location['location_type']) {
  switch (locationType) {
    case 'House':
      return Home;
    case 'Refreshments':
      return Coffee;
    case 'Car':
      return Car;
    case 'Parking':
      return SquareParking;
    case 'Table':
      return Table;
    default:
      return Home;
  }
}

export function createLocationIcon(location: Location): L.DivIcon {
  const IconComponent = getIconComponent(location.location_type);

  // Render icon with status badges
  const iconHtml = renderToString(
    <div className="relative">
      {/* Main icon container */}
      <div
        className="flex items-center justify-center rounded-full bg-white shadow-lg"
        style={{
          width: '40px',
          height: '40px',
          border: '3px solid #6366f1'
        }}
      >
        <IconComponent
          className="text-primary"
          size={20}
          strokeWidth={2.5}
        />
      </div>

      {/* Status badges */}
      <div className="absolute -top-1 -right-1 flex gap-0.5">
        {location.is_start && (
          <div
            className="flex items-center justify-center rounded-full bg-green-500 text-white text-xs font-bold shadow"
            style={{ width: '16px', height: '16px' }}
            title="Starting Point"
          >
            S
          </div>
        )}
        {location.has_activity && (
          <div
            className="flex items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold shadow"
            style={{ width: '16px', height: '16px' }}
            title="Has Activity"
          >
            A
          </div>
        )}
        {!location.has_candy && (
          <div
            className="flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold shadow"
            style={{ width: '16px', height: '16px' }}
            title="No Candy"
          >
            ✕
          </div>
        )}
      </div>
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'custom-location-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
}
