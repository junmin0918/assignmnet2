// =========================
// GET ELEMENTS
// =========================

const video = document.getElementById("custom-video-player");
const audio = document.getElementById("audio");

const player = document.querySelector(".media-player");
const splash = document.querySelector(".splash");

const playPauseImg = document.getElementById("play-pause-img");
const rewindBackBtn = document.getElementById("rewind-back-btn");
const rewindForwardBtn = document.getElementById("rewind-forward-btn");


// =========================
// AUDIO ANALYSIS VARIABLES
// =========================

let audioContext;
let analyser;
let source;

let previousBass = 0;
let lastBeatTime = 0;


// =========================
// PLAY / PAUSE
// =========================

function togglePlayPause() {

  console.log("PLAY BUTTON CLICKED");

  if (video.paused) {

    // Play video
    video.play().catch(function(error) {
      console.log("Video error:", error);
    });


    // Restart music from beginning
    audio.currentTime = 0;


    // Play music
    audio.play().catch(function(error) {
      console.log("Audio error:", error);
    });


    // Start audio analysis
    startAudioAnalysis();


    // Add playing effects
    video.classList.add("playing");
    player.classList.add("playing");


    // Change icon to pause
    if (playPauseImg) {
      playPauseImg.src = "image/pause.svg";
      playPauseImg.alt = "Pause";
    }

  } else {

    // Pause video
    video.pause();

    // Pause music
    audio.pause();


    // Remove playing effects
    video.classList.remove("playing");
    player.classList.remove("playing");


    // Change icon back to play
    if (playPauseImg) {
      playPauseImg.src = "image/play.svg";
      playPauseImg.alt = "Play";
    }

  }

}


// =========================
// START AUDIO ANALYSIS
// =========================

function startAudioAnalysis() {

  console.log("Starting audio analysis");


  if (!audioContext) {

    audioContext = new AudioContext();

    analyser = audioContext.createAnalyser();

    analyser.fftSize = 256;


    source = audioContext.createMediaElementSource(audio);

    source.connect(analyser);

    analyser.connect(audioContext.destination);

  }


  // Resume AudioContext if browser suspended it

  if (audioContext.state === "suspended") {

    audioContext.resume();

  }


  analyseMusic();

}


// =========================
// ANALYSE MUSIC
// =========================

function analyseMusic() {

  // Stop analysing when video is paused

  if (video.paused) {
    return;
  }


  const data =
    new Uint8Array(analyser.frequencyBinCount);


  analyser.getByteFrequencyData(data);


  // =========================
  // OVERALL MUSIC STRENGTH
  // =========================

  let total = 0;

  for (let i = 0; i < data.length; i++) {

    total += data[i];

  }


  const average =
    total / data.length;


  const beatStrength =
    average / 255;


  player.style.setProperty(
    "--beat-strength",
    beatStrength
  );


  // =========================
  // BASS DETECTION
  // =========================

  let bassTotal = 0;


  for (let i = 0; i < 10; i++) {

    bassTotal += data[i];

  }


  const bass =
    bassTotal / 10;


  // =========================
  // BEAT DETECTION
  // =========================

  const now =
    performance.now();


  if (
    bass > 40 &&
    bass > previousBass * 1.3 &&
    now - lastBeatTime > 200
  ) {

    console.log("💥 BEAT!", bass);


    lastBeatTime =
      now;


    // =========================
    // PARTICLE COUNT
    // =========================

    const particleCount =
      Math.max(
        2,
        Math.floor((bass / 255) * 16)
      );


    // =========================
    // CREATE LIQUID
    // =========================

    for (
      let i = 0;
      i < particleCount;
      i++
    ) {

      setTimeout(
        function() {

          spawnLiquid();

        },
        i * 80
      );

    }


    // =========================
    // STRONGER BEAT
    // = BIGGER EXPLOSION
    // =========================

    const beatDistance =
      1 + (bass / 255) * 1.8;


    player.style.setProperty(
      "--beat-distance",
      beatDistance
    );

  }


  previousBass =
    bass;


  requestAnimationFrame(
    analyseMusic
  );

}


// =========================
// CREATE LIQUID PARTICLE
// =========================

function spawnLiquid() {

  const liquid =
    document.createElement("span");


  liquid.className =
    "dynamic-liquid";


  // =========================
  // RANDOM START POSITION
  // =========================

  const startX =
    (Math.random() - 0.5) * 400;


  liquid.style.left =
    `${startX}px`;


  liquid.style.top =
    "-300px";


  // =========================
  // RANDOM COLORS
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
    colors[
      Math.floor(
        Math.random() * colors.length
      )
    ];


  liquid.style.background =
    color;


  liquid.style.color =
    color;


  // =========================
  // GET BEAT DISTANCE
  // =========================

  const beatDistance =
    parseFloat(
      getComputedStyle(player)
        .getPropertyValue(
          "--beat-distance"
        )
    ) || 1;


  // =========================
  // RANDOM DIRECTION
  // =========================

  const angle =
    Math.random() *
    Math.PI *
    2;


  // =========================
  // RANDOM DISTANCE
  // =========================

  const distance =
    (
      120 +
      Math.random() * 160
    ) *
    beatDistance;


  const burstX =
    Math.cos(angle) *
    distance;


  const burstY =
    Math.sin(angle) *
    distance;


  // =========================
  // SET DIRECTION
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
  // ADD TO SPLASH
  // =========================

  splash.appendChild(
    liquid
  );


  // =========================
  // START ANIMATION
  // =========================

  requestAnimationFrame(
    function() {

      liquid.classList.add(
        "falling"
      );

    }
  );


  // =========================
  // REMOVE PARTICLE
  // =========================

  setTimeout(
    function() {

      liquid.remove();

    },
    1600
  );

}


// =========================
// REWIND BACK
// -10 SECONDS
// =========================

if (rewindBackBtn) {

  rewindBackBtn.addEventListener(
    "click",
    function() {

      video.currentTime =
        Math.max(
          0,
          video.currentTime - 10
        );


      audio.currentTime =
        Math.max(
          0,
          audio.currentTime - 10
        );

    }
  );

}


// =========================
// REWIND FORWARD
// +10 SECONDS
// =========================

if (rewindForwardBtn) {

  rewindForwardBtn.addEventListener(
    "click",
    function() {

      video.currentTime =
        Math.min(
          video.duration || Infinity,
          video.currentTime + 10
        );


      audio.currentTime =
        Math.min(
          audio.duration || Infinity,
          audio.currentTime + 10
        );

    }
  );

}


// =========================
// VIDEO TABS
// =========================

const videoTabs =
  document.querySelectorAll(
    ".video-tab"
  );


videoTabs.forEach(
  function(tab) {

    tab.addEventListener(
      "click",
      function() {

        videoTabs.forEach(
          function(t) {

            t.classList.remove(
              "active"
            );

          }
        );


        tab.classList.add(
          "active"
        );

      }
    );

  }
);