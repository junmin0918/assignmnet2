const video = document.getElementById("custom-video-player");
const audio = document.getElementById("audio");
const player = document.querySelector(".media-player");
const splash = document.querySelector(".splash");
const playPauseImg = document.getElementById("play-pause-img");
const rewindBackBtn = document.getElementById("rewind-back-btn");
const rewindForwardBtn = document.getElementById("rewind-forward-btn");

// PLAY / PAUSE
function togglePlayPause() {
  if (audio.paused) {
    video.currentTime = 0;
    audio.currentTime = 0;

    video.play();
    audio.play();

    player.classList.remove("home-view");
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


// REWIND BACK
rewindBackBtn.addEventListener("click", function () {
  video.currentTime = Math.max(0, video.currentTime - 5);
  audio.currentTime = Math.max(0, audio.currentTime - 5);
});


// REWIND FORWARD
rewindForwardBtn.addEventListener("click", function () {
  video.currentTime = Math.min(video.duration, video.currentTime + 5);
  audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
});


// VIDEO TABS
const videoTabs = document.querySelectorAll(".video-tabs a");

videoTabs.forEach(function (tab) {
  tab.addEventListener("click", function () {
    videoTabs.forEach(function (item) {
      item.classList.remove("active");
    });

    tab.classList.add("active");
  });
});


// LIKE BUTTON
const likeBtn = document.getElementById("like-btn");
const likeCount = document.getElementById("like-count");

let likes = 0;

likeBtn.addEventListener("click", function () {
  likes++;
  likeCount.textContent = likes;
});


// DISC
const disc = document.querySelector(".disc");

let isDraggingDisc = false;
let lastMouseX = 0;
let discRotation = 0;


// SCRATCH AUDIO
let scratchAudioContext;
let scratchSource;
let scratchGain;
let scratchFilter;
let scratchOscillator;
let scratchOscGain;


// START DRAGGING DISC
disc.addEventListener("mousedown", function (event) {
  isDraggingDisc = true;
  lastMouseX = event.clientX;
});


// DISC MOVEMENT
document.addEventListener("mousemove", function (event) {
  if (!isDraggingDisc) return;

  const movement = event.clientX - lastMouseX;
  const speed = Math.abs(movement);

  discRotation += movement * 2;

  disc.style.transform =
    `rotate(${discRotation}deg)`;

  playScratchSound(speed);

  if (speed > 1) {
    let particleCount;

    if (speed < 4) {
      particleCount = 5;
    } else if (speed < 8) {
      particleCount = 12;
    } else {
      particleCount = 20;
    }

    particleCount = Math.min(
      particleCount,
      25
    );

    for (let i = 0; i < particleCount; i++) {
      setTimeout(function () {
        spawnGlitchLine(speed);
      }, i * 12);
    }
  }

  lastMouseX = event.clientX;
});


// STOP DRAGGING
document.addEventListener("mouseup", function () {
  isDraggingDisc = false;

  if (scratchGain && scratchAudioContext) {
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
});


// GLITCH / ELECTRIC LINES
function spawnGlitchLine(speed) {
  const line = document.createElement("span");

  line.classList.add("glitch-line");

  line.style.left = "50%";
  line.style.top = "50%";

  const angle =
    Math.random() * Math.PI * 2;

  const distance =
    80 +
    Math.random() * 260 +
    Math.min(speed * 12, 180);

  const endX =
    Math.cos(angle) * distance;

  const endY =
    Math.sin(angle) * distance;

  line.style.setProperty(
    "--glitch-x",
    `${endX}px`
  );

  line.style.setProperty(
    "--glitch-y",
    `${endY}px`
  );

  const thickness =
    1 + Math.random() * 4;

  line.style.height =
    `${thickness}px`;

  const length =
    30 + Math.random() * 130;

  line.style.width =
    `${length}px`;

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
        Math.random() * colors.length
      )
    ];

  line.style.background =
    color;

  line.style.boxShadow = `
    0 0 5px ${color},
    0 0 15px ${color},
    0 0 30px ${color}
  `;

  line.style.transform = `
    translate(-50%, -50%)
    rotate(${angle}rad)
  `;

  splash.appendChild(line);

  line.classList.add(
    "glitch-line-active"
  );

  setTimeout(function () {
    line.remove();
  }, 550);
}


// SCRATCH SOUND
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

    for (let i = 0; i < bufferSize; i++) {
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

  const intensity =
    Math.min(speed / 12, 1);

  const volume =
    0.08 +
    intensity * 0.45;

  const frequency =
    500 +
    intensity * 3500;

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


// FULLSCREEN
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
    if (!document.fullscreenElement) {
      videoPlayer.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
);


// MUTE
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


// MOUSE PARTICLES
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
      event.clientX - rect.left;

    mouseY =
      event.clientY - rect.top;

    mouseMoving = true;

    for (let i = 0; i < 3; i++) {
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


// DRAW MOUSE PARTICLES
function drawMouseParticles() {
  mouseCtx.clearRect(
    0,
    0,
    mouseCanvas.width,
    mouseCanvas.height
  );

  for (
    let i = mouseParticles.length - 1;
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

    if (particle.life <= 0) {
      mouseParticles.splice(i, 1);
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


// PLAYLIST
const playlistButton =
  document.querySelector(
    'a[href="playlist.html"]'
  );


// HOME BUTTON
const homeButton =
  document.querySelector(
    'a[href="index.html"]'
  );


// CHANGE YOUR FILE NAMES HERE
const playlist = [
  {
    video: "video/sphere.mp4",
    audio: "audio/montagem.mp3"
  },
  {
    video: "video/wave1.mp4",
    audio: "audio/beat.mp3"
  }
];


// PRELOAD PLAYLIST
const preloadVideos = [];
const preloadAudios = [];

playlist.forEach(
  function (item, index) {

    const preloadVideo =
      document.createElement("video");

    preloadVideo.src =
      item.video;

    preloadVideo.preload =
      "auto";

    preloadVideo.muted =
      true;

    preloadVideo.load();

    preloadVideos[index] =
      preloadVideo;


    const preloadAudio =
      document.createElement("audio");

    preloadAudio.src =
      item.audio;

    preloadAudio.preload =
      "auto";

    preloadAudio.load();

    preloadAudios[index] =
      preloadAudio;
  }
);


// Current playlist number
let currentPlaylist = 0;


// CLICK PLAYLIST
playlistButton.addEventListener(
  "click",
  function (event) {

    event.preventDefault();

    player.classList.remove(
      "home-view"
    );

    currentPlaylist++;

    if (
      currentPlaylist >=
      playlist.length
    ) {
      currentPlaylist = 0;
    }

    const selectedPlaylist =
      playlist[currentPlaylist];

    const selectedPreloadVideo =
      preloadVideos[currentPlaylist];


    // KEEP CURRENT VIDEO IMAGE
    // WHILE NEW VIDEO LOADS
    let oldFrame = null;

    try {
      const frameCanvas =
        document.createElement("canvas");

      frameCanvas.width =
        video.videoWidth;

      frameCanvas.height =
        video.videoHeight;

      if (
        frameCanvas.width > 0 &&
        frameCanvas.height > 0
      ) {
        const frameContext =
          frameCanvas.getContext("2d");

        frameContext.drawImage(
          video,
          0,
          0,
          frameCanvas.width,
          frameCanvas.height
        );

        oldFrame =
          frameCanvas.toDataURL(
            "image/jpeg"
          );

        video.style.backgroundImage =
          `url("${oldFrame}")`;

        video.style.backgroundSize =
          "cover";

        video.style.backgroundPosition =
          "center";
      }
    } catch (error) {
      console.log(
        "Could not save previous frame."
      );
    }


    function switchPlaylist() {

      video.src =
        selectedPlaylist.video;

      audio.src =
        selectedPlaylist.audio;

      video.currentTime =
        0;

      audio.currentTime =
        0;

      playPauseImg.src =
        "image/play.svg";

      playPauseImg.alt =
        "Play";

      player.classList.remove(
        "playing"
      );


      // REMOVE OLD FRAME
      // AFTER NEW VIDEO IS READY
      function removeOldFrame() {
        video.style.backgroundImage =
          "";

        video.style.backgroundSize =
          "";

        video.style.backgroundPosition =
          "";

        video.removeEventListener(
          "canplay",
          removeOldFrame
        );
      }

      video.addEventListener(
        "canplay",
        removeOldFrame
      );
    }


    // IF PRELOADED VIDEO IS READY
    if (
      selectedPreloadVideo.readyState >= 3
    ) {
      switchPlaylist();
    } else {

      selectedPreloadVideo.addEventListener(
        "canplay",
        switchPlaylist,
        {
          once: true
        }
      );

    }

  }
);


// CLICK HOME
homeButton.addEventListener(
  "click",
  function (event) {

    event.preventDefault();

    player.classList.add(
      "home-view"
    );

    video.pause();
    audio.pause();

    playPauseImg.src =
      "image/play.svg";

    playPauseImg.alt =
      "Play";

    player.classList.remove(
      "playing"
    );
  }
);


// JUMP TO 15 / 30 SECONDS
function jumpToTime(seconds) {

  player.classList.remove(
    "home-view"
  );

  video.currentTime =
    seconds;

  audio.currentTime =
    seconds;

  video.play();
  audio.play();

  player.classList.add(
    "playing"
  );

  playPauseImg.src =
    "image/pause.svg";

  playPauseImg.alt =
    "Pause";
}


// BUTTON 1
const jump15Btn =
  document.getElementById(
    "jump-15-btn"
  );

jump15Btn.addEventListener(
  "click",
  function () {
    jumpToTime(15);
  }
);


// BUTTON 2
const jump30Btn =
  document.getElementById(
    "jump-30-btn"
  );

jump30Btn.addEventListener(
  "click",
  function () {
    jumpToTime(30);
  }
);


// KEYBOARD 1 / 2
document.addEventListener(
  "keydown",
  function (event) {

    if (event.key === "1") {
      jumpToTime(15);
    }

    if (event.key === "2") {
      jumpToTime(30);
    }

  }
);
const starCanvas =
  document.getElementById(
    "star-background"
  );

const starCtx =
  starCanvas.getContext("2d");

const stars = [];


// ========================================
// RESIZE STAR CANVAS
// ========================================

function resizeStarCanvas() {

  starCanvas.width =
    player.clientWidth;

  starCanvas.height =
    player.clientHeight;
}

resizeStarCanvas();

window.addEventListener(
  "resize",
  resizeStarCanvas
);


// ========================================
// CREATE STARS
// ========================================

for (
  let i = 0;
  i < 45;
  i++
) {

  stars.push({

    x:
      Math.random() *
      starCanvas.width,

    y:
      Math.random() *
      starCanvas.height,

    size:
      0.5 +
      Math.random() * 2,

    speed:
      0.05 +
      Math.random() * 0.25,

    opacity:
      0.3 +
      Math.random() * 0.7
  });
}


// ========================================
// DRAW STARS
// ========================================

function drawStars() {

  starCtx.clearRect(
    0,
    0,
    starCanvas.width,
    starCanvas.height
  );


  stars.forEach(
    function (star) {

      // Move star slowly
      star.y +=
        star.speed;


      // Return to top
      if (
        star.y >
        starCanvas.height
      ) {

        star.y = -5;

        star.x =
          Math.random() *
          starCanvas.width;
      }


      // Draw star
      starCtx.beginPath();

      starCtx.arc(
        star.x,
        star.y,
        star.size,
        0,
        Math.PI * 2
      );

      starCtx.fillStyle =
        `rgba(255, 255, 255, ${star.opacity})`;

      starCtx.shadowBlur = 8;

      starCtx.shadowColor =
        "#d946ef";

      starCtx.fill();
    }
  );


  requestAnimationFrame(
    drawStars
  );
}


drawStars();