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

// Ensure AudioContext is created after user gesture
toggleButton.addEventListener('click', () => {
    if (!audioContext) {
        // Create and resume AudioContext after user click (fix for autoplay restrictions)
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Load the sound buffer
        fetch('assets/songs/metronome tone 1.mp3')
            .then(response => response.arrayBuffer())
            .then(data => audioContext.decodeAudioData(data))
            .then(buffer => {
                tickAudio = buffer;
            })
            .catch(error => console.error('Error loading audio file:', error));
        
        // If the AudioContext was suspended, resume it
        if (audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                console.log('AudioContext resumed!');
            });
        }
    }

    // Toggle play/pause based on whether the metronome is already playing
    if (isPlaying) {
        stopMetronome();
    } else {
        startMetronome();
    }
});

// Function to play a tick sound
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
