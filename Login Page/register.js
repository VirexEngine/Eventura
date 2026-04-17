/* ── Team Autocomplete ───────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    fetch('/teams')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.teams) {
          const datalist = document.getElementById('team-list');
          data.teams.forEach(team => {
            const option = document.createElement('option');
            option.value = team;
            datalist.appendChild(option);
          });
        }
      })
      .catch(err => console.error('Failed to load teams:', err));
  });

  /* ── Photo upload ──────────────────── */
  document.getElementById('photoInput').addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const img  = document.getElementById('avatarImg');
      const icon = document.getElementById('avatarIcon');
      img.src = e.target.result;
      img.style.display  = 'block';
      icon.style.display = 'none';
    };
    reader.readAsDataURL(file);
  });

  /* ── Ripple on primary btn ─────────── */
  document.getElementById('submitBtn').addEventListener('click', function(e) {
    const r = document.createElement('span');
    r.className = 'ripple';
    const rect = this.getBoundingClientRect();
    r.style.left = (e.clientX - rect.left - 4) + 'px';
    r.style.top  = (e.clientY - rect.top  - 4) + 'px';
    this.appendChild(r);
    setTimeout(() => r.remove(), 700);
  });

  /* ── Password visibility ───────────── */
  document.getElementById('pwToggle').addEventListener('click', function() {
    const pw = document.getElementById('password');
    const show = pw.type === 'password';
    pw.type = show ? 'text' : 'password';
    this.textContent = show ? 'visibility_off' : 'visibility';
  });

  /* ── Password strength ─────────────── */
  const bars   = ['pb1','pb2','pb3','pb4'].map(id => document.getElementById(id));
  const colors = ['#e03131','#d97706','#0EA5A0','#059669'];
  const labels = ['Too weak','Could be stronger','Getting there','Strong password ✓'];
  const tips   = ['Add uppercase & numbers','Add symbols','Add more variety','Great!'];

  function strength(pw) {
    let s = 0;
    if (pw.length >= 8)           s++;
    if (/[A-Z]/.test(pw))         s++;
    if (/[0-9]/.test(pw))         s++;
    if (/[^A-Za-z0-9]/.test(pw))  s++;
    return s;
  }

  document.getElementById('password').addEventListener('input', function() {
    const s   = strength(this.value);
    const lbl = document.getElementById('pwLabel');
    const tip = document.getElementById('pwTips');

    bars.forEach((b, i) => {
      b.style.background = i < s ? colors[s - 1] : 'var(--border)';
      b.classList.toggle('active', i === s - 1);
    });

    if (this.value) {
      lbl.textContent = labels[s - 1] || labels[0];
      lbl.style.color = colors[s - 1] || colors[0];
      tip.textContent = tips[s - 1] || tips[0];
    } else {
      lbl.textContent = 'Enter password';
      lbl.style.color = 'var(--text-muted)';
      tip.textContent = '';
      bars.forEach(b => { b.style.background = 'var(--border)'; b.classList.remove('active'); });
    }
  });

  /* ── Progress pills on focus ───────── */
  const p = id => document.getElementById(id);

  function setPills(n) {
    [1,2,3].forEach(i => {
      const el = p('p' + i);
      el.className = 'pill ' + (i < n ? 'done' : i === n ? 'active' : 'idle');
    });
  }

  ['name','email'].forEach(id =>
    document.getElementById(id).addEventListener('focus', () => setPills(1)));
  ['collegeId','phone'].forEach(id =>
    document.getElementById(id).addEventListener('focus', () => setPills(2)));
  ['teamName','password'].forEach(id =>
    document.getElementById(id).addEventListener('focus', () => setPills(3)));

  /* ── Form submission ───────────────── */
  document.getElementById('regForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const fields = ['name','email','collegeId','phone','teamName','password'];
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

    // Form data to submit
    const formData = new FormData();
    fields.forEach(id => formData.append(id, document.getElementById(id).value.trim()));
    
    const photoInput = document.getElementById('photoInput');
    if (photoInput.files.length > 0) {
      formData.append('photo', photoInput.files[0]);
    }

    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>Submitting...</span>';
    submitBtn.disabled = true;

    fetch('/register', {
      method: 'POST',
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      if(data.success) {
        setPills(4);
        document.getElementById('successOverlay').classList.add('show');
      } else {
        alert(data.error || 'Registration failed.');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    })
    .catch(err => {
      console.error(err);
      alert('Network error occurred.');
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    });
  });
