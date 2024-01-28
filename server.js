// server.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const session = require('express-session');


class Database {
    constructor(dbPath) {
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Connected to the SQLite database.');
        });
    }

    createHistoryTable() {
        this.db.run(`CREATE TABLE IF NOT EXISTS visited_urls (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT NOT NULL,
            userId INTEGER NOT NULL
          );`, (err) => {
            if (err) {
              console.error(err.message);
            }
        });
    }

    createUserTable() {
        this.db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        );`, (err) => {
            if (err) {
              console.error(err.message);
            }
        });
    }


    insertUrl(url, userId) {
        this.db.run(`INSERT INTO visited_urls(url, userId) VALUES(?, ?)`, [url, userId], function(err) {
            if (err) {
              return console.error(err.message);
            }
            console.log(`A row has been inserted with rowid ${this.lastID} and for ${userId}`);
        });
    }

    getHistory(userId, callback) {
        this.db.all(`SELECT * FROM visited_urls WHERE userId = ? ORDER BY id DESC`, [userId], (err, rows) => {
          if (err) {
            throw err;
          }
          callback(rows);
          console.log("Got history for a user" + userId)
        });
    }
}

class Server {
    constructor(database, port) {
        this.app = express();
        this.app.use(cors());
        this.app.use(bodyParser.json());
        this.database = database;
        this.port = port

        // this.app.post("/visited", (req, res) => {
        //     console.log("this is the NEW SESSION")
        //     this.database.insertUrl(req.body.url, req.session.userId);
        //     res.sendStatus(200);
        // });

        // Set up session middleware
        this.app.use(session({
            secret: "NLGFNLKAJGKLJFGLJG4258742598732893247892572394",
            resave: false,
            saveUninitialized: true
        }));

        this.app.get("/history", (req, res) => {
            const userId = req.session.userId;
            if (!userId) {
                res.status(401).send('Not logged in');
                return;
            }

            this.database.getHistory(userId, (history) => {
              res.json(history);
            });
        });
    }

    registerUser() {
        this.app.post('/register', (req, res) => {
            const { username, password } = req.body;

            // Hash the password
            bcrypt.hash(password, 10, (err, hash) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Server error');
                }

                // Insert the new user into the database
                this.database.db.run(`INSERT INTO users(username, password) VALUES(?, ?)`, [username, hash], function(err) {
                    if (err) {
                        console.error(err.message);
                        return res.status(400).send('Could not create user');
                    }

                    req.session.userId = this.lastID;
                    req.session.save();
                    res.status(200).json({ userId: req.session.userId });
                    console.log("user created" + this.lastID)
                });
            });
        });
    }

    loginUser() {
        this.app.post('/login', (req, res) => {
            const { username, password } = req.body;

            // Get the user from the database
            this.database.db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Server error');
                }

                // If the user doesn't exist, send an error response
                if (!row) {
                    return res.status(400).send('Invalid username or password');
                }

                // Compare the hashed passwords
                bcrypt.compare(password, row.password, (err, result) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Server error');
                    }

                    // If the passwords match, the user is authenticated
                    if (result) {
                        // Create a session for the user
                        req.session.userId = row.id;
                        // localStorage.setItem('userId', row.id);
                        req.session.save();
                        console.log("user authenticated with name " + req.session.userId)
                        return res.status(200).json({ userId: row.id });
                    } else {
                        return res.status(400).send('Invalid username or password');
                    }
                });
            });
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
        this.app.listen(this.port, () => console.log(`Server listening on port ${this.port}`));
    }
}

const sq_database = new Database('./mydb.sqlite3');
sq_database.createHistoryTable();
sq_database.createUserTable();

const server = new Server(database=sq_database, port=3000);
server.startServer();