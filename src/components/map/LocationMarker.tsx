import L from 'leaflet';
import type { Tables } from '~/types/database.types';

type Location = Tables<'locations'>;

function getIconPath(location: Location): string {
  // Parking, Refreshments, and AnimalCharity are always static (no state variants)
  if (location.location_type === 'Parking') {
    return '/icons/parking.svg';
  }
  if (location.location_type === 'Refreshments') {
    return '/icons/refreshments.svg';
  }
  if (location.location_type === 'AnimalCharity') {
    return '/icons/animal-charity.svg';
  }

  // Determine base icon shape by location type
  let baseIcon: string;
  switch (location.location_type) {
    case 'House':
      baseIcon = 'house';
      break;
    case 'Table':
      baseIcon = 'table';
      break;
    case 'Car':
      baseIcon = 'car';
      break;
    case 'Store':
      baseIcon = 'store';
      break;
    default:
      baseIcon = 'house'; // Fallback to house
  }

  // Apply state variant suffix based on location status
  // Priority: !has_candy > is_start > has_activity > normal
  // (No candy is most important to show on the day)
  if (!location.has_candy) {
    return `/icons/${baseIcon}-no-candy.svg`;
  }
  if (location.is_start) {
    return `/icons/${baseIcon}-start.svg`;
  }
  if (location.has_activity) {
    return `/icons/${baseIcon}-activity.svg`;
  }

  // Normal state (has candy, no special status)
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
