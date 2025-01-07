let bpm = 120;  // Default BPM
let isPlaying = false;
let lastTickTime = 0;
let tickRequestId = null;  // Store the requestAnimationFrame ID
let interval = 60000 / bpm; // Initial interval
let tickAudio; // Audio buffer (for Web Audio API)
let audioContext; // Web Audio context

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
        try {
            if (audioContext.state === 'suspended') {
                audioContext.resume().then(() => {
                    console.log("AudioContext resumed.");
                }).catch(error => {
                    console.error("Error resuming AudioContext: ", error);
                });
            }
        } catch (error) {
            console.error("Error initializing AudioContext: ", error);
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
    if (!tickAudio) return; // If the audio isn't loaded yet, do nothing
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
    initAudioContext();
}, { once: true });

document.body.addEventListener('click', () => {
    initAudioContext();
}, { once: true });
