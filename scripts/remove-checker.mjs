// Strips the baked-in transparency checkerboard (white + ~204 grey squares)
// from landingpage.jpg via edge-connected flood fill, then autocrops.
// Output: src/assets/landing-car.png (real transparency).
// Usage: node scripts/remove-checker.mjs
import Jimp from "jimp";

const img = await Jimp.read("src/assets/landingpage.jpg");
const { width: W, height: H, data } = img.bitmap;
const at = (x, y) => (y * W + x) * 4;

const isChecker = (x, y) => {
  const i = at(x, y);
  const r = data[i], g = data[i + 1], b = data[i + 2];
  const neutral = Math.abs(r - g) < 8 && Math.abs(g - b) < 8;
  const white = r >= 247 && g >= 247 && b >= 247;
  const grey = neutral && r >= 194 && r <= 216;
  return white || grey;
};

const visited = new Uint8Array(W * H);
const queue = [];
for (let x = 0; x < W; x++) {
  for (const y of [0, H - 1]) {
    if (isChecker(x, y) && !visited[y * W + x]) {
      visited[y * W + x] = 1;
      queue.push(x, y);
    }
  }
}
for (let y = 0; y < H; y++) {
  for (const x of [0, W - 1]) {
    if (isChecker(x, y) && !visited[y * W + x]) {
      visited[y * W + x] = 1;
      queue.push(x, y);
    }
  }
}

while (queue.length) {
  const y = queue.pop();
  const x = queue.pop();
  data[at(x, y) + 3] = 0; // transparent
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
    const k = ny * W + nx;
    if (!visited[k] && isChecker(nx, ny)) {
      visited[k] = 1;
      queue.push(nx, ny);
    }
  }
}

// soften the cut edge: pixels touching transparency get partial alpha
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = at(x, y);
    if (data[i + 3] === 0) continue;
    let nearClear = false;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      if (visited[ny * W + nx]) nearClear = true;
    }
    if (nearClear) data[i + 3] = 140;
  }
}

// wipe the stock-photo watermark in the bottom-right corner
for (let y = 480; y < H; y++) {
  for (let x = 590; x < W; x++) {
    data[at(x, y) + 3] = 0;
  }
}

img.autocrop({ tolerance: 0.01, cropOnlyFrames: false });
await img.writeAsync("src/assets/landing-car.png");
console.log("written src/assets/landing-car.png", img.bitmap.width, "x", img.bitmap.height);
