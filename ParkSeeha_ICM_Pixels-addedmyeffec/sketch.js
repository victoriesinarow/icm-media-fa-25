// ---------- pixel sorting base ----------
let img;
let sorted;
let index = 0;
let group = 1; // smaller number = more detailed sort, slower

// ---------- collapse effect globals ----------
let originalPixels; // backup of original pixels
let step = 1; // pixel skip distance

function preload() {
  img = loadImage("image1.jpg");
}

function setup() {
  let scaling = 0.1;
  img.resize(img.width * scaling, img.height * scaling);

  createCanvas(img.width, img.height * 2);
  pixelDensity(1);

  sorted = img.get();
  sorted.loadPixels();

  // ---------- run pixel sorting ONCE ----------
  pixelSort(sorted);

  // store pixels for bottom collapse
  img.loadPixels();
  originalPixels = [...img.pixels];
}

function draw() {
  background(220);

  // ---------- draw top (sorted image) ----------
  image(sorted, 0, 0);

  // ---------- make a copy for bottom ----------
  let bottomCopy = sorted.get(0, 0, sorted.width, sorted.height);

  // ---------- apply collapse distortion ----------
  collapseTowardsMouse(bottomCopy, mouseX, mouseY);

  // ---------- draw flipped bottom ----------
  push();
  translate(0, height);
  scale(1, -1);
  image(bottomCopy, 0, 0);
  pop();
}

// ---------- pixel sorting function ----------
function pixelSort(sorted) {
  sorted.loadPixels();

  for (let i = 0; i < sorted.pixels.length; i += 4 * group) {
    let recording = -1;
    let selectedPixel = i;

    for (let j = i; j < sorted.pixels.length; j += 4 * group) {
      let pix = color(
        sorted.pixels[j],
        sorted.pixels[j + 1],
        sorted.pixels[j + 2],
        sorted.pixels[j + 3]
      );
      let b = hue(pix);
      if (b > recording) {
        selectedPixel = j;
        recording = b;
      }
    }

    // swap pixels
    for (let k = 0; k < 4; k++) {
      let temp = sorted.pixels[i + k];
      sorted.pixels[i + k] = sorted.pixels[selectedPixel + k];
      sorted.pixels[selectedPixel + k] = temp;
    }
  }

  sorted.updatePixels();
}

// ---------- collapse effect function ----------
function collapseTowardsMouse(imgObj, centerX, centerY) {
  imgObj.loadPixels();
  centerY = imgObj.height - (centerY % imgObj.height);

  for (let y = 0; y < imgObj.height; y += step) {
    for (let x = 0; x < imgObj.width; x += step) {
      let pixelIndex = (x + y * imgObj.width) * 4;

      let r = imgObj.pixels[pixelIndex];
      let g = imgObj.pixels[pixelIndex + 1];
      let b = imgObj.pixels[pixelIndex + 2];

      let pixelBrightness = brightness(color(r, g, b));
      let distanceFromMouse = dist(x, y, centerX, centerY);
      let angleToMouse = atan2(y - centerY, x - centerX);

      let distanceEffect = map(distanceFromMouse, 0, 400, 80, 0);
      distanceEffect = max(distanceEffect, 0);

      let brightnessEffect = map(pixelBrightness, 0, 255, 0.8, 2.5);
      let randomWarp = noise(x * 0.02, y * 0.02) * 2 - 1;

      let moveX =
        cos(angleToMouse) * distanceEffect * brightnessEffect + randomWarp * 20;
      let moveY =
        sin(angleToMouse) * distanceEffect * brightnessEffect + randomWarp * 20;

      let gravityStrength = map(distanceFromMouse, 0, 250, 2.0, 0);
      gravityStrength = max(gravityStrength, 0);
      let gravityPull = pow(gravityStrength, 2) * 35;
      moveY += gravityPull;

      let newX = constrain(x + moveX, 0, imgObj.width - 1);
      let newY = constrain(y + moveY, 0, imgObj.height - 1);

      let newPixelIndex = (int(newX) + int(newY) * imgObj.width) * 4;

      imgObj.pixels[pixelIndex] = originalPixels[newPixelIndex];
      imgObj.pixels[pixelIndex + 1] = originalPixels[newPixelIndex + 1];
      imgObj.pixels[pixelIndex + 2] = originalPixels[newPixelIndex + 2];
    }
  }

  imgObj.updatePixels();
}
