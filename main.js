  // Import the functions you need from the SDKs you need
 import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
 import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
 import{getFirestore, setDoc, doc, getDoc} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js"

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyAC3Bj67tDaxSlc7Wa7R9XaE7YslXIYRhQ",
    authDomain: "perf-counter.firebaseapp.com",
    projectId: "perf-counter",
    storageBucket: "perf-counter.firebasestorage.app",
    messagingSenderId: "365791137165",
    appId: "1:365791137165:web:a31ef9358c1f9c16df01c4",
    measurementId: "G-1H39QY5T04"
  };

  // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth=getAuth();
    const db=getFirestore();

     

function showMessage(message, divId) {
    var messageDiv = document.getElementById(divId);
    messageDiv.innerHTML = message;
    messageDiv.classList.add('visible');

    // Select all elements with the class 'like-button'
    const likeButtons = document.querySelectorAll('button'); 
    
    likeButtons.forEach((button) => {
        // Add click listener to hide message when a like button is clicked
        button.addEventListener('click', () => {
            messageDiv.classList.remove('visible');
        });
    });
    
    // Optional: Also hide on focus if they are inputs
    const inputs = document.querySelectorAll('input'); 
    inputs.forEach((input) => {
        input.addEventListener('focus', () => {
            messageDiv.classList.remove('visible');
        });
    });
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function setButtonLoading(btn) {
    btn.disabled = true;
    btn.dataset.originalText = btn.textContent;
    btn.innerHTML = `
        <span class="btn-spinner"></span>
    `;
}

function resetButton(btn) {
    btn.disabled = false;
    btn.innerHTML = btn.dataset.originalText;
}

const signUp = document.getElementById('submitSignUp');
signUp.addEventListener('click', (event) => {
    event.preventDefault();
    

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email) {
        showMessage('Please enter your email.', 'signInMessage');
        return;
    }
    if (!validateEmail(email)) {
        showMessage('Invalid email address.', 'signInMessage');
        return;
    }
    if (!password) {
        showMessage('Please enter a password.', 'signInMessage');
        return;
    }
    if (!validatePassword(password)) {
        showMessage('Password should be at least 6 characters.', 'signInMessage');
        return;
    }
    setButtonLoading(signUp);
    createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            const user = userCredential.user;

            const docRef = doc(db, "users", user.uid);
            await setDoc(docRef, { email: email, password: password });

            localStorage.setItem('loggedInUserId', user.uid);

            await saveData();

            showMessage('Account created & data saved!', 'signInMessage');
            resetButton(signUp);


            closeSignIn();
            updateUI(); 
        })
        .catch((error) => {
            const friendlyMessages = {
                'auth/email-already-in-use':  'Email address already exists.',
                'auth/weak-password':         'Password should be at least 6 characters.',
                'auth/operation-not-allowed': 'Email/password sign-up is not enabled.',
            };
            showMessage(friendlyMessages[error.code] || error.message, 'signInMessage');
            resetButton(signUp);
        });
});

// --- RESET PASSWORD FUNCTIONALITY ---
const resetPasswordLink = document.querySelector('a[href="#"]');
if (resetPasswordLink) {
    resetPasswordLink.addEventListener('click', (event) => {
        event.preventDefault();
        const email = document.getElementById('email').value.trim();
        if (!email) {
            showMessage('Please enter your email to reset password.', 'signInMessage');
            return;
        }
        if (!validateEmail(email)) {
            showMessage('Invalid email address.', 'signInMessage');
            return;
        }
        sendPasswordResetEmail(auth, email)
            .then(() => {
                showMessage('Password reset email sent! Check your inbox/spam.', 'signInMessage');
            })
            .catch((error) => {
                const friendlyMessages = {
                    'auth/user-not-found': 'No account found with this email.',
                    'auth/invalid-email': 'Invalid email address.',
                };
                showMessage(friendlyMessages[error.code] || error.message, 'signInMessage');
            });
    });
}

document.querySelectorAll('#email, #password').forEach(input => {
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      document.getElementById('submitSignIn').click();
    }
  });
});



const signIn = document.getElementById('submitSignIn');
signIn.addEventListener('click', (event) => {

    event.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const auth = getAuth();
    const userId = localStorage.getItem('loggedInUserId');
    if (userId) {
        showMessage('You are already signed in', 'signInMessage');
        return;
    }
    if (!email) {
        showMessage('Please enter your email.', 'signInMessage');
        return;
    }
    if (!validateEmail(email)) {
        showMessage('Invalid email address.', 'signInMessage');
        return;
    }
    if (!password) {
        showMessage('Please enter your password.', 'signInMessage');
        return;
    }
    setButtonLoading(signIn);

signInWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
        showMessage('Login is successful', 'signInMessage');
        const user = userCredential.user;
        localStorage.setItem('loggedInUserId', user.uid);
        resetButton(signIn);
        await loadData(); // <- pulls their data from Firestore right after login
        closeSignIn();
    })
    .catch((error) => {
        const friendlyMessages = {
            'auth/invalid-credential': 'Invalid email or password.',
            'auth/user-not-found':     'No account found with this email.',
            'auth/wrong-password':     'Incorrect password.',
            'auth/too-many-requests':  'Too many attempts. Please try again later.',
            'auth/user-disabled':      'This account has been disabled.',
        };
        showMessage(friendlyMessages[error.code] || error.message, 'signInMessage');
        resetButton(signIn);
    });
});


// const micro=document.getElementById('submitSignUpmicro');
// const provider = new OAuthProvider('microsoft.com');

// micro.addEventListener('click', (event)=>{
//     const auth = getAuth();
//     signInWithPopup(auth, provider)
//     .then((result) => {
//         // User is signed in.
//         // IdP data available in result.additionalUserInfo.profile.

//         // Get the OAuth access token and ID Token
//         const credential = OAuthProvider.credentialFromResult(result);
//         const accessToken = credential.accessToken;
//         const idToken = credential.idToken;
//     })
//     .catch((error) => {
//         console.error("error writing document", error);
//     });
// });

window.addEventListener('load', loadData);

// // --- NAME & TITLE LOGIC ---
//   function checkUrlForName() {
//     const params = new URLSearchParams(window.location.search);
//     let name = params.get('name');
//     if (!name && window.location.hash) name = window.location.hash.substring(1); 
//     if (name) {
//         name = decodeURIComponent(name);
//         document.getElementById('app-title').innerText = name + "'s Counter";
//         document.title = name + "'s Counter";
//         localStorage.setItem('name', name);

//     }
//   }

// checkUrlForName();

  // --- DATA MANAGEMENT ---
  (function autoName() {
  const params = new URLSearchParams(window.location.search);
   if (params.has('name')) {
        params.delete('name');
        window.history.replaceState({}, document.title, `${window.location.pathname}${params}`);
        }
        // console.log('asdasda')
    })();


const title = document.getElementById('app-title');

let editbtn = document.querySelector(".editbtn")
editbtn.addEventListener('click', function() {
    title.style.pointerEvents='unset';
    title.focus()
});
title.addEventListener('focusin', function(){
    editbtn.style.visibility='hidden'
    editbtn.style.cursor='default'
    editbtn.style.pointerEvents='none'
})
title.addEventListener('focusout', function(){
    editbtn.style.visibility='unset'
    editbtn.style.cursor='pointer'
    editbtn.style.pointerEvents='all'
    title.style.pointerEvents='none';
    localStorage.setItem('title', title.value);
    saveData();
})
title.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        title.blur(); // triggers focusout which saves and resets
    }
});
const mirror = document.createElement('span');
mirror.style.cssText = 'visibility:hidden;position:absolute;white-space:pre;font:inherit;font-size:32px;font-weight:800;letter-spacing:-0.04em;padding:4px;';
document.body.appendChild(mirror);

function resizeInput(input) {
  mirror.textContent = input.value;
  input.style.width = mirror.offsetWidth + 'px';
}


resizeInput(title); // on load
title.addEventListener('input', () => resizeInput(title));


  // --- CHART LOGIC ---
  let myChartInstance = null;

  function renderChart() {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    
    const labels = [];
    const payData = [];
    const fullData = [];
    const postData = [];


    for (let i = 1; i <= 31; i++) {
        labels.push(i);
        
        const day = allData[i];
        const calls = day.calls || 0;
        const coll = day.coll|| 0;
        
        const payPerc = calls > 0 ? (day.pay / calls * 100) : 0;
        const fullPerc = calls > 0 ? (day.full / calls * 100) : 0;
        const postPerc = calls > 0 ? (day.post  / coll * 100) : 0;

        payData.push(payPerc);
        fullData.push(fullPerc);
        postData.push(postPerc);

    }

    if (myChartInstance) {
        myChartInstance.destroy();
    }

    myChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Pay %',
                    data: payData,
                    borderColor: '#f59e0b', 
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderWidth: 2,
                    tension: 0.4, 
                    pointRadius: 1, 
                    pointHoverRadius: 4,
                    fill: true
                },
                {
                    label: 'Full %',
                    data: fullData,
                    borderColor: '#3b82f6', 
                    backgroundColor: 'rgba(59, 130, 246, 0.05)',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 1,
                    fill: true
                },
                {
                    label: 'Rem %',
                    data: postData,
                    borderColor: '#22c55e', 
                    backgroundColor: 'rgba(100, 100, 50, 0.05)',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 1,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    labels: { color: '#94a3b8', font: { size: 10, weight: 'bold' } }
                },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleColor: '#fff',
                    bodyColor: '#cbd5e1',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#64748b', font: { size: 9 } }
                },
                y: {
                    beginAtZero: true,
                    max: 100, 
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#64748b', font: { size: 9 }, stepSize: 25 }
                }
            }
        }
    });
  }



  const defaultDay = {
    calls: 0, pay: 0, full: 0, coll: 0, rem: 0, post:0, credits: 0, ap: 0, pp: 0
  };

  let allData = JSON.parse(localStorage.getItem('counterData_v4')) || {};
  
  // Ensure all 31 days exist in structure (lazy init)
  for(let i=1; i<=31; i++) {
    if(!allData[i]) allData[i] = {...defaultDay};
  }

  // Active State
  let selectedDays = [new Date().getDate()]; // Default to today
  let lastUpdateTimestamp = parseInt(localStorage.getItem('lastUpdateTimestamp')) || Date.now();

  // --- CALENDAR UI ---
  const calendarGrid = document.getElementById('calendar-grid');

  function renderCalendar() {
        if (!allData || Object.keys(allData).length === 0) {
        // optionally clear the calendar UI here
        return;
    }
    calendarGrid.innerHTML = '';
    for (let i = 1; i <= 31; i++) {
        const btn = document.createElement('div');
        btn.className = 'day-btn';
        btn.innerText = i;
        
        // Check if day has data (sum of values > 0)
        const daySum = Object.values(allData[i]).reduce((a, b) => a + b, 0);
        if (daySum > 0) btn.classList.add('has-data');
        
        // Check if active
        if (selectedDays.includes(i)) btn.classList.add('active');

        btn.onclick = () => toggleDay(i);
        calendarGrid.appendChild(btn);
    }
  }

  function toggleDay(day) {
        if (selectedDays.includes(day)) {
            selectedDays = selectedDays.filter(d => d !== day);
        } else {
            selectedDays.push(day);
        }

    updateUI();
  }
  

function toggleSelectAll() {
    const daysWithData = Array.from(document.querySelectorAll('.day-btn.has-data'))
                             .map(el => parseInt(el.textContent));

    const allDataSelected = daysWithData.every(day => selectedDays.includes(day));

    if (allDataSelected) {
        selectedDays = [new Date().getDate()];
    } else {
        selectedDays = daysWithData;
    }

    updateUI();
}

// Attach the click event using JavaScript instead
document.querySelector('.select-all-btn').addEventListener('click', toggleSelectAll);
// document.querySelector('#data-cpy').addEventListener('click', exportData);
document.querySelector('#data-pst').addEventListener('click', importData);
// document.querySelector('#toggle-left-btn').addEventListener('click', importData);

  // --- CORE LOGIC ---

  function getAggregatedData() {

      let result = {...defaultDay};
      selectedDays.forEach(day => {
          const dData = allData[day];
          Object.keys(result).forEach(key => {
              result[key] += (dData[key] || 0);
          });
      });
      return result;
  }

//   function saveData() {
//       localStorage.setItem('counterData_v4', JSON.stringify(allData));
//       renderCalendar(); 
//   }

async function loadData() {
    const userId = localStorage.getItem('loggedInUserId');

    if (!userId) {
        const local = localStorage.getItem('counterData_v4');
        if (local) allData = JSON.parse(local);
        if (!localStorage.getItem('title')) localStorage.setItem('title', "Taha's Counter");
        updateUI();
        return;
    }

    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data().counterData) {
            allData = userSnap.data().counterData;
            const title = userSnap.data().title;
            const savedColor = userSnap.data().primaryColor;

            localStorage.setItem('counterData_v4', JSON.stringify(allData));
            localStorage.setItem('title', title || "Taha's Counter");
            localStorage.setItem('primaryColor', savedColor || "#fdc9c9");
            console.log("Data loaded from Firebase!");
        } else {
            const local = localStorage.getItem('counterData_v4');
            if (local) allData = JSON.parse(local);
            if (!localStorage.getItem('title')) localStorage.setItem('title', "Taha's Counter");
            if (!localStorage.getItem('primaryColor')) localStorage.setItem('primaryColor', "#fdc9c9");
            console.log("No server data found, using local.");
        }

    } catch (error) {
        console.error("Error loading data from Firebase: ", error);
        const local = localStorage.getItem('counterData_v4');
        if (local) allData = JSON.parse(local);
        if (!localStorage.getItem('title')) localStorage.setItem('title', "Taha's Counter");
    }

    updateUI();
}

// Debounce timer — lives outside the function
let saveDebounceTimer = null;

async function saveData({ immediate = false } = {}) {
    const userId = localStorage.getItem('loggedInUserId');
    const usrName = localStorage.getItem('title');
    const savedColor = localStorage.getItem('primaryColor');

    if (usrName === 'undefined' || !usrName) {
        console.warn("Name not available yet.");
        // optionally return or skip saving name
    }

    // Always save locally + re-render right away for instant UI feedback
    localStorage.setItem('counterData_v4', JSON.stringify(allData));
    localStorage.setItem('title', usrName);
    localStorage.setItem('primaryColor', savedColor || "#fdc9c9");
    updateUI();

    if (!userId) {
        console.warn("No user logged in. Saving locally only.");
        return;
    }

    // Clear any pending save
    clearTimeout(saveDebounceTimer);

    saveDebounceTimer = setTimeout(async () => {
        try {
            const userRef = doc(db, "users", userId);
            await setDoc(userRef, { 
                counterData: allData, 
                title: usrName ,
                primaryColor: savedColor 
            }, { merge: true });
            console.log("Data successfully synced to Firebase!");
        } catch (error) {
            console.error("Error syncing data to Firebase: ", error);
        }
    }, 1500); // waits 1.5s after the LAST change before syncing
}

// Map the button types to the actual Input IDs in the DOM
const INPUT_MAP = {
    'ready': 'ready-val',
    'In': 'in-val',
    'call-len': 'call-len-val'
};

function formatTime(totalMinutes) {
    const secondsTotal = Math.round(totalMinutes * 60);
    const h = Math.floor(secondsTotal / 3600);
    const m = Math.floor((secondsTotal % 3600) / 60);
    const s = secondsTotal % 60;

    const pad = (num) => num.toString().padStart(2, '0');

    if (h > 0) {
        return `${pad(h)}:${pad(m)}:${pad(s)}`;
    } else {
        return `${pad(m)}:${pad(s)}`;
    }
}
function updateEstimation() {
    const ready = parseFloat(document.getElementById('ready-val').value) || 0;
    const inCall = parseFloat(document.getElementById('in-val').value) || 0;
    const callLen = parseFloat(document.getElementById('call-len-val').value) || 0;
    
    const displayElement = document.getElementById('est-avail');

    // Avoid division by zero
    if (inCall === 0) {
        displayElement.innerText = "00:00"; 
        return;
    }


    const totalMinutes = (ready * callLen) / inCall;

    displayElement.innerText = formatTime(totalMinutes);
}

// Left panel toggle logic
function setLeftVisibility(visible) {
    const left = document.getElementById('left-panel');
    const right = document.getElementById('metrics-capture-area');
    const btn = document.getElementById('toggle-left-btn');
    if (!left || !btn) return;
    if (visible) {
        // left.style.display = '';
        left.style.opacity='100'
        left.style.transform = "translateX(0px)";
        right.style.transform = "translateX(0px)";
        btn.innerHTML = '&#10005;'; // ×
        btn.title = 'Hide menu';
    } else {
        // left.style.display = 'none';
        left.style.opacity='0'
        left.style.transform = "translateX(210px)";
        right.style.transform = "translateX(-210px)";
        btn.innerHTML = '&#9776;'; // ≡
        btn.title = 'Show menu';
    }
    localStorage.setItem('leftVisible', visible ? '1' : '0');
}

function toggleLeft() {
    const current = localStorage.getItem('leftVisible');
    const visible = current === null ? true : current === '1';
    setLeftVisibility(!visible);
}

// Ensure the DOMContentLoaded handler applies saved left state
document.addEventListener('DOMContentLoaded', () => {
    const leftState = localStorage.getItem('leftVisible');
    const visible = leftState === null ? true : leftState === '1';
    setLeftVisibility(visible);

    // existing input listeners
    const inputs = ['ready-val', 'in-val', 'call-len-val'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updateEstimation);
    });
    
    // Run once on load to set initial state
    updateEstimation();
});

// Expose toggleLeft globally for inline onclick
window.toggleLeft = toggleLeft;

document.addEventListener('DOMContentLoaded', () => {
    const inputs = ['ready-val', 'in-val', 'call-len-val'];
    inputs.forEach(id => {
        document.getElementById(id).addEventListener('input', updateEstimation);
    });
    
    // Run once on load to set initial state
    updateEstimation();
});

window.change = function(key, amt) {
    // Only allow editing if exactly ONE day is selected
    if (selectedDays.length !== 1) {
        alert("Please select a single day to edit data.");
        return;
    }

    const day = selectedDays[0];
    allData[day][key] = Math.max(0, (allData[day][key] || 0) + amt);

    
    // Pulse animation
    const el = document.getElementById(key + '-val');
    el.classList.remove('update-pulse');
    void el.offsetWidth;
    el.classList.add('update-pulse');

    // Update Timestamp
    lastUpdateTimestamp = Date.now();
    localStorage.setItem('lastUpdateTimestamp', lastUpdateTimestamp);
    
    saveData();
    updateUI();
  }

  // Handle Manual Input for Credits
  document.getElementById('credits-val').addEventListener('change', (e) => {
      if (selectedDays.length !== 1) {
          e.target.value = getAggregatedData().credits; // Revert
          alert("Please select a single day to edit data.");
          return;
      }
      const day = selectedDays[0];
      allData[day].credits = parseInt(e.target.value) || 0;
      saveData();
      updateUI();
  });

  function updateUI() {
    renderCalendar();
    const userId = localStorage.getItem('loggedInUserId');
    if (userId) {
        document.getElementById('loginPopUp').innerHTML="Logout";
        
    }else{
		document.getElementById('loginPopUp').innerHTML="Login";
	}
    const data = getAggregatedData();
    const isMulti = selectedDays.length > 1;
    const title = localStorage.getItem("title")
    const savedColor = localStorage.getItem("primaryColor")
    
    const titleDOM = document.getElementById('app-title');
    document.getElementById('app-title').value = title
    document.documentElement.style.setProperty('--primary', savedColor);

    // document.title = title;
    resizeInput(titleDOM);

    // View Label
    const viewLabel = document.getElementById('view-label');
    // const lockMsg = document.getElementById('lock-msg');
    const controls = document.querySelectorAll('.controls');

    if (selectedDays.length === 0) {
        selectedDays.length = 0
    }

    if (isMulti || selectedDays.length === 0) {
        viewLabel.innerText = `Viewing Total (${selectedDays.length} Days)`;
        // lockMsg.style.visibility = 'visible';
        controls.forEach(c => c.classList.add('locked'));
	  document.getElementById('credits-val').disabled = true;

    } else {
        viewLabel.innerText = `Day ${selectedDays[0]}`;
        // lockMsg.style.visibility = 'hidden';
        controls.forEach(c => c.classList.remove('locked'));
        document.getElementById('credits-val').disabled = false;

    }
    // Update Counters
    

    document.getElementById('calls-val').innerText = data.calls;
    document.getElementById('pay-val').innerText = data.pay;
    document.getElementById('full-val').innerText = data.full;
    document.getElementById('coll-val').innerText = data.coll;
    document.getElementById('rem-val').innerText = data.rem;
    document.getElementById('post-val').innerText = data.post;
    document.getElementById('ap-val').innerText = data.ap;
    document.getElementById('pp-val').innerText = data.pp;
    document.getElementById('credits-val').value = data.credits;

    // Update Percentages
    const payRaw = data.calls ? (data.pay / data.calls * 100) : 0;
    const fullRaw = data.calls ? (data.full / data.calls * 100) : 0;
    const remRaw = data.coll ? (data.rem / data.coll * 100) : 0;
    // const postRaw = data.post? (data.post/ data.coll * 100) : 0;
    const postRaw = data.coll ? (data.post / data.coll * 100) : 0;
    const apval= data.ap? (data.ap * 2) : 0;
    const ppval= data.pp? (data.pp) : 0;

    document.getElementById('pay-perc').innerText = payRaw.toFixed(1) + "%";
    document.getElementById('full-perc').innerText = fullRaw.toFixed(1) + "%";
    document.getElementById('rem-perc').innerText = remRaw.toFixed(1) + "%";
    document.getElementById('post-perc').innerText = postRaw.toFixed(1) + "%";
    document.getElementById('ap-val-mon').innerText = apval.toFixed(1) + "$";
    document.getElementById('pp-val-mon').innerText = ppval.toFixed(1) + "$";


    // Update Tiers 
    updateTierUI('pay-tier', payRaw, 'pay', data.calls > 0);
    updateTierUI('full-tier', fullRaw, 'full', data.calls > 0);
    updateTierUI('rem-tier', remRaw, 'rem', data.coll > 0);
    // updateTierUI('post-tier', postRaw, 'post', data.post> 0);
    updateTierUI('post-tier', postRaw, 'post', data.coll > 0);


    // Color Logic
// Pay Logic
// document.getElementById('pay-perc').style.color = payRaw >= 78 ? 'var(--success)' : (payRaw >= 66 ? 'var(--warning)' : 'var(--danger)');

// Full Logic
// document.getElementById('full-perc').style.color = fullRaw >= 55 ? 'var(--success)' : (fullRaw >= 48 ? 'var(--warning)' : 'var(--danger)');

// Remaining Logic
// document.getElementById('rem-perc').style.color = remRaw >= 75 ? 'var(--success)' : (remRaw >= 65 ? 'var(--warning)' : 'var(--danger)');
    
// Remaining Logic
// document.getElementById('post-perc').style.color = postRaw >= 75 ? 'var(--success)' : (postRaw >= 65 ? 'var(--warning)' : 'var(--danger)');

    const credEl = document.getElementById('credits-val');
    if (isMulti) {
    	if (data.credits > 2000) credEl.style.color = 'var(--danger)';
    	else if (data.credits >= 1000) credEl.style.color = 'var(--warning)';
    	else credEl.style.color = 'var(--success)';
    } else {
    	if (data.credits > 180) credEl.style.color = 'var(--danger)';
    	else if (data.credits >= 100) credEl.style.color = 'var(--warning)';
    	else credEl.style.color = 'var(--success)';
    }
    renderChart();

  }

  function getTierInfo(value, type) {
    let tierNum = 1;
    let tierLabel = '1 - 0$';

    const thresholds = {
      pay: [60, 66, 73, 78, 100],
      full: [45, 48, 52, 55, 100],
      rem: [60, 65, 70, 75, 100],
      post: [60, 65, 70, 75, 100]
    };

    const labels = {
      pay: ['1 - 0$', '2 - 20$', '3 - 30$', '4 - 40$', '5 - 50$'],
      full: ['1 - 0$', '2 - 25$', '3 - 50$', '4 - 100$', '5 - 150$'],
      rem: ['1 - 0$', '2 - 30$', '3 - 70$', '4 - 135$', '5 - 250$'],
      post: ['1 - 0$', '2 - 30$', '3 - 70$', '4 - 135$', '5 - 250$']
    };

    const typeThresholds = thresholds[type] || thresholds.pay;
    const typeLabels = labels[type] || labels.pay;

    const tierIndex = typeThresholds.findIndex(threshold => value < threshold);
    tierNum = tierIndex === -1 ? 5 : tierIndex + 1;
    tierLabel = typeLabels[tierNum - 1];

    const lowerBound = tierNum === 1 ? 0 : typeThresholds[tierNum - 2];
    const upperBound = typeThresholds[tierNum - 1];
    const color = `var(--tier-${tierNum})`;
    return { tier: tierLabel, color, tierNum, lowerBound, upperBound };
  }

  function updateTierUI(id, perc, type, hasData) {
    const badge = document.getElementById(id);
    const arrowIds = {
      pay: 'payArrow',
      full: 'fullArrow',
      post: 'postArrow'
    };
    const arrowEl = document.getElementById(arrowIds[type]);

    if (!hasData) {
       if (badge) {
         badge.style.visibility = 'hidden';
       }
       if (arrowEl) {
         arrowEl.style.display = 'none';
       }
       return;
    }

    const { tier, color, tierNum, lowerBound, upperBound } = getTierInfo(perc, type);

    if (badge) {
       badge.style.display = 'inline-block';
       badge.style.visibility = 'visible';
       badge.innerText = `TIER ${tier}`;
       badge.style.color = color;
       badge.style.borderColor = color;
    }

    if (arrowEl) {
       if (tierNum === 5) {
         arrowEl.style.display = 'none';
       } else {
         arrowEl.style.display = 'block';
         const wrapper = arrowEl.parentElement;
         const badgeEl = wrapper ? wrapper.querySelector('.tier-badge') : null;
         const wrapperWidth = wrapper ? wrapper.clientWidth : 0;
         const arrowWidth = arrowEl.offsetWidth || 0;
         const badgeOffset = badgeEl ? badgeEl.offsetLeft : 0;
         const progress = upperBound === lowerBound ? 1 : (perc - lowerBound) / (upperBound - lowerBound);
         const clampedProgress = Math.min(Math.max(progress, 0), 1);
         const minLeft = Math.min(badgeOffset, Math.max(wrapperWidth - arrowWidth, 0));
         const maxLeft = Math.max(wrapperWidth - arrowWidth, 0);
         const pointPos = minLeft + (maxLeft - minLeft) * clampedProgress;
         arrowEl.style.left = `${pointPos}px`;
       }
    }
  }

  // --- JSON EXPORT / IMPORT ---

//   function loginPopUp() {
//     //   const json = JSON.stringify(allData);
//     //   navigator.clipboard.writeText(json).then(() => {
//     //       const btn = document.getElementById('data-cpy');
//     //       const original = btn.innerText;
//     //       btn.innerText = "Copied!";
//     //       setTimeout(() => btn.innerText = original, 2000);
//     //   });
    
//   }
function getDefaultData() {
    const data = {};
    for (let i = 1; i <= 31; i++) {
        data[i] = { ...defaultDay };
    }
    return data;
}
function loginPopUp() {
    const userId = localStorage.getItem('loggedInUserId');

    if (userId) {
        const auth = getAuth();
        signOut(auth)
            .then(() => {
                localStorage.removeItem('loggedInUserId');
                localStorage.removeItem('counterData_v4');
                allData = getDefaultData();                             // ← full reset, not {}
                selectedDays = [new Date().getDate()];                  // reset selected day to today
                document.getElementById('loginPopUp').textContent = 'Login';
                updateUI();
                console.log("User signed out.");
            })
            .catch((error) => {
                console.error("Sign out error:", error);
            });
        return; // stop here, don't open the modal
    }

    const modal   = document.getElementById('signIn');
    const overlay = document.getElementById('signinOverlay');

    modal.classList.add('active');
    overlay.classList.add('active');

    overlay.addEventListener('click', closeSignIn, { once: true });
}

function closeSignIn() {
    document.getElementById('signIn').classList.remove('active');
    document.getElementById('signinOverlay').classList.remove('active');
}

document.getElementById('loginPopUp').addEventListener('click', loginPopUp);

  function importData() {
      const input = prompt("Paste your JSON Data here (or leave it empty to reset)");
if (input === null) return;
// If input is null (Cancel) or empty string, reset the data
  if (!input || input.trim() === "") {
    if (confirm("No data provided. Reset all days to default?")) {
      allData = {};
      for (let i = 1; i <= 31; i++) {
        allData[i] = { ...defaultDay };
      }
      saveData();
      selectedDays = [new Date().getDate()];
      updateUI();
      alert("Data has been reset.");
    }
    return;
  }
      try {
          const parsed = JSON.parse(input);
          // Basic validation: Check if it looks like our object (keys 1-31 exist or can be added)
          if (typeof parsed === 'object') {
              allData = parsed;
              // Ensure structure integrity
              for(let i=1; i<=31; i++) {
                 if(!allData[i]) allData[i] = {...defaultDay};
              }
              saveData();
              selectedDays = [new Date().getDate()]; // Reset view
              updateUI();
              alert("Data loaded successfully!");
          } else {
              throw new Error("Invalid format");
          }
      } catch (e) {
          alert("Error: Invalid JSON data.");
      }
  }

  // --- SCREENSHOT ---

  document.getElementById('copy-btn').onclick = function() {
  const btn = this;
  const area = document.getElementById('metrics-capture-area');
  
  html2canvas(area, { 
      backgroundColor: '#000000',
      scale: 3,
      // Inject CSS into the cloned document to stop all animations
      onclone: (clonedDocument) => {
          const style = clonedDocument.createElement('style');
          // Force all elements to bypass transitions and animations
          style.innerHTML = `
            * { 
              transition: none !important; 
              animation: none !important; 
            }
          `;
          clonedDocument.head.appendChild(style);
      }
  }).then(canvas => {
    canvas.toBlob(blob => {
      // Check if blob exists to prevent errors
      if (!blob) return; 

      const item = new ClipboardItem({ [blob.type]: blob });
      navigator.clipboard.write([item]).then(() => {
        btn.innerText = "Copied!";
        btn.style.background = "var(--success)";
        setTimeout(() => {
          btn.innerText = "Screenshot";
          btn.style.background = "var(--primary)";
        }, 2000);
      });
    });
  });
};

  // --- TIMER ---
  function updateTimer() {
    const now = Date.now();
    const diffInSeconds = Math.floor((now - lastUpdateTimestamp) / 1000);
    const hrs = Math.floor(diffInSeconds / 3600);
    const mins = Math.floor((diffInSeconds % 3600) / 60);
    const secs = diffInSeconds % 60;
    const formattedTime = 
        `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    document.getElementById('last-updated').innerText = `Last Updated: ${formattedTime} ago`;
  }
  setInterval(updateTimer, 1000);

const targetSequence = 'autoaux';
let sequenceIndex = 0;

document.addEventListener('keydown', function(event) {
    if (!event.key) return;
    const key = event.key.toLowerCase();
    if (key === targetSequence[sequenceIndex]) {
        sequenceIndex++;
        if (sequenceIndex === targetSequence.length) {
            autoaux();
            sequenceIndex = 0; 
        }
    } else {
        sequenceIndex = 0; 
    }
});

function closeAutoAux() {
    document.getElementById('autoAux').classList.remove('active');
    document.getElementById('signinOverlay').classList.remove('active');
}

function autoaux() {

    console.log('Sequence "autoaux" detected! ');
    const modal   = document.getElementById('autoAux');
    const overlay = document.getElementById('signinOverlay');

    modal.classList.add('active');
    overlay.classList.add('active');

    overlay.addEventListener('click', closeAutoAux, { once: true });

}


submitBtn.addEventListener('click', () => {
    const auxDropdown = document.getElementById('auxDropdown');
    const minutes = Number(document.getElementById('minutes').value) || 0;
    const seconds = Number(document.getElementById('seconds').value) || 0;
    const delay = (minutes * 60 + seconds) * 1000;

    let jsCode;

    if (auxDropdown.value === "Voice Channel Not Ready End Of Shift Idle") {
        jsCode = `
setTimeout(() => {
    document.querySelector("#voice-state-select-headerContainer").click();
    setTimeout(() => {
        const parent = document.querySelector('[aria-label="${auxDropdown.value}"]');
        parent?.children[1]?.click();
        setTimeout(() => {
            document.getElementById("identity-menu").click();
            setTimeout(() => {
                document.getElementById("Sign Out");
                setTimeout(() => {
                    const parent = document.querySelector('[aria-label="Sign Out End Of Shift"]');
                    parent?.children[0]?.click();
                    setTimeout(() => {
                        document.querySelector('[aria-label="Sign Out Confirmation Are you sure you want to sign out? Ok"]')?.click();
                    }, 1000);
                }, 1000);
            }, 1000);
        }, 1000);
    }, 2000);
}, (${minutes} * 60 + ${seconds}) * 1000);
        `.trim();
    } else {
        jsCode = `
setTimeout(() => {
    document.querySelector("#voice-state-select-headerContainer").click();
    setTimeout(() => {
        const parent = document.querySelector('[aria-label="${auxDropdown.value}"]');
        parent?.children[1]?.click();
    }, 2000);
}, (${minutes} * 60 + ${seconds}) * 1000);
        `.trim();
    }

    navigator.clipboard.writeText(jsCode);
    
    // Visual feedback
    submitBtn.innerText = "Copied!";
    submitBtn.style.background = "var(--success)";
    setTimeout(() => {
        submitBtn.innerText = "Copy";
        submitBtn.style.background = "var(--primary)";
    }, 2000);
});

const fields = ['accNum', 'seqNum'];
const checks = ['pay', 'full', 'rem'];

function logData() {
  const data = {
    ...Object.fromEntries(fields.map(id => [id, document.getElementById(id).value])),
    ...Object.fromEntries(checks.map(id => [id, document.getElementById(`chk-${id}`).checked])),
  };

  // if fields empty return if not console.log data
  if (fields.some(id => !document.getElementById(id).value.trim())) {
    // console.log("Please fill in all fields.");
    return;
  }

  console.log(data);

  // clear feilds
  fields.forEach(id => document.getElementById(id).value = '');
  checks.forEach(id => document.getElementById(`chk-${id}`).checked = false);
}

fields.forEach(id =>
  document.getElementById(id).addEventListener('keydown', e => e.key === 'Enter' && logData())
);

// logic for #colorPicker that changes the primary color
const colorPicker = document.getElementById('colorPickerInput');

if (colorPicker) {
    colorPicker.addEventListener('input', () => {
        document.documentElement.style.setProperty('--primary', colorPicker.value);
    });

    colorPicker.addEventListener('change', () => {
        localStorage.setItem('primaryColor', colorPicker.value);
        saveData();
    });

    const savedColor = localStorage.getItem('primaryColor');
    if (savedColor) {
        document.documentElement.style.setProperty('--primary', savedColor);
        colorPicker.value = savedColor;
    }
}

  // Init
  updateUI();
  updateTimer();
