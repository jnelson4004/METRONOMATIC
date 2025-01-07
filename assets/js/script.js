let bpm = 120;  // Default BPM
let isPlaying = false;
let lastTickTime = 0;
let tickRequestId = null;  // Store the requestAnimationFrame ID
let interval = 60000 / bpm; // Initial interval

const tickAudio = new Audio('assets/songs/metronome tone 1.mp3'); // Preload the audio

// DOM Elements
const bpmDisplay = document.getElementById('bpmDisplay');
const slider = document.getElementById('slider');
const toggleButton = document.getElementById('toggleButton');

// Function to update BPM display when slider is changed
slider.addEventListener('input', () => {
    bpm = slider.value;
    bpmDisplay.textContent = `BPM: ${bpm}`;
    interval = 60000 / bpm;  // Update interval based on the new BPM
    lastTickTime = performance.now();  // Reset lastTickTime so it adjusts without delay
});

// Function to play a tick sound
function playTick() {
    tickAudio.currentTime = 0;  // Reset to the beginning of the sound
    tickAudio.play();
}

// Function to start the metronome
function startMetronome() {
    function tick() {
        const currentTime = performance.now();
        if (currentTime - lastTickTime >= interval) {
            playTick();
            lastTickTime = currentTime;
        }
        if (isPlaying) {
            tickRequestId = requestAnimationFrame(tick);  // Continue the loop
        }
    }
    lastTickTime = performance.now(); // Reset the start time
    tickRequestId = requestAnimationFrame(tick);  // Start the animation frame loop
    toggleButton.textContent = 'Stop';
    isPlaying = true;
}

// Function to stop the metronome
function stopMetronome() {
    isPlaying = false;
    if (tickRequestId !== null) {
        cancelAnimationFrame(tickRequestId);  // Stop the animation frame loop
        tickRequestId = null;  // Reset the request ID
    }
    toggleButton.textContent = 'Start';
}

// Toggle metronome play/pause on button click
toggleButton.addEventListener('click', () => {
    if (isPlaying) {
        stopMetronome();
    } else {
        startMetronome();
    }
});
