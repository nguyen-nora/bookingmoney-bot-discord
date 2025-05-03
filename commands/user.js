const db = require('../database');
const { isAdmin } = require('../utils/permission');

module.exports = {
    balance: (message, args) => {
        const user = message.mentions.users.first() || message.author;
        if (user.id !== message.author.id) {
            return isAdmin(message.author.id, (admin) => {
                if (!admin) return message.reply('You are not allowed to check other users\' balance.');
                db.get(`SELECT Money FROM User WHERE ID = ?`, [user.id], (err, row) => {
                    if (!row) return message.reply(`${user.tag} has no account.`);
                    message.reply(`${user.tag} has ${row.Money} money.`);
                });
            });
        }
        db.get(`SELECT Money FROM User WHERE ID = ?`, [user.id], (err, row) => {
            if (!row) return message.reply('You have no account.');
            message.reply(`You have ${row.Money} money.`);
        });
    },
    transfer: (message, args) => {
        const targetUser = message.mentions.users.first();
        const amount = parseFloat(args[1]);
        if (!targetUser) return message.reply('Please mention a user to transfer money to.');
        if (targetUser.bot) return message.reply('You cannot transfer money to bots.');
        if (isNaN(amount) || amount <= 0) return message.reply('Please specify a valid amount greater than 0.');
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            db.get(`SELECT Money FROM User WHERE ID = ?`, [message.author.id], (err, senderRow) => {
                if (!senderRow) {
                    db.run('ROLLBACK');
                    return message.reply('You do not have an account.');
                }
                if (senderRow.Money < amount) {
                    db.run('ROLLBACK');
                    return message.reply('You do not have enough money.');
                }
                db.run(`UPDATE User SET Money = Money - ? WHERE ID = ?`, [amount, message.author.id]);
                db.run(`INSERT OR IGNORE INTO User (ID) VALUES (?)`, [targetUser.id]);
                db.run(`UPDATE User SET Money = Money + ? WHERE ID = ?`, [amount, targetUser.id]);
                db.run(`INSERT INTO Detail (UserID, Money, DateCash, Description) VALUES (?, ?, datetime('now'), ?)`, 
                    [message.author.id, -amount, `Transfer to ${targetUser.tag}`]);
                db.run(`INSERT INTO Detail (UserID, Money, DateCash, Description) VALUES (?, ?, datetime('now'), ?)`, 
                    [targetUser.id, amount, `Transfer from ${message.author.tag}`]);
                db.run('COMMIT', (err) => {
                    if (err) {
                        db.run('ROLLBACK');
                        return message.reply('An error occurred during the transfer.');
                    }
                    message.reply(`Successfully transferred ${amount} to ${targetUser.tag}.`);
                });
            });
        });
    },
    history: (message, args) => {
        db.all(`SELECT Money, DateCash, Description FROM Detail WHERE UserID = ? ORDER BY DateCash DESC LIMIT 10`, 
            [message.author.id], (err, rows) => {
            if (!rows || rows.length === 0) return message.reply('No transaction history found.');
            const history = rows.map(r => {
                const sign = r.Money >= 0 ? '+' : '';
                return `${r.DateCash}: ${sign}${r.Money} (${r.Description})`;
            }).join('\n');
            message.reply(`Your last 10 transactions:\n${history}`);
        });
    },
    transactions: (message, args) => {
        const user = message.mentions.users.first() || message.author;
        db.all(`SELECT Money, DateCash, Description FROM Detail WHERE UserID = ? ORDER BY DateCash DESC LIMIT 10`, [user.id], (err, rows) => {
            if (!rows || rows.length === 0) return message.reply('No transactions found.');
            const history = rows.map(r => `${r.DateCash}: ${r.Money} (${r.Description})`).join('\n');
            message.reply(`Last 10 transactions for ${user.tag}:\n${history}`);
        });
    },
    userrank: (message, args) => {
        db.all(`
            SELECT d.UserID as ID, SUM(d.Money) as Total
            FROM Detail d
            LEFT JOIN Admin a ON d.UserID = a.ID
            WHERE d.Description LIKE 'Deposit by%'
            AND a.ID IS NULL
            GROUP BY d.UserID
            ORDER BY Total DESC
            LIMIT 10
        `, [], (err, rows) => {
            if (!rows || rows.length === 0) return message.reply('No users found.');
            const rank = rows.map((r, i) => `#${i+1} <@${r.ID}>: ${r.Total}`).join('\n');
            message.reply(`🏆 **User Ranking** 🏆\n${rank}`);
        });
    }
};
