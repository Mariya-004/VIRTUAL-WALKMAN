// script.js
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const stopBtn = document.getElementById('stopBtn');
const leftReel = document.querySelector('.left-reel');
const rightReel = document.querySelector('.right-reel');

let isPlaying = false;

// Toggle play/pause
playPauseBtn.addEventListener('click', () => {
    if (!isPlaying) {
        audioPlayer.play();
        playPauseBtn.innerText = 'Pause';
        startReels();
    } else {
        audioPlayer.pause();
        playPauseBtn.innerText = 'Play';
        stopReels();
    }
    isPlaying = !isPlaying;
});

// Stop the audio and reset
stopBtn.addEventListener('click', () => {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    playPauseBtn.innerText = 'Play';
    stopReels();
    isPlaying = false;
});

// Start reel animations
function startReels() {
    leftReel.style.animationPlayState = 'running';
    rightReel.style.animationPlayState = 'running';
    leftReel.style.animationDuration = '2s';
    rightReel.style.animationDuration = '2s';
}

// Stop reel animations
function stopReels() {
    leftReel.style.animationPlayState = 'paused';
    rightReel.style.animationPlayState = 'paused';
}
