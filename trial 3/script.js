const CLIENT_ID = '1bb0139941f7416f8ae0417e2391f80d'; // Replace with your client ID
const REDIRECT_URI = 'http://localhost:5500'; // Replace with your redirect URI
const SCOPES = 'user-read-private user-read-email user-library-read';

const loginBtn = document.getElementById('loginBtn');

loginBtn.addEventListener('click', () => {
    const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=${encodeURIComponent(SCOPES)}`;
    window.location = AUTH_URL;
});

window.onload = () => {
    const hash = window.location.hash;
    if (hash) {
        const token = hash.split('&')[0].split('=')[1];
        sessionStorage.setItem('token', token);
        document.querySelector('.player-container').style.display = 'block';
        fetchUserProfile(token);
    }
};

function fetchUserProfile(token) {
    fetch('https://api.spotify.com/v1/me', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => console.log(data))
    .catch(error => console.error('Error fetching user profile:', error));
}

const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('search');

searchBtn.addEventListener('click', () => {
    const token = sessionStorage.getItem('token');
    const query = searchInput.value;
    if (query) {
        fetchTracks(token, query);
    }
});

function fetchTracks(token, query) {
    fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => displayTracks(data.tracks.items))
    .catch(error => console.error('Error fetching tracks:', error));
}

function displayTracks(tracks) {
    const trackList = document.getElementById('trackList');
    trackList.innerHTML = '';

    tracks.forEach(track => {
        const trackItem = document.createElement('div');
        trackItem.innerHTML = `
            <img src="${track.album.images[0]?.url}" alt="${track.name}" />
            <h4>${track.name}</h4>
            <h5>${track.artists.map(artist => artist.name).join(', ')}</h5>
            <button class="playButton" data-preview-url="${track.preview_url}" data-track-name="${track.name}" data-artist-name="${track.artists[0]?.name}" data-album-art="${track.album.images[0]?.url}">Play</button>
        `;
        trackList.appendChild(trackItem);
    });

    const playButtons = trackList.getElementsByClassName('playButton');
    for (const button of playButtons) {
        button.addEventListener('click', (event) => {
            const { previewUrl, trackName, artistName, albumArt } = event.target.dataset;
            playTrack(previewUrl, trackName, artistName, albumArt);
        });
    }
}

function playTrack(previewUrl, trackName, artistName, albumArt) {
    const audioPlayer = document.getElementById('audioPlayer');
    const audioSource = document.getElementById('audioSource');
    const albumArtImage = document.getElementById('albumArt');
    const trackNameDisplay = document.getElementById('trackName');
    const artistNameDisplay = document.getElementById('artistName');

    audioPlayer.pause();
    audioPlayer.currentTime = 0;

    if (previewUrl) {
        audioSource.src = `${previewUrl}?nocache=${Date.now()}`;
    } else {
        alert("Preview not available for this track.");
        return;
    }

    audioPlayer.load();
    audioPlayer.play();

    albumArtImage.src = albumArt;
    trackNameDisplay.innerText = trackName;
    artistNameDisplay.innerText = artistName;
}
