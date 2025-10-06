# AI Image Generation Prompts

**Tools**: Flux AI, Leonardo AI, DALL-E 3, or similar text-to-image models

This document contains detailed prompts for generating high-quality Halloween-themed images for the Halloween Maps 2025 app. All prompts follow best practices for Flux and Leonardo AI:

- Natural language structure (subject → setting → mood → style)
- Specific technical details (lighting, camera, atmosphere)
- Comma-separated elements for clarity
- 40-50 word prompts for optimal results
- Negative prompts to avoid unwanted elements

---

## **Primary Images (High Priority)**

### 1. Social Media Preview Image
**Filename**: `preview.jpg`
**Dimensions**: 1200×630px (landscape)
**Format**: JPG (quality 90%)
**Use**: Open Graph, Twitter Card, social sharing

**Positive Prompt**:
```
Aerial view of spooky suburban neighborhood at Halloween twilight, glowing jack-o-lanterns on porches, orange and purple atmospheric lighting, dark houses with warm window lights, map markers with location pins floating above houses, cinematic depth of field, soft mist, dramatic sky with full moon, photorealistic, high detail, moody atmosphere, with emphasis on neighborhood community spirit
```

**Negative Prompt**:
```
no text, no logos, no UI elements, no people, no distorted perspective, no daytime lighting, no bright colors, no cartoonish style, no low quality
```

**Technical Settings**:
- Aspect Ratio: 1200×630 (1.9:1)
- Style: Cinematic, photorealistic
- Camera: Aerial drone shot, 45-degree angle
- Lighting: Golden hour/twilight, warm and cool contrast
- Atmosphere: Moody, inviting, community-focused

**Implementation**:
1. Save as `public/preview.jpg`
2. Update `src/app/layout.tsx` metadata:
```typescript
export const metadata: Metadata = {
  // ... existing metadata
  openGraph: {
    images: ['/preview.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/preview.jpg'],
  },
};
```

---

### 2. App Logo (High Detail)
**Filename**: `logo-hd.png`
**Dimensions**: 512×512px (square)
**Format**: PNG-24 with transparency
**Use**: Source for favicon generation, high-res branding

**Positive Prompt**:
```
Halloween jack-o-lantern carved pumpkin integrated into orange map location pin shape, glowing warm orange light from carved face, friendly spooky smile with triangle eyes, crisp geometric pin design, gradient orange to amber, dark carved details, green stem on top, clean icon design, centered composition, transparent background, professional logo quality, vector-style clarity
```

**Negative Prompt**:
```
no background, no text, no realistic texture, no photo style, no shadows, no 3D rendering, no blurriness, no extra elements, no off-center
```

**Technical Settings**:
- Aspect Ratio: 1:1 (square)
- Style: Clean icon design, semi-flat with subtle depth
- Lighting: Internal warm glow from carved face
- Background: Transparent (alpha channel)
- Detail Level: High contrast, sharp edges

**Implementation**:
1. Save as `public/logo-hd.png`
2. Replace or supplement existing `public/logo.svg`
3. Use for high-resolution displays

---

### 3. Favicon Source Image
**Filename**: `favicon-source.png`
**Dimensions**: 512×512px (square)
**Format**: PNG-24 with transparency
**Use**: Source for generating multi-size favicon.ico

**Positive Prompt**:
```
Simplified jack-o-lantern pumpkin face icon, bold orange circle, black triangle eyes and jagged smile, minimal design, high contrast, clean edges, centered face, small green stem, readable at tiny sizes, flat design style, transparent background, optimized for 16×16 pixel scaling
```

**Negative Prompt**:
```
no complex details, no gradients, no thin lines, no small elements, no text, no background, no realistic shading, no extra decorations
```

**Technical Settings**:
- Aspect Ratio: 1:1 (square)
- Style: Minimal, flat design, high contrast
- Colors: Solid orange (#f59e0b), black, green
- Simplicity: Must be readable at 16×16px

**Implementation**:
1. Save as `public/favicon-source.png`
2. Convert to multi-size favicon using online tool:
   - Go to https://realfavicongenerator.net/
   - Upload `favicon-source.png`
   - Generate sizes: 16×16, 32×32, 48×48
   - Download `favicon.ico`
3. Replace `public/favicon.ico`
4. Update `src/app/layout.tsx`:
```typescript
export const metadata: Metadata = {
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
};
```

---

### 4. Apple Touch Icon
**Filename**: `apple-touch-icon.png`
**Dimensions**: 180×180px (square)
**Format**: PNG-24 (no transparency - use dark background)
**Use**: iOS home screen icon, Safari pinned tabs

**Positive Prompt**:
```
Jack-o-lantern pumpkin icon on dark near-black background, warm orange glowing pumpkin, friendly carved face with triangle eyes and jagged smile, centered composition, subtle inner glow effect, rounded corners compatible with iOS design, high contrast for visibility, professional app icon quality, with focus on warm inviting Halloween atmosphere
```

**Negative Prompt**:
```
no transparency, no white background, no complex details, no text, no small elements, no thin lines, no gradients, no photo realism
```

**Technical Settings**:
- Aspect Ratio: 1:1 (square)
- Style: App icon design, semi-flat
- Background: Dark (#0f0f0f or #1a1a1a)
- Padding: 10-15px margin from edges
- Corners: Will be rounded by iOS automatically

**Implementation**:
1. Save as `public/apple-touch-icon.png` (180×180px)
2. Optionally create larger versions:
   - `apple-touch-icon-152x152.png`
   - `apple-touch-icon-167x167.png`
3. Already referenced in `src/app/layout.tsx` metadata

---

## **Optional Enhancement Images (Medium Priority)**

### 5. Map Marker Icons (Photorealistic Upgrade)
If SVG icons need more detail/realism, generate PNG versions:

#### Location Marker (Standard)
**Filename**: `icons/location-hd.png`
**Dimensions**: 128×128px
**Format**: PNG-24 with transparency

**Positive Prompt**:
```
Halloween decorated house icon, warm orange glow from windows showing jack-o-lantern inside, small pumpkin on roof, friendly inviting atmosphere, flat design with subtle depth, orange and amber color scheme, clean crisp edges, transparent background, optimized for map marker, view from front
```

**Negative Prompt**: `no realistic photo, no background, no text, no people, no extra decorations, no complex details`

---

#### Parking Icon (Enhanced)
**Filename**: `icons/parking-hd.png`
**Dimensions**: 128×128px
**Format**: PNG-24 with transparency

**Positive Prompt**:
```
Orange circular parking sign with P symbol, small bat wings decoration on sides, Halloween themed, flat icon design with subtle gradient, clean professional look, dark border, centered composition, transparent background, readable at small sizes
```

**Negative Prompt**: `no realistic texture, no background, no text besides P, no 3D rendering, no shadows`

---

#### Refreshments Icon (Enhanced)
**Filename**: `icons/refreshments-hd.png`
**Dimensions**: 128×128px
**Format**: PNG-24 with transparency

**Positive Prompt**:
```
Purple bubbling cauldron or steaming cup icon, wisps of pink steam rising, Halloween potion aesthetic, indigo and purple color scheme, flat design with subtle highlights, magical glow effect, transparent background, clean icon style, centered composition
```

**Negative Prompt**: `no realistic photo, no background, no text, no complex details, no 3D rendering`

---

### 6. Background Pattern/Texture
**Filename**: `bg-pattern.png`
**Dimensions**: 256×256px (tileable)
**Format**: PNG-24 with transparency
**Use**: Subtle background texture for dark theme

**Positive Prompt**:
```
Subtle Halloween pattern texture, tiny scattered stars and small jack-o-lantern silhouettes, very dark background with barely visible elements, seamless tileable pattern, minimal design, suitable for subtle webpage background, dark purple and orange accent colors, low opacity elements, with emphasis on subtlety
```

**Negative Prompt**:
```
no busy pattern, no high contrast, no large elements, no text, no borders, no bright colors, no realistic rendering
```

**Technical Settings**:
- Must be seamlessly tileable (edges match)
- Very subtle, low opacity
- Dark base color (#0f0f0f or transparent)

**Implementation**:
```css
/* In globals.css */
body {
  background-image: url('/bg-pattern.png');
  background-repeat: repeat;
}
```

---

### 7. Loading/Error State Illustration
**Filename**: `empty-state.png`
**Dimensions**: 400×300px
**Format**: PNG-24 with transparency
**Use**: Empty states, loading screens, error pages

**Positive Prompt**:
```
Friendly cartoon ghost holding a map, confused expression, Halloween themed, simple illustration style, orange and purple color palette, minimal clean design, transparent background, suitable for empty state placeholder, cute not scary, looking at folded map
```

**Negative Prompt**:
```
no scary imagery, no realistic photo, no background, no text, no complex details, no dark atmosphere, no multiple ghosts
```

---

## **Image Format & Export Guidelines**

### **PNG Images** (Icons, Logos, Transparent Assets)
- **Format**: PNG-24 (millions of colors + alpha)
- **Compression**: Medium (balance size/quality)
- **Color Profile**: sRGB
- **Transparency**: Preserve alpha channel
- **Use Cases**: Icons, logos, UI elements

### **JPG Images** (Photos, Previews)
- **Format**: JPEG
- **Quality**: 90% (high quality)
- **Color Profile**: sRGB
- **Optimization**: Progressive encoding
- **Use Cases**: Social previews, backgrounds

### **SVG Fallback Strategy**
Current SVG files in `public/icons/` and `public/` serve as:
1. **Immediate production assets** - Use now
2. **Fallbacks** - If AI generation doesn't work
3. **Lightweight alternatives** - Faster loading
4. **Scalable options** - No resolution limits

**When to Replace SVGs with AI-Generated PNGs**:
- ✅ Social preview (JPG needed for best compatibility)
- ✅ Favicon source (multi-size ICO generation)
- ✅ Apple touch icon (PNG required by iOS)
- ⚠️ Map markers - Only if you want more photorealistic detail
- ❌ Logo - Keep SVG for scalability unless HD version needed

---

## **Favicon Generation Workflow**

### Step 1: Generate Source Image
Use prompt #3 above to create `favicon-source.png` (512×512px)

### Step 2: Convert to Multi-Size ICO
1. Visit: https://realfavicongenerator.net/
2. Upload `favicon-source.png`
3. Configure settings:
   - **iOS**: Use `apple-touch-icon.png` (prompt #4)
   - **Android**: Generate from source
   - **Windows**: Generate from source
   - **macOS Safari**: Use `favicon.svg` (existing)
4. Download package
5. Extract files to `public/`:
   - `favicon.ico` (16×16, 32×32, 48×48 embedded)
   - `favicon-16x16.png`
   - `favicon-32x32.png`
   - `android-chrome-192x192.png`
   - `android-chrome-512x512.png`

### Step 3: Update HTML Metadata
Edit `src/app/layout.tsx`:
```typescript
export const metadata: Metadata = {
  title: `${env.NEXT_PUBLIC_NEIGHBORHOOD_NAME} Halloween ${env.NEXT_PUBLIC_EVENT_YEAR}`,
  description: `Interactive Halloween trick-or-treating map for ${env.NEXT_PUBLIC_NEIGHBORHOOD_NAME}. Find participating houses, candy availability, and walking directions.`,
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'android-chrome', url: '/android-chrome-192x192.png', sizes: '192x192' },
      { rel: 'android-chrome', url: '/android-chrome-512x512.png', sizes: '512x512' },
    ],
  },
  openGraph: {
    title: `${env.NEXT_PUBLIC_NEIGHBORHOOD_NAME} Halloween ${env.NEXT_PUBLIC_EVENT_YEAR}`,
    description: `Interactive Halloween trick-or-treating map for ${env.NEXT_PUBLIC_NEIGHBORHOOD_NAME}. Find participating houses, candy availability, and walking directions.`,
    images: ['/preview.jpg'],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${env.NEXT_PUBLIC_NEIGHBORHOOD_NAME} Halloween ${env.NEXT_PUBLIC_EVENT_YEAR}`,
    description: `Interactive Halloween trick-or-treating map for ${env.NEXT_PUBLIC_NEIGHBORHOOD_NAME}`,
    images: ['/preview.jpg'],
  },
};
```

---

## **Best Practices for AI Image Generation**

### **Flux AI Specific Tips**
1. **No prompt weights** - Use phrases like "with emphasis on" or "with focus on"
2. **Natural language** - Write conversationally, not keyword-stuffed
3. **Technical details** - Specify camera, lighting, shot type explicitly
4. **Layered structure** - Subject → Setting → Mood → Style → Technical
5. **Balance specificity** - Enough detail to guide, but allow creative freedom

### **Leonardo AI Specific Tips**
1. **Comma separation** - Separate distinct concepts with commas
2. **40-50 words max** - Longer prompts need stronger details repeated
3. **Subject first** - Start with main focus of the image
4. **Negative prompts** - Essential for avoiding unwanted elements
5. **Style references** - Use "in the style of [artist/movie/game]" if desired

### **Universal Best Practices**
1. **Lighting is crucial** - Always specify lighting (twilight, warm glow, dramatic, etc.)
2. **Avoid vagueness** - "Halloween atmosphere" → "orange and purple lighting with carved pumpkins"
3. **Technical terms** - "Cinematic depth of field," "aerial drone shot," "soft mist"
4. **Consistent style** - All images should feel cohesive (same color palette, mood)
5. **Test and iterate** - Generate 3-4 variations, pick best, refine prompt

---

## **Color Palette Reference**

Use these colors in prompts for consistency with app theme:

**Primary Colors**:
- Orange: `#f59e0b` (warm pumpkin orange)
- Amber: `#fbbf24` (glowing accent)
- Dark Orange: `#ea580c` (shadows, depth)

**Secondary Colors**:
- Indigo: `#6366f1` (buttons, links)
- Pink: `#ec4899` (accents, highlights)
- Purple: `#7c3aed` (alternative accent)

**Functional Colors**:
- Success/Start: `#10b981` (green)
- Warning: `#f59e0b` (amber)
- Error/No Candy: `#ef4444` (red)

**Theme Colors**:
- Background: `#0f0f0f` (near-black)
- Surface: `#1a1a1a` (dark gray cards)
- Text Light: `#f3f4f6` (primary text)
- Text Dim: `#9ca3af` (secondary text)

**Prompt Color Descriptions**:
- "Warm orange glow" = #f59e0b
- "Dark near-black background" = #0f0f0f
- "Purple mystical atmosphere" = #7c3aed
- "Bright green welcoming" = #10b981
- "Pink magical accents" = #ec4899

---

## **File Organization**

```
public/
├── logo.svg                      ✅ Created (SVG version)
├── logo-hd.png                   ⏳ Generate with AI (prompt #2)
├── favicon.svg                   ✅ Created (SVG version)
├── favicon-source.png            ⏳ Generate with AI (prompt #3)
├── favicon.ico                   ⏳ Generate from favicon-source.png
├── favicon-16x16.png             ⏳ Generate from favicon-source.png
├── favicon-32x32.png             ⏳ Generate from favicon-source.png
├── apple-touch-icon.svg          ✅ Created (SVG version)
├── apple-touch-icon.png          ⏳ Generate with AI (prompt #4)
├── android-chrome-192x192.png    ⏳ Generate from favicon-source.png
├── android-chrome-512x512.png    ⏳ Generate from favicon-source.png
├── preview.jpg                   ⏳ Generate with AI (prompt #1) HIGH PRIORITY
├── bg-pattern.png                ⏳ Optional enhancement (prompt #6)
├── empty-state.png               ⏳ Optional enhancement (prompt #7)
└── icons/
    ├── location.svg              ✅ Created (SVG version)
    ├── location-no-candy.svg     ✅ Created (SVG version)
    ├── location-start.svg        ✅ Created (SVG version)
    ├── location-activity.svg     ✅ Created (SVG version)
    ├── parking.svg               ✅ Created (SVG version)
    ├── refreshments.svg          ✅ Created (SVG version)
    ├── car.svg                   ✅ Created (SVG version)
    ├── marker-shadow.svg         ✅ Created (SVG version)
    ├── location-hd.png           ⏳ Optional upgrade (prompt #5)
    ├── parking-hd.png            ⏳ Optional upgrade (prompt #5)
    └── refreshments-hd.png       ⏳ Optional upgrade (prompt #5)
```

**Legend**:
- ✅ Already created (SVG versions ready to use)
- ⏳ Generate with AI when you have time
- HIGH PRIORITY = Most important for production

---

## **Quick Start Checklist**

### **Immediate Use (Already Created)**
- [x] SVG map markers (7 icons)
- [x] SVG logo
- [x] SVG favicon
- [x] SVG apple touch icon
- [x] Marker shadow

### **High Priority (Generate Soon)**
1. [ ] Social preview image (`preview.jpg`) - **MOST IMPORTANT**
2. [ ] Favicon source (`favicon-source.png`)
3. [ ] Apple touch icon PNG (`apple-touch-icon.png`)
4. [ ] Convert favicon source to multi-size ICO

### **Medium Priority (Optional Upgrades)**
5. [ ] High-detail logo (`logo-hd.png`)
6. [ ] Photorealistic map markers (if SVGs aren't detailed enough)

### **Low Priority (Nice to Have)**
7. [ ] Background pattern
8. [ ] Empty state illustrations

---

## **Testing Generated Images**

After generating images, test them:

1. **Social Preview**:
   - Share on Facebook/Twitter - preview should appear
   - Use https://www.opengraph.xyz/ to validate
   - Check 1200×630px dimensions

2. **Favicons**:
   - Test in Chrome, Firefox, Safari
   - Check browser tab icon
   - Test iOS home screen icon (add to home screen)
   - Verify 16×16px is readable

3. **Map Markers**:
   - View on actual map at various zoom levels
   - Check contrast against light map tiles
   - Ensure readable on mobile screens

4. **Performance**:
   - Optimize images with https://tinypng.com/ or https://squoosh.app/
   - Target <100KB for preview.jpg
   - Target <50KB for each PNG icon

---

## **Support & Resources**

- **Flux AI**: https://flux-ai.io/
- **Leonardo AI**: https://leonardo.ai/
- **Favicon Generator**: https://realfavicongenerator.net/
- **OG Image Validator**: https://www.opengraph.xyz/
- **Image Optimizer**: https://squoosh.app/
- **Color Picker**: Use existing app colors from `globals.css`

---

**Last Updated**: 2025-10-06
**Status**: Ready for AI image generation
**Current Assets**: All SVG versions created and production-ready
