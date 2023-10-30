// Define global variables
let music, vocals, bass, drums;
let vocalsFFT, bassFFT, drumsFFT;

let sinWave;
let audioReactiveCircle;

// Create a function to preload music
// Extra: Split the file into 4 parts (vocals, melody, bass, drums)
// Have them play at the same time
// Song Credit: Madeon - All My Friends x Imperium (NO HOPE. Flip)
function preload() {
  music = loadSound('allmyfriends [music].mp3');
  vocals = loadSound('allmyfriends [vocals].mp3');
  bass = loadSound('allmyfriends [bass].mp3');
  drums = loadSound('allmyfriends [drums].mp3');
}

// Create setup function
// Maximize screen size
// Create FFT objects for audiovisual data to display
function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL); // WEBGL used to manipulate 3D parameters in reference to "Sine wave structures in p5.js"
  angleMode(DEGREES);

  // Use only vocals, bass, and drums FFT data since they are the most audio-responsive, whereas the music FFT is not
  vocalsFFT = new p5.FFT();
  bassFFT = new p5.FFT();
  drumsFFT = new p5.FFT();

  vocalsFFT.setInput(vocals);
  bassFFT.setInput(bass);
  drumsFFT.setInput(drums);

  // Create the primary audio visual object (update: defined as a class for the Sin Wave)
  sinWave = new SinWave();
}

// Create draw function
function draw() {
  // Define amplitude from drums
  drumsFFT.analyze();
  let drumsAmp = drumsFFT.getEnergy(150, 200);

  // Outline parameters for the background
  // Most likely blank/low visual contrast (update: created audio-reactive background that phases between red and black based on drum amplitude)
  let redStrobe = map(drumsAmp, 50, 255, 0, 255);
  let backgroundColor = color(redStrobe, 0, 0);
  background(backgroundColor);

  // Create an audio-reactive stroke color so that when the background turns red, the stroke turns black and vice versa
  let invertStroke = map(drumsAmp, 50, 255, 255, 0);
  let strokeColor = color(invertStroke, 0, 0);
  stroke(strokeColor);

  sinWave.update();
  sinWave.show();

  // Call upon the object class for the secondary audiovisual object
  // (update: audio-reactive circle only appears when the bass track is playing)
  if (bass.isPlaying()) {
    audioReactiveCircle = new AudioReactiveCircle(150, 250);
    audioReactiveCircle.update();
    audioReactiveCircle.show();
    audioReactiveCircle = new AudioReactiveCircle(150, 265);
    audioReactiveCircle.update();
    audioReactiveCircle.show();
    audioReactiveCircle = new AudioReactiveCircle(150, 280);
    audioReactiveCircle.update();
    audioReactiveCircle.show();
  }
}

// Create object class or classes (update: create 2 classes)
// Define constructor
// Define what will be shown
// Define any other parameters

// Sin wave referenced from "Sine wave structures in p5.js" (https://www.youtube.com/watch?v=vmhRlDyPHMQ&ab_channel=ColorfulCoding)
// Added functionality of audio-reactive radius from vocals amplitude, rotation via the up and down keys, and changing the shape via the left and right keys
class SinWave {
  constructor() {
    this.shapeChange = 10;
    this.angle = 60;
    this.rotationSpeed = 1;
  }

  // Reference: https://p5js.org/reference/#/p5/keyIsDown
  // Reference: https://p5js.org/reference/#/p5/constrain
  update() {
    if (keyIsDown(RIGHT_ARROW)) {
      // When the right arrow is pressed, the shape progressively becomes simpler but is constrained between the values of 10 and 180 for aesthetic and performance
      this.shapeChange = constrain(this.shapeChange + .5, 10, 180);
      console.log('right');
    } else if (keyIsDown(LEFT_ARROW)) {
      // When the left arrow is pressed, the shape progressively becomes smoother but is constrained between the values of 10 and 180 for aesthetic and performance
      this.shapeChange = constrain(this.shapeChange - .5, 10, 180);
      console.log('left');
    }
    if (keyIsDown(UP_ARROW)) {
      // When the up arrow is pressed, the sin wave begins to rotate in the same direction
      this.angle += this.rotationSpeed;
      console.log('up');
    } else if (keyIsDown(DOWN_ARROW)) {
      // When the down arrow is pressed, the sin wave begins to rotate in the same direction
      this.angle -= this.rotationSpeed;
      console.log('down');
    }
  }

  show() {
    // Referenced from "Sine wave structures in p5.js" (https://www.youtube.com/watch?v=vmhRlDyPHMQ&ab_channel=ColorfulCoding)
    vocalsFFT.analyze();
    let vocalsAmp = vocalsFFT.getEnergy(1, 700);

    push();
    rotateX(this.angle);

    for (var i = 0; i < 18; i++) {
      beginShape();

      for (var j = 0; j < 360; j += this.shapeChange) {
        let rad = (i * vocalsAmp) / 20; // Radius size affected by vocal amplitude
        var x = rad * cos(j);
        var y = rad * sin(j);
        var z = sin(frameCount * 2 + i * 10) * 50;
        vertex(x, y, z);
      }

      endShape(CLOSE);
    }
    pop();
  }
}

// Audio-reactive circle referenced from "Code an Audio Visualizer in p5js (from scratch)" (https://www.youtube.com/watch?v=uk96O7N1Yo0&t=497s&ab_channel=ColorfulCoding)
// Added functionality of audio-reactivity exclusively from bass FFT, the ability to create multiple instances with different sizes through the class via constructors, hide instances when the space bar is pressed
class AudioReactiveCircle {
  constructor(radiusMin, radiusMax) {
    // Constructors to adjust size to add more (for this piece, I decided to go with 3 for aesthetics and performance)
    this.radiusMin = radiusMin;
    this.radiusMax = radiusMax;
    this.visible = true;
  }

  //hide circles when space bar is pressed
  update() {
    if (keyIsDown(32)) {
      this.visible = !this.visible;
      console.log('space');
    }
  }

  show() {
    // Audio-reactive circle referenced from "Code an Audio Visualizer in p5js (from scratch)" (https://www.youtube.com/watch?v=uk96O7N1Yo0&t=497s&ab_channel=ColorfulCoding)
    if (this.visible) {
      var wave = bassFFT.waveform();

      for (var t = -1; t <= 1; t += 2) {
        noFill();
        beginShape();

        for (var i = 0; i <= 180; i++) {
          var index = floor(map(i, 0, 180, 0, wave.length - 1));
          var r = map(wave[index], -1, 1, this.radiusMin, this.radiusMax);
          var x = r * sin(i) * t;
          var y = r * cos(i);
          vertex(x, y);
        }

        endShape();
      }
    }
  }
}

// Button pressing function
// Apply an if-else statement for when the button is clicked vs. not
// Minimum: keyboard buttons to trigger audio
function mouseClicked() {
  if (bass.isPlaying() || music.isPlaying() || drums.isPlaying() || vocals.isPlaying()) {
    music.pause();
    vocals.pause();
    bass.pause();
    drums.pause();
  } else {
    music.play();
    vocals.play();
    bass.play();
    drums.play();
  }
}
