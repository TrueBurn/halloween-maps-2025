import type { Tables } from '~/types/database.types';

type Location = Tables<'locations'>;

/**
 * Export locations to CSV format
 */
export function exportToCSV(locations: Location[]): void {
  const headers = [
    'ID',
    'Address',
    'Latitude',
    'Longitude',
    'Type',
    'Route',
    'Is Start',
    'Participating',
    'Has Candy',
    'Has Activity',
    'Activity Details',
    'Created At',
  ];

  const rows = locations.map((loc) => [
    loc.id,
    loc.address,
    loc.latitude,
    loc.longitude,
    loc.location_type,
    loc.route || '',
    loc.is_start ? 'Yes' : 'No',
    loc.is_participating ? 'Yes' : 'No',
    loc.has_candy ? 'Yes' : 'No',
    loc.has_activity ? 'Yes' : 'No',
    loc.activity_details || '',
    loc.created_at,
  ]);

  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  downloadFile(csv, 'locations.csv', 'text/csv');
}

/**
 * Export locations to JSON format
 */
export function exportToJSON(locations: Location[]): void {
  const json = JSON.stringify(locations, null, 2);
  downloadFile(json, 'locations.json', 'application/json');
}

/**
 * Helper to trigger file download
 */
function downloadFile(content: string, filename: string, contentType: string): void {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
