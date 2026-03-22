# Centralized Typography System Documentation

This document outlines the architecture and usage of the new typography system for the HODAL portfolio.

## 🏗️ Typography Architecture

The typography system is built on a **Single Source of Truth** using Tailwind CSS configuration and a global CSS base layer. This ensures that every component inherits the correct fonts and sizes automatically.

### 🍱 Font Combination
- **Display/Headings**: [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) (Weights: 500, 600, 700)
- **Sans/Body**: [Inter](https://fonts.google.com/specimen/Inter) (Weights: 400, 500, 600, 700, 800)

### 📏 Scale Tokens
We use a consistent naming convention for font sizes to maintain a professional hierarchy:

| Token | Size (px) | Usage |
| :--- | :--- | :--- |
| `text-hero` | 56px | Hero Titles & Main Branding |
| `text-heading` | 40px | Primary Page Headings |
| `text-section` | 32px | Section Titles |
| `text-subheading` | 24px | Feature & Card Headings |
| `text-large` | 20px | Intro Text & Lead Paragraphs |
| `text-body` | 16px | Standard UI & Content |
| `text-small` | 14px | Metadata & Secondary Info |
| `text-caption` | 12px | Labels & Status Badges |

---

## ⚙️ How to Modify Topography

### 1. Changing Fonts Globally
To change the font family for the entire application, edit `tailwind.config.js`:
```javascript
fontFamily: {
  display: ['Your New Heading Font', 'sans-serif'],
  sans: ['Your New Body Font', 'sans-serif'],
}
```

### 2. Adjusting the Scale
To adjust font sizes globally, modify the `fontSize` section in `tailwind.config.js`. rem values are used to ensure accessibility and responsive scaling.

---

## 🎨 Best Practices for Developers

### ✅ Do's
1. **Inherit by Default**: Most elements (Paragraphs, Links, Divs) automatically use the `Inter` body font and `text-body` size.
2. **Use Systematic Classes**: For new components, use the semantic classes:
   - `font-display` for headings.
   - `text-subheading`, `text-body`, etc., for sizing.
3. **Responsive Consistency**: Use the mobile-first tokens. If a size needs to change on larger screens, use Tailwind's responsive prefixes (e.g., `text-body md:text-large`).

### ❌ Don'ts
1. **Avoid Hardcoded px Sizes**: Never use `text-[17px]`. Stick to the tokens.
2. **Don't Override font-family**: Individual components should not define `font-family` locally.

---

## 🚀 Performance & Optimization
- **Pre-connecting**: Fonts are pre-connected to `fonts.gstatic.com` in `index.html`.
- **Swap Strategy**: `font-display: swap` is used to prevent layout shifts.
- **Unified Weights**: We only load necessary weights (400-800) to keep bundle size minimal.
