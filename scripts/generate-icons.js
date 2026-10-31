// Generate valid PNG icons for 16x16, 48x48, 128x128
// Precision geometric link cut emblem (anti-AI aesthetic)
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPng(width, height) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8-bit depth
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4);
    data.copy(buf, 8);
    const crc = crc32(Buffer.concat([Buffer.from(type), data]));
    buf.writeUInt32BE(crc, 8 + len);
    return buf;
  }

  const rawData = Buffer.alloc((width * 4 + 1) * height);
  let pos = 0;

  for (let y = 0; y < height; y++) {
    rawData[pos++] = 0; // Filter
    for (let x = 0; x < width; x++) {
      const nx = x / width;
      const ny = y / height;

      // Rounded tile container
      const cornerR = 0.22;
      const dx = Math.max(0, Math.abs(nx - 0.5) - (0.5 - cornerR));
      const dy = Math.max(0, Math.abs(ny - 0.5) - (0.5 - cornerR));
      const isInsideTile = Math.sqrt(dx * dx + dy * dy) <= cornerR;

      if (!isInsideTile) {
        rawData[pos++] = 0;
        rawData[pos++] = 0;
        rawData[pos++] = 0;
        rawData[pos++] = 0;
        continue;
      }

      // Slate base background: #0f172a
      let r = 15;
      let g = 23;
      let b = 42;
      let a = 255;

      // Border outline
      const isBorder = (nx <= 0.04 || nx >= 0.96 || ny <= 0.04 || ny >= 0.96);
      if (isBorder) {
        r = 51; g = 65; b = 85;
      }

      // Render chain link geometry
      // Left loop: center around (0.35, 0.5)
      const dLeft = Math.sqrt((nx - 0.35) ** 2 + (ny - 0.5) ** 2);
      // Right loop: center around (0.65, 0.5)
      const dRight = Math.sqrt((nx - 0.65) ** 2 + (ny - 0.5) ** 2);
      // Center connecting horizontal bar: ny between 0.44 and 0.56, nx between 0.35 and 0.65
      const inBridge = (ny >= 0.44 && ny <= 0.56 && nx >= 0.32 && nx <= 0.68);

      const inLeftLoop = (dLeft >= 0.12 && dLeft <= 0.24 && nx <= 0.48);
      const inRightLoop = (dRight >= 0.12 && dRight <= 0.24 && nx >= 0.52);

      if (inLeftLoop || (inBridge && nx <= 0.52)) {
        // Crisp white for left anchor
        r = 255; g = 255; b = 255;
      } else if (inRightLoop || (inBridge && nx > 0.52)) {
        // Electric sky cyan #38bdf8 for right anchor
        r = 56; g = 189; b = 248;
      }

      // Notch indicator dot around (0.65, 0.3)
      const dDot = Math.sqrt((nx - 0.65) ** 2 + (ny - 0.3) ** 2);
      if (dDot <= 0.06) {
        r = 56; g = 189; b = 248;
      }

      rawData[pos++] = r;
      rawData[pos++] = g;
      rawData[pos++] = b;
      rawData[pos++] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[i] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const dirs = ['extension/icons', 'public/extension/icons'];
dirs.forEach(d => {
  const fullPath = path.resolve(d);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
  [16, 48, 128].forEach(size => {
    const pngBuf = createPng(size, size);
    fs.writeFileSync(path.join(fullPath, `icon${size}.png`), pngBuf);
  });
});

console.log('Successfully regenerated authentic precision icons.');
