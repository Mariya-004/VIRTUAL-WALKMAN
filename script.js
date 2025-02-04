const CLIENT_ID = '1bb0139941f7416f8ae0417e2391f80d';
const REDIRECT_URI = 'https://virtual-walkman.netlify.app/';
const SCOPES = 'user-read-private user-read-email user-library-read';

// 🔹 Spotify Login
const loginBtn = document.getElementById('loginBtn');

loginBtn.addEventListener('click', () => {
    const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=${encodeURIComponent(SCOPES)}`;
    window.location = AUTH_URL;
});

// 🔹 Check for Token in URL
window.onload = () => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const token = hashParams.get('access_token');

    if (token) {
        sessionStorage.setItem('token', token);
        document.querySelector('.player').style.display = 'block';
        fetchUserProfile(token);
    }
};

// 🔹 Fetch Spotify User Profile
function fetchUserProfile(token) {
    if (!token) {
        console.error("No token found, please log in again.");
        return;
    }

    fetch('https://api.spotify.com/v1/me', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
        if (!response.ok) throw new Error(`Failed to fetch user profile. Status: ${response.status}`);
        return response.json();
    })
    .then(data => console.log('User Profile:', data))
    .catch(error => console.error('Error fetching user profile:', error));
}

// 🔹 Search Feature
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('search');

searchBtn.addEventListener('click', () => {
    const token = sessionStorage.getItem('token');
    const query = searchInput.value.trim();
    if (query && token) {
        fetchTracks(token, query);
    } else {
        alert("Please enter a search term and ensure you are logged in.");
    }
});

// 🔹 Fetch Tracks from Spotify
function fetchTracks(token, query) {
    fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
        if (!response.ok) throw new Error(`Failed to fetch tracks. Status: ${response.status}`);
        return response.json();
    })
    .then(data => displayTracks(data.tracks.items))
    .catch(error => console.error('Error fetching tracks:', error));
}

// 🔹 Display Tracks
function displayTracks(tracks) {
    const trackList = document.getElementById('trackList');
    trackList.innerHTML = '';

    tracks.forEach(track => {
        if (!track.preview_url) return; // Skip tracks without previews

        const trackItem = document.createElement('div');
        trackItem.innerHTML = `
            <img src="${track.album.images[0]?.url}" alt="${track.name}" />
            <h4>${track.name}</h4>
            <h5>${track.artists.map(artist => artist.name).join(', ')}</h5>
            <button class="playButton" 
                data-preview-url="${track.preview_url}" 
                data-track-name="${track.name}" 
                data-artist-name="${track.artists[0]?.name}" 
                data-album-art="${track.album.images[0]?.url}">
                Play
            </button>
        `;
        trackList.appendChild(trackItem);
    });

    // Attach event listeners to play buttons
    document.querySelectorAll('.playButton').forEach(button => {
        button.addEventListener('click', function () {
            const previewUrl = this.getAttribute('data-preview-url');
            const trackName = this.getAttribute('data-track-name');
            const artistName = this.getAttribute('data-artist-name');
            const albumArt = this.getAttribute('data-album-art');

            if (!previewUrl) {
                alert("Preview not available for this track.");
                return;
            }

            playTrack(previewUrl, trackName, artistName, albumArt);
        });
    });
}

// 🔹 Play Track with Autoplay Handling
function playTrack(previewUrl, trackName, artistName, albumArt) {
    const audioPlayer = document.getElementById('audioPlayer');
    const audioSource = document.getElementById('audioSource');
    const albumArtImage = document.getElementById('albumArt');
    const trackNameDisplay = document.getElementById('trackName');
    const artistNameDisplay = document.getElementById('artistName');

    audioPlayer.pause();
    audioPlayer.currentTime = 0;

    if (!previewUrl) {
        alert("Preview not available for this track.");
        return;
    }

    audioSource.src = `${previewUrl}?nocache=${Date.now()}`;
    audioPlayer.load();

    audioPlayer.play()
        .then(() => console.log(`Now playing: ${trackName} by ${artistName}`))
        .catch(error => {
            console.warn("Autoplay blocked, waiting for user interaction.");
            document.addEventListener('click', () => {
                audioPlayer.play().catch(err => console.error("Playback failed:", err));
            }, { once: true });
        });

    albumArtImage.src = albumArt;
    trackNameDisplay.innerText = trackName;
    artistNameDisplay.innerText = artistName;

    // Start reel animations
    document.querySelector('.left-reel').classList.add('spinning');
    document.querySelector('.right-reel').classList.add('spinning');

    // Stop reel animations when track ends
    audioPlayer.onended = () => {
        document.querySelector('.left-reel').classList.remove('spinning');
        document.querySelector('.right-reel').classList.remove('spinning');
    };
}

// 🔹 Handle Browser Autoplay Restriction
document.addEventListener('click', () => {
    const audioPlayer = document.getElementById('audioPlayer');
    if (audioPlayer.paused) {
        audioPlayer.play().catch(error => console.log("Autoplay blocked:", error));
    }
});
