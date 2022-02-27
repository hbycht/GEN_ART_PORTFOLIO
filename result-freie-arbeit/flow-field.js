/// <reference path="../TSDef/p5.global-mode.d.ts" />

/*jshint esversion: 6 */

/* ############################################################################ 

FLOW-FIELD von Henning Brode
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

  preset: ["DEFAULT", "Dust", "Softing", "Painting", 'Stream', "Speed of Light", "Randooom"],

  numParticles: 1500,
  numParticlesMin: 0,
  numParticlesMax: 5000,
  numParticlesStep: 10,

  particleSpeed: 6.0,
  particleSpeedMin: 0,
  particleSpeedMax: 10,
  particleSpeedStep: 0.1,

  particleSize: 1.5,
  particleSizeMin: 0.1,
  particleSizeMax: 10,
  particleSizeStep: 0.1,

  attachToForces: 0.8,
  attachToForcesMin: 0,
  attachToForcesMax: 1,
  attachToForcesStep: 0.01,

  forceSpacing: 40,
  forceSpacingMin: 20,
  forceSpacingMax: 100,
  forceSpacingStep: 1,

  noiseIncrement: 0.3,
  noiseIncrementMin: 0,
  noiseIncrementMax: 1.0,
  noiseIncrementStep: 0.001,

  reactToForces: true,

  defaultAngle: 310,
  defaultAngleMin: 0,
  defaultAngleMax: 360,
  defaultAngleStep: 1,

  // showForces: !true,

  // circleSpawner: !true,
  // pendulum: !true,

  particleColorBegin: 180,
  particleColorBeginMin: 0,
  particleColorBeginMax: 359,
  particleColorBeginStep: 1,
  
  particleColorEnd: 275,
  particleColorEndMin: 0,
  particleColorEndMax: 359,
  particleColorEndStep: 1,

  // background: 0,
  // backgroundMin: 0,
  // backgroundMax: 100,
  // backgroundStep: 1,

  backgroundAlpha: 10,
  backgroundAlphaMin: 0,
  backgroundAlphaMax: 100,
  backgroundAlphaStep: 1,

  // forcePower: 10,
  // forcePowerMin: 0,
  // forcePowerMax: 100,
  // forcePowerStep: 1,

  
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
let particles = [];
var changed = true;
var paramQ = 0;
var preParamQ = 1;
var looop = true;
let midX = canvasParams.w / 2;
let midY = canvasParams.h / 2;
let minDimension = Math.min(canvasParams.w, canvasParams.h);
let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;



/* ###########################################################################
Custom Functions
############################################################################ */

function mouseOnCanvas() {
  return mouseX > 0 && mouseX < canvasParams.w && mouseY > 0 && mouseY < canvasParams.h;
}

function drawForce(xPos, yPos, dir, pow) {
  push();
  translate(xPos, yPos);
  rotate(dir);
  
  fill(0, 100, 100, 100);
  ellipse(0, 0, 3);
  
  strokeWeight(0.1);
  stroke(255);
  line(0, 0, pow, 0);

  pop();
}

function initParticles() {
  let randomScale = random(1 / 2, 2);

  particles = [];
  for (n = 0; n < drawingParams.numParticles; n++) {
    var x = random(width);
    var y = random(height);

    particles.push({
      col: random(drawingParams.particleColorBegin, drawingParams.particleColorEnd),
      xPos: x,
      yPos: y,
      preX: x,
      preY: y,
      rot: null,
      speed: drawingParams.particleSpeed * randomScale,
      size: drawingParams.particleSize * (1 / randomScale)
    })
  }
}

function drawParticle(p, forces) {
  push();

  // draw particle
  stroke(p.col, 100, 100, 100);
  strokeWeight(p.size);
  line(p.xPos, p.yPos, p.preX, p.preY);

  // check if on canvas
  if (p.xPos > - p.size && p.xPos < canvasParams.w + p.size && p.yPos > - p.size && p.yPos < canvasParams.h + p.size) {
    // move particle
    p.preX = p.xPos;
    p.preY = p.yPos;
    p.xPos += cos(p.rot) * p.speed;
    p.yPos += sin(p.rot) * p.speed;
  } 
  else {
    //*// reborn particle
    if(drawingParams.circleSpawner) {
      // circle spawner
      let sAngle = (millis() / 1) % 360;
      if (drawingParams.pendulum) {
        var sRad = minDimension * 0.4 * sin(millis() / 100);
        ellipse(sRad + midX, midY, 10);
      } else {
        var sRad = minDimension * 0.4;
      }

      p.xPos = cos(sAngle) * sRad + midX;
      p.yPos = sin(sAngle) * sRad + midY;

    } 
    else {
      // random spawner
      p.xPos = random(width);
      p.yPos = random(height);
    }

    let randomScale = random(1 / 2, 2);

    p.col = random(drawingParams.particleColorBegin, drawingParams.particleColorEnd);
    p.preX = p.xPos;
    p.preY = p.yPos;
    p.rot = null;
    p.speed = drawingParams.particleSpeed * randomScale;
    p.size = drawingParams.particleSize * (1 / randomScale);
  }

  pop();

  // check which forces are the nearest
  let nearestForce = [[Infinity, 0]]; // Save the 4 nearest forces into an array
  let nearestForceRot = 0;
  let nearestForceWeights = 0;
  forces.forEach(f => {
    let distance = dist(f.xPos, f.yPos, p.xPos, p.yPos);
    for(let i = 0; i < nearestForce.length; i++) {
      if (distance < nearestForce[i][0]) {
        nearestForce.splice(i, 0, [distance, f.rot]);
        break;
      }
    }
    if (nearestForce.length > 4) nearestForce.splice(4, 1); // Max. 4 forces in the array
  });

  // Calculate weighted mean of forces
  let maxDistToForce = sqrt(2) * drawingParams.forceSpacing;
  for(let i = 0; i < nearestForce.length; i++) {
    let weight = maxDistToForce - nearestForce[i][0];
    let rot = nearestForce[i][1];
    nearestForceRot += rot * weight;
    nearestForceWeights += weight;
  }
  nearestForceRot /= nearestForceWeights;

  // refresh particles rotation to new value
  if(p.rot === null) {
    p.rot = nearestForceRot;
  }
  else {
    p.rot = lerp(p.rot, nearestForceRot, drawingParams.attachToForces * (sin(frameCount) / 2 + 0.5));
  }

  if(!drawingParams.reactToForces) p.rot = drawingParams.defaultAngle;
}


function drawFlowfield() {
  // FORCES
  let forces = [];
  let forceSpacing = drawingParams.forceSpacing;
  let forcePower = drawingParams.forcePower;
  let rows = floor(height / forceSpacing);
  let columns = floor(width / forceSpacing);
  let xOff = (width - columns * forceSpacing) / 2;
  let yOff = (height - rows * forceSpacing) / 2;
  let inc = drawingParams.noiseIncrement;

  // PARTICLES
  let numParticles = drawingParams.numParticles;
  let size = drawingParams.particleSize;

  // TIME
  let timeShift = millis() / 10000;

  // Check changes in drawingParams
  paramQ = width + height + numParticles;
  changed = paramQ == preParamQ ? false : true;

  // INIT PARTICLES & reset canvas stats if drawingParams changed
  if(changed || keyIsPressed && key == 'r') {
    initParticles();

    midX = width / 2;
    midY = height / 2;
    minDimension = min(width, height);
  }


  background(drawingParams.particleColorBegin, 90, 5, drawingParams.backgroundAlpha);

  // REFRESH & SHOW FORCES
  for (let j = 0; j <= rows; j++) {
    let fY = j * forceSpacing + yOff;
    for (let i = 0; i <= columns; i++) {
      let fX = i * forceSpacing + xOff;
      let fRot = (noise(i * inc, j * inc, timeShift) * 2 - 1) * 360 + 360;

      forces.push({
        xPos: fX,
        yPos: fY,
        rot: fRot,
        power: forcePower
      });

      if (drawingParams.showForces) {
        drawForce(fX, fY, fRot, forcePower);
      }
    }
  }

  // REFRESH & DRAW PARTICLES
  particles.forEach(particle => {
    drawParticle(particle, forces);
  });


  preParamQ = paramQ;
}

function setRandomSettings(){
  sketchGUI.update('preset', drawingParams.preset.length - 1);
  sketchGUI.update('numParticles', random(1500));
  sketchGUI.update('particleSpeed', random(drawingParams.particleSpeedMax));
  sketchGUI.update('particleSize', random(0.5, 5));
  sketchGUI.update('attachToForces', random(drawingParams.attachToForcesMax));
  sketchGUI.update('forceSpacing', random(drawingParams.forceSpacingMax));
  sketchGUI.update('noiseIncrement', random(drawingParams.noiseIncrementMax));
  sketchGUI.update('reactToForces', true);
  sketchGUI.update('particleColorBegin', random(drawingParams.particleColorBeginMax));
  sketchGUI.update('particleColorEnd', random(drawingParams.particleColorEndMax));
  sketchGUI.update('backgroundAlpha', random(25));
}



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
  frameRate(50);
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

  // INIT PARTICLES
  initParticles();
}



function draw() {

  /* ----------------------------------------------------------------------- */
  // Log globals
  if (!canvasParams.mouseLock) {
    canvasParams.mouseX = mouseX;
    canvasParams.mouseY = mouseY;
    logInfo();
  }

  // numParticles: 1500,
  // particleSpeed: 6.0,
  // particleSize: 1.5,
  // attachToForces: 0.8,
  // forceSpacing: 40,
  // noiseIncrement: 0.3,
  // reactToForces: true,
  // defaultAngle: 310,
  // particleColorBegin: 180,
  // particleColorEnd: 275,
  // backgroundAlpha: 10,

  /* ----------------------------------------------------------------------- */
  // Manage Presets
  if (drawingParams.preset !== currentPreset) { 
    currentPreset = drawingParams.preset;
    if (drawingParams.preset === 'DEFAULT') {
      sketchGUI.update('numParticles', 1500);
      sketchGUI.update('particleSpeed', 5.0);
      sketchGUI.update('particleSize', 1.5);
      sketchGUI.update('attachToForces', 0.8);
      sketchGUI.update('forceSpacing', 40);
      sketchGUI.update('noiseIncrement', 0.5);
      sketchGUI.update('reactToForces', true);
      sketchGUI.update('defaultAngle', 310);
      sketchGUI.update('particleColorBegin', 140);
      sketchGUI.update('particleColorEnd', 290);
      sketchGUI.update('backgroundAlpha', 8);
    }
    else if (drawingParams.preset === 'Dust') {
      sketchGUI.update('numParticles', 4000);
      sketchGUI.update('particleSpeed', 1.8);
      sketchGUI.update('particleSize', 0.4);
      sketchGUI.update('attachToForces', 0.95);
      sketchGUI.update('forceSpacing', 70);
      sketchGUI.update('noiseIncrement', 0.6);
      sketchGUI.update('reactToForces', true);
      sketchGUI.update('defaultAngle', 310);
      sketchGUI.update('particleColorBegin', 30);
      sketchGUI.update('particleColorEnd', 80);
      sketchGUI.update('backgroundAlpha', 50);
    }
    else if (drawingParams.preset === 'Softing') {
      sketchGUI.update('numParticles', 400);
      sketchGUI.update('particleSpeed', 0.9);
      sketchGUI.update('particleSize', 2.6);
      sketchGUI.update('attachToForces', 0.5);
      sketchGUI.update('forceSpacing', 25);
      sketchGUI.update('noiseIncrement', 0.03);
      sketchGUI.update('reactToForces', true);
      sketchGUI.update('defaultAngle', 310);
      sketchGUI.update('particleColorBegin', 260);
      sketchGUI.update('particleColorEnd', 300);
      sketchGUI.update('backgroundAlpha', 2);
    }
    else if (drawingParams.preset === 'Painting') {
      sketchGUI.update('numParticles', 1200);
      sketchGUI.update('particleSpeed', 2.0);
      sketchGUI.update('particleSize', 3.9);
      sketchGUI.update('attachToForces', 0.8);
      sketchGUI.update('forceSpacing', 50);
      sketchGUI.update('noiseIncrement', 0.8);
      sketchGUI.update('reactToForces', true);
      sketchGUI.update('defaultAngle', 310);
      sketchGUI.update('particleColorBegin', 10);
      sketchGUI.update('particleColorEnd', 120);
      sketchGUI.update('backgroundAlpha', 1);
    }
    else if (drawingParams.preset === 'Stream') {
      sketchGUI.update('numParticles', 700);
      sketchGUI.update('particleSpeed', 7.0);
      sketchGUI.update('particleSize', 1.0);
      sketchGUI.update('attachToForces', 0.9);
      sketchGUI.update('forceSpacing', 30);
      sketchGUI.update('noiseIncrement', 0.9);
      sketchGUI.update('reactToForces', true);
      sketchGUI.update('defaultAngle', 310);
      sketchGUI.update('particleColorBegin', 190);
      sketchGUI.update('particleColorEnd', 210);
      sketchGUI.update('backgroundAlpha', 3);
    }
    else if (drawingParams.preset === 'Speed of Light') {
      sketchGUI.update('numParticles', 800);
      sketchGUI.update('particleSpeed', 10.0);
      sketchGUI.update('particleSize', 1.0);
      sketchGUI.update('attachToForces', 0.8);
      sketchGUI.update('forceSpacing', 1000);
      sketchGUI.update('noiseIncrement', 0.3);
      sketchGUI.update('reactToForces', false);
      sketchGUI.update('defaultAngle', 300);
      sketchGUI.update('particleColorBegin', 0);
      sketchGUI.update('particleColorEnd', 90);
      sketchGUI.update('backgroundAlpha', 5);
    } 
    else if (drawingParams.preset === 'Randooom') { 
      setRandomSettings();
    }
  }

  /* ----------------------------------------------------------------------- */
  // Provide your Code below

  // CANVAS
  // let minDimension = min(width, height);
  // let midX = width/2;
  // let midY = height/2;

  // execute Flowfield function
  drawFlowfield();
}



function keyPressed() {

  if (key === "r") { // R-Key
    setRandomSettings();
  }

  if (keyCode === 87) { // W-Key
  }

  if (keyCode === 89) { // Y-Key
    if(looop) noLoop();
    else loop();

    looop = !looop;
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

