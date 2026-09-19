const video = document.getElementById("custom-video-player");
const audio = document.getElementById("audio");
const player = document.querySelector(".media-player");
const splash = document.querySelector(".splash");
const playPauseImg = document.getElementById("play-pause-img");
const rewindBackBtn = document.getElementById("rewind-back-btn");
const rewindForwardBtn = document.getElementById("rewind-forward-btn");


// ========================================
// PLAY / PAUSE
// ========================================

function togglePlayPause() {

  if (audio.paused) {

    video.currentTime = 0;
    audio.currentTime = 0;

    video.play();
    audio.play();

    player.classList.add("playing");

    playPauseImg.src = "image/pause.svg";
    playPauseImg.alt = "Pause";

  } else {

    video.pause();
    audio.pause();

    player.classList.remove("playing");

    playPauseImg.src = "image/play.svg";
    playPauseImg.alt = "Play";
  }
}


// ========================================
// REWIND BACK
// ========================================

rewindBackBtn.addEventListener(
  "click",
  function () {

    video.currentTime =
      Math.max(
        0,
        video.currentTime - 5
      );

    audio.currentTime =
      Math.max(
        0,
        audio.currentTime - 5
      );
  }
);


// ========================================
// REWIND FORWARD
// ========================================

rewindForwardBtn.addEventListener(
  "click",
  function () {

    video.currentTime =
      Math.min(
        video.duration,
        video.currentTime + 5
      );

    audio.currentTime =
      Math.min(
        audio.duration,
        audio.currentTime + 5
      );
  }
);


// ========================================
// VIDEO TABS
// ========================================

const videoTabs =
  document.querySelectorAll(
    ".video-tabs a"
  );

videoTabs.forEach(
  function (tab) {

    tab.addEventListener(
      "click",
      function () {

        videoTabs.forEach(
          function (item) {

            item.classList.remove(
              "active"
            );
          }
        );

        tab.classList.add("active");
      }
    );
  }
);


// ========================================
// LIKE BUTTON
// ========================================

const likeBtn =
  document.getElementById("like-btn");

const likeCount =
  document.getElementById("like-count");

let likes = 0;

likeBtn.addEventListener(
  "click",
  function () {

    likes++;

    likeCount.textContent =
      likes;
  }
);


// ========================================
// DISC
// ========================================

const disc =
  document.querySelector(".disc");

let isDraggingDisc = false;
let lastMouseX = 0;
let discRotation = 0;


// ========================================
// SCRATCH AUDIO
// ========================================

let scratchAudioContext;
let scratchSource;
let scratchGain;
let scratchFilter;
let scratchOscillator;
let scratchOscGain;


// ========================================
// START DRAGGING DISC
// ========================================

disc.addEventListener(
  "mousedown",
  function (event) {

    isDraggingDisc = true;

    lastMouseX =
      event.clientX;
  }
);


// ========================================
// DISC MOVEMENT
// ========================================

document.addEventListener(
  "mousemove",
  function (event) {

    if (!isDraggingDisc) return;

    const movement =
      event.clientX - lastMouseX;

    const speed =
      Math.abs(movement);


    // Rotate Disc
    discRotation +=
      movement * 2;

    disc.style.transform =
      `rotate(${discRotation}deg)`;


    // Scratch sound
    playScratchSound(speed);


    // ====================================
    // GLITCH VISUAL EFFECT
    // ====================================

    if (speed > 1) {

      let particleCount;


      if (speed < 4) {

        particleCount = 5;

      } else if (speed < 8) {

        particleCount = 12;

      } else {

        particleCount = 20;
      }


      particleCount =
        Math.min(
          particleCount,
          25
        );


      // Create many lines
      for (
        let i = 0;
        i < particleCount;
        i++
      ) {

        setTimeout(
          function () {

            spawnGlitchLine(speed);

          },
          i * 12
        );
      }
    }


    lastMouseX =
      event.clientX;
  }
);


// ========================================
// STOP DRAGGING
// ========================================

document.addEventListener(
  "mouseup",
  function () {

    isDraggingDisc = false;

    if (
      scratchGain &&
      scratchAudioContext
    ) {

      scratchGain.gain.setTargetAtTime(
        0,
        scratchAudioContext.currentTime,
        0.02
      );

      scratchOscGain.gain.setTargetAtTime(
        0,
        scratchAudioContext.currentTime,
        0.02
      );
    }
  }
);


// ========================================
// GLITCH / ELECTRIC LINES
// ========================================

function spawnGlitchLine(speed) {

  const line =
    document.createElement("span");

  line.classList.add(
    "glitch-line"
  );


  // ------------------------------------
  // START FROM CENTER OF PLAYER
  // ------------------------------------

  line.style.left = "50%";
  line.style.top = "50%";


  // ------------------------------------
  // RANDOM DIRECTION
  // ------------------------------------

  const angle =
    Math.random() *
    Math.PI *
    2;


  // ------------------------------------
  // RANDOM DISTANCE
  // ------------------------------------

  const distance =
    80 +
    Math.random() * 260 +
    Math.min(
      speed * 12,
      180
    );


  const endX =
    Math.cos(angle) *
    distance;

  const endY =
    Math.sin(angle) *
    distance;


  line.style.setProperty(
    "--glitch-x",
    `${endX}px`
  );

  line.style.setProperty(
    "--glitch-y",
    `${endY}px`
  );


  // ------------------------------------
  // RANDOM LINE SIZE
  // ------------------------------------

  const thickness =
    1 +
    Math.random() * 4;

  line.style.height =
    `${thickness}px`;


  const length =
    30 +
    Math.random() * 130;

  line.style.width =
    `${length}px`;


  // ------------------------------------
  // RANDOM COLOUR
  // ------------------------------------

  const colors = [
    "#ff2bd6",
    "#a855f7",
    "#ff00ff",
    "#e879f9",
    "#c026d3",
    "#d946ef"
  ];


  const color =
    colors[
      Math.floor(
        Math.random() *
        colors.length
      )
    ];


  line.style.background =
    color;


  line.style.boxShadow =
    `
    0 0 5px ${color},
    0 0 15px ${color},
    0 0 30px ${color}
    `;


  // ------------------------------------
  // RANDOM ROTATION
  // ------------------------------------

  line.style.transform =
    `
    translate(-50%, -50%)
    rotate(${angle}rad)
    `;


  // ------------------------------------
  // ADD TO SPLASH CONTAINER
  // ------------------------------------

  splash.appendChild(
    line
  );


  line.classList.add(
    "glitch-line-active"
  );


  // ------------------------------------
  // REMOVE LINE
  // ------------------------------------

  setTimeout(
    function () {

      line.remove();

    },
    550
  );
}


// ========================================
// SCRATCH SOUND
// ========================================

function playScratchSound(speed) {

  if (!scratchAudioContext) {

    scratchAudioContext =
      new (
        window.AudioContext ||
        window.webkitAudioContext
      )();

    scratchGain =
      scratchAudioContext.createGain();

    scratchFilter =
      scratchAudioContext.createBiquadFilter();

    scratchOscGain =
      scratchAudioContext.createGain();


    const bufferSize =
      scratchAudioContext.sampleRate * 2;


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


    scratchSource =
      scratchAudioContext.createBufferSource();

    scratchSource.buffer =
      buffer;

    scratchSource.loop =
      true;


    scratchFilter.type =
      "bandpass";


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
      0;


    scratchSource.start();


    scratchOscillator =
      scratchAudioContext.createOscillator();

    scratchOscillator.type =
      "sawtooth";


    scratchOscGain =
      scratchAudioContext.createGain();

    scratchOscGain.gain.value =
      0;


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


  // ====================================
  // SPEED → SCRATCH INTENSITY
  // ====================================

  const intensity =
    Math.min(speed / 12, 1);


  // ====================================
  // VOLUME
  // 越快越大声
  // ====================================

  const volume =
    0.08 +
    intensity * 0.45;


  // ====================================
  // FREQUENCY
  // 越快越尖锐
  // ====================================

  const frequency =
    500 +
    intensity * 3500;


  // ====================================
  // FILTER
  // 越快，高频越明显
  // ====================================

  const filterFrequency =
    1000 +
    intensity * 7000;


  scratchGain.gain.setTargetAtTime(
    volume,
    scratchAudioContext.currentTime,
    0.008
  );


  scratchFilter.frequency.setTargetAtTime(
    filterFrequency,
    scratchAudioContext.currentTime,
    0.008
  );


  scratchOscillator.frequency.setTargetAtTime(
    frequency,
    scratchAudioContext.currentTime,
    0.008
  );


  scratchOscGain.gain.setTargetAtTime(
    volume * 0.35,
    scratchAudioContext.currentTime,
    0.008
  );
}


// ========================================
// FULLSCREEN
// ========================================

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
  function () {

    if (
      !document.fullscreenElement
    ) {

      videoPlayer.requestFullscreen();

    } else {

      document.exitFullscreen();
    }
  }
);


// ========================================
// MUTE
// ========================================

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
  function () {

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


// ========================================
// MOUSE PARTICLES
// ========================================

const mouseCanvas =
  document.getElementById(
    "mouse-particles"
  );

const mouseCtx =
  mouseCanvas.getContext("2d");

const mouseParticles = [];

let mouseX = 0;
let mouseY = 0;
let mouseMoving = false;


function resizeMouseCanvas() {

  mouseCanvas.width =
    player.clientWidth;

  mouseCanvas.height =
    player.clientHeight;
}


resizeMouseCanvas();


window.addEventListener(
  "resize",
  resizeMouseCanvas
);


player.addEventListener(
  "mousemove",
  function (event) {

    const rect =
      player.getBoundingClientRect();


    mouseX =
      event.clientX -
      rect.left;

    mouseY =
      event.clientY -
      rect.top;


    mouseMoving = true;


    for (
      let i = 0;
      i < 3;
      i++
    ) {

      mouseParticles.push({

        x:
          mouseX +
          (Math.random() - 0.5) * 20,

        y:
          mouseY +
          (Math.random() - 0.5) * 20,

        size:
          3 +
          Math.random() * 7,

        life: 1,

        speedX:
          (Math.random() - 0.5) * 2,

        speedY:
          (Math.random() - 0.5) * 2,

        rotation:
          Math.random() *
          Math.PI *
          2,

        rotationSpeed:
          (Math.random() - 0.5) *
          0.15,

        color: [
          "#ff2bd6",
          "#a855f7",
          "#ff4de1",
          "#c026d3",
          "#d946ef"
        ][
          Math.floor(
            Math.random() * 5
          )
        ]
      });
    }
  }
);


player.addEventListener(
  "mouseleave",
  function () {

    mouseMoving = false;
  }
);


// ========================================
// DRAW MOUSE PARTICLES
// ========================================

function drawMouseParticles() {

  mouseCtx.clearRect(
    0,
    0,
    mouseCanvas.width,
    mouseCanvas.height
  );


  for (
    let i =
      mouseParticles.length - 1;
    i >= 0;
    i--
  ) {

    const particle =
      mouseParticles[i];


    particle.x +=
      particle.speedX;

    particle.y +=
      particle.speedY;


    particle.x +=
      (Math.random() - 0.5) *
      1.5;

    particle.y +=
      (Math.random() - 0.5) *
      1.5;


    particle.rotation +=
      particle.rotationSpeed;


    particle.life -=
      0.025;


    if (
      particle.life <= 0
    ) {

      mouseParticles.splice(
        i,
        1
      );

      continue;
    }


    mouseCtx.save();


    mouseCtx.translate(
      particle.x,
      particle.y
    );


    mouseCtx.rotate(
      particle.rotation
    );


    mouseCtx.globalAlpha =
      particle.life;


    mouseCtx.shadowBlur =
      15;

    mouseCtx.shadowColor =
      particle.color;

    mouseCtx.fillStyle =
      particle.color;


    mouseCtx.beginPath();


    mouseCtx.arc(
      0,
      0,
      particle.size,
      0,
      Math.PI * 2
    );


    mouseCtx.fill();


    mouseCtx.restore();
  }


  requestAnimationFrame(
    drawMouseParticles
  );
}


drawMouseParticles();


// ========================================
// PLAYLIST
// ========================================

const playlistButton =
  document.querySelector(
    'a[href="playlist.html"]'
  );


// ========================================
// CHANGE YOUR FILE NAMES HERE
// ========================================

const playlist = [

  {
    video: "video/sphere.mp4",
    audio: "audio/montagem.mp3"
  },

  {
    video: "video/wave.mp4",
    audio: "audio/beat.mp3"
  }

];


// Current playlist number

let currentPlaylist = 0;


// ========================================
// CLICK PLAYLIST
// ========================================

playlistButton.addEventListener(
  "click",
  function (event) {

    event.preventDefault();


    // Go to next playlist

    currentPlaylist++;


    // Go back to first playlist
    // when reaching the end

    if (
      currentPlaylist >= playlist.length
    ) {

      currentPlaylist = 0;
    }


    const selectedPlaylist =
      playlist[currentPlaylist];


    // ====================================
    // CHANGE VIDEO
    // ====================================

    video.src =
      selectedPlaylist.video;


    // ====================================
    // CHANGE AUDIO
    // ====================================

    audio.src =
      selectedPlaylist.audio;


    // ====================================
    // RELOAD VIDEO + AUDIO
    // ====================================

    video.load();
    audio.load();


    // ====================================
    // RESET PLAYBACK
    // ====================================

    video.currentTime = 0;
    audio.currentTime = 0;


    // ====================================
    // UPDATE BUTTON
    // ====================================

    playPauseImg.src =
      "image/play.svg";

    playPauseImg.alt =
      "Play";


    player.classList.remove(
      "playing"
    );

  }
);


// ========================================
// CLICK HOME
// ========================================

homeButton.addEventListener(
  "click",
  function (event) {

    event.preventDefault();


    // Show HOME introduction

    player.classList.add(
      "home-view"
    );


    // Stop music and video

    video.pause();
    audio.pause();


    // Reset play button

    playPauseImg.src =
      "image/play.svg";

    playPauseImg.alt =
      "Play";


    // Remove playing animation

    player.classList.remove(
      "playing"
    );

  }
);