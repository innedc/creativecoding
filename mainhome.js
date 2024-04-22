import './stylehome.css';

var c = document.getElementById('Canvas');
var ctx = c.getContext('2d');

var cwidth = 512;
var cheight = 512;
c.width = cwidth;
c.height = cheight;

ctx.fillStyle = '#1f1f1f';
ctx.fillRect(0, 0, cwidth, cheight);

ctx.lineWidth = 2;
ctx.lineCap = '';

var nextV = Math.random() * 40;
var lastV = Math.random() * -40;
var vCounter = 0;
var vAngle = 6;
var colorScale = 0;
var nextC = 20;

Run();
function Run() {
  vCounter = (vCounter + 1) % nextC;

  if (vCounter == 0) {
    lastV = nextV;
    nextV = Math.random() * 40 * (lastV > 0 ? -1 : 1);
    nextC = Math.round(Math.random() * 6) + 4;
  }

  let f = (1 - Math.cos((vCounter / nextC) * Math.PI)) * 0.5;
  let newWidth = lastV * (1 - f) + nextV * f;

  ctx.fillStyle = 'rgba(0,0,0,0.015)';
  ctx.fillRect(0, 0, cwidth, cheight);

  var newA1 = Math.sin(vAngle * (Math.PI / 2));
  var newA2 = Math.sin((1 - vAngle) * (Math.PI / 2));

  var newX0 = (192 + (newWidth > 0 ? 8 : -8) + newWidth) * newA1;
  var newY0 = (192 + (newWidth > 0 ? 8 : -8) + newWidth) * newA2;

  var newX1 = (192 + newWidth) * newA1;
  var newY1 = (192 + newWidth) * newA2;
  var newX2 = (192 - newWidth) * newA1;
  var newY2 = (192 - newWidth) * newA2;

  ctx.beginPath();
  ctx.arc(256 + newX0, 256 + newY0, 1, 0, 2 * Math.PI);
  ctx.fillStyle = '#a1a1a1';
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(256 + newX1, 256 + newY1);
  ctx.lineTo(256 + newX2, 256 + newY2);

  let newR = 55 + 200 * (1 - Math.abs(1 - Math.max(0, 2 - colorScale)));
  let newG = 55 + 200 * (1 - Math.abs(1 - Math.min(2, 3 - colorScale)));
  let newB = 55 + 200 * Math.max(0, Math.abs(colorScale - 1.5) - 0.5);

  ctx.strokeStyle = 'rgb(' + newR + ', ' + newG + ', ' + newB + ')';
  ctx.stroke();

  vAngle = (vAngle - 0.01) % 4;
  colorScale = (colorScale + 0.01) % 3;

  requestAnimationFrame(Run);
}
