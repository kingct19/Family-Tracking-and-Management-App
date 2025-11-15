# Logo Setup Guide

## Overview
The HaloHub logo (`halohub.png`) has been integrated throughout the application. This guide explains where it's used and how to optimize it for PWA.

## Current Logo Usage

### 1. **PWA Manifest** (`public/manifest.json`)
- Used as the app icon for install prompts
- Referenced in shortcuts
- Currently uses `halohub.png` for all sizes

### 2. **HTML Head** (`index.html`)
- Favicon: `/halohub.png`
- Apple Touch Icon: `/halohub.png`

### 3. **UI Components**
- **TopBar**: Logo next to hamburger menu (clickable, links to `/map`)
- **Sidebar**: Logo in header section
- **LoginPage**: Logo in branding section
- **RegisterPage**: Logo in branding section (desktop and mobile)
- **HomePage**: Logo in hero section and footer

## Recommended Icon Sizes

For optimal PWA support, create these sizes from `halohub.png`:

- **16x16** - Favicon (small)
- **32x32** - Favicon (medium)
- **192x192** - Android home screen, PWA icon
- **512x512** - Android splash screen, PWA install prompt
- **1024x1024** - iOS app icon (if needed)

## Generating Icon Sizes

### Option 1: Online Tools
1. Use [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
2. Upload `halohub.png`
3. Download generated sizes
4. Place in `public/` folder

### Option 2: ImageMagick (CLI)
```bash
# Install ImageMagick (if not installed)
# macOS: brew install imagemagick
# Linux: sudo apt-get install imagemagick

# Generate sizes
convert public/halohub.png -resize 192x192 public/logo192.png
convert public/halohub.png -resize 512x512 public/logo512.png
convert public/halohub.png -resize 32x32 public/favicon-32x32.png
convert public/halohub.png -resize 16x16 public/favicon-16x16.png
```

### Option 3: Manual (Design Tools)
1. Open `halohub.png` in Photoshop/Figma/Sketch
2. Export at each required size
3. Ensure square aspect ratio (crop if needed)
4. Save to `public/` folder

## Updating Manifest with Specific Sizes

Once you have the proper sizes, update `public/manifest.json`:

```json
{
  "icons": [
    {
      "src": "favicon-16x16.png",
      "sizes": "16x16",
      "type": "image/png"
    },
    {
      "src": "favicon-32x32.png",
      "sizes": "32x32",
      "type": "image/png"
    },
    {
      "src": "logo192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "logo512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

## Testing PWA Icons

1. **Chrome DevTools**:
   - Open DevTools → Application → Manifest
   - Check icon previews
   - Test install prompt

2. **Lighthouse**:
   - Run PWA audit
   - Verify icon sizes are correct

3. **Mobile Testing**:
   - Install PWA on Android/iOS
   - Verify home screen icon appears correctly
   - Check splash screen on launch

## Current Status

✅ Logo integrated in all UI components
✅ Manifest updated with HaloHub branding
✅ Theme color updated to match logo (#6750A4)
⚠️ Using single `halohub.png` for all sizes (works but not optimal)
📝 Generate specific sizes for better PWA support

## Notes

- The logo should be square (1:1 aspect ratio) for best results
- Ensure logo has transparent background or matches app theme
- Test on various devices to ensure visibility
- Consider creating a "maskable" version for Android adaptive icons

