const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS Admin (ID TEXT PRIMARY KEY)`);
    db.run(`CREATE TABLE IF NOT EXISTS User (ID TEXT PRIMARY KEY, Money REAL DEFAULT 0, IsPlayer INTEGER DEFAULT 0)`);
    db.run(`CREATE TABLE IF NOT EXISTS Detail (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        UserID TEXT,
        Money REAL DEFAULT 0,
        DateCash TEXT,
        Description TEXT,
        FOREIGN KEY (UserID) REFERENCES User(ID)
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS DetailBooking (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Money REAL DEFAULT 0,
        DateRent TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS Booking (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        UserID TEXT,
        PlayerID TEXT,
        DetailBookingID INTEGER,
        FOREIGN KEY (UserID) REFERENCES User(ID),
        FOREIGN KEY (PlayerID) REFERENCES User(ID),
        FOREIGN KEY (DetailBookingID) REFERENCES DetailBooking(ID)
    )`);
});

module.exports = db;