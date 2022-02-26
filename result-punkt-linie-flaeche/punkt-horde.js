
/// <reference path="../TSDef/p5.global-mode.d.ts" />

/*jshint esversion: 6 */

/* ############################################################################ 

PUNKT-HORDE von Henning Brode
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
  preset: ["DEFAULT", "linear", "experimental fabric", "experimental physics", "experimental spin"],

  columns: 70,
  columnsMin: 1,
  columnsMax: 100,
  columnsStep: 1,
  
  rows: 35,
  rowsMin: 1,
  rowsMax: 100,
  rowsStep: 1,

  dotSize: 2.5,
  dotSizeMin: 0,
  dotSizeMax: 10,
  dotSizeStep: 0.1,

  speedMode: ["exponential", "linear"],

  dotSpeed: 5,
  dotSpeedMin: 0,
  dotSpeedMax: 50,
  dotSpeedStep: 0.1,

  experimentalMode: false,

  // mouseAgent: false,
  
  hue_1: 235,
  hue_1Min: 0,
  hue_1Max: 360,
  hue_1Step: 1,
  
  hue_2: 30,
  hue_2Min: 0,
  hue_2Max: 360,
  hue_2Step: 1,

  // transparency: 100,
  // transparencyMin: 0,
  // transparencyMax: 100,
  // transparencyStep: 1,

  colorMixingMode: ["RGB", "HSB"],

  // background: 7,
  // backgroundMin: 0,
  // backgroundMax: 100,
  // backgroundStep: 1,
  
  backgroundAlpha: 10,
  backgroundAlphaMin: 0,
  backgroundAlphaMax: 100,
  backgroundAlphaStep: 1,

  // showHint: false,
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
class Dot {
  constructor(xHome, yHome, size, col, radiusAgent, veloFac, linearSpeed) {
    this.home = createVector(xHome, yHome);
    this.position = this.home.copy();
    this.radius = size;
    this.dist = 0;
    this.startVelo = 10;
    this.velo = this.startVelo;
    this.col = col;
    this.radiusAgent = radiusAgent*2;
    this.veloFac = veloFac;
    this.linearSpeed = linearSpeed;
  }

  calcDist() {
    this.dist = this.position.dist(mouseIsPressed ? createVector(mouseX, mouseY) : this.home);
    return this.dist;
  }

  calcVelo() {
    this.calcDist();
    this.velo = (this.dist > (mouseIsPressed ? this.radiusAgent + this.radius : this.radius / 2)) ? (this.linearSpeed ? this.veloFac * 2 : pow(this.dist, 2) * (this.veloFac / 10000)) : 0;
    return this.velo;
  }

  draw() {
    fill(this.col);
    ellipse(this.position.x, this.position.y, this.radius * 2);
  }

  move() {
    this.calcVelo();

    this.position = mouseIsPressed && mouseOnCanvas() ? 
      p5.Vector.add(this.position, p5.Vector.sub(createVector(mouseX, mouseY), this.position).setMag(this.velo)) : 
      p5.Vector.add(this.position, p5.Vector.sub(this.home, this.position).setMag(this.velo));

    this.draw();
  }
}




/* ###########################################################################
Custom Functions
############################################################################ */
function mouseOnCanvas() {
  return mouseX > 0 && mouseX < canvasParams.w && mouseY > 0 && mouseY < canvasParams.h;
}

let hintAlpha = 100;

function showHint(textOffCanvas, textOnCanvas, xP, yP, hue)
{
  rectMode(CENTER);

  const aniSpeed = 5;

  const sizeText = 14;
  textAlign(CENTER);
  textSize(sizeText);

  hue = (hue + 360) % 360;
  
  if(mouseIsPressed) {
    if(mouseOnCanvas())
    {
      hintAlpha = max(hintAlpha + aniSpeed/2, 100);
      hint = textOnCanvas;
    }
    else{
      hintAlpha = min(hintAlpha - aniSpeed, 0);
      hint = "";
    }
  }
  else {
    hintAlpha = max(hintAlpha + aniSpeed/2, 100);
    hint = textOffCanvas;
  }
  
  fill(hue, 100, 40, hintAlpha);
  rect(xP, yP, textWidth(hint) + 20, sizeText * 2, 10);
  fill(255, hintAlpha);
  text(hint, xP, yP + 4);
}









/* ###########################################################################
P5 Functions
############################################################################ */

var dots = [];
var changed = true;
var paramQ = 0;
var preParamQ = 1;
var looop = true;


function setup() {

  let canvas;
  if (canvasParams.mode === 'svg') {
    canvas = createCanvas(canvasParams.w, canvasParams.h, SVG);
  } else { 
    canvas = createCanvas(canvasParams.w, canvasParams.h);
    canvas.parent("canvas");
  }

  // Display & Render Options
  frameRate(25);
  angleMode(DEGREES);
  smooth();

  // GUI Management
  if (true) { 
    sketchGUI = createGui('Params');
    sketchGUI.addObject(drawingParams);
    //noLoop();
  }

  // Anything else
  noStroke();
  colorMode(HSB, 360, 100, 100, 100);
  angleMode(DEGREES);
  changed = true;
  
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
      sketchGUI.update('columns', 100);
      sketchGUI.update('rows', 50);
      sketchGUI.update('dotSize', 2.9);
      sketchGUI.update('speedMode', 0);
      sketchGUI.update('dotSpeed', 5);
      sketchGUI.update('experimentalMode', false);
      sketchGUI.update('hue_1', 200);
      sketchGUI.update('hue_2', 25);
      sketchGUI.update('transparency', 100);
      sketchGUI.update('colorMixingMode', "RGB");
      sketchGUI.update('background', 7);
      sketchGUI.update('backgroundAlpha', 20);
    } 
    else if (drawingParams.preset === 'linear') { 
      sketchGUI.update('columns', 100);
      sketchGUI.update('rows', 50);
      sketchGUI.update('dotSize', 2);
      sketchGUI.update('speedMode', 1);
      sketchGUI.update('dotSpeed', 5);
      sketchGUI.update('experimentalMode', false);
    }
    else if (drawingParams.preset === 'experimental fabric') { 
      sketchGUI.update('columns', 100);
      sketchGUI.update('rows', 50);
      sketchGUI.update('dotSize', 2.5);
      sketchGUI.update('speedMode', 1);
      sketchGUI.update('dotSpeed', 10);
      sketchGUI.update('experimentalMode', true);
    }
    else if (drawingParams.preset === 'experimental physics') { 
      sketchGUI.update('columns', 100);
      sketchGUI.update('rows', 50);
      sketchGUI.update('dotSize', 2);
      sketchGUI.update('speedMode', 0);
      sketchGUI.update('dotSpeed', 4);
      sketchGUI.update('experimentalMode', true);
    }
    else if (drawingParams.preset === 'experimental spin') { 
      sketchGUI.update('columns', 100);
      sketchGUI.update('rows', 50);
      sketchGUI.update('dotSize', 2);
      sketchGUI.update('speedMode', 1);
      sketchGUI.update('dotSpeed', 50);
      sketchGUI.update('experimentalMode', true);
      sketchGUI.update('transparency', 100);
      sketchGUI.update('colorMixingMode', "RGB");
      sketchGUI.update('background', 7);
      sketchGUI.update('backgroundAlpha', 20);
    }
  }

  /* ----------------------------------------------------------------------- */
  // Provide your Code below
  let minDimension = min(width, height);
  let midX = width/2;
  let midY = height/2;

  // GRID
  let columns = drawingParams.columns;
  let rows = drawingParams.rows;
  let numDots = columns * rows;
  let xSpacing = width / (columns + 1);
  let ySpacing = height / (rows + 1);
  let dotSize = drawingParams.dotSize;
  let veloDiv = drawingParams.dotSpeed;
  let linearSpeed = drawingParams.speedMode === "linear" ? true : false;
  let experimental = drawingParams.experimentalMode;

  // COLOR
  let mixing = drawingParams.colorMixingMode;
  let hue_1 = drawingParams.hue_1;
  let hue_2 = drawingParams.hue_2;
  let alpha = drawingParams.transparency;
  let col_1 = color(hue_1, 100, 100, alpha);
  let col_2 = color(hue_2, 100, 100, alpha);

  // Check changes in drawingParams
  paramQ = width + height;
  for (const key in drawingParams) {
    paramQ += drawingParams[key];      
  }
  changed = paramQ == preParamQ ? false : true;

  // Mouse Agent
  let radiusMouse = 20;
  
  // Init my Dots
  if(changed || keyIsPressed && key == 'r' || experimental) {
    dots = [];
  }

  // Handle Experimental Mode
  if (experimental) {
    veloDiv *= 3;
  }

  if(dots.length < numDots) {
    for(let j = 0; j < rows; j++) {
      let yPos = ySpacing * j + ySpacing;
      for(let i = 0; i < columns; i++)
      {
        xPos = xSpacing * i + xSpacing;

        colorMode(mixing == "RGB" ? RGB : HSB, 360, 100, 100, 100);
        col = lerpColor(col_1, col_2, (j * columns + i * rows) / numDots/2);
        colorMode(HSB, 360, 100, 100, 100);

        dots.push(new Dot(xPos, yPos, dotSize, col, radiusMouse, veloDiv, linearSpeed));
      }
    }
  }

  background(0, drawingParams.backgroundAlpha);

  dots.forEach(element => {
    element.move();
  });

  // Mouse Agent
  if(drawingParams.mouseAgent) {
    fill(mouseIsPressed ? (hue_1 + 180) % 360 : hue_1, 100, 100, 100);
    ellipse(mouseX, mouseY, radiusMouse*2);
  }
  
  if(false){
    let hue = lerp(hue_1, hue_2, mixing == "HSB" ? 0.5 : 0);
    if(experimental){
      showHint("Press & hold mouse on canvas.", "Play around with dotSpeed & speedMode.", midX, height * 0.5, hue);
    } 
    else {
      showHint("Press & hold mouse on canvas.", "Now move mouse over canvas edge.", midX, height * 0.5, hue);
    }
    
  }


  preParamQ = paramQ;
}



function keyPressed() {

  if (keyCode === 81) { // Q-Key
  }

  if (keyCode === 87) { // W-Key
    looop = !looop;
    if (looop) {
      loop();
    } else { 
      noLoop();
    }
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

