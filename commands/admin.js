const db = require('../database');
const { isAdmin, setPlayer } = require('../utils/permission');

module.exports = {
    addad: (message, args) => {
        if (message.author.id !== process.env.ADMINID) return message.reply('Only the main admin can add admins.');
        const user = message.mentions.users.first();
        if (!user) return message.reply('Please mention a user.');
        db.run(`INSERT OR IGNORE INTO Admin (ID) VALUES (?)`, [user.id], (err) => {
            if (err) return message.reply('Error adding admin.');
            message.reply(`${user.tag} is now an admin.`);
        });
    },
    deposit: (message, args) => {
        isAdmin(message.author.id, (admin) => {
            if (!admin) return message.reply('You are not an admin.');
            const user = message.mentions.users.first();
            const amount = parseFloat(args[1]);
            if (!user || isNaN(amount) || amount <= 0) return message.reply('Usage: /deposit @user <amount>');
            db.run(`INSERT OR IGNORE INTO User (ID) VALUES (?)`, [user.id]);
            db.run(`UPDATE User SET Money = Money + ? WHERE ID = ?`, [amount, user.id]);
            db.run(`INSERT INTO Detail (UserID, Money, DateCash, Description) VALUES (?, ?, datetime('now'), ?)`, [user.id, amount, `Deposit by ${message.author.tag}`]);
            message.reply(`Deposited ${amount} to ${user.tag}.`);
        });
    },
    showbank: (message, args) => {
        const user = message.mentions.users.first() || message.author;
        message.reply(`Bank image for ${user.tag}: [Image Placeholder]`);
    },
    setplayer: (message, args) => {
        isAdmin(message.author.id, (admin) => {
            if (!admin) return message.reply('You are not an admin.');
            const user = message.mentions.users.first();
            if (!user) return message.reply('Please mention a user.');
            setPlayer(user.id, true, () => {
                message.reply(`${user.tag} is now a player.`);
            });
        });
    },
    unsetplayer: (message, args) => {
        isAdmin(message.author.id, (admin) => {
            if (!admin) return message.reply('You are not an admin.');
            const user = message.mentions.users.first();
            if (!user) return message.reply('Please mention a user.');
            setPlayer(user.id, false, () => {
                message.reply(`${user.tag} is no longer a player.`);
            });
        });
    }
};
