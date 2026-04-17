import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import "./login.css";

const roles = [
  { value: 'organizer' as UserRole, label: 'Organizer', icon: 'shield', color: '#a855f7', email: 'sarah@eventpro.com', password: 'organizer123' },
  { value: 'judge' as UserRole, label: 'Judge', icon: 'gavel', color: '#3b82f6', email: 'alex@judge.com', password: 'judge123' },
  { value: 'user' as UserRole, label: 'User', icon: 'groups', color: '#22c55e', email: 'riya@user.com', password: 'user123' },
];

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState<{ show: boolean; message: string }>({
    show: false,
    message: ""
  });
  const [showFaceModal, setShowFaceModal] = useState(false);
  const [faceScanStatus, setFaceScanStatus] = useState("Initializing neuro-optical scanner...");
  const [isFaceApiLoaded, setIsFaceApiLoaded] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem("remembered_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }

    // Setup canvas animation
    setupDotGrid();

    return () => {
      // Cleanup
    };
  }, []);

  const setupDotGrid = () => {
    const canvas = document.getElementById("dotGrid") as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const gap = 40;
    const dotR = 1;
    let mouse = { x: -1000, y: -1000 };
    const influence = 120;

    let cols = Math.ceil(w / gap) + 1;
    let rows = Math.ceil(h / gap) + 1;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * gap;
          const y = r * gap;
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const dist = Math.hypot(dx, dy);
          const pull = Math.max(0, 1 - dist / influence);

          ctx.fillStyle = `rgba(31, 182, 255, ${0.15 + pull * 0.25})`;
          ctx.beginPath();
          ctx.arc(x, y, dotR + pull * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      requestAnimationFrame(draw);
    };

    document.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener("resize", () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      cols = Math.ceil(w / gap) + 1;
      rows = Math.ceil(h / gap) + 1;
    });

    draw();
  };

  const loadFaceApi = async () => {
    if (isFaceApiLoaded) return;
    setFaceScanStatus("Loading neuro-optical models...");
    // @ts-ignore
    const modelUrl = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
    // @ts-ignore
    await faceapi.nets.ssdMobilenetv1.loadFromUri(modelUrl);
    // @ts-ignore
    await faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl);
    // @ts-ignore
    await faceapi.nets.faceRecognitionNet.loadFromUri(modelUrl);
    setIsFaceApiLoaded(true);
  };

  const handleFaceLogin = async () => {
    if (!email) {
      setLoginStatus({ show: true, message: "Enter Email ID first to use Face Login." });
      return;
    }

    setShowFaceModal(true);
    setFaceScanStatus("Retrieving biometric reference...");

    try {
      const res = await fetch(`http://localhost:80/get_user_info/${email}`);
      const data = await res.json();
      if (!data.success) {
        setFaceScanStatus("Error: " + data.error);
        return;
      }

      await loadFaceApi();
      setFaceScanStatus("Analyzing reference biometrics...");

      // @ts-ignore
      const referenceImage = await faceapi.fetchImage(data.photo);
      // @ts-ignore
      const refDetection = await faceapi.detectSingleFace(referenceImage).withFaceLandmarks().withFaceDescriptor();
      
      if (!refDetection) {
        setFaceScanStatus("Error: No face detected in profile picture.");
        return;
      }
      const refDescriptor = refDetection.descriptor;
      
      setFaceScanStatus("Awaiting positive visual lock...");
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setStream(videoStream);
      
      const video = document.getElementById('webcamVideo') as HTMLVideoElement;
      const canvas = document.getElementById('faceCanvas') as HTMLCanvasElement;
      
      video.srcObject = videoStream;
      video.onplay = async () => {
        const displaySize = { width: video.videoWidth, height: video.videoHeight };
        // @ts-ignore
        faceapi.matchDimensions(canvas, displaySize);
        
        const scanInterval = setInterval(async () => {
          if (!showFaceModal) {
            clearInterval(scanInterval);
            return;
          }

          // @ts-ignore
          const detection = await faceapi.detectSingleFace(video).withFaceLandmarks().withFaceDescriptor();
          if (detection) {
            // @ts-ignore
            const resizedDetection = faceapi.resizeResults(detection, displaySize);
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
            // @ts-ignore
            faceapi.draw.drawDetections(canvas, resizedDetection);
            
            // @ts-ignore
            const distance = faceapi.euclideanDistance(refDescriptor, detection.descriptor);
            
            if (distance < 0.6) {
              clearInterval(scanInterval);
              setFaceScanStatus("Lock acquired. Authenticating...");
              ctx?.clearRect(0, 0, canvas.width, canvas.height);
              
              const authRes = await fetch('http://localhost:80/face_login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
              });
              const authData = await authRes.json();
              if (authData.success) {
                localStorage.setItem('email', email);
                navigate("/dashboard");
                closeFaceModal();
              } else {
                setFaceScanStatus("Authentication rejected by server.");
              }
            } else {
              setFaceScanStatus(`Scanning... (dist: ${distance.toFixed(2)})`);
            }
          } else {
            setFaceScanStatus("No visible face in scanner.");
            canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
          }
        }, 300);
      };
    } catch (err: any) {
      console.error(err);
      setFaceScanStatus("Scanner malfunction: " + err.message);
    }
  };

  const closeFaceModal = () => {
    setShowFaceModal(false);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleDemoLogin = async (roleObj: any) => {
    setLoading(true);
    setEmail(roleObj.email);
    setPassword(roleObj.password);
    
    try {
      const success = await login(roleObj.email, roleObj.password, roleObj.value);
      if (success) {
        navigate("/dashboard");
      } else {
        setLoginStatus({ show: true, message: "Demo login failed." });
      }
    } catch (err) {
      setLoginStatus({ show: true, message: "An error occurred." });
    } finally {
      setLoading(false);
    }
  };

  const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    const rect = btn.getBoundingClientRect();
    ripple.style.left = e.clientX - rect.left - 4 + "px";
    ripple.style.top = e.clientY - rect.top - 4 + "px";
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(email, password, 'user');
      if (success) {
        if (rememberMe) {
          localStorage.setItem("remembered_email", email);
        } else {
          localStorage.removeItem("remembered_email");
        }
        navigate("/dashboard");
      } else {
        setLoginStatus({
          show: true,
          message: "Authentication Failed. Please check your credentials."
        });
      }
    } catch (error) {
      console.error(error);
      setLoginStatus({
        show: true,
        message: "Network error — please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <canvas id="dotGrid"></canvas>
      <div className="glow glow-cyan"></div>
      <div className="glow glow-purple"></div>

      <div className="os-bar">
        <div className="os-brand">
          <div className="os-logo">
            <span className="material-icons-round">bolt</span>
          </div>
          <div className="os-name">
            Eventura<span className="os-ver">OS v2.1</span>
          </div>
        </div>
        <div className="os-status">
          <span className="status-dot"></span>
          <span className="status-text">SECURE · ENCRYPTED</span>
        </div>
      </div>

      <div className="card-border-wrap">
        <div className="card">
          <div className="card-head">
            <div className="card-head-text">
              <h1>
                Welcome Back<span className="accent-dot">.</span>
              </h1>
              <p>Enter your credentials to access the portal</p>
            </div>
            <div className="card-head-icon">
              <span className="material-icons-round">shield</span>
            </div>
          </div>

          <div className="card-body">
            <form id="loginForm" onSubmit={handleSubmit} noValidate>
              <div className="form-grid">
                {/* Full Name */}
                <div className="tf fg-full">
                  <div className="tf-label">
                    <span className="material-icons-round">person</span>
                    Full Name <span className="req">*</span>
                  </div>
                  <div className="tf-wrap">
                    <input
                      type="text"
                      id="fullName"
                      placeholder="e.g. Riya Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                    <span className="material-icons-round tf-lead">person</span>
                    <div className="tf-glow"></div>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="tf fg-full">
                  <div className="tf-label">
                    <span className="material-icons-round">phone</span>
                    Phone Number <span className="req">*</span>
                  </div>
                  <div className="tf-wrap">
                    <input
                      type="tel"
                      id="phoneNumber"
                      placeholder="+91 98765 43210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                    />
                    <span className="material-icons-round tf-lead">call</span>
                    <div className="tf-glow"></div>
                  </div>
                </div>

                {/* Email ID */}
                <div className="tf fg-full">
                  <div className="tf-label">
                    <span className="material-icons-round">mail</span>
                    Email ID <span className="req">*</span>
                  </div>
                  <div className="tf-wrap">
                    <input
                      type="email"
                      id="email"
                      placeholder="you@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <span className="material-icons-round tf-lead">mail</span>
                    <div className="tf-glow"></div>
                  </div>
                </div>

                {/* Password */}
                <div className="tf fg-full">
                  <div className="tf-label">
                    <span className="material-icons-round">lock_outline</span>
                    Password <span className="req">*</span>
                  </div>
                  <div className="tf-wrap has-trail">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <span className="material-icons-round tf-lead">lock</span>
                    <button
                      type="button"
                      className="tf-trail material-icons-round"
                      id="pwToggle"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "visibility_off" : "visibility"}
                    </button>
                    <div className="tf-glow"></div>
                  </div>
                </div>

                {/* Form Options - separate row, outside form-grid */}
              </div>

              <div className="form-opts">
                  <label className="remember-lbl">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="chk-box">
                      <span
                        className="material-icons-round"
                        style={{ fontSize: "12px", opacity: "0" }}
                      >
                        check
                      </span>
                    </span>
                    Remember me
                  </label>
                  <a
                    href="#"
                    className="forgot-link"
                    id="forgotPassword"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(
                        "Please contact your system administrator or technical head to reset your Phase Key."
                      );
                    }}
                  >
                    Forgot password?
                  </a>
              </div>

              {/* Error Status */}
              {loginStatus.show && (
                  <div id="loginStatus" className="login-status">
                    <span className="material-icons-round">error_outline</span>
                    <span id="loginStatusText">{loginStatus.message}</span>
                  </div>
              )}

              {/* Submit */}
              <div className="submit-row">
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => navigate("/register")}
                  >
                    Create account
                  </button>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      className="btn-primary"
                      id="faceLoginBtn"
                      onClick={handleFaceLogin}
                      style={{ background: "rgba(255, 255, 255, 0.05)", padding: "13px", color: "var(--neon-cyan)", boxShadow: "none" }}
                    >
                      <span className="material-icons-round">face</span>
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      id="loginBtn"
                      onClick={handleRipple}
                    >
                      <span>Sign In</span>
                      <span className="material-icons-round">arrow_forward</span>
                    </button>
                  </div>
              </div>

              {/* Social OAuth Login */}
              <div className="social-login">
                  <div className="section-head">
                    <div className="section-head-line"></div>
                    <div className="section-head-label">Or continue with</div>
                    <div className="section-head-line"></div>
                  </div>
                  <div className="social-btns">
                    <button type="button" className="btn-social google" onClick={() => window.location.href = 'http://localhost:80/login/google'}>
                      <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" />
                      <span>Google</span>
                    </button>
                    <button type="button" className="btn-social github" onClick={() => window.location.href = 'http://localhost:80/login/github'}>
                      <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub" />
                      <span>GitHub</span>
                    </button>
                  </div>

                  {/* Quick Access Section */}
                  <div className="section-head" style={{ marginTop: '24px' }}>
                    <div className="section-head-line"></div>
                    <div className="section-head-label">Quick Access</div>
                    <div className="section-head-line"></div>
                  </div>
                  <div className="quick-login-grid">
                    {roles.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        className="quick-btn"
                        onClick={() => handleDemoLogin(r)}
                        disabled={loading}
                      >
                        <span className="material-icons-round" style={{ color: r.color }}>{r.icon}</span>
                        <span>{r.label}</span>
                      </button>
                    ))}
                  </div>
              </div>
            </form>
          </div>

          {/* Card Footer */}
          <div className="card-foot">
            <span className="material-icons-round">verified_user</span>
            <span>AES-256 encrypted · Zero-trust architecture</span>
          </div>
        </div>
      </div>

      {/* Face Scan Modal */}
      {showFaceModal && (
        <div id="faceScanModal" className="modal-overlay">
          <div className="modal-card">
            <div className="modal-head">
              <div className="modal-title">
                <span className="material-icons-round">face</span>
                <h3>Biometric Core</h3>
              </div>
              <button className="btn-icon" id="closeFaceModal" onClick={closeFaceModal}>
                <span className="material-icons-round">close</span>
              </button>
            </div>
            <div className="modal-body">
              <p id="faceScanStatus" className="scan-status-text">{faceScanStatus}</p>
              <div className="video-wrap">
                <video id="webcamVideo" autoPlay muted playsInline></video>
                <canvas id="faceCanvas"></canvas>
                <div className="scan-line"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
