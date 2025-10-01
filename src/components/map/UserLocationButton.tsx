'use client';

import { MapPinned } from 'lucide-react';

interface UserLocationButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function UserLocationButton({ onClick, disabled = false }: UserLocationButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex h-12 w-12 items-center justify-center rounded-full shadow-lg
        transition-all duration-200
        ${
          disabled
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-primary text-white hover:bg-primary/90 hover:shadow-xl active:scale-95'
        }
      `}
      title={disabled ? 'Location unavailable' : 'Center on my location'}
      aria-label="Center map on my location"
    >
      <MapPinned className="h-5 w-5" strokeWidth={2.5} />
    </button>
  );
}
