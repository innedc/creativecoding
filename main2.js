import './style2.css';
import timer from './timer.js';

timer();

let { sin, cos, PI } = Math;
// Creating canvas and getting 2d context
let c = document.querySelector('#visualizer').getContext('2d');

// Getting canvas from context
let canvas = c.canvas;

// Common
let frame = 0;
let vertices = [];
let cubeSize = 11;

// Creating HTMLAudioElement
let audio = new Audio();
audio.crossOrigin = 'anonymous';

// AudioContext, analyser and media element source, to make visualization
let ac;
let an;
let sr;

// Spectrum array
let spectrumData;
let spectrumRenderCount = 20; // How much lines of spectrum will render

// Rendering visualization
let oldTimeStamp = performance.now();
let loop = function (timeStamp = performance.now()) {
  let rad = (frame / 2 / 128) * PI;

  const dt = (timeStamp - oldTimeStamp) / 800;
  oldTimeStamp = timeStamp;

  // Resize canvas
  if (
    canvas.width !== canvas.offsetWidth ||
    canvas.height !== canvas.offsetHeight
  ) {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  frame += dt * 20;
  if (an) an.getByteFrequencyData(spectrumData);
  c.fillStyle = `hsl(${frame + 90}deg, 100%, 3%)`;
  c.globalAlpha = 1;
  c.fillRect(0, 0, canvas.width, canvas.height);
  c.globalAlpha = 1;

  c.save();
  c.translate(canvas.width / 2, canvas.height / 2);

  const colors = ['#ff69cc', '#ffffff', '#0000ed', '#ff932e', '#833f00'];

  for (let i = 0; i < vertices.length; i++) {
    let value = spectrumData
      ? spectrumData[i % spectrumRenderCount] / 6 + 1
      : 0;
    let vertex = vertices[i];
    let x = vertex[0];
    let y = vertex[1];
    let z = vertex[2];

    // Get distance to center
    let dist = cubeSize / 10 - Math.sqrt(x ** 2 + y ** 2 + z ** 2);

    let tx = x * cos(rad) + sin(rad) * z;
    let tz = -x * sin(rad) + cos(rad) * z;
    let ty = y;

    // Apply transform
    x = tx;
    y = ty;
    z = tz;

    // Apply transform
    x = tx;
    y = ty;

    // Translate cube
    z -= 65;

    // Make reaction on spectrum
    z += value;
    y += value / 100;

    // Distort animation
    x += Math.cos(frame / 80 + y / 5);
    y += Math.sin(frame / 80 + z / 3);

    // Make perspective
    x /= z / canvas.height / 2;
    y /= z / canvas.height / 2;

    // Determine color based on vertex index
    let colorIndex = i % colors.length;
    c.fillStyle = colors[colorIndex];

    // Drawing vertex
    c.fillRect(x - dist / 2, y - dist / 2, dist, dist);
  }

  c.restore();

  requestAnimationFrame(loop);
};

// Connecting analyser to audio
audio.src = '../Muziek/giocosa-3.mp3';
audio.oncanplaythrough = function () {
  ac = new AudioContext();
  sr = ac.createMediaElementSource(audio);
  an = ac.createAnalyser();

  spectrumData = new Uint8Array(an.frequencyBinCount);

  // Setting analyser
  an.fftSize = 128;
  an.smoothingTimeConstant = 0.9;

  sr.connect(an);
  an.connect(ac.destination);

  audio.play();
};

for (let i = 0; i < cubeSize ** 3; i++) {
  let x = i % cubeSize;
  let y = ((i / cubeSize) >> 0) % cubeSize;
  let z = (i / cubeSize ** 2) >> 0;

  // Offset
  x -= cubeSize / 2 - 0.5;
  y -= cubeSize / 2 - 0.5;
  z -= cubeSize / 2 - 0.5;

  vertices.push([x, y, z]);
}

loop();
