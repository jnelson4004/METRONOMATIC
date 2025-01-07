let bpm = 120;  // Default BPM
let isPlaying = false;
let lastTickTime = 0;
let tickRequestId = null;  // Store the requestAnimationFrame ID
let interval = 60000 / bpm; // Initial interval
let tickAudio = new Audio('assets/songs/metronome tone 1.mp3'); // Preload the audio

// DOM Elements
const bpmDisplay = document.getElementById('bpmDisplay');
const slider = document.getElementById('slider');
const toggleButton = document.getElementById('toggleButton');

// Function to update BPM display and tempo while slider is being dragged
slider.addEventListener('input', () => {
    bpm = slider.value;
    bpmDisplay.textContent = `BPM: ${bpm}`;
    interval = 60000 / bpm;  // Update interval based on the new BPM
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
        // Only play the sound if the correct interval has passed
        if (currentTime - lastTickTime >= interval) {
            playTick();
            lastTickTime = currentTime;
        }
        if (isPlaying) {
            tickRequestId = requestAnimationFrame(tick);  // Continue the loop
        }
    }
    lastTickTime = performance.now(); // Reset the start time to align with the first tick
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

