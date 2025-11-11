let img;
let sorted;
let index = 0;
let group = 1;  // manipulate this number to change the chunk size of sorted array (smaller the number the slower the speed, but final product will be more filled)

// collapse effect globals
let originalPixels; // backup of og img's pixel
let step = 1; // pixel distance

function preload() {
  img = loadImage("image1.jpg");
}

function setup() {
  let scaling = 0.1;
  img.resize(img.width * scaling, img.height * scaling);

  createCanvas(img.width, img.height * 2);
  pixelDensity(1);

    // saving, backup pixel for collapse effect
  sorted = img.get();
  sorted.loadPixels();

  img.loadPixels();
  originalPixels = [...img.pixels];
}

function draw() {
  
  let topCopy = sorted.get(0, 0, sorted.width, sorted.height);
    // add collapse effect to top
  collapseTowardsMouse(sorted, mouseX, mouseY);
   // draw original image top part
  image(topCopy, 0, 0);
  
  
    // pixel sorting part
  sorted.loadPixels();

  for (let n = 0; n < 500; n += 50) {
    let recording = -1;
    let selectedPixel = index;

    for (let j = index; j < sorted.pixels.length; j += 4 * group) {
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
    let temp = [];
    temp[0] = sorted.pixels[index];
    temp[1] = sorted.pixels[index + 1];
    temp[2] = sorted.pixels[index + 2];
    temp[3] = sorted.pixels[index + 3];
    sorted.pixels[index] = sorted.pixels[selectedPixel];
    sorted.pixels[index + 1] = sorted.pixels[selectedPixel + 1];
    sorted.pixels[index + 2] = sorted.pixels[selectedPixel + 2];
    sorted.pixels[index + 3] = sorted.pixels[selectedPixel + 3];
    sorted.pixels[selectedPixel] = temp[0];
    sorted.pixels[selectedPixel + 1] = temp[1];
    sorted.pixels[selectedPixel + 2] = temp[2];
    sorted.pixels[selectedPixel + 3] = temp[3];

    if (index < sorted.pixels.length - 1) {
      index += 4*group;
    }
  }

  sorted.updatePixels();
  // background(220);

  // // draw original image top part
  // image(sorted, 0, 0);

  // make bottom copy
  // let bottomCopy = sorted.get(0, 0, sorted.width, sorted.height);
  // // bottomCopy.loadPixels();

  // sorted.loadPixels();

  
  // draw flipped bottom image
  push();
  translate(0, height);
  scale(1, -1);
  image(sorted, 0, 0);
  pop();
}



// collapse effect function with mouse position
function collapseTowardsMouse(imgObj, centerX, centerY) {
  imgObj.loadPixels();


  // scanning every pixel 
  // adjust the speed with step - bigger = faster, rougher
  // smaller = opposite of bigger
  for (let y = 0; y < imgObj.height; y += step) {
    for (let x = 0; x < imgObj.width; x += step) {
      let pixelIndex = (x + y * imgObj.width) * 4;

      let r = imgObj.pixels[pixelIndex];
      let g = imgObj.pixels[pixelIndex + 1];
      let b = imgObj.pixels[pixelIndex + 2];

      
   // how far is it from mouse,
   // and which way to move
      let pixelBrightness = brightness(color(r, g, b));
      let distanceFromMouse = dist(x, y, centerX, centerY);
      let angleToMouse = atan2(y - centerY, x - centerX);

      // close = move more
      // far = move less - depending on distance
      let distanceEffect = map(distanceFromMouse, 0, 400, 80, 0);
      distanceEffect = max(distanceEffect, 0);

      
      // brightness higher = move more
      // not making them(distorted pixels) go all the way same
      let brightnessEffect = map(pixelBrightness, 0, 255, 0.8, 2.5);
      let randomWarp = noise(x * 0.02, y * 0.02) * 2 - 1;

      
      // calculating movement
      let moveX = cos(angleToMouse) * distanceEffect * brightnessEffect + randomWarp * 20;
      let moveY = sin(angleToMouse) * distanceEffect * brightnessEffect + randomWarp * 20;

      
      // gravity-like effect(collapsing down)
      let gravityStrength = map(distanceFromMouse, 0, 250, 2.0, 0);
      gravityStrength = max(gravityStrength, 0);
      let gravityPull = pow(gravityStrength, 2) * 35;
      moveY += gravityPull;

      
      // effect not to escape image
      let newX = constrain(x + moveX, 0, imgObj.width - 1);
      let newY = constrain(y + moveY, 0, imgObj.height - 1);

      
      // cover the og pixel to currently move spot to
      // seems like dragging 
      let newPixelIndex = (int(newX) + int(newY) * imgObj.width) * 4;

      imgObj.pixels[pixelIndex] = originalPixels[newPixelIndex];
      imgObj.pixels[pixelIndex + 1] = originalPixels[newPixelIndex + 1];
      imgObj.pixels[pixelIndex + 2] = originalPixels[newPixelIndex + 2];
    }
  }

  imgObj.updatePixels();
}
