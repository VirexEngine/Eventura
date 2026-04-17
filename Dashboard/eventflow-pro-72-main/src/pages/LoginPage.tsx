import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import './login-professional.css';

const roles: { value: UserRole; label: string; icon: string; color: string }[] = [
  { value: 'organizer', label: 'Organizer', icon: 'shield', color: '#a855f7' },
  { value: 'judge', label: 'Judge', icon: 'gavel', color: '#3b82f6' },
  { value: 'team', label: 'Student', icon: 'groups', color: '#22c55e' },
];

const demoCredentials: Record<UserRole, { email: string; password: string }> = {
  organizer: { email: 'sarah@eventpro.com', password: 'organizer123' },
  judge: { email: 'alex@judge.com', password: 'judge123' },
  team: { email: 'alpha@team.com', password: 'team123' },
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showFaceModal, setShowFaceModal] = useState(false);
  const [faceScanStatus, setFaceScanStatus] = useState('Initializing neuro-optical scanner...');
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    // Setup dot grid animation
    const canvas = document.getElementById('dotGrid') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const gap = 40;
    const dotR = 1;
    let mouse = { x: -1000, y: -1000 };
    const influence = 120;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const cols = Math.ceil(w / gap) + 1;
      const rows = Math.ceil(h / gap) + 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * gap;
          const y = r * gap;
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const dist = Math.hypot(dx, dy);
          const pull = Math.max(0, 1 - dist / influence);

          ctx.fillStyle = `rgba(31, 182, 255, ${0.1 + pull * 0.3})`;
          ctx.beginPath();
          ctx.arc(x, y, dotR + pull * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      requestAnimationFrame(draw);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    draw();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter all credentials.');
      return;
    }

    setLoading(true);
    const success = await login(email, password);
    if (success) {
      toast.success('Access granted. Welcome back.');
      navigate('/dashboard');
    } else {
      toast.error('Authentication failed.');
    }
    setLoading(false);
  };

  const handleDemoLogin = async (role: UserRole) => {
    setLoading(true);
    const success = await login(
      demoCredentials[role].email,
      demoCredentials[role].password,
      role
    );
    if (success) {
      toast.success(`Logged in as ${role}`);
      navigate('/dashboard');
    } else {
      toast.error('Quick login failed.');
    }
    setLoading(false);
  };

  const startFaceScan = async () => {
    setShowFaceModal(true);
    setFaceScanStatus('Initializing camera...');
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(s);
      const video = document.getElementById('webcamVideo') as HTMLVideoElement;
      if (video) video.srcObject = s;
      setFaceScanStatus('Scanning biometric data...');
      
      // Simulating a scan for aesthetic purposes
      setTimeout(() => {
        setFaceScanStatus('Face matched. Redirecting...');
        setTimeout(async () => {
          await handleDemoLogin('team'); // Default to student team for face login demo
          closeFaceModal();
        }, 1500);
      }, 3000);
    } catch (err) {
      setFaceScanStatus('Camera access denied.');
      toast.error('Camera access is required for biometric login.');
    }
  };

  const closeFaceModal = () => {
    setShowFaceModal(false);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
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
            EventFlow<span className="os-ver">PRO v3.0</span>
          </div>
        </div>
        <div className="os-status">
          <span className="status-dot"></span>
          <span className="status-text">SECURE GATEWAY</span>
        </div>
      </div>

      <div className="card-border-wrap">
        <div className="card">
          <div className="card-head">
            <div className="card-head-text">
              <h1>
                Welcome Back<span className="accent-dot">.</span>
              </h1>
              <p>Sign in to your dashboard portal</p>
            </div>
            <div className="card-head-icon">
              <span className="material-icons-round">vpn_key</span>
            </div>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="tf">
                  <div className="tf-label">
                    <span className="material-icons-round">alternate_email</span>
                    Email Address
                  </div>
                  <div className="tf-wrap">
                    <input
                      type="text"
                      placeholder="e.g. sarah@eventpro.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                    <span className="material-icons-round tf-lead">person</span>
                  </div>
                </div>

                <div className="tf">
                  <div className="tf-label">
                    <span className="material-icons-round">lock</span>
                    Password
                  </div>
                  <div className="tf-wrap">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                    <span className="material-icons-round tf-lead">lock</span>
                    <button
                      type="button"
                      className="tf-trail material-icons-round"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-opts">
                <label className="remember-lbl">
                  <input type="checkbox" />
                  <span className="chk-box">
                    <span className="material-icons-round" style={{ fontSize: '10px', color: '#fff' }}>check</span>
                  </span>
                  Remember me
                </label>
                <a href="#" className="forgot-link">Forgot password?</a>
              </div>

              <div className="submit-row">
                <button type="button" className="btn-ghost" onClick={() => navigate('/register')}>
                  New Account
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" className="btn-primary" onClick={startFaceScan} style={{ background: 'rgba(255,255,255,0.05)', color: '#1fb6ff', boxShadow: 'none' }}>
                    <span className="material-icons-round">face</span>
                  </button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Wait...' : 'Sign In'}
                    <span className="material-icons-round">arrow_forward</span>
                  </button>
                </div>
              </div>

              <div className="social-login">
                <div className="section-head">
                  <div className="section-head-line"></div>
                  <div className="section-head-label">Or continue with</div>
                  <div className="section-head-line"></div>
                </div>
                <div className="social-btns">
                  <button type="button" className="btn-social">
                    <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" />
                    <span>Google</span>
                  </button>
                  <button type="button" className="btn-social">
                    <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub" style={{ filter: 'invert(1)' }} />
                    <span>GitHub</span>
                  </button>
                </div>

                {/* Quick Login Section */}
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
                      onClick={() => handleDemoLogin(r.value)}
                      disabled={loading}
                    >
                      <i className="material-icons-round" style={{ color: r.color }}>{r.icon}</i>
                      <span>{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>

          <div className="card-foot">
            <span className="material-icons-round">verified_user</span>
            <span>Cloud-SEC Protocol Active · AES-256</span>
          </div>
        </div>
      </div>

      {showFaceModal && (
        <div className="modal-overlay" onClick={closeFaceModal}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="scan-status-text">{faceScanStatus}</div>
            <div className="video-wrap">
              <video id="webcamVideo" autoPlay muted playsInline></video>
              <canvas id="faceCanvas"></canvas>
            </div>
            <button className="btn-primary" style={{ marginTop: '20px', width: '100%', justifyContent: 'center' }} onClick={closeFaceModal}>
              Cancel Scan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
