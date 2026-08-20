/** Minimal GIF89a encoder for 16-color indexed frames. Looping. */

function lzw(index, minCode) {
  const clear = 1 << minCode;
  const eoi = clear + 1;
  let codeSize = minCode + 1;
  let next = eoi + 1;
  let dict = new Map();
  const out = [];
  let buf = 0;
  let nbits = 0;

  function emit(code) {
    buf |= code << nbits;
    nbits += codeSize;
    while (nbits >= 8) {
      out.push(buf & 255);
      buf >>= 8;
      nbits -= 8;
    }
  }

  function reset() {
    dict = new Map();
    codeSize = minCode + 1;
    next = eoi + 1;
  }

  emit(clear);
  let w = String.fromCharCode(index[0]);
  for (let i = 1; i < index.length; i++) {
    const c = String.fromCharCode(index[i]);
    const wc = w + c;
    if (dict.has(wc)) {
      w = wc;
    } else {
      emit(w.length === 1 ? w.charCodeAt(0) : dict.get(w));
      if (next < 4096) {
        dict.set(wc, next++);
        if (next === 1 << codeSize && codeSize < 12) codeSize++;
      } else {
        emit(clear);
        reset();
      }
      w = c;
    }
  }
  emit(w.length === 1 ? w.charCodeAt(0) : dict.get(w));
  emit(eoi);
  if (nbits) out.push(buf & 255);
  return Uint8Array.from(out);
}

function blocks(data) {
  const out = [];
  for (let i = 0; i < data.length; i += 255) {
    const slice = data.subarray(i, Math.min(i + 255, data.length));
    out.push(slice.length);
    for (let j = 0; j < slice.length; j++) out.push(slice[j]);
  }
  out.push(0);
  return out;
}

export function encodeGif(frames, width, height, palette, delayCs) {
  const gctSize = 4; // 2^4 = 16 colors
  const bytes = [];
  const u8 = (n) => bytes.push(n & 255);
  const u16 = (n) => {
    bytes.push(n & 255, (n >> 8) & 255);
  };
  const str = (s) => {
    for (let i = 0; i < s.length; i++) bytes.push(s.charCodeAt(i));
  };

  str("GIF89a");
  u16(width);
  u16(height);
  u8(0x80 | ((gctSize - 1) << 4) | (gctSize - 1));
  u8(0);
  u8(0);
  for (let i = 0; i < 16; i++) {
    const p = palette[i] || [0, 0, 0];
    u8(p[0]);
    u8(p[1]);
    u8(p[2]);
  }

  u8(0x21);
  u8(0xff);
  u8(11);
  str("NETSCAPE2.0");
  u8(3);
  u8(1);
  u16(0);
  u8(0);

  for (const frame of frames) {
    u8(0x21);
    u8(0xf9);
    u8(4);
    u8(0x04);
    u16(delayCs);
    u8(0);
    u8(0);

    u8(0x2c);
    u16(0);
    u16(0);
    u16(width);
    u16(height);
    u8(0);

    const packed = lzw(frame, 4);
    u8(4);
    for (const b of blocks(packed)) u8(b);
  }
  u8(0x3b);
  return Buffer.from(bytes);
}
