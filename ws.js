function startWebsocket() {
  var ws = new WebSocket('ws://192.168.100.1:1880/websocket');

  ws.onmessage = function (e) {
    //console.log('websocket message event:', e);
    const data = e.data;
    console.log(data);

    if (data === 'up') {
      window.location.href = 'page1.html';
    }

    if (data === 'right') {
      window.location.href = 'page2.html';
    }

    if (data === 'down') {
      window.location.href = 'page3.html';
    }

    if (data === 'left') {
      window.location.href = 'page4.html';
    }
  };

  ws.onclose = function () {
    // connection closed, discard old websocket and create a new one in 5s
    ws = null;
    setTimeout(startWebsocket, 5000);
  };
}

startWebsocket();
