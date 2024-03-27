import './style3.css';

let canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d');

canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;

let centerX = canvas.width / 2;
let centerY = canvas.height / 2;
let radius = document.body.clientWidth <= 425 ? 120 : 160;
let steps = document.body.clientWidth <= 425 ? 60 : 120;
let interval = 360 / steps;
let pointsUp = [];
let pointsDown = [];
let running = false;
let pCircle = 2 * Math.PI * radius;
let angleExtra = 90;

// Create points
for (let angle = 0; angle < 360; angle += interval) {
  let distUp = 1.1;
  let distDown = 0.9;

  pointsUp.push({
    angle: angle + angleExtra,
    x:
      centerX +
      radius * Math.cos(((-angle + angleExtra) * Math.PI) / 180) * distUp,
    y:
      centerY +
      radius * Math.sin(((-angle + angleExtra) * Math.PI) / 180) * distUp,
    dist: distUp,
  });

  pointsDown.push({
    angle: angle + angleExtra + 5,
    x:
      centerX +
      radius * Math.cos(((-angle + angleExtra + 5) * Math.PI) / 180) * distDown,
    y:
      centerY +
      radius * Math.sin(((-angle + angleExtra + 5) * Math.PI) / 180) * distDown,
    dist: distDown,
  });
}

// -------------
// Audio stuff
// -------------

// make a Web Audio Context
const context = new AudioContext();
const splitter = context.createChannelSplitter();

const analyserL = context.createAnalyser();
analyserL.fftSize = 8192;

const analyserR = context.createAnalyser();
analyserR.fftSize = 8192;

splitter.connect(analyserL, 0, 0);
splitter.connect(analyserR, 1, 0);

// Make a buffer to receive the audio data
const bufferLengthL = analyserL.frequencyBinCount;
const audioDataArrayL = new Uint8Array(bufferLengthL);

const bufferLengthR = analyserR.frequencyBinCount;
const audioDataArrayR = new Uint8Array(bufferLengthR);

// Make a audio node
const audio = new Audio();

function loadAudio() {
  audio.loop = false;
  audio.autoplay = false;
  audio.crossOrigin = 'anonymous';

  // call `handleCanplay` when it music can be played
  audio.addEventListener('canplay', handleCanplay);
  audio.src = '../Muziek/test.mp3';
  audio.load();
  running = true;
}

function handleCanplay() {
  // connect the audio element to the analyser node and the analyser node
  // to the main Web Audio context
  const source = context.createMediaElementSource(audio);
  source.connect(splitter);
  splitter.connect(context.destination);
}

function toggleAudio() {
  if (running === false) {
    loadAudio();
    document.querySelector('.call-to-action').remove();
  }

  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
}

canvas.addEventListener('click', toggleAudio);

document.body.addEventListener('touchend', function (ev) {
  context.resume();
});

// -------------
// Canvas stuff
// -------------

function drawLine(points) {
  let origin = points[0];

  for (let i = 1; i < points.length; i++) {
    let gradient = ctx.createLinearGradient(
      origin.x,
      origin.y,
      points[i].x,
      points[i].y,
    );
    gradient.addColorStop(0, 'rgba(255,192,203,0.5)'); // Light pink
    gradient.addColorStop(1, 'rgba(255,20,147,0.5)'); // Deep pink

    ctx.beginPath();
    ctx.strokeStyle = gradient;
    ctx.lineJoin = 'round';
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(points[i].x, points[i].y);
    ctx.stroke();

    origin = points[i];
    // Increase line width
    ctx.lineWidth = 3;

    // Add more color variation to the gradient
    gradient.addColorStop(0, 'rgba(255, 0, 255, 0.5)'); // Magenta
    gradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.5)'); // Cyan
    gradient.addColorStop(1, 'rgba(255, 255, 0, 0.5)'); // Yellow
  }
}

function connectPoints(pointsA, pointsB) {
  for (let i = 0; i < pointsA.length; i++) {
    let gradient = ctx.createLinearGradient(
      pointsA[i].x,
      pointsA[i].y,
      pointsB[i].x,
      pointsB[i].y,
    );
    gradient.addColorStop(0, 'rgba(255,192,203,0.5)'); // Light pink
    gradient.addColorStop(1, 'rgba(0,0,255,0.5)'); // Deep pink

    ctx.beginPath();
    ctx.strokeStyle = gradient;
    ctx.moveTo(pointsA[i].x, pointsA[i].y);
    ctx.lineTo(pointsB[i].x, pointsB[i].y);
    ctx.stroke();
  }
}

function update(dt) {
  let audioIndex, audioValue;

  // get the current audio data
  analyserL.getByteFrequencyData(audioDataArrayL);
  analyserR.getByteFrequencyData(audioDataArrayR);

  for (let i = 0; i < pointsUp.length; i++) {
    audioIndex =
      Math.ceil(pointsUp[i].angle * (bufferLengthL / (pCircle * 3))) | 0;
    // get the audio data and make it go from 0 to 1
    audioValue = audioDataArrayL[audioIndex] / 255;

    pointsUp[i].dist = 1.1 + audioValue * 0.8;
    pointsUp[i].x =
      centerX +
      radius *
        Math.cos((-pointsUp[i].angle * Math.PI) / 180) *
        pointsUp[i].dist;
    pointsUp[i].y =
      centerY +
      radius *
        Math.sin((-pointsUp[i].angle * Math.PI) / 180) *
        pointsUp[i].dist;

    audioIndex =
      Math.ceil(pointsDown[i].angle * (bufferLengthR / (pCircle * 3))) | 0;
    // get the audio data and make it go from 0 to 1
    audioValue = audioDataArrayR[audioIndex] / 255;

    pointsDown[i].dist = 0.9 + audioValue * 0.2;
    pointsDown[i].x =
      centerX +
      radius *
        Math.cos((-pointsDown[i].angle * Math.PI) / 180) *
        pointsDown[i].dist;
    pointsDown[i].y =
      centerY +
      radius *
        Math.sin((-pointsDown[i].angle * Math.PI) / 180) *
        pointsDown[i].dist;
  }
}

function draw(dt) {
  requestAnimationFrame(draw);

  if (running) {
    update(dt);
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawLine(pointsUp);
  drawLine(pointsDown);
  connectPoints(pointsUp, pointsDown);
}

draw();
