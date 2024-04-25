import './style4.css';
var audio, audioContext, audioSrc;
var analyser, analyserBufferLength;

var w;
var h;

var center2D;

var btStart;
var canvas;
var context;

var imageData;
var data;

var fov = 250;
var speed = 0.5;

var particles = [];
var time = 0;
var centerPosition = { x: 0, y: 0 };
var colorInvertValue = 0;

function init() {
  canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  context = canvas.getContext('2d');
  window.addEventListener('resize', onResize);

  onResize();
  addParticles();
  render();
  clearImageData();
  render();

  context.putImageData(imageData, 0, 0);

  btStart = document.getElementById('btStartAudioVisualization');
  btStart.addEventListener('mousedown', userStart, false);

  // Automatically start the audio visualization when the page loads
  userStart();
}

function userStart() {
  btStart.removeEventListener('mousedown', userStart);
  btStart.addEventListener('mousedown', audioBtHandler, false);
  audioSetup();
  animate();
}

function audioSetup() {
  audio = new Audio();
  audio.src = '../Muziek/fly-me-to-the-moon.mp3';
  audio.controls = false;
  audio.loop = true;
  audio.autoplay = true;
  audio.crossOrigin = 'anonymous';
  audio.addEventListener('canplaythrough', audioLoaded, false);
  audioContext = new (window.AudioContext || window.webkitAudioContext)();

  analyser = audioContext.createAnalyser();
  analyser.connect(audioContext.destination);
  analyser.smoothingTimeConstant = 0.65;
  analyser.fftSize = 512 * 32; //circleSegments * 32;
  analyserBufferLength = analyser.frequencyBinCount;

  audioSrc = audioContext.createMediaElementSource(audio);
  audioSrc.connect(analyser);
}

function audioLoaded(event) {
  txtStatus.style.display = 'none';
}

function audioBtHandler(event) {
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
}

function clearImageData() {
  for (var i = 0, l = data.length; i < l; i += 4) {
    data[i] = 0;
    data[i + 1] = 0;
    data[i + 2] = 0;
    data[i + 3] = 0;
  }
}

function setPixel(x, y, r, g, b, a) {
  var i = (x + y * imageData.width) * 4;

  data[i] = r;
  data[i + 1] = g;
  data[i + 2] = b;
  data[i + 3] = a;
}

function drawLine(x1, y1, x2, y2, r, g, b, a) {
  var dx = Math.abs(x2 - x1);
  var dy = Math.abs(y2 - y1);

  var sx = x1 < x2 ? 1 : -1;
  var sy = y1 < y2 ? 1 : -1;

  var err = dx - dy;

  var lx = x1;
  var ly = y1;

  while (true) {
    if (lx > 0 && lx < w && ly > 0 && ly < h) {
      setPixel(lx, ly, r, g, b, a);
    }

    if (lx === x2 && ly === y2) break;
    var e2 = 20 * err;

    if (e2 > -dx) {
      err -= dy;
      lx += sx;
    }

    if (e2 < dy) {
      err += dx;
      ly += sy;
    }
  }
}

function getCirclePosition(centerX, centerY, radius, index, segments) {
  var angle = index * ((Math.PI * 2) / segments) + time;
  var x = centerX + Math.cos(angle) * radius;
  var y = centerY + Math.sin(angle) * radius;

  return { x: x, y: y };
}

function drawCircle(centerPosition, radius, segments) {
  var coordinates = [];
  var radiusSave;
  var diff = Math.floor(Math.random() * segments);

  for (var i = 0; i <= segments; i++) {
    var radiusRandom = radius; // + ( radius / 8 );
    if (i === 0) {
      radiusSave = radiusRandom;
    }

    if (i === segments) {
      radiusRandom = radiusSave;
    }

    var centerX = centerPosition.x;
    var centerY = centerPosition.y;

    var position = getCirclePosition(
      centerX,
      centerY,
      radiusRandom,
      i,
      segments,
    );

    coordinates.push({
      x: position.x,
      y: position.y,
      index: i + diff,
      radius: radiusRandom,
      segments: segments,
      centerX: centerX,
      centerY: centerY,
    });
  }
  return coordinates;
}

function addParticle(x, y, z, audioBufferIndex) {
  var particle = {};
  particle.x = x;
  particle.y = y;
  particle.z = z;
  particle.x2d = 0;
  particle.y2d = 0;
  particle.audioBufferIndex = audioBufferIndex;
  return particle;
}

function addParticles() {
  var audioBufferIndexMin = 50;
  var audioBufferIndexMax = 80;
  var audioBufferIndex = audioBufferIndexMin;

  var centerPosition = { x: 0, y: 0 };

  for (var z = -fov; z < fov; z += 25) {
    var coordinates = drawCircle(centerPosition, 0, 150);
    var particlesRow = [];

    for (var i = 0, l = coordinates.length; i < l; i++) {
      var coordinate = coordinates[i];
      var particle = addParticle(
        coordinate.x,
        coordinate.y,
        z,
        audioBufferIndex,
      );
      particle.index = coordinate.index;
      particle.radius = coordinate.radius;
      particle.radiusAudio = particle.radius;
      particle.segments = coordinate.segments;
      particle.centerX = coordinate.centerX;
      particle.centerY = coordinate.centerY;
      particlesRow.push(particle);

      audioBufferIndex++;

      if (audioBufferIndex > audioBufferIndexMax) {
        audioBufferIndex = audioBufferIndexMin;
      }
    }
    particles.push(particlesRow);
  }
}

function onResize() {
  w =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;
  h =
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight;

  center2D = { x: w / 2, y: h / 2 };

  canvas.width = w;
  canvas.height = h;

  imageData = context.getImageData(0, 0, w, h);
  data = imageData.data;
}

function render() {
  var frequencySource;
  if (analyser) {
    frequencySource = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(frequencySource);
  }

  var sortArray = false;
  for (var i = 0, l = particles.length; i < l; i++) {
    var particlesRow = particles[i];
    for (var j = 0, k = particlesRow.length; j < k; j++) {
      var particle = particlesRow[j];
      var scale = fov / (fov + particle.z);

      particle.x2d = particle.x * scale + center2D.x;
      particle.y2d = particle.y * scale + center2D.y;

      if (analyser) {
        var frequency = frequencySource[particle.audioBufferIndex];
        var frequencyAdd = frequency / 10;
        particle.radiusAudio = particle.radius + frequencyAdd;
      } else {
        particle.radiusAudio = particle.radius; // + Math.random() * 4;
      }

      particle.z -= speed;
      if (particle.z < -fov) {
        particle.z += fov * 2;
        sortArray = true;
      }

      if (j > 0) {
        var p = particlesRow[j - 1];
        // Define three predetermined colors
        const colors = [
          [252, 109, 39],
          [178, 4, 86],
          [0, 0, 0],
        ];

        // Modify getRandomColor() function to return one of the predetermined colors
        function getRandomColor() {
          // Generate a random index to select a color from the colors array
          const randomIndex = Math.floor(Math.random() * colors.length);
          return colors[randomIndex];
        }

        // Inside the code block where the color is obtained
        // Replace var color = getRandomColor(); with:
        var color = colors[j % colors.length];

        drawLine(
          particle.x2d | 0,
          particle.y2d | 0,
          p.x2d | 0,
          p.y2d | 0,
          color[0],
          color[1],
          color[2],
          255, // Use the random color for the line
        );
      }

      var position;
      if (j < k - 1) {
        position = getCirclePosition(
          particle.centerX,
          particle.centerY,
          particle.radiusAudio,
          particle.index,
          particle.segments,
        );
      } else {
        var p1 = particlesRow[0];
        position = getCirclePosition(
          p1.centerX,
          p1.centerY,
          p1.radiusAudio,
          p1.index,
          p1.segments,
        );
      }

      particle.x = position.x;
      particle.y = position.y;
    }
  }

  if (sortArray) {
    particles = particles.sort(function (a, b) {
      return b[0].z - a[0].z;
    });
  }
}

function animate() {
  clearImageData();
  render();
  context.putImageData(imageData, 0, 0);
  requestAnimationFrame(animate);
}

window.requestAnimFrame = function () {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
};

init();

audio.play();
