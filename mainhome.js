import './stylehome.css';

var loadTimeOut = function () {
  var soundWave = $('.sound-wave .bar').removeClass('bar');
  setTimeout(function () {
    alert('Hello');
  }, 3000);
};

$('.sound-wave .bar').addClass('bar2');

// loadTimeOut();
