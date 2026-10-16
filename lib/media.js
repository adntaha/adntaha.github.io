// Reads the pixel size of images and videos straight from their headers, so
// every <img> and <video> can carry width/height and the page never jumps
// around while media loads. Covers the formats this site actually uses.

import fs from 'node:fs';

function pngSize(buf) {
  // The IHDR chunk always comes first: width and height are at bytes 16–23.
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function jpegSize(buf) {
  // Walk the segments until a Start Of Frame marker, which holds the size.
  let i = 2;
  while (i < buf.length) {
    const marker = buf[i + 1];
    const length = buf.readUInt16BE(i + 2);
    const isStartOfFrame = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
    if (isStartOfFrame) return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
    i += 2 + length;
  }
  return null;
}

function mp4Size(buf) {
  // Each track header ("tkhd" box) ends with width and height as 16.16 fixed-point
  // numbers. Audio tracks report 0×0, so take the first track with a real size.
  for (let at = buf.indexOf('tkhd'); at !== -1; at = buf.indexOf('tkhd', at + 4)) {
    const boxEnd = at - 4 + buf.readUInt32BE(at - 4);
    const width = buf.readUInt32BE(boxEnd - 8) >> 16;
    const height = buf.readUInt32BE(boxEnd - 4) >> 16;
    if (width && height) return { width, height };
  }
  return null;
}

const readers = { png: pngSize, jpg: jpegSize, jpeg: jpegSize, mp4: mp4Size };
const cache = new Map();

export function mediaSize(file) {
  if (cache.has(file)) return cache.get(file);
  const read = readers[file.split('.').pop().toLowerCase()];
  const size = read && fs.existsSync(file) ? read(fs.readFileSync(file)) : null;
  cache.set(file, size);
  return size;
}
