# SmartyGym App Icon Generation Instructions

This folder contains the required app icons for iOS App Store and Google Play Store submission.

## Quick Method (Recommended)

1. **Go to [AppIcon.co](https://appicon.co)**
2. **Upload** `public/smarty-gym-logo.png` (or create a 1024×1024 version first)
3. **Select platforms:** iOS + Android
4. **Click "Generate"**
5. **Download** and extract the generated icons into this folder structure

## Required Icons

### iOS App Store
- **icon-1024.png** (1024×1024) - **REQUIRED for App Store submission**

### Android Play Store  
- **icon-512.png** (512×512) - **REQUIRED for Play Store submission**

### Android In-App Icons (mipmap folders)
Place these in the corresponding `mipmap-*` folders:
- **mipmap-mdpi:** ic_launcher.png (48×48)
- **mipmap-hdpi:** ic_launcher.png (72×72)
- **mipmap-xhdpi:** ic_launcher.png (96×96)
- **mipmap-xxhdpi:** ic_launcher.png (144×144)
- **mipmap-xxxhdpi:** ic_launcher.png (192×192)

## Icon Design Requirements

### Technical Specifications
- **Format:** PNG (24-bit with alpha channel)
- **Background:** Solid color (NO transparency for store icons)
- **Corners:** Square corners (platform applies rounding automatically)
- **File size:** Under 1MB per icon
- **Color space:** sRGB

### Design Best Practices
- Use the **SmartyGym logo** prominently
- Ensure good contrast and visibility at small sizes
- Avoid text or fine details (they don't scale well)
- Test visibility on both light and dark backgrounds
- Keep 10% padding/margin around edges for safety

## Folder Structure

```
app-icons/
├── README.md (this file)
├── ios/
│   └── icon-1024.png (1024×1024)
└── android/
    ├── icon-512.png (512×512)
    ├── mipmap-mdpi/
    │   └── ic_launcher.png (48×48)
    ├── mipmap-hdpi/
    │   └── ic_launcher.png (72×72)
    ├── mipmap-xhdpi/
    │   └── ic_launcher.png (96×96)
    ├── mipmap-xxhdpi/
    │   └── ic_launcher.png (144×144)
    └── mipmap-xxxhdpi/
        └── ic_launcher.png (192×192)
```

## Using with AppMySite

If you're using **AppMySite** to publish your app:
1. Generate all icons using AppIcon.co
2. Upload the **1024×1024** icon to AppMySite's iOS settings
3. Upload the **512×512** icon to AppMySite's Android settings
4. AppMySite will handle the rest of the icon generation automatically

## Manual Creation (Alternative)

If you prefer to create icons manually using design software (Figma, Photoshop, etc.):
1. Start with a 1024×1024 canvas
2. Place the SmartyGym logo centered with appropriate padding
3. Export at required sizes listed above
4. Ensure proper resolution (72 PPI minimum)

## Verification Checklist

Before submission, verify:
- [ ] All icons are PNG format
- [ ] No transparency in store submission icons (1024×1024, 512×512)
- [ ] All files are under 1MB
- [ ] Icons are square (same width and height)
- [ ] Logo is clearly visible at all sizes
- [ ] Tested on both light and dark backgrounds

## Resources

- **AppIcon Generator:** https://appicon.co
- **Apple Design Guidelines:** https://developer.apple.com/design/human-interface-guidelines/app-icons
- **Google Design Guidelines:** https://developer.android.com/distribute/google-play/resources/icon-design-specifications

---

**Need help?** Contact the development team or refer to the main project documentation.
