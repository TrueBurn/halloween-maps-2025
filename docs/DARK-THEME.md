# Dark Halloween Theme 🎃

## Overview
The Halloween Maps 2025 app features a spooky dark theme throughout the entire application, creating an immersive Halloween atmosphere.

## Color Palette

### Base Colors
```css
--color-background: #0f0f0f    /* Near-black page background */
--color-surface: #1a1a1a       /* Dark gray for cards/panels */
--color-text-primary: #f3f4f6  /* Light gray for primary text */
--color-text-secondary: #9ca3af /* Medium gray for secondary text */
```

### Accent Colors (Vibrant for Contrast)
```css
--color-primary: #6366f1     /* Indigo - Buttons, links */
--color-secondary: #ec4899   /* Pink - Accents */
--color-success: #10b981     /* Green - Has candy */
--color-warning: #f59e0b     /* Amber - Warnings */
--color-error: #ef4444       /* Red - No candy */
```

### Border Colors
```css
border-gray-800: #1f2937     /* Borders and dividers */
border-gray-700: #374151     /* Form input borders */
```

## Components Updated

### Navigation
- Dark surface background (`bg-surface`)
- Gray borders (`border-gray-800`)
- Light text with secondary gray icons
- Hover states with dark gray background

### Map Components
- **MapView**: Dark loading overlay, dark location count badge
- **Leaflet Popups**: Custom CSS overrides for dark backgrounds
  - Dark wrapper with gray borders
  - Light text on dark background
  - Dark popup arrow (tip)
  - Gray close button with hover state
- **UserLocationButton**: Dark disabled state

### Location List
- Dark background page
- Dark surface cards
- Dark form inputs with proper contrast
- Dark filter selects and sort dropdown

### Admin Panel
- **Dashboard**: Dark header, dark action cards
- **LocationTable**: Dark table with gray borders, dark hover states
- **LocationForm**: Dark modal with dark form inputs
- **CoordinatePicker**: Dark modal overlay and UI
- **Login Page**: Dark authentication form

### Dev Tools
- Dark page background
- Dark stats cards with borders
- Dark info boxes with blue accent
- Dark form elements

## Implementation Details

### Tailwind CSS Classes Used
- `bg-background` - Main page backgrounds
- `bg-surface` - Cards, panels, modals
- `text-text-primary` - Primary text
- `text-text-secondary` - Secondary text
- `border-gray-800` - Main borders
- `border-gray-700` - Form input borders
- `hover:bg-gray-800` - Dark hover states

### Form Elements
All form inputs use:
```
bg-background
border-gray-700
text-text-primary
placeholder:text-text-secondary
focus:ring-primary
```

### Status Badges
- Success (has candy): `bg-success/20 text-success border-success/30`
- Error (no candy): `bg-error/20 text-error border-error/30`
- Warning (activity): `bg-warning/20 text-warning border-warning/30`

### Custom CSS
Added to `globals.css`:
```css
/* Leaflet Popup Dark Theme Overrides */
.leaflet-popup-content-wrapper {
  background: #1a1a1a !important;
  color: #f3f4f6 !important;
  border: 1px solid #374151 !important;
  border-radius: 0.5rem !important;
}

.leaflet-popup-tip {
  background: #1a1a1a !important;
  border-left: 1px solid #374151 !important;
  border-bottom: 1px solid #374151 !important;
}

.leaflet-popup-close-button {
  color: #9ca3af !important;
}

.leaflet-popup-close-button:hover {
  color: #f3f4f6 !important;
}
```

## Files Modified

1. **Styles**:
   - `src/styles/globals.css` - Theme variables and Leaflet overrides

2. **Layout Components**:
   - `src/app/layout.tsx` - Root layout
   - `src/components/layout/Navigation.tsx` - Navigation bar

3. **Map Components**:
   - `src/app/page.tsx` - Homepage
   - `src/components/map/MapView.tsx` - Map view
   - `src/components/map/UserLocationButton.tsx` - FAB button

4. **Location Components**:
   - `src/app/locations/page.tsx` - List page
   - `src/components/locations/LocationList.tsx` - Location list

5. **Admin Components**:
   - `src/app/admin/page.tsx` - Admin dashboard
   - `src/app/admin/login/page.tsx` - Login page
   - `src/components/admin/LocationTable.tsx` - Location table
   - `src/components/admin/LocationForm.tsx` - Location form
   - `src/components/admin/CoordinatePicker.tsx` - Coordinate picker

6. **Dev Tools**:
   - `src/app/dev/page.tsx` - Dev tools page

## Design Philosophy

1. **High Contrast**: Light text on very dark backgrounds for readability
2. **Vibrant Accents**: Bright colors pop against dark backgrounds
3. **Consistent Patterns**: Same dark theme treatment across all pages
4. **Proper Hover States**: Clear visual feedback on dark backgrounds
5. **Halloween Vibes**: Spooky dark atmosphere perfect for trick-or-treating

## Browser Support

- Dark theme works in all modern browsers
- Custom Tailwind CSS variables supported
- Leaflet popup overrides use `!important` to ensure dark styling

## Future Enhancements

- Consider adding a toggle for users who prefer light mode
- Explore darker accent colors for better WCAG AAA compliance
- Add subtle Halloween-themed animations/effects
