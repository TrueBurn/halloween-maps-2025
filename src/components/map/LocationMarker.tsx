import L from 'leaflet';
import type { Tables } from '~/types/database.types';

type Location = Tables<'locations'>;

function getIconPath(location: Location): string {
  // Determine base icon type
  let baseIcon: string;

  switch (location.location_type) {
    case 'Parking':
      baseIcon = 'parking';
      break;
    case 'Refreshments':
      baseIcon = 'refreshments';
      break;
    case 'Car':
      baseIcon = 'car';
      break;
    case 'House':
    case 'Table':
    default:
      // For House/Table, use location icon with variants
      // Determine variant based on status
      if (location.is_start) {
        baseIcon = 'location-start';
      } else if (!location.has_candy) {
        baseIcon = 'location-no-candy';
      } else if (location.has_activity) {
        baseIcon = 'location-activity';
      } else {
        baseIcon = 'location';
      }
  }

  return `/icons/${baseIcon}.svg`;
}

export function createLocationIcon(location: Location): L.Icon {
  const iconUrl = getIconPath(location);
  const shadowUrl = '/icons/marker-shadow.svg';

  // Starting points get larger icons
  const iconSize = location.is_start ? 48 : 40;

  return L.icon({
    iconUrl,
    shadowUrl,
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize / 2, iconSize / 2],
    popupAnchor: [0, -(iconSize / 2)],
    shadowSize: [iconSize, iconSize],
    shadowAnchor: [iconSize / 2, iconSize - 5],
  });
}
