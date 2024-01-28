// server.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

class Database { 
    constructor(dbPath) {
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Connected to the SQLite database.');
        });
    }

    createTable() {
        this.db.run(`CREATE TABLE IF NOT EXISTS visited_urls (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT NOT NULL
          );`, (err) => {
            if (err) {
              console.error(err.message);
            }
        });
    }

    insertUrl(url) {
        this.db.run(`INSERT INTO visited_urls(url) VALUES(?)`, [url], function(err) {
            if (err) {
              return console.error(err.message);
            }
            console.log(`A row has been inserted with rowid ${this.lastID}`);
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

        this.app.post("/visited", (req, res) => {
            this.database.insertUrl(req.body.url);
            res.sendStatus(200);
        });
    }

    startServer() {
        this.app.listen(this.port, () => console.log(`Server listening on port ${this.port}`));
    }
}

const sq_database = new Database('./mydb.sqlite3');
sq_database.createTable();

const server = new Server(database=sq_database, port=3000);
server.startServer();