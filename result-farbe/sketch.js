/*jshint esversion: 6 */

/* ############################################################################ 

Kurs «Generative Gestaltung» an der TH Köln
Christian Noss
christian.noss@th-koeln.de
https://twitter.com/cnoss
https://cnoss.github.io/generative-gestaltung/

############################################################################ */


let saveParams = {
  sketchName: 'gg-startercode'
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
  mode: 'canvas', // canvas, svg or WEBGL - svg mode is experimental 
};
getCanvasHolderSize();

// Params for the drawing
let drawingParams = {
  gridSize: 20,
  gridSizeMax: 100,
  gridSizeMin: 5,
  gridSizeStep: 5,
  gridAlpha: 20,

  strokeWeight: 1,
  strokeAlpha: 50,
  lines: 10,
  innerRadius1: 40,
  outerRadius1: 120,
  innerRadius2: 40,
  outerRadius2: 120,
  padding: 20,
  hueStart: 0,
  hueStartMax: 360,

  hueEnd: 360,
  hueEndMax: 360,

};

// Params for logging
let loggingParams = {
  targetDrawingParams: document.getElementById('drawingParams'),
  targetCanvasParams: document.getElementById('canvasParams'),
  state: false
};

let areas = [];

let innerRadius = 0;
let innerIncrement = 0.7;
let innerIncrementDirection = 1;


/* ###########################################################################
Classes
############################################################################ */


/* ###########################################################################
Custom Functions
############################################################################ */

function drawGrid() { 

  push();
  translate(width/2, height/2);
  let maxDimension = (width / height > 1) ? width : height;
  let halfWidth = width / 2;
  let halfheight= width / 2;
  let steps = maxDimension * 0.5 / drawingParams.gridSize;

  stroke(0, 0, 0, drawingParams.gridAlpha);

  for (i = 0; i <= steps; i++) { 
    let weight = (i % 10 === 0) ? 0.5 : 0.2;
    strokeWeight(weight);
    let positive  = (i * drawingParams.gridSize);
    let negative = -positive ;
    line(positive, -halfheight, positive, halfheight);
    line(negative, -halfheight, negative, halfheight);
    line(-halfWidth, positive, halfWidth, positive);
    line(-halfWidth, negative, halfWidth, negative);
  }
  pop();

}



/* ###########################################################################
P5 Functions
############################################################################ */


function setup() {
  
  let canvas;
  if (canvasParams.mode === 'svg') {
    canvas = createCanvas(canvasParams.w, canvasParams.h, SVG);
  } else if (canvasParams.mode === 'WEBGL') { 
    canvas = createCanvas(canvasParams.w, canvasParams.h, WEBGL);
    canvas.parent("canvas");
  } else { 
    canvas = createCanvas(canvasParams.w, canvasParams.h);
    canvas.parent("canvas");
  }

  // Display & Render Options
  // frameRate(25);
  angleMode(DEGREES);
  smooth();
  // colorMode(HSB, 360, 100, 100, 100);

  // GUI Management
  if (canvasParams.gui) { 
    let sketchGUI = createGui('Params');
    sketchGUI.addObject(drawingParams);
    //noLoop();
  }

  // Anything else
  fill(0);
  // noStroke();
  stroke(0,0,90,5);
  strokeWeight(0.5);
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
  // Provide your Code below
  background(0);
  stroke(255);
  fill(255);
  translate(width / 2, height / 2);

  strokeWeight(drawingParams.strokeWeight);
  
  let angleSteps = 360 / drawingParams.lines;
  
  innerRadius = innerRadius + (innerIncrement * innerIncrementDirection);
  if (innerRadius > width) { innerIncrementDirection = -1; }
  if (innerRadius < -width ) { innerIncrementDirection = 1; }

  for (let angle = 0; angle <= 360; angle += angleSteps) { 
    let x1 = cos(angle) * innerRadius;
    let y1 = sin(angle) * drawingParams.innerRadius2;

    let x2 = cos(angle) * drawingParams.outerRadius1;
    let y2 = sin(angle) * drawingParams.outerRadius2;

    let hue = map(angle, 0, 360, drawingParams.hueStart, drawingParams.hueEnd);
    stroke(hue, 100, 100, drawingParams.strokeAlpha);
    
    line(x1, y1, x2, y2);
  }
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

    let suffix = (canvasParams.mode === "svg") ? '.svg' : '.png';
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



function mousePressed() {
}



function mouseReleased() {
}



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

