// server.js

require("dotenv").config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const session = require('express-session');
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

client.connect();

class Database {
    constructor(client) {
        this.client = client;
    }

    async createHistoryTable() {
        try {
            await this.client.query(`
                CREATE TABLE IF NOT EXISTS visited_urls (
                    id SERIAL PRIMARY KEY,
                    url TEXT NOT NULL,
                    userId INTEGER NOT NULL
                );
            `);
            console.log('History table created successfully.');
        } catch (err) {
            console.error('Error creating history table:', err);
        }
    }

    async createUserTable() {
        try {
            await this.client.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL
                );
            `);
            console.log('Users table created successfully.');
        } catch (err) {
            console.error('Error creating users table:', err);
        }
    }

    async insertUrl(url, userId) {
        try {
            const result = await this.client.query(`INSERT INTO visited_urls(url, userId) VALUES($1, $2) RETURNING id`, [url, userId]);
            console.log(`A row has been inserted with rowid ${result.rows[0].id} and for ${userId}`);
        } catch (err) {
            console.error('Error inserting URL:', err);
        }
    }

    async getHistory(userId) {
        try {
            const result = await this.client.query(`SELECT * FROM visited_urls WHERE userId = $1 ORDER BY id DESC`, [userId]);
            return result.rows;
        } catch (err) {
            console.error('Error getting history:', err);
        }
    }
}

class Server {
    constructor(database, port) {
        this.app = express();
        this.app.use(cors());
        this.app.use(bodyParser.json());
        this.database = database;
        this.port = port

        // Set up session middleware
        this.app.use(session({
            secret: "NLGFNLKAJGKLJFGLJG4258742598732893247892572394",
            resave: false,
            saveUninitialized: true
        }));

        this.app.get("/history", async (req, res) => {
            const userId = req.session.userId;
            if (!userId) {
                res.status(401).send('Not logged in');
                return;
            }
        
            try {
                const history = await this.database.getHistory(userId);
                res.json(history);
            } catch (err) {
                console.error(err);
                res.status(500).send('Server error');
            }
        });
    }

    registerUser() {
        this.app.post('/register', async (req, res) => {
            const { username, password } = req.body;
    
            // Hash the password
            try {
                const hash = await bcrypt.hash(password, 10);
    
                // Insert the new user into the database
                const result = await this.database.client.query(`INSERT INTO users(username, password) VALUES($1, $2) RETURNING id`, [username, hash]);
    
                req.session.userId = result.rows[0].id;
                req.session.save();
                res.status(200).json({ userId: req.session.userId });
                console.log("user created" + result.rows[0].id);
            } catch (err) {
                console.error(err);
                return res.status(500).send('Server error');
            }
        });
    }

    loginUser() {
        this.app.post('/login', async (req, res) => {
            const { username, password } = req.body;
    
            // Get the user from the database
            try {
                const result = await this.database.client.query(`SELECT * FROM users WHERE username = $1`, [username]);
    
                // If the user doesn't exist, send an error response
                if (result.rows.length === 0) {
                    return res.status(400).send('Invalid username or password');
                }
    
                const user = result.rows[0];
    
                // Check the password
                const match = await bcrypt.compare(password, user.password);
    
                if (!match) {
                    return res.status(400).send('Invalid username or password');
                }
    
                // Log the user in
                req.session.userId = user.id;
                req.session.save();
                res.status(200).json({ userId: req.session.userId });
                console.log("user logged in" + user.id);
            } catch (err) {
                console.error(err);
                return res.status(500).send('Server error');
            }
        });
    }

    checkAuth(req, res, next) {
        // If the user is logged in, continue with the request
        if (req.session && req.session.userId) {
            return next();
        }

        // Otherwise, send an unauthorized error
        return res.status(401).send('Unauthorized');
    }

    startServer() {
        this.registerUser();
        this.loginUser();
        this.app.post("/visited", this.checkAuth, (req, res) => {
            console.log("this is the LAST SESSION" + req.session);
            this.database.insertUrl(req.body.url, req.session.userId);
            res.sendStatus(200);
        });
        this.app.post("/logout", (req, res) => {
            const authHeader = req.headers['authorization'];
            const sessionId = authHeader && authHeader.split(' ')[1];
        
            if (sessionId) {
                req.session.destroy(err => {
                    if (err) {
                        return res.sendStatus(500);
                    }
        
                    res.sendStatus(200);
                });
            } else {
                res.sendStatus(401);
            }
        });
        this.app.listen(this.port, () => console.log(`Server listening on port ${this.port}`));
    }
}

const sq_database = new Database(client);
sq_database.createHistoryTable();
sq_database.createUserTable();

const server = new Server(database=sq_database, port=3000);
server.startServer();

process.on('SIGINT', async () => {
    console.log('Received SIGINT. Closing PostgreSQL client.');
    await client.end();
    process.exit();
});

process.on('SIGTERM', async () => {
    console.log('Received SIGTERM. Closing PostgreSQL client.');
    await client.end();
    process.exit();
});