/**
 * PWA Icon Generator
 * Generates PWA icons from SVG source using sharp
 * 
 * Install: pnpm add -D sharp
 * Run: node generate-pwa-icons.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgPath = path.join(__dirname, 'public', 'aivo-icon.svg');
const outputDir = path.join(__dirname, 'public');

const sizes = [
  { name: 'icon-192.png', size: 192, purpose: 'any' },
  { name: 'icon-512.png', size: 512, purpose: 'any' },
  { name: 'icon-maskable-192.png', size: 192, purpose: 'maskable' },
  { name: 'icon-maskable-512.png', size: 512, purpose: 'maskable' },
];

async function generateIcons() {
  console.log('📸 Generating PWA icons from SVG...\n');

  // Read SVG
  const svgBuffer = fs.readFileSync(svgPath);

  for (const { name, size, purpose } of sizes) {
    const outputPath = path.join(outputDir, name);

    try {
      if (purpose === 'maskable') {
        // For maskable icons, add 20% padding (safe zone)
        const padding = Math.floor(size * 0.2);
        const innerSize = size - padding * 2;

        await sharp(svgBuffer)
          .resize(innerSize, innerSize)
          .extend({
            top: padding,
            bottom: padding,
            left: padding,
            right: padding,
            background: { r: 102, g: 126, b: 234, alpha: 1 }, // #667eea
          })
          .png()
          .toFile(outputPath);
      } else {
        // Standard icons without padding
        await sharp(svgBuffer)
          .resize(size, size)
          .png()
          .toFile(outputPath);
      }

      console.log(`✅ Generated: ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Failed to generate ${name}:`, error.message);
    }
  }

  console.log('\n🎉 All icons generated successfully!');
  console.log('\n📁 Icons saved to:', outputDir);
  console.log('\n📋 Next steps:');
  console.log('1. ✅ Icons are ready for PWA');
  console.log('2. Build the app: pnpm build');
  console.log('3. Test PWA: pnpm preview');
  console.log('4. Open DevTools → Application → Manifest');
}

// Run generator
generateIcons().catch(console.error);
