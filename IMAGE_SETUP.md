# How to Add Temple Images to PujaConnect

## 📁 Image Directory Structure

Create the following folder structure in your project:

```
PujaConnect/
└── public/
    └── images/
        └── temples/
            ├── temple1.jpg
            ├── temple2.jpg
            ├── temple3.jpg
            ├── temple4.jpg
            └── temple5.jpg
```

## 🛠️ Steps to Add Your Temple Images

### Step 1: Create the Images Folder
```bash
mkdir -p public/images/temples
```

### Step 2: Add Your Temple Images
Copy your temple images to `public/images/temples/` with the following filenames:
- `temple1.jpg` - First temple image
- `temple2.jpg` - Second temple image
- `temple3.jpg` - Third temple image
- `temple4.jpg` - Fourth temple image
- `temple5.jpg` - Fifth temple image

### Step 3: Image Requirements
- **Format**: JPG, PNG, or WebP
- **Recommended Size**: 1920x1080px or higher
- **File Size**: Keep under 500KB each for fast loading
- **Quality**: High quality temple photography

### Step 4: Usage in Code
The images are automatically loaded by the ImageCarousel component at:
```
/src/components/ImageCarousel.tsx
```

The component will:
1. Try to load images from `public/images/temples/`
2. Fall back to beautiful gradients if images are missing
3. Rotate through all 5 images every 5 seconds
4. Allow manual navigation using the dots at the bottom

## 🎨 Image Suggestions

Consider including temple images of:
1. **Golden Temple** - Bright, spiritual
2. **Temple Entrance** - Welcoming, traditional
3. **Prayer Hall** - Sacred, peaceful
4. **Temple Dome** - Iconic, recognizable
5. **Temple at Sunset** - Atmospheric, beautiful

## 📝 File Naming Convention

The code looks for images in this exact order:
```javascript
'/images/temples/temple1.jpg'
'/images/temples/temple2.jpg'
'/images/temples/temple3.jpg'
'/images/temples/temple4.jpg'
'/images/temples/temple5.jpg'
```

**Important**: Keep the exact filenames, or update the array in `ImageCarousel.tsx`

## 🔧 How to Add More Images

To add more temple images (e.g., 10 instead of 5):

1. Add images: `temple6.jpg`, `temple7.jpg`, etc. to `public/images/temples/`
2. Update `src/components/ImageCarousel.tsx`:

```typescript
const images = [
  '/images/temples/temple1.jpg',
  '/images/temples/temple2.jpg',
  '/images/temples/temple3.jpg',
  '/images/temples/temple4.jpg',
  '/images/temples/temple5.jpg',
  '/images/temples/temple6.jpg',  // Add new image path
  '/images/temples/temple7.jpg',  // Add new image path
  // ... add more as needed
];
```

## ⚡ Performance Tips

1. **Optimize Images**: Use online tools like TinyPNG to compress images
2. **Use WebP Format**: Convert to WebP for smaller file sizes
3. **Lazy Load**: Images are only loaded when the login page is visited
4. **Cache**: Vite caches images for faster loading on subsequent visits

## 🔄 How the Carousel Works

- **Auto-play**: Images rotate every 5 seconds
- **Manual Control**: Click the dots at the bottom to jump to any image
- **Fade Transition**: Smooth 1-second fade between images
- **Dark Overlay**: 45% dark overlay ensures text readability
- **Fallback**: If images aren't found, colorful gradients display

## 📍 Current File Locations

```
/Users/indranilsarmacharya/Documents/PujaConnect/
├── public/              ← Add images here
│   └── images/
│       └── temples/
├── src/
│   ├── components/
│   │   └── ImageCarousel.tsx  ← Component that displays images
│   └── pages/
│       └── LoginScreen.tsx     ← Uses the carousel
```

## ✅ Verification

After adding images:
1. Run `npm run dev`
2. Navigate to the login page
3. You should see your temple images sliding in the background
4. Images should rotate every 5 seconds

## 🎯 No Images Yet?

If you haven't added images yet, the carousel will display beautiful gradient backgrounds instead. This ensures the app works perfectly even without custom images!
