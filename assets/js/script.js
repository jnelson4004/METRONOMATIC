/* var toneOne = new Audio("assets/songs/metronome tone 1.mp3");

function startStop () {
    if (toneOne.paused) {
      toneOne.play();
    }
}; */

let bpm = 120;  // Default BPM
let isPlaying = false;
let intervalId = null;

// DOM Elements
const bpmDisplay = document.getElementById('bpmDisplay');
const slider = document.getElementById('slider');
const toggleButton = document.getElementById('toggleButton');

// Function to update BPM display when slider is changed
slider.addEventListener('input', () => {
    bpm = slider.value;
    bpmDisplay.textContent = `BPM: ${bpm}`;
    if (isPlaying) {
        // If metronome is playing, restart it with the new BPM
        clearInterval(intervalId);
        startMetronome();
    }
});

// Function to play a tick sound (you can replace with an actual audio file if preferred)
function playTick() {
    const audio = new Audio('assets/songs/metronome tone 1.mp3'); // Or use a Web Audio API for custom sounds
    audio.play();
}

// Function to start the metronome
function startMetronome() {
    const interval = 60000 / bpm;  // Interval in milliseconds (60,000 ms = 1 minute)
    intervalId = setInterval(playTick, interval);
    toggleButton.textContent = 'Stop';
    isPlaying = true;
}

// Function to stop the metronome
function stopMetronome() {
    clearInterval(intervalId);
    toggleButton.textContent = 'Start';
    isPlaying = false;
}

// Toggle metronome play/pause on button click
toggleButton.addEventListener('click', () => {
    if (isPlaying) {
        stopMetronome();
    } else {
        startMetronome();
    }
});