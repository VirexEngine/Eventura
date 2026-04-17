require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');

const app = express();
// Frontend requests are hardcoded to http://localhost:80/
const port = process.env.PORT || 80;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({ storage: multer.memoryStorage() });

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Setup Initial Tables
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        fullName VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        username VARCHAR(100) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database connected and tables initialized.');
  } catch (err) {
    console.error('Database connection error! Please ensure PostgreSQL is running localy:', err.message);
  }
};

initDB();

app.post('/register', upload.single('photo'), async (req, res) => {
  try {
    const { name, email, phone, username, password } = req.body;
    
    // Check if user exists
    const userExists = await pool.query('SELECT id FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'User with this email or username already exists' });
    }

    const newUser = await pool.query(
      'INSERT INTO users (fullName, email, phone, username, password) VALUES ($1, $2, $3, $4, $5) RETURNING id, username',
      [name, email, phone, username, password]
    );

    res.json({ success: true, user: newUser.rows[0] });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, error: 'Internal server error while registering' });
  }
});

app.get('/teams', (req, res) => {
  res.json({ success: true, teams: ['TechFest IIT', 'Design Council', 'Robotics Club'] });
});

// Basic endpoint
app.get('/', (req, res) => {
  res.send('Eventeros API is running on PostgreSQL!');
});

app.listen(port, () => {
  console.log(`Backend server successfully started on port ${port}`);
});
