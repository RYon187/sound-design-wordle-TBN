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
            'SELECT * FROM users ORDER BY id'
        );

        res.json(result.rows);

    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({
            error: 'Failed to retrieve users'
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
            'DELETE FROM users WHERE id = $1 RETURNING *',
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
            'UPDATE users SET username = $1 WHERE id = $2 RETURNING *',
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

// start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
