const db = require('../database');
require('dotenv').config();

function isAdmin(userId, callback) {
    db.get(`SELECT 1 FROM Admin WHERE ID = ?`, [userId], (err, row) => {
        callback(!!row || userId === process.env.ADMINID);
    });
}

function isPlayer(userId, callback) {
    db.get(`SELECT IsPlayer FROM User WHERE ID = ?`, [userId], (err, row) => {
        callback(row && row.IsPlayer === 1);
    });
}

function setPlayer(userId, isPlayer, cb) {
    db.run(`INSERT OR IGNORE INTO User (ID) VALUES (?)`, [userId], () => {
        db.run(`UPDATE User SET IsPlayer = ? WHERE ID = ?`, [isPlayer ? 1 : 0, userId], cb);
    });
}

module.exports = { isAdmin, isPlayer, setPlayer };
