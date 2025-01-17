let bpm = 120;  // Default BPM
let isPlaying = false;
let lastTickTime = 0;
let tickRequestId = null;  // Store the requestAnimationFrame ID
let interval = 60000 / bpm; // Initial interval
let tickAudio; // Audio buffer (for Web Audio API)
let audioContext; // Web Audio context

// Tap tempo variables
let tapTimes = [];  // To store the timestamps of the taps
const maxTaps = 4;  // Maximum number of taps to calculate the average BPM

// DOM Elements
const bpmDisplay = document.getElementById('bpmDisplay');
const slider = document.getElementById('slider');
const toggleButton = document.getElementById('toggleButton');

// Ensure AudioContext is created or resumed after user interaction
function initAudioContext() {
    if (!audioContext) {
        // Create AudioContext only on first user interaction (click or touch)
        audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Force the AudioContext to resume if it's suspended (mobile Safari issue)
        if (audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                console.log("AudioContext resumed successfully.");
            }).catch(error => {
                console.error("Error resuming AudioContext:", error);
            });
        }

        // Load the sound buffer only once
        fetch('assets/songs/metronome tone 1.mp3')
            .then(response => response.arrayBuffer())
            .then(data => audioContext.decodeAudioData(data))
            .then(buffer => {
                tickAudio = buffer;
                console.log("Audio loaded successfully.");
            })
            .catch(error => console.error('Error loading audio file:', error));
    }
}

// Function to play a tick sound (now works with Web Audio API)
function playTick() {
    if (!tickAudio || !audioContext) return; // If the audio isn't loaded or context isn't initialized, do nothing
    const source = audioContext.createBufferSource();
    source.buffer = tickAudio;
    source.connect(audioContext.destination);
    source.start();
}

// Function to start the metronome
function startMetronome() {
    let nextTickTime = performance.now();

    function tick() {
        const currentTime = performance.now();
        if (currentTime >= nextTickTime) {
            playTick();
            nextTickTime += interval; // Schedule the next tick
        }

        if (isPlaying) {
            tickRequestId = requestAnimationFrame(tick);  // Continue the loop
        }
    }

    nextTickTime = performance.now(); // Set the first tick time
    tickRequestId = requestAnimationFrame(tick); // Start the animation frame loop
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

// Update BPM when the slider is adjusted
slider.addEventListener('input', () => {
    bpm = slider.value;
    bpmDisplay.textContent = `BPM: ${bpm}`;
    interval = 60000 / bpm;  // Update interval based on the new BPM
});

// Handle first touch or click to resume AudioContext (necessary for mobile Safari)
toggleButton.addEventListener('click', () => {
    console.log("Button clicked. Initializing AudioContext.");
    initAudioContext();  // Ensure the AudioContext is initialized or resumed

    // If not already playing, start the metronome
    if (isPlaying) {
        stopMetronome();
    } else {
        startMetronome();
    }
});

// Handle slider input in real-time
slider.addEventListener('input', () => {
    bpm = slider.value;
    bpmDisplay.textContent = `BPM: ${bpm}`;
    interval = 60000 / bpm;  // Update the interval immediately based on the new BPM
    lastTickTime = performance.now();  // Reset lastTickTime so it adjusts smoothly without delay
});

// Ensure that AudioContext is resumed even after page load for Safari (by listening to touch/click)
document.body.addEventListener('touchstart', () => {
    console.log("First touch detected, initializing AudioContext.");
    initAudioContext();
}, { once: true });

document.body.addEventListener('click', () => {
    console.log("First click detected, initializing AudioContext.");
    initAudioContext();
}, { once: true });

// Tap tempo function
function handleTap() {
    const now = performance.now();
    tapTimes.push(now);

    // If we have more than 4 taps, remove the oldest
    if (tapTimes.length > maxTaps) {
        tapTimes.shift();
    }

    if (tapTimes.length === maxTaps) {
        // Calculate the tempo based on the average interval between taps
        const intervals = [];
        for (let i = 1; i < tapTimes.length; i++) {
            intervals.push(tapTimes[i] - tapTimes[i - 1]);
        }

        // Calculate the average interval
        const averageInterval = intervals.reduce((acc, interval) => acc + interval, 0) / intervals.length;

        // Convert interval to BPM (60,000 milliseconds per minute)
        bpm = Math.round(60000 / averageInterval);
        bpmDisplay.textContent = `BPM: ${bpm}`;
        interval = 60000 / bpm;  // Update the interval for the metronome
    }
}

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {  // Spacebar
        event.preventDefault();  // Prevent default spacebar action (scrolling)
        handleTap();  // Handle tap on spacebar press
        
    }
});

// Add the event listener for the Tap Tempo button
document.getElementById('tapTempoButton').addEventListener('click', () => {
    handleTap();  // Trigger tap tempo on button click
});
