import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./register.css";

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [pills, setPillsState] = useState([true, false, false]); // [p1 active, p2 active, p3 active]
  const [pillsDone, setPillsDone] = useState([false, false, false]);
  const [pwStrength, setPwStrength] = useState(0);
  const [teamSuggestions, setTeamSuggestions] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pwColors = ["#e03131", "#d97706", "#0EA5A0", "#059669"];
  const pwLabels = ["Too weak", "Could be stronger", "Getting there", "Strong password ✓"];
  const pwTips   = ["Add uppercase & numbers", "Add symbols", "Add more variety", "Great!"];

  useEffect(() => {
    // Fetch team suggestions
    fetch("http://localhost:80/teams")
      .then(r => r.json())
      .then(d => { if (d.success && d.teams) setTeamSuggestions(d.teams); })
      .catch(() => {});

    // Dot grid canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    const gap = 40, dotR = 1, influence = 120;
    let cols = Math.ceil(w / gap) + 1, rows = Math.ceil(h / gap) + 1;
    let mouse = { x: -1000, y: -1000 };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * gap, y = r * gap;
          const dist = Math.hypot(x - mouse.x, y - mouse.y);
          const pull = Math.max(0, 1 - dist / influence);
          ctx.fillStyle = `rgba(31, 182, 255, ${0.08 + pull * 0.35})`;
          ctx.beginPath();
          ctx.arc(x, y, dotR + pull * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      requestAnimationFrame(draw);
    };

    const onMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      cols = Math.ceil(w / gap) + 1;
      rows = Math.ceil(h / gap) + 1;
    };

    document.addEventListener("mousemove", onMove);
    window.addEventListener("resize", onResize);
    draw();

    return () => {
      document.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const calcStrength = (pw: string) => {
    let s = 0;
    if (pw.length >= 8)          s++;
    if (/[A-Z]/.test(pw))        s++;
    if (/[0-9]/.test(pw))        s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    setPwStrength(val ? calcStrength(val) : 0);
  };

  const setPills = (step: number) => {
    setPillsState([step === 1, step === 2, step === 3]);
    setPillsDone([step > 1, step > 2, step > 3]);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = ev => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    const rect = btn.getBoundingClientRect();
    ripple.style.left = e.clientX - rect.left - 4 + "px";
    ripple.style.top  = e.clientY - rect.top  - 4 + "px";
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fields = [
      { id: "name", val: name },
      { id: "email", val: email },
      { id: "phone", val: phone },
      { id: "username", val: username },
      { id: "password", val: password },
    ];

    let valid = true;
    fields.forEach(f => { if (!f.val.trim()) { valid = false; } });
    if (!valid) return;

    const btn = document.getElementById("submitBtn") as HTMLButtonElement;
    const origHtml = btn.innerHTML;
    btn.innerHTML = "<span>Submitting...</span>";
    btn.disabled = true;

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("phone", phone.trim());
      formData.append("username", username.trim());
      formData.append("password", password.trim());
      if (photoFile) formData.append("photo", photoFile);

      const res = await fetch("http://localhost:80/register", { method: "POST", body: formData });
      const data = await res.json();

      if (data.success) {
        setPills(4);
        setShowSuccess(true);
      } else {
        alert(data.error || "Registration failed.");
        btn.innerHTML = origHtml;
        btn.disabled = false;
      }
    } catch (err) {
      console.error(err);
      alert("Network error occurred.");
      btn.innerHTML = origHtml;
      btn.disabled = false;
    }
  };

  const getPillClass = (idx: number) => {
    if (pillsDone[idx]) return "pill done";
    if (pills[idx]) return "pill active";
    return "pill idle";
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center py-6 px-4 relative overflow-hidden" style={{ backgroundColor: 'var(--bg-deep)', fontFamily: 'var(--f-body)' }}>
      <canvas id="dotGrid" ref={canvasRef}></canvas>
      <div className="glow glow-cyan"></div>
      <div className="glow glow-purple"></div>

      {/* OS Top Bar */}
      <div className="os-bar relative z-10 w-full max-w-[560px] flex items-center justify-between mb-4 px-1">
        <div className="os-brand">
          <div className="os-logo"><span className="material-icons-round">bolt</span></div>
          <div className="os-name">Eventura<span className="os-ver">OS v2.1</span></div>
        </div>
        <div className="os-status">
          <span className="status-dot"></span>
          <span className="status-text">SECURE · ENCRYPTED</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="card-border-wrap">
        <div className="card">

          {/* Success Overlay */}
          {showSuccess && (
            <div className="success-overlay show">
              <div className="success-ring">
                <span className="material-icons-round">check</span>
              </div>
              <h2>Welcome to <span>Eventura!</span></h2>
              <p>Your account has been created. You're all set to join your team.</p>
              <button className="btn-primary" onClick={() => navigate("/login")} style={{ marginTop: "4px" }}>
                <span>Go to Sign In</span>
                <span className="material-icons-round">arrow_forward</span>
              </button>
            </div>
          )}

          {/* Card Header */}
          <div className="card-head">
            <div className="card-head-text">
              <h1>Create Account<span className="accent-dot">.</span></h1>
              <p>Join Eventura OS — create your personal account</p>
            </div>
            <div className="step-badge">
              <div className="step-pills">
                <div className={getPillClass(0)}></div>
                <div className={getPillClass(1)}></div>
                <div className={getPillClass(2)}></div>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="card-body">

            {/* Avatar Upload */}
            <label className="avatar-row" htmlFor="photoInput">
              <div className="avatar-ring">
                <div className="avatar-circle">
                  {!avatarPreview && <span className="material-icons-round">person</span>}
                  {avatarPreview && <img src={avatarPreview} alt="Profile" style={{ display: "block" }} />}
                </div>
                <div className="avatar-edit-badge"><span className="material-icons-round">edit</span></div>
              </div>
              <div className="avatar-info">
                <strong>Profile Photo</strong>
                <span>Click to upload · JPG, PNG · Max 5 MB</span>
              </div>
              <div className="avatar-btn">
                <span className="material-icons-round">upload</span>
                Upload
              </div>
              <input
                type="file"
                id="photoInput"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: "none" }}
                onChange={handlePhotoChange}
              />
            </label>

            <form id="regForm" onSubmit={handleSubmit} noValidate>

              {/* Personal Info */}
              <div className="section-head">
                <div className="section-head-label">Personal Info</div>
                <div className="section-head-line"></div>
              </div>

              <div className="form-grid">
                {/* Full Name */}
                <div className="tf fg-full">
                  <div className="tf-label">
                    <span className="material-icons-round">person_outline</span>
                    Full Name <span className="req">*</span>
                  </div>
                  <div className="tf-wrap">
                    <input
                      type="text" id="name" placeholder="e.g. Arjun Sharma"
                      value={name} onChange={e => setName(e.target.value)}
                      onFocus={() => setPills(1)} autoComplete="name"
                    />
                    <span className="material-icons-round tf-lead">badge</span>
                    <div className="tf-glow"></div>
                  </div>
                </div>

                {/* Email */}
                <div className="tf fg-full">
                  <div className="tf-label">
                    <span className="material-icons-round">mail_outline</span>
                    Email Address <span className="req">*</span>
                  </div>
                  <div className="tf-wrap">
                    <input
                      type="email" id="email" placeholder="you@college.edu"
                      value={email} onChange={e => setEmail(e.target.value)}
                      onFocus={() => setPills(1)} autoComplete="email"
                    />
                    <span className="material-icons-round tf-lead">alternate_email</span>
                    <div className="tf-glow"></div>
                  </div>
                </div>



                {/* Phone */}
                <div className="tf">
                  <div className="tf-label">
                    <span className="material-icons-round">phone_iphone</span>
                    Phone Number <span className="req">*</span>
                  </div>
                  <div className="tf-wrap">
                    <input
                      type="tel" id="phone" placeholder="+91 98765 43210"
                      value={phone} onChange={e => setPhone(e.target.value)}
                      onFocus={() => setPills(2)} autoComplete="tel"
                    />
                    <span className="material-icons-round tf-lead">call</span>
                    <div className="tf-glow"></div>
                  </div>
                </div>
              </div>

              {/* Account & Security */}
              <div className="section-head" style={{ marginTop: "4px" }}>
                <div className="section-head-label">Account &amp; Security</div>
                <div className="section-head-line"></div>
              </div>

              <div className="form-grid">
                {/* Username */}
                <div className="tf fg-full">
                  <div className="tf-label">
                    <span className="material-icons-round">alternate_email</span>
                    Choose Username <span className="req">*</span>
                  </div>
                  <div className="tf-wrap">
                    <input
                      type="text" id="username" placeholder="e.g. riya_codes"
                      value={username} onChange={e => setUsername(e.target.value)}
                      onFocus={() => setPills(3)} autoComplete="off"
                    />
                    <span className="material-icons-round tf-lead">alternate_email</span>
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
                      type={showPassword ? "text" : "password"} id="password"
                      placeholder="Min 8 chars · letters + numbers + symbols"
                      value={password}
                      onChange={e => handlePasswordChange(e.target.value)}
                      onFocus={() => setPills(3)}
                    />
                    <span className="material-icons-round tf-lead">lock</span>
                    <button
                      type="button" className="tf-trail material-icons-round"
                      tabIndex={-1} onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "visibility_off" : "visibility"}
                    </button>
                    <div className="tf-glow"></div>
                  </div>

                  {/* Strength Meter */}
                  <div className="pw-strength">
                    <div className="pw-bars">
                      {[0,1,2,3].map(i => (
                        <div
                          key={i}
                          className={`pw-bar${i === pwStrength - 1 ? " active" : ""}`}
                          style={{ background: i < pwStrength ? pwColors[pwStrength - 1] : undefined }}
                        ></div>
                      ))}
                    </div>
                    <div className="pw-meta">
                      <div className="pw-label" style={{ color: password ? pwColors[pwStrength - 1] : "var(--text-muted)" }}>
                        {password ? (pwLabels[pwStrength - 1] || pwLabels[0]) : "Enter password"}
                      </div>
                      <div className="pw-tips">
                        {password ? (pwTips[pwStrength - 1] || pwTips[0]) : ""}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="submit-row">
                <button type="button" className="btn-ghost" onClick={() => navigate("/login")}>
                  Sign in instead
                </button>
                <button type="submit" className="btn-primary" id="submitBtn" onClick={handleRipple}>
                  <span>Create Account</span>
                  <span className="material-icons-round">arrow_forward</span>
                </button>
              </div>

              {/* Social Signup */}
              <div className="social-login" style={{ marginTop: "24px" }}>
                <div className="section-head">
                  <div className="section-head-line"></div>
                  <div className="section-head-label">Or sign up with</div>
                  <div className="section-head-line"></div>
                </div>
                <div className="social-btns">
                  <button type="button" className="btn-social google" onClick={() => window.location.href = "http://localhost:80/login/google"}>
                    <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" />
                    <span>Google</span>
                  </button>
                  <button type="button" className="btn-social github" onClick={() => window.location.href = "http://localhost:80/login/github"}>
                    <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub" />
                    <span>GitHub</span>
                  </button>
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
    </div>
  );
};

export default Register;
