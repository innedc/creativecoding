# Synesthopia

![Synesthopia](/Docs/Synesthopia.png)

## Concept

Synesthopia is een interactieve muziekvisualisatie gemaakt voor mensen die slechthorend of doof zijn. De muziek wordt omgezet in visuele voorstelling met kleur en bewegingen. Deze bewegingen geven het ritme van de nummers aan.

Binnen in de doos van de joystick zit er een gsm die trillingen doorgeeft zodat je met je hand de trillingen van de muziek kan voelen.
Voor de muziek hebben we samen gewerkt met Astrid Mertens van het Koninklijk Conservatorium Anwtwerpen. Zij heeft voor ons 4 nummers op haar gitaar gespeeld en deze hebben we gebruikt in dit project.

De nummers die Astrid gespeeld heeft zijn:

1. Country road - John Denver
2. Fly me to the moon - Frank Sinatra
3. Sonata giocosa III - Joaquin Rodrigo
4. La Caterdral II - Barrios Mangoré

## Video

## Benodigheden

- Raspberry Pi
- Visual Studio Code
- Node Red
- Joystick
- 3 mm houte doos
- Oude gsm(s)
- Beamer
- Externe speaker

## Code

Ons project bestaat uit een webapplicatie met een startscherm en vier verschillende muziekvisualisaties, verdeeld over vijf pagina's. Voor elke visualisatie is er een aparte set van HTML-, CSS- en JavaScript-bestanden. De bestanden die bij een specifieke visualisatie horen, zijn genummerd zodat ze gemakkelijk te identificeren zijn. Elk bestand eindigt met hetzelfde nummer om de bijbehorende visualisatie aan te duiden.

Enkele belangrijke code's:

- WebSocket-verbinding
- timerfunctie
- audioSetup
- geluidsvolume analyseren

### Websocket-verbinding

De onderstaande JavaScript-code creëert een WebSocket-verbinding die reageert op joystickbewegingen door de gebruiker naar verschillende webpagina's te leiden. Wanneer de joystick naar boven, rechts, beneden of links wordt bewogen, wordt respectievelijk pagina 1, 2, 3 of 4 geladen. Dit is in combinatie met de Node red.

```javascript
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
```

### Timerfunctie

De functie `timer`, die wordt geëxporteerd als de standaardfunctionaliteit, zorgt ervoor dat na een bepaalde tijd de gebruiker automatisch wordt doorgestuurd naar de hoofdpagina, 'index.html'. Specifiek, nadat twee minuten zijn verstreken, wordt de huidige pagina automatisch herladen en vervangen door de hoofdpagina. Dit wordt bereikt door een timer in te stellen die na de opgegeven tijd de actie uitvoert.

```Javascript
export default function timer() {
  setTimeout(
    () => {
      location.href = 'index.html';
    },
    2 * 60 * 1000,
  );
}

```

### AudioSetup

De `audioSetup` functie maakt een audio-element, stelt de bron in, schakelt bedieningsknoppen uit, en zorgt ervoor dat het automatisch herhaald en afgespeeld wordt. Een AudioContext wordt gecreëerd om audio te beheren, en een Analyser-node wordt toegevoegd om de audio te analyseren. Deze Analyser-node wordt verbonden met de audio-uitvoer en ingesteld voor vloeiende analyse. Tot slot wordt het audio-element als bron verbonden met de Analyser zodat de audio geanalyseerd kan worden terwijl het wordt afgespeeld.

```javascript
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
```

### Geluidsvolume analyseren (Externe code)

Hier is een uitleg van een JavaScript-functie die je microfoon gebruikt om het geluidsvolume te analyseren. Word uitgevoerd op een externe GSM:

De `getMicrophone` functie gebruikt een API om toegang te krijgen tot je microfoon en vraagt om een audiostream. Het creëert een AudioContext, maakt een AnalyserNode en een MediaStreamSource aan, en gebruikt een ScriptProcessorNode voor audioprocessing.

De analyser verzamelt frequentiegegevens en berekent het gemiddelde volume van het geluid, dat wordt doorgegeven aan een callback-functie. Een globale variabele `lastValue` slaat het laatst gemeten volume op en de `microphoneSuccess` functie logt dit naar de console.

Elke 200 milliseconden wordt de gemeten waarde weergegeven in een HTML-element met id "meter" en trilt het apparaat op basis van het gemeten volume, aangepast met een factor van 1.5.

Hieronder zie je de HTML en Javascript

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite App</title>
    <script defer="module" src="/main.js"></script>
  </head>
  <body>
    <div id="meter"></div>
  </body>
</html>
```

```javascript
async function getMicrophone(callback) {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false,
  });
  audioContext = new AudioContext();
  analyser = audioContext.createAnalyser();
  microphone = audioContext.createMediaStreamSource(stream);
  javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);
  analyser.smoothingTimeConstant = 0.8;
  analyser.fftSize = 1024;
  microphone.connect(analyser);
  analyser.connect(javascriptNode);
  javascriptNode.connect(audioContext.destination);
  javascriptNode.onaudioprocess = function () {
    let array = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);
    let values = 0;
    let length = array.length;
    for (let i = 0; i < length; i++) {
      values += array[i];
    }
    let average = values / length;
    if (callback) callback(average);
  };
}
let lastValue = 0;
function microphoneSuccess(volume) {
  console.log(volume);
  lastValue = volume;
}
getMicrophone(microphoneSuccess);
setInterval(() => {
  document.getElementById('meter').textContent = lastValue;
  window.navigator.vibrate([lastValue * 1.5]);
}, 200);
```

## NodeRed

## Makercase

Voor de joystick hebben we een doos gemaakt met www.makercase.com en de makerspace van AP.
Via Illustrator hebben we een plank toegevoegd waar we onze raspberry op kunnen plaatsen. Onder de plank is er plaats voorzien om een laptop in te zetten met een gat aan de zijkant voor de kabels van de beamer.

![Makercase file 1](/Docs/makercase1.png)

Ook is er een gat aan de bovenkant in het midden toegevoegd om de joystick in te steken.
Op de plank is er een gat voorzien voor de draden van de Raspberry.

![Makercase file 2](/Docs/makercase2.png)

## Valkuil

Een valkuil ligt bij de trillingen. Hiervoor hadden we een gsm gebruikt maar die was te zwak om de trillingen deftig te laten doorkomen. Achteraf gezien was het beter geweest als we meerdere gsm’s hadden. Om zo het trillen te versterken.

## Tip

Als je ook trillingen met een gsm wilt toevoegen dan is het aan te raden om meerder gsm’s te gebruiken.
