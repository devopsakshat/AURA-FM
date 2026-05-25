
// FIREBASE SETUP & AUTH STATE

const firebaseConfig = {
  apiKey: "AIzaSyBUCmCvVI3JnoKlQ-aDqlHivTrck34tlBw",
  authDomain: "aura-fm.firebaseapp.com",
  projectId: "aura-fm",
  storageBucket: "aura-fm.firebasestorage.app",
  messagingSenderId: "1059247645194",
  appId: "1:1059247645194:web:4069d3d35b5c12615635f3"
}

firebase.initializeApp(firebaseConfig)
const auth = firebase.auth()
const provider = new firebase.auth.GoogleAuthProvider()

// DOM Elements
const loginBtnNav = document.querySelector('.loginbtn')
const signupBtnNav = document.querySelector('.signupbtn')
const loginBtnSec = document.querySelector('.login-btn') // Sidebar login
const profileSection = document.querySelector('.profile-section')
const profileName = document.querySelector('.profile-name')
const profilePhoto = document.querySelector('.profile-photo')
const logoutBtn = document.getElementById('logout-btn')

// Login Trigger
function googleLogin() {
  auth.signInWithPopup(provider).catch(err => console.error('Login error:', err))
}

if (loginBtnNav) loginBtnNav.addEventListener('click', googleLogin)
if (loginBtnSec) loginBtnSec.addEventListener('click', googleLogin)

// Listen for Auth State Changes
auth.onAuthStateChanged(user => {
  if (user) {
    // USER IS LOGGED IN 
    // Hide login/signup buttons
    loginBtnNav?.classList.add('hidden')
    signupBtnNav?.classList.add('hidden')
    
    // Show profile section
    profileSection?.classList.remove('hidden')
    profileSection.style.display = 'flex' 

    // Update with real Google data
    if (profileName) profileName.textContent = user.displayName || 'Music Fan'
    if (profilePhoto) profilePhoto.src = user.photoURL || 'https://i.pravatar.cc/40'
    
  } else {
    // USER IS LOGGED OUT
    // Show login/signup buttons
    loginBtnNav?.classList.remove('hidden')
    signupBtnNav?.classList.remove('hidden')
    
    // Hide profile section
    profileSection?.classList.add('hidden')
    profileSection.style.display = 'none' 
  }
})

// Logout Logic
if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault() // Prevent default anchor link behavior
    auth.signOut().then(() => {
      console.log('Successfully logged out')
      window.location.reload() // This forces the page to refresh
    }).catch(err => console.error('Logout error:', err))
  })
}
// GREETING

const hours = new Date().getHours()
const greeting = document.querySelector('.greeting')

if (hours >= 5 && hours < 12) {
  greeting.textContent = 'Good Morning 🌅'
} else if (hours >= 12 && hours < 17) {
  greeting.textContent = 'Good Afternoon 🌤'
} else if (hours >= 17 && hours < 21) {
  greeting.textContent = 'Good Evening 🌆'
} else {
  greeting.textContent = 'Good Night 🌌'
}

// STATE & AUDIO PLAYER SETUP
const audio = new Audio()
let songs = []        
let localTracks = []  
let likedSongs = []  
let currentIndex = 0
let isPlaying = false
let currentMode = 'music' 

// Pagination State
let musicOffset = 0
const musicLimit = 20
let isFetchingMusic = false
let currentQuery = ''

let fmOffset = 0
const fmLimit = 20
let isFetchingFm = false
let currentFmCountry = ''
let currentFmQuery = ''

const playIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="black"><polygon points="5 3 19 12 5 21 5 3"/></svg>`
const pauseIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="black"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`

function formatTime(secs) {
  if (isNaN(secs) || !secs) return '0:00'
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}


// HOME BUTTON LOGIC

document.querySelector('.homebtn').addEventListener('click', () => {
  document.querySelector('.searchbox').value = ''
  currentQuery = ''
  musicOffset = 0
  songs = []
  
  document.querySelector('[data-tab="music"]').click()
  fetchSongs()
})


// PLAYBACK CONTROLLER
function playSong(index) {
  if (!songs[index]) return
  currentIndex = index
  currentMode = 'music'
  const song = songs[index]

  audio.src = song.audio
  audio.play()
  isPlaying = true

  document.querySelector('.player-song').textContent = song.name
  document.querySelector('.player-artist').textContent = song.artist_name
  document.querySelector('.player-img').src = song.image || 'assets/music.svg'
  document.querySelector('.progress-bar').style.opacity = '1'
  document.getElementById('playBtn').innerHTML = pauseIcon

  updateLikeButtonUI(song)

  document.querySelectorAll('.card').forEach((card, i) => {
    card.style.outline = i === index ? '2px solid #7C3AED' : 'none'
  })
}


// LIKE BUTTON LOGIC
const likeBtn = document.querySelector('.like-btn')

function updateLikeButtonUI(song) {
  const isLiked = likedSongs.some(s => s.id === song.id)
  if (isLiked) {
    likeBtn.setAttribute('fill', '#7C3AED')
    likeBtn.style.color = '#7C3AED'
  } else {
    likeBtn.setAttribute('fill', 'none')
    likeBtn.style.color = '#aaa'
  }
}

likeBtn.addEventListener('click', () => {
  if (currentMode === 'radio' || !songs[currentIndex]) return
  const currentSong = songs[currentIndex]
  
  const songIndex = likedSongs.findIndex(s => s.id === currentSong.id)
  if (songIndex > -1) {
    likedSongs.splice(songIndex, 1) // Remove from liked
  } else {
    likedSongs.push(currentSong) // Add to liked
  }
  updateLikeButtonUI(currentSong)
})

// Play Liked Songs Playlist from Sidebar
document.querySelector('.likedplaylist').addEventListener('click', () => {
  if (likedSongs.length === 0) return alert("You haven't liked any songs yet!")
  songs = [...likedSongs]
  renderMusicCards(songs, true)
  playSong(0)
  document.querySelector('[data-tab="music"]').click()
})

// PLAYER CONTROLS

document.getElementById('playBtn').addEventListener('click', () => {
  if (isPlaying) {
    audio.pause()
    isPlaying = false
    document.getElementById('playBtn').innerHTML = playIcon
  } else if (audio.src) {
    audio.play()
    isPlaying = true
    document.getElementById('playBtn').innerHTML = pauseIcon
  }
})

const ctrlBtns = document.querySelectorAll('.ctrl-btn')
ctrlBtns[0].addEventListener('click', () => {
  if (currentMode === 'music' && currentIndex > 0) playSong(currentIndex - 1)
})
ctrlBtns[1].addEventListener('click', () => {
  if (currentMode === 'music' && currentIndex < songs.length - 1) playSong(currentIndex + 1)
})

audio.addEventListener('ended', () => {
  if (currentMode === 'music' && currentIndex < songs.length - 1) playSong(currentIndex + 1)
})

// Progress & Volume
audio.addEventListener('timeupdate', () => {
  if (!audio.duration || currentMode === 'radio') return
  const progressInput = document.querySelector('.progress')
  const times = document.querySelectorAll('.time')
  progressInput.value = (audio.currentTime / audio.duration) * 100
  times[0].textContent = formatTime(audio.currentTime)
})

audio.addEventListener('loadedmetadata', () => {
  if(currentMode === 'music') {
    document.querySelectorAll('.time')[1].textContent = formatTime(audio.duration)
  }
})

document.querySelector('.progress').addEventListener('input', (e) => {
  if (audio.duration && currentMode === 'music') {
    audio.currentTime = (e.target.value / 100) * audio.duration
  }
})

document.querySelector('.volume').addEventListener('input', (e) => {
  audio.volume = e.target.value / 100
})

// INFINITE SCROLL & JAMENDO FETCH
async function fetchSongs(query = '', append = false) {
  if (isFetchingMusic) return
  isFetchingMusic = true

  try {
    let url = `https://api.jamendo.com/v3.0/tracks/?client_id=4ad3fbd1&format=json&limit=${musicLimit}&offset=${musicOffset}&audioformat=mp32`
    if (query) url += `&search=${encodeURIComponent(query)}`

    const res = await fetch(url)
    const data = await res.json()
    
    if (append) {
      songs = [...songs, ...data.results]
    } else {
      songs = data.results
    }
    
    renderMusicCards(songs, !append)
  } catch (err) {
    console.log('Songs fetch failed:', err)
  } finally {
    isFetchingMusic = false
  }
}

function renderMusicCards(songList, clearContainer = true) {
  const container = document.querySelector('.albumCards')
  if (clearContainer) container.innerHTML = ''

  const colors = ['blue', 'green', 'red', 'pink']

  // Only render the newly appended items to save performance
  const startIndex = clearContainer ? 0 : container.children.length

  for (let i = startIndex; i < songList.length; i++) {
    const song = songList[i]
    const card = document.createElement('div')
    card.className = 'card'

    const hasImage = song.image && song.image.length > 0
    card.innerHTML = `
      <div class="innerCard ${colors[i % colors.length]}" style="${hasImage ? `background: url('${song.image}') center/cover no-repeat; padding: 0;` : ''}">
        ${!hasImage ? '<img src="assets/music.svg" alt="">' : ''}
      </div>
      <h1>${song.name.substring(0, 20)}${song.name.length > 20 ? '...' : ''}</h1>
      <p>${song.artist_name}</p>
    `
    card.addEventListener('click', () => playSong(i))
    container.appendChild(card)
  }
}

// Infinite Scroll Listener
document.querySelector('.right-container').addEventListener('scroll', (e) => {
  const { scrollTop, scrollHeight, clientHeight } = e.target
  // If user scrolls near the bottom of the container
  if (scrollTop + clientHeight >= scrollHeight - 100) {
    const activeBtn = document.querySelector('.filter-tabs .active-tab')
    if (activeBtn && activeBtn.dataset.tab === 'music' && !isFetchingMusic) {
      musicOffset += musicLimit
      fetchSongs(currentQuery, true)
    } else if (activeBtn && activeBtn.dataset.tab === 'fm' && !isFetchingFm) {
      fmOffset += fmLimit
      fetchStations(currentFmCountry, currentFmQuery, true)
    }
  }
})


// SEARCH BAR
const searchInput = document.querySelector('.searchbox')
let searchTimeout = null

searchInput.addEventListener('input', (e) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    const query = e.target.value.trim()
    const activeBtn = document.querySelector('.filter-tabs .active-tab')
    const activeTab = activeBtn ? activeBtn.dataset.tab : 'music'

    if (activeTab === 'fm') {
      fmOffset = 0
      currentFmQuery = query
      fetchStations(currentFmCountry, query, false)
    } else {
      musicOffset = 0
      currentQuery = query
      fetchSongs(query, false)
    }
  }, 500)
})

// TAB SWITCHING

const tabBtns = document.querySelectorAll('.filter-tabs .btn')
const musicSection = document.getElementById('music-section')
const fmSection = document.getElementById('fm-section')
const downloadsSection = document.getElementById('downloads-section')

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active-tab'))
    btn.classList.add('active-tab')

    const tab = btn.dataset.tab
    musicSection.classList.add('hidden')
    fmSection.classList.add('hidden')
    downloadsSection.classList.add('hidden')

    if (tab === 'music') musicSection.classList.remove('hidden')
    else if (tab === 'fm') fmSection.classList.remove('hidden')
    else if (tab === 'downloads') downloadsSection.classList.remove('hidden')
  })
})


// FM RADIO - RADIO BROWSER API
async function fetchStations(countrycode = '', query = '', append = false) {
  if(isFetchingFm) return
  isFetchingFm = true

  try {
    let url = `https://de1.api.radio-browser.info/json/stations/search?limit=${fmLimit}&offset=${fmOffset}&hidebroken=true&order=clickcount&reverse=true`
    if (countrycode) url += `&countrycode=${countrycode}`
    if (query) url += `&name=${encodeURIComponent(query)}`

    const res = await fetch(url)
    const data = await res.json()
    renderFMCards(data, !append)
  } catch (err) {
    console.log('FM stations fetch failed:', err)
  } finally {
    isFetchingFm = false
  }
}

function renderFMCards(stations, clearContainer = true) {
  const container = document.getElementById('fm-cards')
  if (clearContainer) container.innerHTML = ''

  if (stations.length === 0 && clearContainer) {
    container.innerHTML = '<p style="color:#aaa; padding:1rem;">No stations found</p>'
    return
  }

  const colors = ['blue', 'green', 'red', 'pink']

  stations.forEach((station, index) => {
    const channel = document.createElement('div')
    channel.className = 'channel'

    const iconHTML = station.favicon
      ? `<img src="${station.favicon}" alt="" style="width:100%; height:100%; border-radius:5px; object-fit:cover;" onerror="this.src='assets/boombox.svg'">`
      : `<img src="assets/boombox.svg" alt="">`

    // Fix for weird station names by grabbing actual name instead of cutting blindly, and providing fallback
    const stationName = station.name ? station.name.trim().substring(0, 22) : 'Unknown Station'

    channel.innerHTML = `
      <div class="innerfmbox ${colors[index % colors.length]}">
        ${iconHTML}
      </div>
      <div class="fmboxtxt">
        <h2>${stationName}</h2>
        <p>${station.country || 'Global'}</p>
      </div>
    `

    channel.addEventListener('click', () => playStation(station))
    container.appendChild(channel)
  })
}

function playStation(station) {
  currentMode = 'radio'
  audio.src = station.url_resolved
  audio.play()
  isPlaying = true

  document.querySelector('.player-song').textContent = station.name.trim().substring(0, 30)
  document.querySelector('.player-artist').textContent = station.country || 'Live Radio'
  document.querySelector('.player-img').src = station.favicon || 'assets/boombox.svg'
  document.getElementById('playBtn').innerHTML = pauseIcon

  document.querySelector('.progress-bar').style.opacity = '0.3'
  document.querySelectorAll('.time')[0].textContent = '🔴 Live'
  document.querySelectorAll('.time')[1].textContent = ''
  
  likeBtn.setAttribute('fill', 'none')
  likeBtn.style.color = '#aaa'
}

document.querySelectorAll('.fm-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.fm-pill').forEach(p => {
      p.classList.remove('active-pill')
    })
    pill.classList.add('active-pill')
    
    currentFmCountry = pill.dataset.country
    fmOffset = 0
    fetchStations(currentFmCountry, currentFmQuery, false)
  })
})


// DOWNLOADS - LOCAL FILES

document.getElementById('file-input')?.addEventListener('change', (e) => {
  const files = Array.from(e.target.files)
  files.forEach(file => {
    const track = {
      name: file.name.replace(/\.[^/.]+$/, ''), 
      artist_name: 'Local File',
      audio: URL.createObjectURL(file),
      image: ''
    }
    localTracks.push(track)
  })
  renderLocalTracks()
})

function renderLocalTracks() {
  const container = document.getElementById('local-tracks')
  container.innerHTML = ''
  const colors = ['blue', 'green', 'red', 'pink']

  localTracks.forEach((track, index) => {
    const item = document.createElement('div')
    item.className = 'channel'
    item.style.marginBottom = '8px'
    item.style.cursor = 'pointer'

    item.innerHTML = `
      <div class="innerfmbox ${colors[index % colors.length]}">
        <img src="assets/music.svg" alt="">
      </div>
      <div class="fmboxtxt">
        <h2>${track.name.substring(0, 28)}</h2>
        <p>Local File</p>
      </div>
    `
    item.addEventListener('click', () => {
      songs = localTracks
      playSong(index)
    })
    container.appendChild(item)
  })
}

// INIT
fetchSongs()      
fetchStations()