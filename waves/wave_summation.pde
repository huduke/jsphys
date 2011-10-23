/**
 * Travelling wave summation demonstration
 * by Alex Reinhart
 * Based on:
 * Sine Console
 * Processing: Creative Coding and
 * Computational Art
 * By Ira Greenberg */

/* @pjs pauseOnBlur="true"; */

float py, pyprev;
float angle, angle2;
float k, k2;
float amplitude = 50;
float amplitude2 = 50;
float t = 0;

void setup(){
  size(600, 210);
  background (0);
  smooth();
  noLoop();
}

void draw(){
  background (255);
  // keep reinitializing to 0, to avoid
  // flashing during redrawing
  angle = 0;
  angle2 = 0;
  k = w / waveSpeed;
  k2 = w2 / waveSpeed;
  
  // Draw first traveling wave -- y1 = sin(k1 x - w1 t)
  stroke(0, 127, 0);
  strokeWeight(1);
  for (int i = 0; i < width; i++) {
    py = 105 + sin(k * i - (w * t)) * amplitude;
    pyprev = 105 + sin(k * (i-1) - (w * t)) * amplitude;
    line(i-1, pyprev, i, py);
  }

  // Draw second traveling wave -- y1 = sin(k2 x - w2 t)
  stroke(0, 0, 127);
  for (int i = 0; i < width; i++) {
    py = 105 + sin(k2 * i - (w2 * t)) * amplitude2;
    pyprev = 105 + sin(k2 * (i-1) - (w2 * t)) * amplitude2;
    line(i-1, pyprev, i, py);
  }
  
  // Draw sum wave
  stroke(0);
  strokeWeight(2);
  for (int i = 0; i < width; i++) {
    py = 105 + sin(k2 * i - (w2 * t)) * amplitude2 + sin(k * i - (w * t)) * amplitude;
    pyprev = 105 + sin(k * (i-1) - (w * t)) * amplitude + 
             sin(k2 * (i-1) - (w2 * t)) * amplitude2;
    line(i-1, pyprev, i, py);
  }

  // Draw a spot in the middle, floating on the sum wave
  i = width/2;
  py = 105 + sin(k2 * i - (w2 * t)) * amplitude2 + sin(k * i - (w * t)) * amplitude;
  ellipse(i, py, 4, 4);
  
  t += timestep;
}
