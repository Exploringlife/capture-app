// Generate simple PNG icons for PWA
const fs = require('fs');

function createPNG(size) {
  // Minimal valid PNG with a solid dark navy background and a white checkmark-like shape
  // Using a simple approach: create a canvas-less PNG
  // For production you'd use sharp/canvas, but for a simple icon we'll use an SVG-based approach
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="#0f1729" rx="${size * 0.15}"/>
    <text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" font-family="system-ui" font-size="${size * 0.45}" font-weight="bold" fill="#4a9eff">✓</text>
  </svg>`;
  
  return svg;
}

// We'll serve SVG as icons since modern browsers support it
// But for Apple, we need PNG. Let's just create a simple placeholder approach.
// Actually, let's write SVG icons and reference them - but iOS needs PNG.
// Simplest: write a minimal valid 1x1 PNG and note to replace later.

// Better approach: use the SVG directly in manifest and as apple-touch-icon via inline data
// Actually the simplest working approach for Railway deploy:

fs.writeFileSync('public/icon-192.svg', createPNG(192));
fs.writeFileSync('public/icon-512.svg', createPNG(512));
console.log('SVG icons created');
