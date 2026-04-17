/* ── Cookie Helpers ────────────────────────── */
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Strict";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

/* ── Helpers ───────────────────────────────── */
// Auto-fill on load if remember cookie exists
document.addEventListener('DOMContentLoaded', () => {
    const savedId = getCookie('remembered_cid');
    if (savedId) {
        document.getElementById('collegeId').value = savedId;
        document.getElementById('rememberMe').checked = true;
    }
});

function showLoginError(msg) {
    const statusEl = document.getElementById('loginStatus');
    document.getElementById('loginStatusText').textContent = msg;
    statusEl.style.display = 'flex';

    // Red border + shake on both credential fields
    const fields = ['collegeId', 'password'];
    fields.forEach(id => {
        const inp = document.getElementById(id);
        inp.classList.add('err');
        inp.classList.remove('shake');
        // force reflow so animation restarts
        void inp.offsetWidth;
        inp.classList.add('shake');
        inp.addEventListener('input', () => {
            inp.classList.remove('err', 'shake');
            statusEl.style.display = 'none';
        }, { once: true });
    });
}

/* ── Password visibility toggle ─────────── */
document.getElementById('pwToggle').addEventListener('click', function () {
    const pw = document.getElementById('password');
    const show = pw.type === 'password';
    pw.type = show ? 'text' : 'password';
    this.textContent = show ? 'visibility_off' : 'visibility';
});

/* ── Forgot Password ────────────────────── */
document.getElementById('forgotPassword').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Please contact your system administrator or technical head to reset your Phase Key.');
});

/* ── Ripple on primary btn ──────────────── */
document.getElementById('loginBtn').addEventListener('click', function (e) {
    const r = document.createElement('span');
    r.className = 'ripple';
    const rect = this.getBoundingClientRect();
    r.style.left = (e.clientX - rect.left - 4) + 'px';
    r.style.top = (e.clientY - rect.top - 4) + 'px';
    this.appendChild(r);
    setTimeout(() => r.remove(), 700);
});

/* ── Form submission ────────────────────── */
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const fields = ['collegeId', 'password'];
    let valid = true;
    fields.forEach(id => {
        const inp = document.getElementById(id);
        if (!inp.value.trim()) {
            inp.classList.add('err');
            valid = false;
            inp.addEventListener('input', () => inp.classList.remove('err'), { once: true });
        }
    });

    if (!valid) return;

    const btn = document.getElementById('loginBtn');
    const ogHtml = btn.innerHTML;
    btn.innerHTML = '<span>Verifying...</span>';
    btn.disabled = true;

    const collegeId = document.getElementById('collegeId').value.trim();
    const rememberMe = document.getElementById('rememberMe').checked;

    const payload = {
        collegeId: collegeId,
        password: document.getElementById('password').value.trim()
    };

    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // Handle Remember Me
                if (rememberMe) {
                    setCookie('remembered_cid', collegeId, 30); // 30 days
                } else {
                    setCookie('remembered_cid', "", -1); // delete
                }

                localStorage.setItem('collegeId', payload.collegeId);
                window.location.href = '/dashboard.html';
            } else {
                showLoginError(data.error || 'Authentication Failed');
                btn.innerHTML = ogHtml;
                btn.disabled = false;
            }
    })
    .catch(err => {
        console.error(err);
        showLoginError('Network error — please try again.');
        btn.innerHTML = ogHtml;
        btn.disabled = false;
    });
});

/* ── Face Scan Logic ────────────────────── */
const faceLoginBtn = document.getElementById('faceLoginBtn');
const faceScanModal = document.getElementById('faceScanModal');
const closeFaceModalBtn = document.getElementById('closeFaceModal');
const faceScanStatus = document.getElementById('faceScanStatus');
const webcamVideo = document.getElementById('webcamVideo');
const faceCanvas = document.getElementById('faceCanvas');

let faceApiLoaded = false;
let stream = null;

async function loadFaceApi() {
    if (faceApiLoaded) return;
    faceScanStatus.textContent = "Loading neuro-optical models...";
    const modelUrl = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
    await faceapi.nets.ssdMobilenetv1.loadFromUri(modelUrl);
    await faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl);
    await faceapi.nets.faceRecognitionNet.loadFromUri(modelUrl);
    faceApiLoaded = true;
}

closeFaceModalBtn.addEventListener('click', () => {
    faceScanModal.style.display = 'none';
    if(stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});

faceLoginBtn.addEventListener('click', async () => {
    const collegeId = document.getElementById('collegeId').value.trim();
    if(!collegeId) {
        showLoginError("Enter College ID first to use Face Login.");
        return;
    }

    faceScanModal.style.display = 'flex';
    faceScanStatus.textContent = "Retrieving biometric reference...";

    try {
        // 1. Fetch user photo
        const res = await fetch(`/get_user_info/${collegeId}`);
        const data = await res.json();
        if(!data.success) {
            faceScanStatus.textContent = "Error: " + data.error;
            return;
        }

        // 2. Load models
        await loadFaceApi();
        faceScanStatus.textContent = "Analyzing reference biometrics...";

        // 3. Process reference photo
        const referenceImage = await faceapi.fetchImage(data.photo);
        const refDetection = await faceapi.detectSingleFace(referenceImage).withFaceLandmarks().withFaceDescriptor();
        
        if(!refDetection) {
            faceScanStatus.textContent = "Error: No face detected in profile picture.";
            return;
        }
        const refDescriptor = refDetection.descriptor;
        
        // 4. Start webcam
        faceScanStatus.textContent = "Awaiting positive visual lock...";
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        
        // 5. Match frame by frame
        webcamVideo.onplay = async () => {
            const displaySize = { width: webcamVideo.videoWidth, height: webcamVideo.videoHeight };
            faceapi.matchDimensions(faceCanvas, displaySize);
            
            const scanInterval = setInterval(async () => {
                if(faceScanModal.style.display === 'none') {
                    clearInterval(scanInterval);
                    return;
                }

                const detection = await faceapi.detectSingleFace(webcamVideo).withFaceLandmarks().withFaceDescriptor();
                if(detection) {
                    const resizedDetection = faceapi.resizeResults(detection, displaySize);
                    faceCanvas.getContext('2d').clearRect(0, 0, faceCanvas.width, faceCanvas.height);
                    faceapi.draw.drawDetections(faceCanvas, resizedDetection);
                    
                    const distance = faceapi.euclideanDistance(refDescriptor, detection.descriptor);
                    
                    if(distance < 0.6) {
                        clearInterval(scanInterval);
                        faceScanStatus.textContent = "Lock acquired. Authenticating...";
                        faceCanvas.getContext('2d').clearRect(0, 0, faceCanvas.width, faceCanvas.height);
                        
                        // Proceed to backend authentication
                        const authRes = await fetch('/face_login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ collegeId })
                        });
                        const authData = await authRes.json();
                        if(authData.success) {
                            localStorage.setItem('collegeId', collegeId);
                            window.location.href = '/dashboard.html';
                        } else {
                            faceScanStatus.textContent = "Authentication rejected by server.";
                        }
                    } else {
                        faceScanStatus.textContent = `Scanning... (dist: ${distance.toFixed(2)})`;
                    }
                } else {
                    faceScanStatus.textContent = "No visible face in scanner.";
                    faceCanvas.getContext('2d').clearRect(0, 0, faceCanvas.width, faceCanvas.height);
                }
            }, 300); // scan every 300ms
        };

        webcamVideo.srcObject = stream;
        webcamVideo.onloadedmetadata = () => {
            webcamVideo.play().catch(e => console.error("Play error:", e));
        };

    } catch (err) {
        console.error(err);
        faceScanStatus.textContent = "Scanner malfunction: " + err.message;
    }
});
