import fs from 'fs';
import zlib from 'zlib';

function createPng(width, height, drawPixel) {
  // RGBA buffer: each scanline starts with filter byte 0
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter byte: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawPixel(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // Helper to build chunk
  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type);
    const body = Buffer.concat([typeBuf, data]);
    const crc = Buffer.alloc(4);
    crc.writeInt32BE(crc32(body), 0);
    return Buffer.concat([len, body, crc]);
  }

  // Basic CRC32 table
  function crc32(buf) {
    let c = -1;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let j = 0; j < 8; j++) {
        c = (c >>> 1) ^ (-(c & 1) & 0xedb88320);
      }
    }
    return c ^ -1;
  }

  // PNG Header
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = chunk('IHDR', ihdrData);

  // IDAT chunk
  const idatChunk = chunk('IDAT', deflated);

  // IEND chunk
  const iendChunk = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

// Draw nice icon: dark background #09090b, amber/gold center #f59e0b
function drawThsIcon(x, y, w, h, isMaskable = false) {
  const normX = (x / w) * 100;
  const normY = (y / h) * 100;

  // Maskable icons have full bleed background; standard icons have rounded corner rect
  let inBackground = true;
  if (!isMaskable) {
    // Check rounded rectangle (radius 22)
    const rx = 22;
    const dx = Math.max(rx - normX, 0, normX - (100 - rx));
    const dy = Math.max(rx - normY, 0, normY - (100 - rx));
    if (dx * dx + dy * dy > rx * rx) {
      inBackground = false;
    }
  }

  if (!inBackground) {
    return [0, 0, 0, 0]; // Transparent
  }

  // Border highlight
  const isBorder = !isMaskable && (
    normX < 3 || normX > 97 || normY < 3 || normY > 97
  );

  // Film perforations dots at top & bottom
  const inTopPerf = normY >= 10 && normY <= 15 && (
    (normX >= 18 && normX <= 26) ||
    (normX >= 36 && normX <= 44) ||
    (normX >= 56 && normX <= 64) ||
    (normX >= 74 && normX <= 82)
  );

  // THS block letter geometry inside safe central area
  // T: normX: 20-40, normY: 35-65
  const inT = (normY >= 36 && normY <= 42 && normX >= 18 && normX <= 38) ||
              (normX >= 25 && normX <= 31 && normY >= 42 && normY <= 65);

  // H: normX: 42-62, normY: 35-65
  const inH = (normX >= 40 && normX <= 46 && normY >= 36 && normY <= 65) ||
              (normX >= 56 && normX <= 62 && normY >= 36 && normY <= 65) ||
              (normY >= 47 && normY <= 53 && normX >= 46 && normX <= 56);

  // S: normX: 64-82, normY: 35-65
  const inS = (normY >= 36 && normY <= 42 && normX >= 65 && normX <= 82) || // top
              (normX >= 65 && normX <= 71 && normY >= 42 && normY <= 50) || // top-left
              (normY >= 47 && normY <= 53 && normX >= 65 && normX <= 82) || // middle
              (normX >= 76 && normX <= 82 && normY >= 53 && normY <= 60) || // bot-right
              (normY >= 60 && normY <= 65 && normX >= 65 && normX <= 82);   // bot

  // Dot under emblem
  const dotDx = normX - 50;
  const dotDy = normY - 78;
  const inDot = (dotDx * dotDx + dotDy * dotDy) <= 12;

  if (inT || inH || inS || inDot) {
    // Warm golden amber gradient
    const gradFactor = (normY - 35) / 35;
    const r = Math.round(251 * (1 - gradFactor) + 245 * gradFactor);
    const g = Math.round(191 * (1 - gradFactor) + 158 * gradFactor);
    const b = Math.round(36 * (1 - gradFactor) + 11 * gradFactor);
    return [r, g, b, 255];
  }

  if (inTopPerf) {
    return [245, 158, 11, 140];
  }

  if (isBorder) {
    return [39, 39, 42, 255];
  }

  // Dark background #09090b
  return [9, 9, 11, 255];
}

const sizes = [
  { file: 'public/pwa-192x192.png', size: 192, maskable: false },
  { file: 'public/pwa-512x512.png', size: 512, maskable: false },
  { file: 'public/pwa-maskable-512x512.png', size: 512, maskable: true },
  { file: 'public/apple-touch-icon.png', size: 180, maskable: false }
];

for (const { file, size, maskable } of sizes) {
  const buf = createPng(size, size, (x, y, w, h) => drawThsIcon(x, y, w, h, maskable));
  fs.writeFileSync(file, buf);
  console.log(`Generated ${file} (${size}x${size})`);
}
