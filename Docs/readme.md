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
- Beamer
- Externe speaker

## Code

Ons project bestaat uit een webapplicatie met een startscherm en vier verschillende muziekvisualisaties, verdeeld over vijf pagina's. Voor elke visualisatie is er een aparte set van HTML-, CSS- en JavaScript-bestanden. De bestanden die bij een specifieke visualisatie horen, zijn genummerd zodat ze gemakkelijk te identificeren zijn. Elk bestand eindigt met hetzelfde nummer om de bijbehorende visualisatie aan te duiden.

Enkele belangrijke code's:

- geluidsvolume analyseren

```html
async function getMicrophone(callback) {   const stream = await
navigator.mediaDevices.getUserMedia({ audio: true, video: false })  
audioContext = new AudioContext();   analyser = audioContext.createAnalyser();  
microphone = audioContext.createMediaStreamSource(stream);   javascriptNode =
audioContext.createScriptProcessor(2048, 1, 1);   analyser.smoothingTimeConstant
= 0.8;   analyser.fftSize = 1024;   microphone.connect(analyser);  
analyser.connect(javascriptNode);  
javascriptNode.connect(audioContext.destination);  
javascriptNode.onaudioprocess = function() {     let array = new
Uint8Array(analyser.frequencyBinCount);    
analyser.getByteFrequencyData(array);     let values = 0;     let length =
array.length;     for (let i = 0; i < length; i++) {       values += (array[i]);
    }     let average = values / length;     if (callback) callback(average);  
} } let lastValue = 0; function microphoneSuccess(volume) {  
console.log(volume);   lastValue = volume; } getMicrophone(microphoneSuccess);
setInterval(()=> {   document.getElementById("meter").textContent=lastValue;  
window.navigator.vibrate([lastValue*1.5]) }, 200)
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
