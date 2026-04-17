document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('mainContainer').style.display = 'block';

    let allTeams = [];
    let dScores = JSON.parse(localStorage.getItem('judgeDrafts') || '{}');
    let currentTeamIndex = 0;

    document.getElementById('logoutBtn').addEventListener('click', () => {
        fetch('/judge_logout', { method: 'POST' }).then(() => {
            window.location.href = '/judge_login.html';
        });
    });

    const views = {
        eval: document.getElementById('viewEval'),
        lead: document.getElementById('viewLeaderboard')
    };

    function showView(name) {
        Object.values(views).forEach(v => v.style.display = 'none');
        views[name].style.display = 'block';
    }

    function updateStats() {
        const total = allTeams.length;
        const complete = Object.keys(dScores).length;
        document.getElementById('totNum').textContent = total;
        document.getElementById('scNum').textContent = complete;
        
        if(total > 0 && complete === total) {
            document.getElementById('sysStatus').textContent = 'Ready for Ledger Lock';
            document.getElementById('sysStatus').style.color = '#0EA5A0';
        } else {
            document.getElementById('sysStatus').textContent = 'Drafting';
            document.getElementById('sysStatus').style.color = '#F06543';
        }
    }

    // Local DB load
    fetch('/teams_full').then(r => {
        if(r.status === 401) {
            window.location.href = '/judge_login.html';
            return null;
        }
        return r.json();
    }).then(data => {
        if(!data) return;
        if(data.success) {
            allTeams = data.teams;
            if (allTeams.length > 0) {
                openEvalView(0);
            } else {
                alert('No teams found to evaluate.');
            }
        } else {
            alert('Failed to boot teams DB');
        }
    });

    function openEvalView(index) {
        if (allTeams.length === 0) return;
        
        // Wrap around bounds
        if (index < 0) index = allTeams.length - 1;
        if (index >= allTeams.length) index = 0;
        
        currentTeamIndex = index;
        const team = allTeams[currentTeamIndex];
        
        document.getElementById('evTeamName').textContent = team.teamName;
        document.getElementById('evTeamId').textContent = team.teamId;
        document.getElementById('evProjName').textContent = team.projectName || 'N/A';
        document.getElementById('evDesc').textContent = team.description || 'N/A';
        document.getElementById('evMembers').textContent = team.members.join(', ') || 'No mapped members';
        
        document.getElementById('evScoreInp').value = dScores[team.teamId] || '';
        showView('eval');
        updateStats();
    }

    document.getElementById('prevTeamBtn').addEventListener('click', () => {
        openEvalView(currentTeamIndex - 1);
    });

    document.getElementById('nextTeamBtn').addEventListener('click', () => {
        openEvalView(currentTeamIndex + 1);
    });

    document.getElementById('saveDraftBtn').addEventListener('click', () => {
        const inp = parseInt(document.getElementById('evScoreInp').value);
        if(isNaN(inp) || inp < 0 || inp > 100) { alert("Score must be 0-100"); return; }
        
        const team = allTeams[currentTeamIndex];
        dScores[team.teamId] = inp;
        localStorage.setItem('judgeDrafts', JSON.stringify(dScores));
        updateStats();
        
        // Auto-advance logic
        const total = allTeams.length;
        const complete = Object.keys(dScores).length;
        if (complete === total) {
            renderLeaderboard();
            showView('lead');
        } else {
            // Find next unscored team automatically
            for (let i = 1; i <= total; i++) {
                let checkIdx = (currentTeamIndex + i) % total;
                if (!dScores[allTeams[checkIdx].teamId]) {
                    openEvalView(checkIdx);
                    break;
                }
            }
        }
    });

    function renderLeaderboard() {
        const tbody = document.getElementById('leaderboardBody');
        tbody.innerHTML = '';
        
        const sorted = allTeams.map(t => ({
            ...t,
            fScore: dScores[t.teamId] || 0
        })).sort((a,b) => b.fScore - a.fScore);

        sorted.forEach((team, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="rk">#${idx + 1}</td>
                <td>
                    <div class="tn">${team.teamName}</div>
                    <div style="font-family:var(--f-mono); font-size:11px; margin-top:4px; color:var(--text-m);">${team.members.join(', ')}</div>
                </td>
                <td style="color:var(--text-s); font-size:13px; max-width:250px;">${team.projectName || '—'}</td>
                <td class="sc">${team.fScore}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    document.getElementById('finalSubmitBtn').addEventListener('click', () => {
        if(!confirm("Are you sure you want to permanently submit these scores? This action will sync to participant dashboards.")) return;
        
        const btn = document.getElementById('finalSubmitBtn');
        btn.innerHTML = 'Locking...'; btn.disabled = true;

        fetch('/submit_judge_scores', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ scores: dScores })
        }).then(res => {
            if(res.status === 401) {
                window.location.href = '/judge_login.html';
                return null;
            }
            return res.json();
        }).then(data => {
            if(!data) return;
            if(data.success) {
                alert("Scores Successfully Locked & Synced!");
                localStorage.removeItem('judgeDrafts');
                window.location.href='/judge_login.html';
            } else {
                alert("Submission failed."); btn.disabled = false; btn.innerHTML = 'Submit Final Ledger';
            }
        }).catch(e => {
            alert("Network Error"); btn.disabled = false; btn.innerHTML = 'Submit Final Ledger';
        });
    });

    document.getElementById('viewLeaderboardBtn').addEventListener('click', () => {
        const total = allTeams.length;
        const complete = Object.keys(dScores).length;
        if(total > 0 && complete === total) {
            renderLeaderboard();
            showView('lead');
        } else {
            alert('You must score all teams before viewing the leaderboard.');
        }
    });
    
    document.getElementById('backToEvalBtn').addEventListener('click', () => {
        openEvalView(currentTeamIndex);
    });

});
