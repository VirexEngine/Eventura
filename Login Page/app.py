import os
import json
import uuid
from flask import Flask, request, jsonify, send_from_directory, send_file, session
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)  # Enable CORS for all routes
app.secret_key = 'eventura_secure_secret_cookie_key'

# Configuration
USERS_FILE = 'users.json'
TEAMS_FILE = 'teams.json'
UPLOAD_FOLDER = 'users'
QR_FOLDER = 'qrcodes'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(QR_FOLDER, exist_ok=True)

# Helper function to load users
def load_users():
    if not os.path.exists(USERS_FILE):
        return []
    try:
        with open(USERS_FILE, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, ValueError):
        return []

# Helper function to save users
def save_users(users):
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=4)

def load_teams():
    if not os.path.exists(TEAMS_FILE):
        return []
    try:
        with open(TEAMS_FILE, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, ValueError):
        return []

def save_teams(teams):
    with open(TEAMS_FILE, 'w') as f:
        json.dump(teams, f, indent=4)

@app.route('/')
def index():
    return send_from_directory('.', 'register.html')

@app.route('/register', methods=['POST'])
def register():
    # Extract text fields
    name = request.form.get('name', '').strip()
    email = request.form.get('email', '').strip()
    college_id = request.form.get('collegeId', '').strip()
    phone = request.form.get('phone', '').strip()
    team_name = request.form.get('teamName', '').strip()
    password = request.form.get('password', '').strip()
    
    if not all([name, email, college_id, phone, team_name, password]):
        return jsonify({"success": False, "error": "All fields are required"}), 400
        
    # Check if college ID already registered
    users = load_users()
    if any(u.get('collegeId') == college_id for u in users):
        return jsonify({"success": False, "error": "College ID already registered."}), 400

    # Save user data (password is hashed using pbkdf2:sha256)
    user_data = {
        "name": name,
        "email": email,
        "collegeId": college_id,
        "phone": phone,
        "teamName": team_name,
        "password": generate_password_hash(password)
    }
    
    # Handle image upload
    if 'photo' in request.files:
        photo = request.files['photo']
        if photo.filename != '':
            # Extract extension explicitly from original file or default to jpg
            ext = os.path.splitext(photo.filename)[1]
            if not ext:
                ext = '.jpg'
            
            # Using College ID as the filename
            filename = secure_filename(f"{college_id}{ext}")
            photo_path = os.path.join(UPLOAD_FOLDER, filename)
            try:
                photo.save(photo_path)
                user_data['photo'] = filename
            except Exception as e:
                return jsonify({"success": False, "error": "Failed to save photo"}), 500

    # Save to users.json
    users.append(user_data)
    save_users(users)
    
    # Handle team update/creation
    teams = load_teams()
    team_found = next((t for t in teams if t.get('teamName') == team_name), None)
    if team_found:
        if college_id not in team_found.setdefault('participantIds', []):
            team_found['participantIds'].append(college_id)
    else:
        new_team = {
            "teamId": str(uuid.uuid4()),
            "teamName": team_name,
            "participantIds": [college_id],
            "score": 0
        }
        teams.append(new_team)
    save_teams(teams)
    
    return jsonify({"success": True, "message": "Registration successful!", "user": user_data})

@app.route('/teams', methods=['GET'])
def get_teams():
    teams = load_teams()
    team_names = [t.get('teamName') for t in teams if 'teamName' in t]
    return jsonify({"success": True, "teams": team_names})

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "error": "Invalid request"}), 400
    
    college_id = data.get('collegeId')
    password = data.get('password')
    
    users = load_users()
    user = next((u for u in users if u.get('collegeId') == college_id), None)

    if user and check_password_hash(user.get('password', ''), password):
        return jsonify({"success": True})
    return jsonify({"success": False, "error": "Invalid College ID or Password"}), 401

@app.route('/dashboard_data', methods=['GET'])
def dashboard_data():
    college_id = request.args.get('collegeId')
    if not college_id:
        return jsonify({"success": False, "error": "Missing collegeId"}), 400
        
    users = load_users()
    teams = load_teams()
    
    user = next((u for u in users if u.get('collegeId') == college_id), None)
    if not user:
        return jsonify({"success": False, "error": "User not found"}), 404
        
    team_name = user.get('teamName')
    team = next((t for t in teams if t.get('teamName') == team_name), None)
    if not team:
        return jsonify({"success": False, "error": "Team not found"}), 404
        
    participant_ids = team.get('participantIds', [])
    teammates = [u for u in users if u.get('collegeId') in participant_ids]
    
    def safe_user(u):
        return {
            "name": u.get("name"),
            "collegeId": u.get("collegeId"),
            "photo": u.get("photo"),
            "teamName": u.get("teamName")
        }
    
    safe_teammates = [safe_user(t) for t in teammates]
    
    return jsonify({
        "success": True, 
        "user": safe_user(user),
        "team": {
            "teamId": team.get("teamId", ""),
            "teamName": team.get("teamName"),
            "score": team.get("score"),
            "projectName": team.get("projectName", ""),
            "description": team.get("description", "")
        },
        "teammates": safe_teammates
    })

@app.route('/update_team', methods=['POST'])
def update_team():
    data = request.get_json()
    college_id = data.get('collegeId')
    project_name = data.get('projectName')
    description = data.get('description')
    
    if not college_id:
         return jsonify({"success": False, "error": "Missing collegeId"}), 400
         
    users = load_users()
    user = next((u for u in users if u.get('collegeId') == college_id), None)
    if not user:
        return jsonify({"success": False, "error": "User not found"}), 404
        
    team_name = user.get('teamName')
    teams = load_teams()
    team = next((t for t in teams if t.get('teamName') == team_name), None)
    if not team:
        return jsonify({"success": False, "error": "Team not found"}), 404
        
    if project_name is not None:
        team['projectName'] = project_name
    if description is not None:
        team['description'] = description
        
    save_teams(teams)
    return jsonify({"success": True})

@app.route('/qrcode/<team_id>.png', methods=['GET'])
def get_qrcode(team_id):
    import qrcode
    qr_path = os.path.join(QR_FOLDER, f"{secure_filename(team_id)}.png")
    if not os.path.exists(qr_path):
        img = qrcode.make(team_id)
        img.save(qr_path)
    return send_file(qr_path, mimetype='image/png')

@app.route('/judge_login', methods=['POST'])
def judge_login():
    data = request.get_json()
    if data and data.get('username') == 'judge' and data.get('password') == 'innovisionary3.0':
        return jsonify({"success": True})
    return jsonify({"success": False, "error": "Invalid credentials"}), 401

@app.route('/teams_full', methods=['GET'])
def teams_full():
    teams = load_teams()
    users = load_users()
    teams_list = []
    
    for t in teams:
        participant_ids = t.get('participantIds', [])
        members = [u.get('name') for u in users if u.get('collegeId') in participant_ids]
        teams_list.append({
            "teamId": t.get("teamId"),
            "teamName": t.get("teamName"),
            "projectName": t.get("projectName", "Not specified"),
            "description": t.get("description", "No description available"),
            "score": t.get("score", 0),
            "members": members
        })
    return jsonify({"success": True, "teams": teams_list})

@app.route('/submit_judge_scores', methods=['POST'])
def submit_judge_scores():
    if not session.get('is_judge'):
        return jsonify({"success": False, "error": "Unauthorized"}), 401
        
    data = request.get_json()
    scores = data.get('scores')
    if not scores or not isinstance(scores, dict):
        return jsonify({"success": False, "error": "Invalid scores payload"}), 400
        
    teams = load_teams()
    updated = False
    
    for t in teams:
        tid = t.get("teamId")
        if tid in scores:
            try:
                t["score"] = int(scores[tid])
                updated = True
            except ValueError:
                pass
                
    if updated:
        save_teams(teams)
        
    return jsonify({"success": True})

@app.route('/get_user_info/<college_id>', methods=['GET'])
def get_user_info(college_id):
    users = load_users()
    user = next((u for u in users if u.get('collegeId') == college_id), None)
    if user:
        photo = user.get('photo')
        if photo:
            return jsonify({"success": True, "photo": f"/users/{photo}"})
        return jsonify({"success": False, "error": "User has no profile picture"}), 404
    return jsonify({"success": False, "error": "User not found"}), 404

@app.route('/face_login', methods=['POST'])
def face_login():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "error": "Invalid request"}), 400
        
    college_id = data.get('collegeId')
    users = load_users()
    user = next((u for u in users if u.get('collegeId') == college_id), None)
    
    if user:
        return jsonify({"success": True})
    return jsonify({"success": False, "error": "Invalid College ID"}), 401

if __name__ == '__main__':
    app.run(debug=True, port=80)
