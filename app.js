

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBUCmCvVI3JnoKlQ-aDqlHivTrck34tlBw",
  authDomain: "aura-fm.firebaseapp.com",
  projectId: "aura-fm",
  storageBucket: "aura-fm.firebasestorage.app",
  messagingSenderId: "1059247645194",
  appId: "1:1059247645194:web:4069d3d35b5c12615635f3"
};

// Initialize Firebase

firebase.initializeApp(firebaseConfig)
const auth = firebase.auth()
const provider = new firebase.auth.GoogleAuthProvider()

function googleLogin() {
  auth.signInWithPopup(provider)
    .then(result => {
      const user = result.user
      console.log(user.displayName, user.photoURL)
    })
    .catch(err => console.log(err))
}

document.querySelector('.login-btn').onclick = googleLogin
document.querySelector('.loginbtn').onclick = googleLogin






const hours = new Date().getHours()
let greeting = document.querySelector('.greeting')
if (hours >= 5 && hours < 12){
    greeting.textContent ='Good Morning 🌅'
} else if (hours >= 12 && hours <17){
    greeting.textContent='Good Afternoon 👋'
} else if(hours>= 17 && hours < 21){
    greeting.textContent='Good Evening 🌆'
} else{
    greeting.textContent='Good Night 🌙'
}

