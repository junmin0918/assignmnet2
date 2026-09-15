const video = document.getElementById("custom-video-player");
const audio = document.getElementById("audio");
const player = document.querySelector(".media-player");
const splash = document.querySelector(".splash");
const playPauseImg = document.getElementById("play-pause-img");
const rewindBackBtn = document.getElementById("rewind-back-btn");
const rewindForwardBtn = document.getElementById("rewind-forward-btn");

let audioContext;
let analyser;
let source;
let previousBass = 0;
let lastBeatTime = 0;

function togglePlayPause() {

  if (audio.paused) {

    video.currentTime = 0;
    audio.currentTime = 0;

    video.play();
    audio.play();

    startAudioAnalysis();

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

function startAudioAnalysis() {

  if (!audioContext) {

    audioContext = new (window.AudioContext || window.webkitAudioContext)();

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

  if (!analyser) return;

  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  analyser.getByteFrequencyData(dataArray);

  let sum = 0;

  for (let i = 0; i < dataArray.length; i++) {
    sum += dataArray[i];
  }

  const average = sum / dataArray.length;

  const bassRange = Math.floor(dataArray.length * 0.15);

  let bass = 0;

  for (let i = 0; i < bassRange; i++) {
    bass += dataArray[i];
  }

  bass = bass / bassRange;

  player.style.setProperty(
    "--beat-strength",
    Math.min(average / 120, 2)
  );

  const now = performance.now();

  if (
    bass > 40 &&
    bass > previousBass * 1.3 &&
    now - lastBeatTime > 200
  ) {

    console.log("💥 BEAT!", bass);

    lastBeatTime = now;

    const particleCount =
      Math.max(2, Math.floor((bass / 255) * 16));

    for (let i = 0; i < particleCount; i++) {

      setTimeout(function () {
        spawnLiquid();
      }, i * 80);

    }

    const beatDistance =
      1 + (bass / 255) * 1.8;

    player.style.setProperty(
      "--beat-distance",
      beatDistance
    );
  }

  previousBass = bass;

  requestAnimationFrame(analyseMusic);
}

function spawnLiquid() {

  const liquid = document.createElement("span");

  liquid.classList.add("dynamic-liquid");

  const startX =
    (Math.random() - 0.5) * 400;

  liquid.style.left =
    `${startX}px`;

  liquid.style.top = "-300px";

  const colors = [
    "#ff2bd6",
    "#a855f7",
    "#ff4de1",
    "#c026d3",
    "#d946ef"
  ];

  const color =
    colors[Math.floor(Math.random() * colors.length)];

  liquid.style.background = color;

  liquid.style.color = color;

  const beatDistance =
    parseFloat(
      getComputedStyle(player)
        .getPropertyValue("--beat-distance")
    ) || 1;

  const angle =
    Math.random() * Math.PI * 2;

  const distance =
    (100 + Math.random() * 140) *
    beatDistance;

  const burstX =
    Math.cos(angle) * distance;

  const burstY =
    Math.sin(angle) * distance;

  liquid.style.setProperty(
    "--burst-x",
    `${burstX}px`
  );

  liquid.style.setProperty(
    "--burst-y",
    `${burstY}px`
  );

  splash.appendChild(liquid);

  liquid.classList.add("falling");

  setTimeout(function () {
    liquid.remove();
  }, 1600);
}

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

const videoTabs =
  document.querySelectorAll(".video-tabs a");

videoTabs.forEach(function (tab) {

  tab.addEventListener(
    "click",
    function () {

      videoTabs.forEach(function (item) {
        item.classList.remove("active");
      });

      tab.classList.add("active");
    }
  );

});

const likeBtn =
  document.getElementById("like-btn");

const likeCount =
  document.getElementById("like-count");

let likes = 0;

likeBtn.addEventListener(
  "click",
  function () {

    likes++;

    likeCount.textContent = likes;
  }
);

const disc =
  document.querySelector(".disc");

let isDraggingDisc = false;
let lastMouseX = 0;
let discRotation = 0;

let scratchAudioContext;
let scratchSource;
let scratchGain;
let scratchFilter;
let scratchOscillator;
let scratchOscGain;

disc.addEventListener(
  "mousedown",
  function (event) {

    isDraggingDisc = true;

    lastMouseX = event.clientX;
  }
);

document.addEventListener(
  "mousemove",
  function (event) {

    if (!isDraggingDisc) return;

    const movement =
      event.clientX - lastMouseX;

    discRotation += movement * 2;

    disc.style.transform =
      `rotate(${discRotation}deg)`;

    playScratchSound(
      Math.abs(movement)
    );

    lastMouseX =
      event.clientX;
  }
);

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
    }
  }
);

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

    scratchSource.buffer = buffer;

    scratchSource.loop = true;

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

    scratchGain.gain.value = 0;

    scratchSource.start();

    scratchOscillator =
      scratchAudioContext.createOscillator();

    scratchOscillator.type =
      "sawtooth";

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

  const volume =
    Math.min(
      speed / 30,
      0.35
    );

  const frequency =
    300 + speed * 35;

  scratchGain.gain.setTargetAtTime(
    volume,
    scratchAudioContext.currentTime,
    0.01
  );

  scratchFilter.frequency.setTargetAtTime(
    800 + speed * 100,
    scratchAudioContext.currentTime,
    0.01
  );

  scratchOscillator.frequency.setTargetAtTime(
    frequency,
    scratchAudioContext.currentTime,
    0.01
  );

  scratchOscGain.gain.setTargetAtTime(
    volume * 0.25,
    scratchAudioContext.currentTime,
    0.01
  );
}

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

const muteBtn =
  document.getElementById("mute-btn");

const muteImg =
  document.getElementById("mute-img");

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