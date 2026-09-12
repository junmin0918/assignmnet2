const video = document.getElementById("custom-video-player");
const audio = document.getElementById("audio");

const player = document.querySelector(".media-player");
const splash = document.querySelector(".splash");

let audioContext;
let analyser;
let source;

let previousBass = 0;
let lastBeatTime = 0;


function togglePlayPause() {

  if (video.paused) {

    video.play();

    audio.currentTime = 0;

    audio.play().catch(function(error) {
      console.log("Audio error:", error);
    });

    startAudioAnalysis();

    video.classList.add("playing");
    player.classList.add("playing");

  } else {

    video.pause();
    audio.pause();

    video.classList.remove("playing");
    player.classList.remove("playing");

  }

}


function startAudioAnalysis() {

  if (!audioContext) {

    audioContext = new AudioContext();

    analyser = audioContext.createAnalyser();

    analyser.fftSize = 256;

    source = audioContext.createMediaElementSource(audio);

    source.connect(analyser);

    analyser.connect(audioContext.destination);

  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  analyseMusic();
}


function analyseMusic() {

  if (video.paused) {
    return;
  }

  const data = new Uint8Array(analyser.frequencyBinCount);

  analyser.getByteFrequencyData(data);


  // Overall music intensity

  let total = 0;

  for (let i = 0; i < data.length; i++) {
    total += data[i];
  }

  const average = total / data.length;


  // Music strength: 0 - 1

  const beatStrength = average / 255;

  player.style.setProperty("--beat-strength", beatStrength);


  // Look at low frequencies (bass / kick)

  let bassTotal = 0;

  for (let i = 0; i < 10; i++) {
    bassTotal += data[i];
  }

  const bass = bassTotal / 10;


  // Detect a sudden increase in bass

  const now = performance.now();


  if (
    bass > 40 &&
    bass > previousBass * 1.3 &&
    now - lastBeatTime > 200
  ) {

    console.log("💥 BEAT!", bass);

    lastBeatTime = now;


    // Decide how many liquid particles to create

    const particleCount = Math.max(
      2,
      Math.floor((bass / 255) * 16)
    );


    // Create particles one after another

    for (let i = 0; i < particleCount; i++) {

      setTimeout(() => {
        spawnLiquid();
      }, i * 80);

    }


    // Stronger beat = larger explosion distance

    const beatDistance = 1 + (bass / 255) * 1.8;

    player.style.setProperty(
      "--beat-distance",
      beatDistance
    );

  }


  previousBass = bass;

  console.log("Beat strength:", beatStrength);


  requestAnimationFrame(analyseMusic);

}



// =========================
// CREATE ONE LIQUID PARTICLE
// =========================

function spawnLiquid() {

  const liquid = document.createElement("span");

  liquid.className = "dynamic-liquid";


  // =========================
  // RANDOM START POSITION
  // =========================

  const startX = (Math.random() - 0.5) * 400;

  liquid.style.left = `${startX}px`;

  liquid.style.top = "-300px";


  // =========================
  // RANDOM PURPLE / PINK COLOR
  // =========================

  const colors = [
    "#a855f7",
    "#ff2bd6",
    "#c026d3",
    "#e879f9",
    "#ec4899",
    "#8b5cf6",
    "#d946ef"
  ];

  const color =
    colors[Math.floor(Math.random() * colors.length)];

  liquid.style.background = color;

  liquid.style.color = color;


  // =========================
  // GET BEAT STRENGTH
  // =========================

  const beatDistance =
    parseFloat(
      getComputedStyle(player)
        .getPropertyValue("--beat-distance")
    ) || 1;


  // =========================
  // RANDOM EXPLOSION DIRECTION
  // =========================

  const angle =
    Math.random() * Math.PI * 2;


  // =========================
  // EXPLOSION DISTANCE
  // STRONGER BEAT = FARTHER
  // =========================

  const distance =
    (120 + Math.random() * 160) * beatDistance;


  const burstX =
    Math.cos(angle) * distance;


  const burstY =
    Math.sin(angle) * distance;


  // =========================
  // GIVE PARTICLE ITS DIRECTION
  // =========================

  liquid.style.setProperty(
    "--burst-x",
    `${burstX}px`
  );

  liquid.style.setProperty(
    "--burst-y",
    `${burstY}px`
  );


  // =========================
  // ADD PARTICLE
  // =========================

  splash.appendChild(liquid);


  // =========================
  // START FALLING
  // =========================

  requestAnimationFrame(() => {

    liquid.classList.add("falling");

  });


  // =========================
  // REMOVE AFTER ANIMATION
  // =========================

  setTimeout(() => {

    liquid.remove();

  }, 1600);
}