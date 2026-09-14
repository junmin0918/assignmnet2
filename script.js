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


// =========================
// PLAY / PAUSE
// =========================

function togglePlayPause() {

  console.log("PLAY BUTTON CLICKED");

  if (video.paused) {

    // Restart video from beginning
    video.currentTime = 0;

    // Restart music from beginning
    audio.currentTime = 0;

    // Play video
    video.play().catch(function(error) {
      console.log("Video error:", error);
    });

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


  // Continue analysing music
  // but DO NOT create liquid from the beat

  requestAnimationFrame(
    analyseMusic
  );

}


// =========================
// CREATE LIQUID PARTICLE
// =========================

function spawnLiquid(speed = 1) {

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
  // SPEED STRENGTH
  // =========================

  const speedStrength =
    Math.min(speed / 10, 3);


  // =========================
  // RANDOM DIRECTION
  // =========================

  const angle =
    Math.random() *
    Math.PI *
    2;


  // =========================
  // DISTANCE BASED ON
  // SCRATCH SPEED
  // =========================

  const distance =
    80 +
    Math.random() * 120 +
    speedStrength * 80;


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
  // SPEED BASED SIZE
  // =========================

  const size =
    0.7 +
    Math.min(speed / 15, 0.8);

  liquid.style.transform =
    `translate(0, 0) scale(${size})`;


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


// =========================
// LIKE BUTTON
// =========================

const likeBtn =
  document.getElementById("like-btn");

const likeCount =
  document.getElementById("like-count");

let likes = 0;

likeBtn.addEventListener(
  "click",
  function() {

    likes++;

    likeCount.textContent =
      likes;

  }
);


// =========================
// VINYL DISC
// =========================

const disc =
  document.querySelector(".disc");

let isDraggingDisc = false;

let lastMouseX = 0;

let discRotation = 0;


// =========================
// SCRATCH AUDIO
// =========================

let scratchAudioContext;
let scratchSource;
let scratchGain;
let scratchFilter;
let scratchOscillator;
let scratchOscGain;


// =========================
// START DISC DRAG
// =========================

disc.addEventListener(
  "mousedown",
  function(event) {

    isDraggingDisc = true;

    lastMouseX =
      event.clientX;

  }
);


// =========================
// DISC MOVEMENT
// =========================

document.addEventListener(
  "mousemove",
  function(event) {

    if (!isDraggingDisc) return;


    // =========================
    // CALCULATE MOVEMENT
    // =========================

    const movement =
      event.clientX -
      lastMouseX;

    const speed =
      Math.abs(movement);


    // =========================
    // ROTATE DISC
    // =========================

    discRotation +=
      movement * 2;

    disc.style.transform =
      `rotate(${discRotation}deg)`;


    // =========================
    // SCRATCH SOUND
    // =========================

    playScratchSound(
      speed
    );


    // =========================
    // CREATE LIQUID
    // BASED ON SCRATCH SPEED
    // =========================

    if (speed > 1) {

      const particleCount =
        Math.min(
          1 +
          Math.floor(speed / 5),
          8
        );


      for (
        let i = 0;
        i < particleCount;
        i++
      ) {

        setTimeout(
          function() {

            spawnLiquid(
              speed
            );

          },
          i * 30
        );

      }

    }


    lastMouseX =
      event.clientX;

  }
);


// =========================
// STOP DISC DRAG
// =========================

document.addEventListener(
  "mouseup",
  function() {

    isDraggingDisc = false;


    // Stop scratch sound

    if (
      scratchGain &&
      scratchAudioContext
    ) {

      scratchGain.gain.setTargetAtTime(
        0,
        scratchAudioContext.currentTime,
        0.02
      );

    }

  }
);


// =========================
// SCRATCH SOUND
// =========================

function playScratchSound(speed) {

  if (!scratchAudioContext) {

    scratchAudioContext =
      new AudioContext();


    // =========================
    // MAIN SCRATCH NOISE
    // =========================

    scratchSource =
      scratchAudioContext
        .createBufferSource();

    scratchGain =
      scratchAudioContext
        .createGain();


    const bufferSize =
      scratchAudioContext.sampleRate *
      2;


    const buffer =
      scratchAudioContext.createBuffer(
        1,
        bufferSize,
        scratchAudioContext.sampleRate
      );


    const data =
      buffer.getChannelData(0);


    for (
      let i = 0;
      i < bufferSize;
      i++
    ) {

      data[i] =
        Math.random() * 2 - 1;

    }


    scratchSource.buffer =
      buffer;

    scratchSource.loop =
      true;


    // High frequency scratch

    scratchFilter =
      scratchAudioContext
        .createBiquadFilter();

    scratchFilter.type =
      "highpass";

    scratchFilter.frequency.value =
      2200;


    scratchSource.connect(
      scratchFilter
    );

    scratchFilter.connect(
      scratchGain
    );

    scratchGain.connect(
      scratchAudioContext.destination
    );


    scratchGain.gain.value =
      0.001;


    scratchSource.start();


    // =========================
    // SHARP SCRATCH TONE
    // =========================

    scratchOscillator =
      scratchAudioContext
        .createOscillator();

    scratchOscGain =
      scratchAudioContext
        .createGain();


    scratchOscillator.type =
      "sawtooth";

    scratchOscillator.frequency.value =
      900;


    scratchOscGain.gain.value =
      0.001;


    scratchOscillator.connect(
      scratchOscGain
    );

    scratchOscGain.connect(
      scratchAudioContext.destination
    );

    scratchOscillator.start();

  }


  if (
    scratchAudioContext.state ===
    "suspended"
  ) {

    scratchAudioContext.resume();

  }


  // Faster movement = louder scratch

  const volume =
    Math.min(
      speed / 7,
      0.65
    );


  scratchGain.gain.setTargetAtTime(
    volume,
    scratchAudioContext.currentTime,
    0.003
  );


  // Faster movement = higher pitch

  const pitch =
    700 +
    Math.min(
      speed * 120,
      2200
    );


  scratchOscillator.frequency
    .setTargetAtTime(
      pitch,
      scratchAudioContext.currentTime,
      0.003
    );


  scratchOscGain.gain
    .setTargetAtTime(
      Math.min(
        speed / 20,
        0.22
      ),
      scratchAudioContext.currentTime,
      0.003
    );

}


// =========================
// FULLSCREEN
// =========================

const fullscreenBtn =
  document.getElementById(
    "fullscreen-btn"
  );

const videoPlayer =
  document.getElementById(
    "custom-video-player"
  );


fullscreenBtn.addEventListener(
  "click",
  function() {

    if (!document.fullscreenElement) {

      videoPlayer.requestFullscreen();

    } else {

      document.exitFullscreen();

    }

  }
);


// =========================
// MUTE / UNMUTE
// =========================

const muteBtn =
  document.getElementById(
    "mute-btn"
  );

const muteImg =
  document.getElementById(
    "mute-img"
  );


muteBtn.addEventListener(
  "click",
  function() {

    audio.muted =
      !audio.muted;


    if (audio.muted) {

      muteImg.src =
        "image/mute.svg";

      muteImg.alt =
        "Unmute";

    } else {

      muteImg.src =
        "image/sound.svg";

      muteImg.alt =
        "Mute";

    }

  }
);