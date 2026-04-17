document.addEventListener('DOMContentLoaded', () => {
    const collegeId = localStorage.getItem('collegeId');
    if (!collegeId) {
        window.location.href = '/login.html';
        return;
    }

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('collegeId');
        window.location.href = '/login.html';
    });

    fetch(`/dashboard_data?collegeId=${collegeId}`)
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            renderDashboard(data);
        } else {
            alert('Failed to load dashboard data.');
            window.location.href = '/login.html';
        }
    })
    .catch(err => {
        console.error(err);
        alert('Network error loading dashboard.');
    });

    function renderDashboard(data) {
        // User Profile
        document.getElementById('userName').textContent = data.user.name;
        document.getElementById('userCollegeId').textContent = data.user.collegeId;
        const uPhoto = document.getElementById('userPhoto');
        if(data.user.photo) {
            uPhoto.src = `/users/${data.user.photo}`;
            uPhoto.style.display = 'block';
        }

        // Team Header
        document.getElementById('teamNameTitle').textContent = data.team.teamName;
        document.getElementById('teamScore').textContent = data.team.score;

        if (data.team.teamId) {
            const qrUrl = `/qrcode/${encodeURIComponent(data.team.teamId)}.png`;
            document.getElementById('qrImg').src = qrUrl;
            document.getElementById('qrBox').style.display = 'block';
            
            // Pre-fill Modal Data
            document.getElementById('qrModalImg').src = qrUrl;
            document.getElementById('qrModalId').textContent = data.team.teamId;
        }

        // Project Details View
        document.getElementById('dispProjectName').textContent = data.team.projectName || 'Not specified';
        document.getElementById('dispDescription').textContent = data.team.description || 'No description available.';

        // Setup Form
        document.getElementById('inpProjectName').value = data.team.projectName || '';
        document.getElementById('inpDescription').value = data.team.description || '';

        // Roster
        const rosterList = document.getElementById('rosterList');
        rosterList.innerHTML = '';
        data.teammates.forEach(player => {
            const div = document.createElement('div');
            div.className = 'roster-item';
            div.innerHTML = `
                <img src="/users/${player.photo || 'default.jpg'}" alt="${player.name}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\'><rect width=\\'100\\' height=\\'100\\' fill=\\'%23dde2ef\\'/></svg>'"/>
                <div class="roster-item-info">
                    <strong>${player.name} ${player.collegeId === data.user.collegeId ? '(You)' : ''}</strong>
                    <span>${player.collegeId}</span>
                </div>
            `;
            rosterList.appendChild(div);
        });
    }

    // Toggle Edit Mode
    const viewMode = document.getElementById('projectDetailsView');
    const editMode = document.getElementById('projectEditView');
    
    document.getElementById('editProjectBtn').addEventListener('click', () => {
        viewMode.style.display = 'none';
        editMode.style.display = 'block';
    });

    document.getElementById('cancelEditBtn').addEventListener('click', () => {
        editMode.style.display = 'none';
        viewMode.style.display = 'flex';
    });

    document.getElementById('projectForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const projName = document.getElementById('inpProjectName').value.trim();
        const desc = document.getElementById('inpDescription').value.trim();
        
        const btn = document.getElementById('saveProjectBtn');
        const ogText = btn.textContent;
        btn.textContent = 'Saving...';
        btn.disabled = true;

        fetch('/update_team', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                collegeId: collegeId,
                projectName: projName,
                description: desc
            })
        })
        .then(res => res.json())
        .then(data => {
            if(data.success) {
                document.getElementById('dispProjectName').textContent = projName || 'Not specified';
                document.getElementById('dispDescription').textContent = desc || 'No description available.';
                editMode.style.display = 'none';
                viewMode.style.display = 'flex';
            } else {
                alert(data.error || 'Failed to update team');
            }
        })
        .catch(err => {
            console.error(err);
            alert('A network error occurred');
        })
        .finally(() => {
            btn.textContent = ogText;
            btn.disabled = false;
        });
    });

    // Modal Interaction
    const qrModal = document.getElementById('qrModalOverlay');
    document.getElementById('qrBox').addEventListener('click', () => {
        qrModal.classList.add('active');
    });
    document.getElementById('qrModalClose').addEventListener('click', () => {
        qrModal.classList.remove('active');
    });
    qrModal.addEventListener('click', () => {
        qrModal.classList.remove('active');
    });

});
