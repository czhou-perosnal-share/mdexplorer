import { readFileSync, writeFileSync } from 'fs';
import { Resvg } from '@resvg/resvg-js';
import pngToIco from 'png-to-ico';

const svg = readFileSync('assets/icon.svg', 'utf8');

function renderAt(size) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
  });
  return resvg.render().asPng();
}

const sizes = [256, 128, 64, 48, 32, 16];
const pngs = sizes.map(renderAt);

// Save the 256px PNG for macOS / Linux use
writeFileSync('assets/icon.png', pngs[0]);

// Build multi-resolution ICO for Windows
const ico = await pngToIco(pngs);
writeFileSync('assets/icon.ico', ico);

console.log('Icon generated: assets/icon.png, assets/icon.ico');
