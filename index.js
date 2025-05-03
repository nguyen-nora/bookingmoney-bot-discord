require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

// Create the client first
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ] 
});

const db = new sqlite3.Database('database.db');

// Ensure tables exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS Admin (ID TEXT PRIMARY KEY)`);
    db.run(`CREATE TABLE IF NOT EXISTS User (ID TEXT PRIMARY KEY, Money REAL DEFAULT 0)`);
    db.run(`CREATE TABLE IF NOT EXISTS Detail (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        UserID TEXT,
        Money REAL,
        DateCash TEXT,
        Description TEXT,
        FOREIGN KEY (UserID) REFERENCES User(ID)
    )`);
});

function isAdmin(userId, callback) {
    db.get(`SELECT 1 FROM Admin WHERE ID = ?`, [userId], (err, row) => {
        callback(!!row || userId === process.env.ADMINID);
    });
}

const adminCmd = require('./commands/admin');
const userCmd = require('./commands/user');
const bookingCmd = require('./commands/booking');
const helpCmd = require('./commands/help');

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    const args = message.content.trim().split(/\s+/);
    const command = args.shift().toLowerCase();

    // ADMIN
    if (command === '/addad') return adminCmd.addad(message, args);
    if (command === '/deposit') return adminCmd.deposit(message, args);
    if (command === '/showbank') return adminCmd.showbank(message, args);
    if (command === '/setplayer') return adminCmd.setplayer(message, args);
    if (command === '/unsetplayer') return adminCmd.unsetplayer(message, args);

    // USER
    if (command === '/balance') return userCmd.balance(message, args);
    if (command === '/transfer') return userCmd.transfer(message, args);
    if (command === '/history') return userCmd.history(message, args);
    if (command === '/transactions') return userCmd.transactions(message, args);
    if (command === '/userrank') return userCmd.userrank(message, args);

    // BOOKING
    if (command === '/booking') return bookingCmd.booking(message, args);
    if (command === '/playerrank') return bookingCmd.playerrank(message, args);

    // HELP
    if (command === '/help') return helpCmd.help(message);
});

// Login the client at the end
client.login(process.env.DISCORD_TOKEN);