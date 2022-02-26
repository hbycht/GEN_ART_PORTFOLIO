/// <reference path="../TSDef/p5.global-mode.d.ts" />

/*jshint esversion: 6 */

/* ############################################################################ 

CURLZ von Henning Brode
Kurs «Generative Gestaltung» an der TH Köln
Prof. Christian Noss
---
hello@henningbrode.de
www.henningbrode.de

############################################################################ */

let saveParams = {
  sketchName: "gg-sketch"
}


// Params for canvas
let canvasParams = {
  holder: document.getElementById('canvas'),
  state: false,
  mouseX: false,
  mouseY: false,
  mouseLock: false,
  background: 0,
  gui: true,
  mode: 'canvas', // canvas or svg … SVG mode is experimental 
};
getCanvasHolderSize();

let currentPreset = false;
let sketchGUI;

// Params for the drawing
let drawingParams = {

  preset: ["DEFAULT", "Randooom"],

  numHairs: 30,
  numHairsMin: 1,
  numHairsMax: 100,
  numHairsStep: 1,

  hairThickness: 2,
  hairThicknessMin: 0,
  hairThicknessMax: 10,
  hairThicknessStep: .1,

  hairAmplitude: 10,
  hairAmplitudeMin: -30,
  hairAmplitudeMax: 30,
  hairAmplitudeStep: 1,
  
  hairFrequency: 12,
  hairFrequencyMin: 2,
  hairFrequencyMax: 100,
  hairFrequencyStep: 1,
  
  hairLength: 14,
  hairLengthMin: 1,
  hairLengthMax: 100,
  hairLengthStep: 1,
  
  // hairRandom: 40,
  // hairRandomMin: 0,
  // hairRandomMax: 100,
  // hairRandomStep: 1,

  // boxes: false,

  radius: 12,
  radiusMin: -20,
  radiusMax: 40,
  radiusStep: 1,
  
  numRings: 12,
  numRingsMin: 1,
  numRingsMax: 40,
  numRingsStep: 1,

  angleOffset: 19,
  angleOffsetMin: -30,
  angleOffsetMax: 30,
  angleOffsetStep: 1,

  spacing: 10,
  spacingMin: 0,
  spacingMax: 100,
  spacingStep: 1,

  blendingMode: ["SCREEN", "OVERLAY", "LIGHTEST", "ADD", "DIFFERENCE"],

  hueInside: 20,
  hueInsideMin: 0,
  hueInsideMax: 359,
  hueInsideStep: 1,

  hueOutside: 190,
  hueOutsideMin: 0,
  hueOutsideMax: 359,
  hueOutsideStep: 1,
  
  // saturation: 100,
  // saturationMin: 0,
  // saturationMax: 100,
  // saturationStep: 1,
  
  // brightness: 100,
  // brightnessMin: 0,
  // brightnessMax: 100,
  // brightnessStep: 1,

  // transparency: 95,
  // transparencyMin: 0,
  // transparencyMax: 100,
  // transparencyStep: 1,

  // background: 3,
  // backgroundMin: 0,
  // backgroundMax: 100,
  // backgroundStep: 1,

  backgroundAlpha: 5,
  backgroundAlphaMin: 0,
  backgroundAlphaMax: 100,
  backgroundAlphaStep: 1,
};

// Params for logging
let loggingParams = {
  targetDrawingParams: document.getElementById('drawingParams'),
  targetCanvasParams: document.getElementById('canvasParams'),
  state: false
};





/* ###########################################################################
Classes
############################################################################ */





/* ###########################################################################
Custom Functions
############################################################################ */
let hintAlpha = 100;

function showHint(hint, xP, yP)
{
  rectMode(CENTER);

  const aniSpeed = 10;

  const sizeText = 14;
  textAlign(CENTER);
  textSize(sizeText);

  if(dist(mouseX, mouseY, width/2, height/2) < 200)
  {
    hintAlpha = min(hintAlpha + aniSpeed, 100);
  }
  else{
    hintAlpha = max(hintAlpha - aniSpeed, 0);
  }
  
  blendMode(NORMAL);
  fill(drawingParams.hueInside, 80, 20, hintAlpha);
  rect(xP, yP, textWidth(hint) + 20, sizeText * 2, 10);
  fill(drawingParams.hueOutside, 100, 100, hintAlpha);
  text(hint, xP, yP + 4);
}

function mouseOnCanvas() {
  return mouseX > 0 && mouseX < canvasParams.w && mouseY > 0 && mouseY < canvasParams.h;
}

// function fibonacci(index)
// {
//   let actual = 1;
//   let previous = 1;
//   let temp;

//   for(let i = 0; i < index; i++)
//   {
//     temp = actual;
//     actual = actual + previous;
//     previous = temp;
//   }

//   return actual;
// }




/* ###########################################################################
P5 Functions
############################################################################ */



function setup() {

  let canvas;
  if (canvasParams.mode === 'svg') {
    canvas = createCanvas(canvasParams.w, canvasParams.h, SVG);
  } else { 
    canvas = createCanvas(canvasParams.w, canvasParams.h);
    canvas.parent("canvas");
  }

  // Display & Render Options
  frameRate(35);
  angleMode(DEGREES);
  smooth();

  // GUI Management
  if (true) { 
    sketchGUI = createGui('Params');
    sketchGUI.addObject(drawingParams);
    //noLoop();
  }

  // Anything else
  rectMode(CENTER);
  ellipseMode(CENTER);
  colorMode(HSB, 360, 100, 100, 100);
}



function draw() {

  /* ----------------------------------------------------------------------- */
  // Log globals
  if (!canvasParams.mouseLock) {
    canvasParams.mouseX = mouseX;
    canvasParams.mouseY = mouseY;
    logInfo();
  }

  /* ----------------------------------------------------------------------- */
  // Manage Presets
  if (drawingParams.preset !== currentPreset) { 
    currentPreset = drawingParams.preset;
    if (drawingParams.preset === 'DEFAULT') { 
      sketchGUI.update('numHairs', 30);
      sketchGUI.update('hairThickness', 2);
      sketchGUI.update('hairAmplitude', 10);
      sketchGUI.update('hairFrequency', 12);
      sketchGUI.update('hairLength', 14);
      sketchGUI.update('radius', 12);
      sketchGUI.update('numRings', 12);
      sketchGUI.update('angleOffset', 19);
      sketchGUI.update('spacing', 10);
      sketchGUI.update('blendingMode', 0);
      sketchGUI.update('hueInside', 20);
      sketchGUI.update('hueOutside', 190);
      sketchGUI.update('backgroundAlpha', 5);
    } 
    else if (drawingParams.preset === 'Randooom') { 
      sketchGUI.update('numHairs', random(1, 30));
      sketchGUI.update('hairThickness', random(drawingParams.hairThicknessMax));
      sketchGUI.update('hairAmplitude', random(1, drawingParams.hairAmplitudeMax));
      sketchGUI.update('hairFrequency', random(2, 20));
      sketchGUI.update('hairLength', random(1, 30));
      sketchGUI.update('radius', random(20));
      sketchGUI.update('numRings', random(1, 20));
      sketchGUI.update('angleOffset', random(drawingParams.angleOffsetMax));
      sketchGUI.update('spacing', random(drawingParams.spacingMax));
      sketchGUI.update('hueInside', random(drawingParams.hueInsideMax));
      sketchGUI.update('hueOutside', random(drawingParams.hueOutsideMax));
      sketchGUI.update('backgroundAlpha', random(drawingParams.backgroundAlphaMax));
    } 
  }

  /* ----------------------------------------------------------------------- */
  // Provide your Code below
  let minDimension = min(width, height);
  let midX = width/2;
  let midY = height/2;

  blendMode(BLEND);

  background(0, drawingParams.backgroundAlpha);
  
  noStroke();

  let mX = canvasParams.mouseX;
  let mY = canvasParams.mouseY;

  // HAIRS
  let numHairs = drawingParams.numHairs;
  let hairThickness = drawingParams.hairThickness;
  let hairAmplitude = drawingParams.hairAmplitude * cos(- frameCount / 10);
  let hairFrequency = drawingParams.hairFrequency;
  let hairLength = drawingParams.hairLength;
  // let hairRandom = drawingParams.hairRandom;
  let hairRandom = 1;

  // RINGS
  let numRings = drawingParams.numRings;
  let spacing = drawingParams.spacing;
  let angleOffset = drawingParams.angleOffset;
  let radiusFirstCircle = (sin(frameCount) * drawingParams.radius / 100) * minDimension;


  let preRotation = frameCount / 10;

  // COLOR
  let hueInside = drawingParams.hueInside;
  let hueOutside = drawingParams.hueOutside;
  // let sat = drawingParams.saturation;
  // let bright = drawingParams.brightness;
  // let alpha = drawingParams.transparency;
  let sat = 100;
  let bright = 100;
  let alpha = 95;
  let colorInside = color(hueInside, sat * 0.9, bright, alpha);
  let colorOutside = color(hueOutside, sat, bright * 0.8, alpha / 2);

  // BLEND MODE
  let blendingMode = drawingParams.blendingMode;
  switch (blendingMode) {
    case "OVERLAY":
      blendMode(OVERLAY);
      break;

    case "SCREEN":
      blendMode(SCREEN);
      break;

    case "LIGHTEST":
      blendMode(LIGHTEST);
      break;

    case "ADD":
      blendMode(ADD);
      break;

    case "DIFFERENCE":
      blendMode(DIFFERENCE);
      break;
  
    default:
      blendMode(BLEND);
      break;
  }


  push();
  translate(width/2, height/2);
  rotate(preRotation);


  for(i = 0; i < numRings; i++)
  {
    let radiusCircle = radiusFirstCircle + spacing * i;
    let angleStep = 360 / numHairs;

    colorMode(RGB);
    let color = lerpColor(colorInside, colorOutside, i / (numRings - 1 + 0.001));
    colorMode(HSB);
    
    stroke(color);
    strokeWeight(hairThickness / (i+1));
    noFill();


    for(a = 0; a * angleStep < 360; a++)
    {
      // Draw the circles
      push();
      rotate(a * angleStep + i * angleOffset);

    

      // CURLZ
      beginShape();
      curveVertex(0, 0);
      curveVertex(0, 0);
      for(let s = 1; s < hairFrequency; s++)
      {
        let xP = radiusCircle + s * (hairLength / hairFrequency) * hairLength + (noise(s / 40, millis() / 3000) * 2 - 1) * hairRandom;
        let yP = (s % 2 == 0 ? -hairAmplitude * s : hairAmplitude * s) + (noise(millis() / 5000, s / 20) * 2 - 1) * hairRandom;
        curveVertex(xP, yP);

        if(s == hairFrequency - 1) {curveVertex(xP, yP);}

        // // BOXES
        // if(drawingParams.boxes){
        //   rect(xP, yP, hairAmplitude * 2, hairAmplitude / 2);
        // }
      }
      endShape();

      pop();
    }
  }
  
  pop();

  showHint("Just switch between the DEFAULT & Randooom preset. Again & again.", midX, midY);
}



function keyPressed() {

  if (keyCode === 81) { // Q-Key
  }

  if (keyCode === 87) { // W-Key
  }

  if (keyCode === 89) { // Y-Key
  }

  if (keyCode === 88) { // X-Key
  }

  if (keyCode === 83) { // S-Key
    let suffix = (canvasParams.mode === "canvas") ? '.jpg' : '.svg';
    let fragments = location.href.split(/\//).reverse().filter(fragment => {
      return (fragment.match !== 'index.html' && fragment.length > 2) ? fragment : false;
    });
    let suggestion = fragments.shift();
  
    let fn = prompt(`Filename for ${suffix}`, suggestion);
    save(fn + suffix);
  }

  if (keyCode === 49) { // 1-Key
  }

  if (keyCode === 50) { // 2-Key
  }

  if (keyCode === 76) { // L-Key
    if (!canvasParams.mouseLock) {
      canvasParams.mouseLock = true;
    } else { 
      canvasParams.mouseLock = false;
    }
    document.getElementById("canvas").classList.toggle("mouseLockActive");
  }


}



function mousePressed() {}



function mouseReleased() {}



function mouseDragged() {}



function keyReleased() {
  if (keyCode == DELETE || keyCode == BACKSPACE) clear();
}





/* ###########################################################################
Service Functions
############################################################################ */



function getCanvasHolderSize() {
  canvasParams.w = canvasParams.holder.clientWidth;
  canvasParams.h = canvasParams.holder.clientHeight;
}



function resizeMyCanvas() {
  getCanvasHolderSize();
  resizeCanvas(canvasParams.w, canvasParams.h);
}



function windowResized() {
  resizeMyCanvas();
}



function logInfo(content) {

  if (loggingParams.targetDrawingParams) {
    loggingParams.targetDrawingParams.innerHTML = helperPrettifyLogs(drawingParams);
  }

  if (loggingParams.targetCanvasParams) {
    loggingParams.targetCanvasParams.innerHTML = helperPrettifyLogs(canvasParams);
  }

}

