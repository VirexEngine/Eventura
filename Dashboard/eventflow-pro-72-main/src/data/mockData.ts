// Central data store — simulates a backend
// In production, replace with real API calls.

export type EventCategory = 'Tech' | 'Sports' | 'Dance' | 'Music' | 'Drama' | 'Others';

export interface Event {
  id: string;
  title: string;
  description: string;
  theme: string;
  category: EventCategory;
  date: string;        // primary / start date (ISO)
  startDate: string;   // ISO date string
  endDate: string;     // ISO date string
  venue: string;
  status: 'upcoming' | 'live' | 'completed';
  teamsCount: number;
  judgesCount: number;
  submissionsCount: number;
  minMembers: number;
  maxMembers: number;
  prizes?: { first: string; second: string; third?: string };
  winnerTeamId?: string;
  runnerUpTeamId?: string;
  winnerScore?: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email?: string;
  role: string;
  contribution: string;
  avatar?: string;
}

export interface Team {
  id: string;
  name: string;
  eventId: string;
  /** IDs of events this team has joined */
  eventIds: string[];
  members: TeamMember[];
  submission?: Submission;
  totalScore?: number;
  rank?: number;
}

export interface Submission {
  id: string;
  teamId: string;
  projectTitle: string;
  description: string;
  problemStatement: string;
  solution: string;
  challenges: string;
  techStack: string[];
  videoUrl: string;
  videoHash?: string;
  videoFileName?: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface Score {
  teamId: string;
  judgeId: string;
  innovation: number;
  technicalComplexity: number;
  presentation: number;
  practicalUse: number;
  total: number;
  comment: string;
  evaluated: boolean;
}

export interface Judge {
  id: string;
  name: string;
  email: string;
  expertise: string;
  organization: string;
  eventsAssigned: string[];  // event IDs
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

/** Maps judgeId → array of event IDs they are assigned to */
export const judgeEventAssignments: Record<string, string[]> = {
  '2':  ['1', '2'],
  'j2': ['1'],
  'j3': ['3'],
  'j4': ['1', '4'],
  'j5': ['5'],
  'j6': ['6'],
  'j7': ['7'],
  'j8': ['3', '5'],
};

// ─── EVENTS ──────────────────────────────────────────────────────────────────
export const mockEvents: Event[] = [
  {
    id: '1', title: 'HackTech 2026', category: 'Tech',
    theme: 'AI, Sustainability & Healthcare',
    description: 'Annual flagship hackathon for innovative solutions across AI, sustainability, and healthcare. Teams compete to build production-ready prototypes in 48 hours.',
    date: '2026-04-15', startDate: '2026-04-15', endDate: '2026-04-17',
    venue: 'Tech Hub Arena', status: 'live',
    teamsCount: 24, judgesCount: 8, submissionsCount: 18,
    minMembers: 2, maxMembers: 5,
    prizes: { first: '$5,000 + AWS Credits', second: '$2,500', third: '$1,000' },
    winnerTeamId: undefined, runnerUpTeamId: undefined,
  },
  {
    id: '2', title: 'AI Innovation Summit', category: 'Tech',
    theme: 'Machine Learning & Deep Learning Applications',
    description: 'AI & ML focused competition exploring the frontier of artificial intelligence applications in real-world industries.',
    date: '2026-05-20', startDate: '2026-05-20', endDate: '2026-05-21',
    venue: 'Digital Center', status: 'upcoming',
    teamsCount: 16, judgesCount: 5, submissionsCount: 0,
    minMembers: 2, maxMembers: 4,
    prizes: { first: '$3,000 + GPU Cloud Credits', second: '$1,500' },
  },
  {
    id: '3', title: 'Green Code Challenge', category: 'Tech',
    theme: 'Climate Tech & Sustainability',
    description: 'Build sustainable tech solutions that reduce carbon footprint and support a greener planet. Focus on measurable environmental impact.',
    date: '2026-03-10', startDate: '2026-03-10', endDate: '2026-03-11',
    venue: 'Eco Campus', status: 'completed',
    teamsCount: 20, judgesCount: 6, submissionsCount: 20,
    minMembers: 1, maxMembers: 4,
    prizes: { first: '$2,000', second: '$1,000', third: '$500' },
    winnerTeamId: '5', runnerUpTeamId: '6', winnerScore: 38,
  },
  {
    id: '4', title: 'FinTech Sprint', category: 'Tech',
    theme: 'Digital Payments & Financial Inclusion',
    description: 'Financial technology innovations that democratize access to banking and digital payments for the unbanked population.',
    date: '2026-06-01', startDate: '2026-06-01', endDate: '2026-06-02',
    venue: 'Business Tower', status: 'upcoming',
    teamsCount: 12, judgesCount: 4, submissionsCount: 0,
    minMembers: 2, maxMembers: 5,
    prizes: { first: '$4,000 + Incubation Opportunity', second: '$2,000' },
  },
  {
    id: '5', title: 'Inter-College Sports Fiesta', category: 'Sports',
    theme: 'Athletics, Team Sports & Fitness',
    description: 'Annual inter-college sports championship covering basketball, football, cricket, and athletics. Celebrate sportsmanship and athletic excellence.',
    date: '2026-03-20', startDate: '2026-03-20', endDate: '2026-03-22',
    venue: 'University Sports Complex', status: 'completed',
    teamsCount: 32, judgesCount: 10, submissionsCount: 32,
    minMembers: 5, maxMembers: 15,
    prizes: { first: 'Gold Trophy + ₹10,000', second: 'Silver Trophy + ₹5,000', third: 'Bronze Trophy' },
    winnerTeamId: '7', runnerUpTeamId: '8', winnerScore: 95,
  },
  {
    id: '6', title: 'Rhythms Dance Battle', category: 'Dance',
    theme: 'Contemporary, Classical & Fusion Dance',
    description: 'Showcase your dance talent across classical, contemporary, hip-hop, and fusion styles. Solo, duo, and group performances welcome.',
    date: '2026-04-05', startDate: '2026-04-05', endDate: '2026-04-05',
    venue: 'Performing Arts Auditorium', status: 'completed',
    teamsCount: 18, judgesCount: 5, submissionsCount: 18,
    minMembers: 1, maxMembers: 12,
    prizes: { first: '₹8,000 + Trophy', second: '₹4,000', third: '₹2,000' },
    winnerTeamId: '9', runnerUpTeamId: '10', winnerScore: 91,
  },
  {
    id: '7', title: 'Melodies Music Fest', category: 'Music',
    theme: 'Instrumental, Vocal & Band Performances',
    description: 'A celebration of musical talent spanning classical instruments, western bands, vocal performances, and electronic music production.',
    date: '2026-05-10', startDate: '2026-05-10', endDate: '2026-05-11',
    venue: 'Open Air Amphitheatre', status: 'upcoming',
    teamsCount: 22, judgesCount: 6, submissionsCount: 0,
    minMembers: 1, maxMembers: 8,
    prizes: { first: '₹12,000 + Recording Studio Session', second: '₹6,000' },
  },
  {
    id: '8', title: 'Drama & Theatre Showdown', category: 'Drama',
    theme: 'Short Plays, Mono-Acts & Street Theatre',
    description: 'Express storytelling through original drama and theatre. Categories include street plays, mono-acts, and full-length short plays with original scripts.',
    date: '2026-06-15', startDate: '2026-06-15', endDate: '2026-06-16',
    venue: 'Black Box Theatre', status: 'upcoming',
    teamsCount: 14, judgesCount: 4, submissionsCount: 0,
    minMembers: 1, maxMembers: 10,
    prizes: { first: 'Best Play Trophy + ₹7,000', second: '₹3,500' },
  },
  {
    id: '9', title: 'Innovation Expo', category: 'Others',
    theme: 'Cross-Domain Student Innovation Projects',
    description: 'Open-category innovation expo welcoming ideas from all domains — social impact, art-tech, environment, education, and beyond. No boundaries on creativity.',
    date: '2026-05-28', startDate: '2026-05-28', endDate: '2026-05-29',
    venue: 'Exhibition Hall B', status: 'upcoming',
    teamsCount: 40, judgesCount: 12, submissionsCount: 0,
    minMembers: 1, maxMembers: 6,
    prizes: { first: '$2,500 + Mentorship', second: '$1,200', third: '$600' },
  },
  {
    id: '10', title: 'CyberSec Summit', category: 'Tech',
    theme: 'Ethical Hacking, CTF & Security Research',
    description: 'Capture-the-flag competition and security research showcase. Test your skills in penetration testing, cryptography, and network security.',
    date: '2026-04-25', startDate: '2026-04-25', endDate: '2026-04-26',
    venue: 'Cyber Lab Arena', status: 'upcoming',
    teamsCount: 28, judgesCount: 7, submissionsCount: 0,
    minMembers: 2, maxMembers: 4,
    prizes: { first: '$3,500 + Internship', second: '$1,800' },
  },
];

// ─── JUDGES ───────────────────────────────────────────────────────────────────
export const mockJudges: Judge[] = [
  { id: '2',  name: 'Dr. Alex Rivera',     email: 'judge@demo.com',        expertise: 'AI & Machine Learning',    organization: 'MIT AI Lab',         eventsAssigned: ['1', '2'] },
  { id: 'j2', name: 'Prof. Maria Santos',  email: 'maria@uni.edu',         expertise: 'Full Stack Development',   organization: 'Stanford CS Dept',   eventsAssigned: ['1'] },
  { id: 'j3', name: 'Kevin Zhang',         email: 'kevin@greentech.io',    expertise: 'Sustainability & Climate',  organization: 'GreenTech Foundation',eventsAssigned: ['3'] },
  { id: 'j4', name: 'Dr. Priya Nair',      email: 'priya@fintech.in',      expertise: 'FinTech & Blockchain',     organization: 'HDFC Innovation Lab', eventsAssigned: ['1', '4'] },
  { id: 'j5', name: 'Coach Ramesh Kumar',  email: 'ramesh@sports.edu',     expertise: 'Athletics & Team Sports',  organization: 'SAI Federation',     eventsAssigned: ['5'] },
  { id: 'j6', name: 'Ms. Ananya Mehta',    email: 'ananya@arts.in',        expertise: 'Classical & Contemporary Dance', organization: 'Kalakshetra', eventsAssigned: ['6'] },
  { id: 'j7', name: 'Vikram Roshan',       email: 'vikram@music.com',      expertise: 'Carnatic & Western Music', organization: 'Berklee India',      eventsAssigned: ['7'] },
  { id: 'j8', name: 'Dr. Sofia Patel',     email: 'sofia@biotech.org',    expertise: 'Biotech & Health Tech',    organization: 'IIT Bombay',         eventsAssigned: ['3', '5'] },
  { id: 'j9', name: 'Marcus Lee',          email: 'marcus@cyber.sec',      expertise: 'Cybersecurity & CTF',     organization: 'CISA Partner',       eventsAssigned: ['10'] },
  { id: 'j10', name: 'Dr. Lisa Wang',      email: 'lisa@drama.arts',       expertise: 'Theatre & Scriptwriting', organization: 'NSD Alumni',         eventsAssigned: ['8'] },
  { id: 'j11', name: 'Rajan Pillai',       email: 'rajan@vc.fund',         expertise: 'Entrepreneurship & Startups','organization': 'Y Combinator India', eventsAssigned: ['9'] },
  { id: 'j12', name: 'Dr. Neha Gupta',     email: 'neha@airesearch.org',   expertise: 'NLP & Computer Vision',   organization: 'Google DeepMind India', eventsAssigned: ['2'] },
];

// ─── TEAMS ────────────────────────────────────────────────────────────────────
export const mockTeams: Team[] = [
  {
    id: '1', name: 'Code Wizards', eventId: '1', eventIds: ['1'],
    totalScore: 36, rank: 1,
    members: [
      { id: 'm1', name: 'Alice Johnson',  role: 'Frontend Lead',  contribution: 'Built the entire UI with React and designed the user experience flow' },
      { id: 'm2', name: 'Bob Smith',      role: 'Backend Dev',    contribution: 'Designed RESTful APIs and database architecture using Node.js' },
      { id: 'm3', name: 'Carol Lee',      role: 'ML Engineer',    contribution: 'Implemented prediction model using TensorFlow and data pipeline' },
    ],
    submission: {
      id: 's1', teamId: '1', projectTitle: 'EcoTrack AI',
      description: 'An AI-powered carbon footprint tracker that helps individuals and businesses monitor and reduce their environmental impact through smart, personalised suggestions powered by machine learning.',
      problemStatement: 'Individuals lack awareness of their daily carbon footprint and actionable steps to reduce it.',
      solution: 'A mobile-first app using ML to analyze daily activities and provide personalized sustainability recommendations.',
      challenges: 'Accurate carbon calculation across diverse activities, real-time data processing at scale.',
      techStack: ['React', 'Node.js', 'TensorFlow', 'PostgreSQL', 'AWS'],
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      videoHash: 'abc123hash_unique_team1', videoFileName: 'ecotrack_demo.mp4',
      status: 'submitted', submittedAt: '2026-04-14T10:30:00Z',
    },
  },
  {
    id: '2', name: 'Data Dragons', eventId: '1', eventIds: ['1', '2'],
    totalScore: 33, rank: 2,
    members: [
      { id: 'm4', name: 'David Park',    role: 'Full Stack',       contribution: 'End-to-end feature development and system architecture' },
      { id: 'm5', name: 'Emma Wilson',   role: 'UI/UX Designer',   contribution: 'Designed the complete user interface and conducted user testing' },
    ],
    submission: {
      id: 's2', teamId: '2', projectTitle: 'MediScan Pro',
      description: 'AI-powered medical image analysis platform for early disease detection in rural areas with limited access to specialist doctors.',
      problemStatement: 'Rural healthcare facilities lack specialist doctors for accurate medical image diagnosis.',
      solution: 'A cloud-based platform using deep learning to analyze X-rays and MRIs with specialist-level accuracy.',
      challenges: 'Model accuracy with limited training data, HIPAA compliance, low-bandwidth optimization.',
      techStack: ['Python', 'PyTorch', 'React Native', 'Firebase', 'GCP'],
      videoUrl: '', videoHash: '', videoFileName: '',
      status: 'submitted', submittedAt: '2026-04-13T15:00:00Z',
    },
  },
  {
    id: '3', name: 'Byte Force', eventId: '1', eventIds: ['1'],
    totalScore: 30, rank: 3,
    members: [
      { id: 'm6', name: 'Frank Chen',   role: 'Backend Lead',  contribution: 'Built microservices architecture and real-time data sync' },
      { id: 'm7', name: 'Grace Kim',    role: 'Frontend Dev',  contribution: 'Responsive web app with real-time dashboard updates' },
      { id: 'm8', name: 'Henry Patel',  role: 'DevOps',        contribution: 'CI/CD pipeline setup, containerization, and cloud deployment' },
      { id: 'm9', name: 'Ivy Zhang',    role: 'Data Analyst',  contribution: 'Data modeling, analytics dashboard, and report generation' },
    ],
    submission: {
      id: 's3', teamId: '3', projectTitle: 'SmartCity Dashboard',
      description: 'Real-time city management platform integrating IoT sensors for traffic, air quality, and energy management.',
      problemStatement: 'City administrators lack a unified platform to monitor urban infrastructure in real-time.',
      solution: 'An integrated IoT dashboard connecting sensors across the city with predictive analytics.',
      challenges: 'Handling millions of sensor data points, cross-platform compatibility.',
      techStack: ['Vue.js', 'Go', 'InfluxDB', 'MQTT', 'Docker'],
      videoUrl: '', videoHash: '', videoFileName: '',
      status: 'pending', submittedAt: '',
    },
  },
  {
    id: '4', name: 'Neural Nexus', eventId: '1', eventIds: ['1'],
    totalScore: 0, rank: 4,
    members: [
      { id: 'm10', name: 'Jack Brown',  role: 'AI Researcher',  contribution: 'NLP model development and training' },
      { id: 'm11', name: 'Kate Davis',  role: 'Frontend Dev',   contribution: 'Chat interface and real-time rendering' },
    ],
    submission: {
      id: 's4', teamId: '4', projectTitle: 'LangBridge',
      description: 'Context-aware AI translation engine for international business communication that preserves cultural nuances.',
      problemStatement: 'Business communication across languages loses cultural nuances in existing translation tools.',
      solution: 'Context-aware NLP engine that translates not just words but cultural intent and business etiquette.',
      challenges: 'Multi-language support, cultural context datasets, low-latency translation.',
      techStack: ['Python', 'Transformers', 'React', 'Redis', 'Kubernetes'],
      videoUrl: '', videoHash: '', videoFileName: '',
      status: 'pending', submittedAt: '',
    },
  },
  // Green Code Challenge teams (event 3 — completed)
  {
    id: '5', name: 'GreenByte', eventId: '3', eventIds: ['3'],
    totalScore: 38, rank: 1,
    members: [
      { id: 'm12', name: 'Lily Torres',  role: 'Project Lead', contribution: 'Led ideation and integration with carbon APIs' },
      { id: 'm13', name: 'Sam Okafor',   role: 'Backend Dev',  contribution: 'Developed serverless data ingestion pipeline' },
    ],
    submission: {
      id: 's5', teamId: '5', projectTitle: 'ReforestAI',
      description: 'A platform using satellite imagery and ML to identify optimal reforestation sites and track planting progress.',
      problemStatement: 'Reforestation efforts are uncoordinated and lack data-backed site selection.',
      solution: 'ML models on satellite data to recommend and monitor reforestation areas globally.',
      challenges: 'Satellite data resolution, model training on sparse labels.',
      techStack: ['Python', 'TensorFlow', 'Google Earth Engine', 'React', 'FastAPI'],
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      videoHash: 'hash_team5', videoFileName: 'reforestai_demo.mp4',
      status: 'approved', submittedAt: '2026-03-10T11:00:00Z',
    },
  },
  {
    id: '6', name: 'EcoSprint', eventId: '3', eventIds: ['3'],
    totalScore: 34, rank: 2,
    members: [
      { id: 'm14', name: 'Nina Patel',   role: 'Full Stack', contribution: 'Built end-to-end platform with real-time emissions tracker' },
      { id: 'm15', name: 'Omar Farooq',  role: 'Data Scientist', contribution: 'Emissions forecasting model with 94% accuracy' },
    ],
    submission: {
      id: 's6', teamId: '6', projectTitle: 'EmissionWatch',
      description: 'Real-time emissions monitoring for manufacturing plants using IoT and predictive analytics.',
      problemStatement: 'Factories lack affordable real-time emissions monitoring tools.',
      solution: 'IoT + ML platform that monitors, predicts, and suggests corrective actions for industrial emissions.',
      challenges: 'IoT sensor integration, data accuracy in harsh industrial environments.',
      techStack: ['Node.js', 'InfluxDB', 'React', 'Arduino', 'AWS'],
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      videoHash: 'hash_team6', videoFileName: 'emissionwatch_demo.mp4',
      status: 'approved', submittedAt: '2026-03-10T09:30:00Z',
    },
  },
  // Sports Fiesta teams (event 5 — completed)
  {
    id: '7', name: 'Thunder Strikers', eventId: '5', eventIds: ['5'],
    totalScore: 95, rank: 1,
    members: [
      { id: 'm16', name: 'Arjun Sharma',  role: 'Captain / Striker',   contribution: 'Led team strategy and scored 12 goals in the tournament' },
      { id: 'm17', name: 'Priya Nair',    role: 'Midfielder',           contribution: 'Assisted 8 goals, controlled midfield play' },
      { id: 'm18', name: 'Rahul Singh',   role: 'Goalkeeper',           contribution: 'Maintained clean sheet in 4 out of 6 matches' },
      { id: 'm19', name: 'Sneha Reddy',   role: 'Defender',             contribution: 'Anchored the defense line throughout the tournament' },
      { id: 'm20', name: 'Kiran Bose',    role: 'Winger',               contribution: 'Provided pace and width in attacking plays' },
    ],
    submission: undefined,
  },
  {
    id: '8', name: 'City Blazers', eventId: '5', eventIds: ['5'],
    totalScore: 88, rank: 2,
    members: [
      { id: 'm21', name: 'Aditya Kumar',  role: 'Captain',    contribution: 'Tactical leader and top scorer with 9 goals' },
      { id: 'm22', name: 'Meera Pillai',  role: 'Forward',    contribution: 'Scored decisive goals in knockout rounds' },
      { id: 'm23', name: 'Ronit Das',     role: 'Goalkeeper', contribution: 'Made crucial saves in the semi-final' },
      { id: 'm24', name: 'Tanvi Joshi',   role: 'Midfielder', contribution: 'Set up 6 assists across the tournament' },
      { id: 'm25', name: 'Yash Choudhury',role: 'Defender',   contribution: 'Disciplined defending throughout' },
    ],
    submission: undefined,
  },
  // Dance Battle teams (event 6 — completed)
  {
    id: '9', name: 'Nritya Storm', eventId: '6', eventIds: ['6'],
    totalScore: 91, rank: 1,
    members: [
      { id: 'm26', name: 'Divya Rao',    role: 'Lead Dancer',      contribution: 'Choreographed the winning fusion routine' },
      { id: 'm27', name: 'Sanya Mehta',  role: 'Classical Lead',   contribution: 'Bharatanatyam sequences that anchored the performance' },
      { id: 'm28', name: 'Raj Kapoor',   role: 'Contemporary',     contribution: 'Contemporary movement and acrobatics' },
    ],
    submission: undefined,
  },
  {
    id: '10', name: 'Beat Collective', eventId: '6', eventIds: ['6'],
    totalScore: 86, rank: 2,
    members: [
      { id: 'm29', name: 'Tanmay Seth',  role: 'Choreographer', contribution: 'Created the group street dance routine' },
      { id: 'm30', name: 'Pooja Verma',  role: 'Lead Performer', contribution: 'Lead in hip-hop and locking sequences' },
    ],
    submission: undefined,
  },
  // Additional teams for AI Summit (event 2 — upcoming)
  {
    id: '11', name: 'DeepMind Labs', eventId: '2', eventIds: ['2'],
    totalScore: 0, rank: undefined,
    members: [
      { id: 'm31', name: 'Ananya Singh',  role: 'ML Researcher', contribution: 'Designing transformer-based models' },
      { id: 'm32', name: 'Kabir Mehta',   role: 'Backend Dev',   contribution: 'Building scalable inference pipelines' },
    ],
    submission: undefined,
  },
  {
    id: '12', name: 'Vision AI',  eventId: '2', eventIds: ['2'],
    totalScore: 0, rank: undefined,
    members: [
      { id: 'm33', name: 'Riya Agarwal',  role: 'Computer Vision', contribution: 'Object detection and image segmentation' },
      { id: 'm34', name: 'Gaurav Tiwari', role: 'MLOps',           contribution: 'Model deployment and monitoring' },
    ],
    submission: undefined,
  },
];

// ─── SCORES ───────────────────────────────────────────────────────────────────
export const mockScores: Score[] = [
  { teamId: '1', judgeId: '2', innovation: 9, technicalComplexity: 9, presentation: 9, practicalUse: 9, total: 36, comment: 'Outstanding project with real-world impact. Excellent technical execution.', evaluated: true },
  { teamId: '2', judgeId: '2', innovation: 8, technicalComplexity: 9, presentation: 8, practicalUse: 8, total: 33, comment: 'Strong technical foundation. Could improve presentation clarity.', evaluated: true },
  { teamId: '3', judgeId: '2', innovation: 7, technicalComplexity: 8, presentation: 8, practicalUse: 7, total: 30, comment: 'Good concept but needs more polish on the demo.', evaluated: true },
  { teamId: '4', judgeId: '2', innovation: 0, technicalComplexity: 0, presentation: 0, practicalUse: 0, total: 0, comment: '', evaluated: false },
  { teamId: '5', judgeId: 'j3', innovation: 10, technicalComplexity: 9, presentation: 10, practicalUse: 9, total: 38, comment: 'Exceptional use of satellite data. Real-world pilot already running.', evaluated: true },
  { teamId: '6', judgeId: 'j3', innovation: 9, technicalComplexity: 8, presentation: 9, practicalUse: 8, total: 34, comment: 'Highly practical solution for industrial emissions. Impressive accuracy.', evaluated: true },
  { teamId: '7', judgeId: 'j5', innovation: 10, technicalComplexity: 9, presentation: 9, practicalUse: 9, total: 95, comment: 'Dominant performance throughout. Team spirit and individual skill both excellent.', evaluated: true },
  { teamId: '8', judgeId: 'j5', innovation: 8, technicalComplexity: 9, presentation: 9, practicalUse: 8, total: 88, comment: 'Strong runners-up. Very competitive in knockout stages.', evaluated: true },
  { teamId: '9', judgeId: 'j6', innovation: 9, technicalComplexity: 9, presentation: 10, practicalUse: 9, total: 91, comment: 'Breathtaking fusion of classical and contemporary styles. Near flawless execution.', evaluated: true },
  { teamId: '10', judgeId: 'j6', innovation: 8, technicalComplexity: 9, presentation: 9, practicalUse: 8, total: 86, comment: 'Energetic street dance performance. Crowd favourite.', evaluated: true },
];

export const mockNotifications: Notification[] = [
  { id: 'n1', title: 'New Submission',       message: 'Code Wizards submitted EcoTrack AI',                      type: 'success', read: false, createdAt: '2026-04-14T10:30:00Z' },
  { id: 'n2', title: 'Evaluation Complete',  message: 'Dr. Alex Rivera completed scoring for 3 teams',            type: 'info',    read: false, createdAt: '2026-04-14T09:00:00Z' },
  { id: 'n3', title: 'Deadline Reminder',    message: 'HackTech 2026 submission deadline in 24 hours',            type: 'warning', read: true,  createdAt: '2026-04-14T08:00:00Z' },
  { id: 'n4', title: 'Event Completed',      message: 'Green Code Challenge results are in! GreenByte wins.',     type: 'success', read: true,  createdAt: '2026-03-11T18:00:00Z' },
  { id: 'n5', title: 'New Team Registered',  message: 'DeepMind Labs registered for AI Innovation Summit.',       type: 'info',    read: true,  createdAt: '2026-04-02T12:00:00Z' },
];

// ─── DASHBOARD STATS — derived from real data ────────────────────────────────
export const dashboardStats = {
  organizer: {
    totalEvents:          mockEvents.length,
    activeEvents:         mockEvents.filter(e => e.status === 'live').length,
    totalTeams:           mockTeams.length,
    totalJudges:          mockJudges.length,
    totalSubmissions:     mockTeams.filter(t => t.submission?.status === 'submitted' || t.submission?.status === 'approved').length,
    pendingSubmissions:   mockTeams.filter(t => t.submission?.status === 'pending').length,
    completedEvaluations: mockScores.filter(s => s.evaluated).length,
    completedEvents:      mockEvents.filter(e => e.status === 'completed').length,
  },
  judge: {
    assignedEvents: 2, teamsToEvaluate: 6, completed: 3, pending: 3,
  },
  team: {
    eventsJoined: 1, submissionStatus: 'submitted' as const, daysUntilDeadline: 3,
  },
};

// ─── Utilities ────────────────────────────────────────────────────────────────
export async function computeFileHash(file: File): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return `${file.name}-${file.size}-${file.lastModified}`;
  }
}

export function findDuplicateVideoByHash(hash: string, excludeTeamId?: string): string | null {
  for (const team of mockTeams) {
    if (excludeTeamId && team.id === excludeTeamId) continue;
    if (team.submission?.videoHash && team.submission.videoHash === hash) return team.name;
  }
  return null;
}
