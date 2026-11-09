import express from 'express';
import cors from 'cors';
import pool from './db.js';

// run with 'node server.js'
// link: http://localhost:3000/users

// server tech stack: react/ts -> nodejs -> express -> postgreSQL

// Ports:
// - Vite:     5173
// - Express:  3000
// - Postgres: 5432

const app = express();
const PORT = 3000;

app.use(cors());         // cross-origin requests
app.use(express.json()); // permit express to accept json data

// endpoints. Result (res) is what is returned (res.send(), res.json(), res.status())
app.get('/', (req, res) => {
    res.send('Backend server is running!');
});

app.get('/CS348_app_db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');

        res.json({
            message: 'Successfully connected to PostgreSQL!',
            time: result.rows[0].now
        });

    } catch (error) {
        console.error('Database error:', error.message);
        res.status(500).json({
            error: 'Database connection failed'
        });
    }
});

// GET users 
app.get('/users', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM users ORDER BY user_id'
        );

        res.json(result.rows);

    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({
            error: 'Failed to retrieve users'
        });
    }
});

// GET public profile details
app.get('/users/:id/profile', async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: 'Invalid user ID'
            });
        }

        const result = await pool.query(
            'SELECT user_id, username FROM users WHERE user_id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching profile:', error.message);
        res.status(500).json({
            error: 'Failed to retrieve profile'
        });
    }
});

// GET users total score
app.get('/users/:id/total-score', async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: 'Invalid user ID'
            });
        }

        const result = await pool.query(
            'SELECT get_user_total_score($1) AS total_score',
            [id]
        );

        res.json({
            user_id: id,
            total_score: result.rows[0].total_score
        });

    } catch (error) {
        console.error('Error calculating total score:', error.message);
        res.status(500).json({
            error: 'Failed to calculate total score'
        });
    }
});

// Log in a user with an email
app.get('/users/login/:email', async (req, res) => {
    try {
        const email = String(req.params.email);

        if (!email || email.length <= 0 || !email.includes('@')) {
            return res.status(400).json({
                error: 'Invalid Email'
            });
        }

        const result = await pool.query(
            `SELECT user_id, username, email
            FROM users
            WHERE email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Email not found"
            });
        }

        res.json({
            user_id: result.rows[0].user_id,
            username: result.rows[0].username,
            email: result.rows[0].email
        });

    } catch (error) {
        console.error('Error logging in user:', error.message);
        res.status(500).json({
            error: 'Failed to log in user'
        });
    }
});

// POST to users (uses request (req))
app.post('/users', async (req, res) => {
    try {
        
        // req.body stores middleware JSON information sent by React
        const { username, email } = req.body;

        // validify (will improve later)
        if (!username || !email) {
            return res.status(400).json({
                error: 'Username and email are required'
            });
        }

        // $1, $2, ... = Placeholder variables defined at the end (To prevent SQL injection)
        const result = await pool.query(
            'INSERT INTO users (username, email) VALUES ($1, $2) RETURNING *',
            [username, email]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error('Error inserting user:', error.message);
        res.status(500).json({
            error: 'Failed to insert user'
        });
    }
});

// DELETE from users

app.delete('/users/:id', async (req, res) => {
    try {
        // gets the id from the :id URL param 
        const id = req.params.id;

        const result = await pool.query(
            'DELETE FROM users WHERE user_id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        res.json({
            message: 'User deleted successfully',
            deletedUser: result.rows[0]
        });

    } catch (error) {
        console.error('Error deleting user:', error.message);
        res.status(500).json({
            error: 'Failed to delete user'
        });
    }
});

// PUT to update an existing user
app.put('/users/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({
                error: 'Username is required'
            });
        }

        const result = await pool.query(
            'UPDATE users SET username = $1 WHERE user_id = $2 RETURNING *',
            [username, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        res.json({
            message: 'User updated successfully',
            updatedUser: result.rows[0]
        });

    } catch (error) {
        console.error('Error updating user:', error.message);
        res.status(500).json({
            error: 'Failed to update user'
        });
    }
});


// ==== [ SCORE QUERIES ] ==== //

// get total user score and number of submissions
app.get('/scores', async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT 
                users.user_id, 
                username, 
                SUM(scores.score) AS total_score,
                COUNT(scores.score_id) AS num_submissions 
            FROM users
            JOIN scores ON scores.user_id = users.user_id
            GROUP BY users.user_id
            ORDER BY total_score DESC
            LIMIT 50
            `
        );

        res.json(result.rows);

    } catch (error) {
        console.error('Error fetching total user scores:', error.message);
        res.status(500).json({
            error: 'Failed to retrieve total user scores'
        });
    }
});

// get today's scores
app.get('/scores/today', async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT 
                users.user_id, 
                username, 
                scores.score
            FROM scores
            JOIN users ON users.user_id = scores.user_id
            WHERE submission_date = CURRENT_DATE
            ORDER BY score DESC
            LIMIT 50
            `
        );

        res.json(result.rows);

    } catch (error) {
        console.error('Error fetching today\'s user scores:', error.message);
        res.status(500).json({
            error: 'Failed to retrieve today\'s user scores'
        });
    }
});

// POST a score
app.post('/scores', async (req, res) => {
    try {
        
        // req.body stores middleware JSON information sent by React
        const { user_id, score /* medals (TO DO LATER) */ } = req.body;

        // validify (will improve later)
        if (!user_id) {
            return res.status(400).json({
                error: 'Invalid User'
            });
        }

        const result = await pool.query(
            'INSERT INTO scores (user_id, score) VALUES ($1, $2) RETURNING *',
            [user_id, score]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error('Error inserting score:', error.message);
        res.status(500).json({
            error: 'Failed to insert score'
        });
    }
});

// ==== [ START SERVER ] ==== //


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
