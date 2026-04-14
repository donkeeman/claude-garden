// Minimal PNG encoder — RGBA (color type 6), 8-bit depth, filter type 0.
// Uses node:zlib for deflate. CRC32 implemented manually
// because zlib.crc32 is Node 22+.

import { deflateSync } from 'node:zlib';

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

// Build CRC32 table (polynomial 0xEDB88320)
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function ihdr(width, height) {
  const buf = Buffer.alloc(13);
  buf.writeUInt32BE(width, 0);
  buf.writeUInt32BE(height, 4);
  buf.writeUInt8(8, 8);   // bit depth
  buf.writeUInt8(6, 9);   // color type: RGBA
  buf.writeUInt8(0, 10);  // compression: deflate
  buf.writeUInt8(0, 11);  // filter: none
  buf.writeUInt8(0, 12);  // interlace: none
  return buf;
}

function idat(pixels, width, height) {
  // Add filter-type byte (0 = None) before each scanline
  const stride = width * 4; // RGBA
  const filtered = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    filtered[y * (stride + 1)] = 0; // filter type
    pixels.copy(filtered, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  return deflateSync(filtered);
}

/**
 * Encode an RGBA pixel buffer as a PNG.
 * @param {Buffer} pixels - width * height * 4 bytes (R, G, B, A per pixel)
 * @param {number} width
 * @param {number} height
 * @returns {Buffer} PNG bytes
 */
export function encodePng(pixels, width, height) {
  if (pixels.length !== width * height * 4) {
    throw new Error(`Pixel buffer size mismatch: expected ${width * height * 4}, got ${pixels.length}`);
  }
  return Buffer.concat([
    PNG_SIGNATURE,
    chunk('IHDR', ihdr(width, height)),
    chunk('IDAT', idat(pixels, width, height)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}
