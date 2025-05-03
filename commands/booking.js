const db = require('../database');
const { isPlayer, isAdmin } = require('../utils/permission');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    booking: async (message, args) => {
        const player = message.mentions.users.first();
        const amount = parseFloat(args[1]);
        if (!player || isNaN(amount) || amount <= 0) {
            return message.reply('Usage: /booking @player <amount>');
        }
        // Kiểm tra người được booking có phải player không
        isPlayer(player.id, async (isP) => {
            if (!isP) {
                return message.reply('Chỉ được booking player!');
            }
            // Tạo Embed đẹp mắt
            const embed = new EmbedBuilder()
                .setTitle('💼 Lời Mời Booking 💼')
                .setColor(0x00bfff)
                .setDescription(
                    `👤 **Người booking:** ${message.author}\n` +
                    `🎯 **Player:** ${player}\n` +
                    `💰 **Số tiền:** \`${amount}\`\n\n` +
                    `👉 ${player}, bạn có đồng ý nhận booking này không?\n\n` +
                    `*Vui lòng chọn một trong hai lựa chọn bên dưới!*`
                )
                .setThumbnail(player.displayAvatarURL())
                .setFooter({ text: 'Continental Money Bot', iconURL: message.client.user.displayAvatarURL() })
                .setTimestamp();

            // Gửi message với 2 nút
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('booking_accept')
                    .setLabel('💖 Đồng ý')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('booking_decline')
                    .setLabel('❌ Từ chối')
                    .setStyle(ButtonStyle.Danger)
            );

            const bookingMsg = await message.channel.send({
                content: `${player}`,
                embeds: [embed],
                components: [row]
            });

            // Tạo collector chỉ cho player bấm
            const filter = (i) => i.user.id === player.id;
            const collector = bookingMsg.createMessageComponentCollector({ filter, time: 60000, max: 1 });

            collector.on('collect', async (interaction) => {
                if (interaction.customId === 'booking_accept') {
                    // Thực hiện booking như cũ
                    isPlayer(player.id, (isP) => {
                        if (!isP) return message.reply(`${player.tag} is not a player.`);
                        db.serialize(() => {
                            db.run('BEGIN TRANSACTION');
                            db.get(`SELECT Money FROM User WHERE ID = ?`, [message.author.id], (err, row) => {
                                if (!row || row.Money < amount) {
                                    db.run('ROLLBACK');
                                    return message.reply('You do not have enough money.');
                                }
                                db.run(`UPDATE User SET Money = Money - ? WHERE ID = ?`, [amount, message.author.id]);
                                db.run(`UPDATE User SET Money = Money + ? WHERE ID = ?`, [amount, player.id]);
                                db.run(`INSERT INTO Detail (UserID, Money, DateCash, Description) VALUES (?, ?, datetime('now'), ?)`, 
                                    [message.author.id, -amount, `Booking to ${player.tag}`]);
                                db.run(`INSERT INTO Detail (UserID, Money, DateCash, Description) VALUES (?, ?, datetime('now'), ?)`, 
                                    [player.id, amount, `Booking from ${message.author.tag}`]);
                                db.run(`INSERT INTO DetailBooking (Money, DateRent) VALUES (?, datetime('now'))`, [amount], function(err) {
                                    if (err) {
                                        db.run('ROLLBACK');
                                        return message.reply('Error booking.');
                                    }
                                    const detailBookingId = this.lastID;
                                    db.run(`INSERT INTO Booking (UserID, PlayerID, DetailBookingID) VALUES (?, ?, ?)`, [message.author.id, player.id, detailBookingId], (err) => {
                                        if (err) {
                                            db.run('ROLLBACK');
                                            return message.reply('Error booking.');
                                        }
                                        db.run('COMMIT', (err) => {
                                            if (err) {
                                                db.run('ROLLBACK');
                                                return message.reply('Error booking.');
                                            }
                                            message.reply(`🎉 Booking thành công! ${message.author} đã booking ${player} với số tiền ${amount}.`);
                                        });
                                    });
                                });
                            });
                        });
                    });
                    await interaction.update({ content: '💖 Bạn đã đồng ý booking!', embeds: [], components: [] });
                } else {
                    await interaction.update({ content: '❌ Bạn đã từ chối booking.', embeds: [], components: [] });
                }
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    bookingMsg.edit({ content: '⏰ Booking đã hết hạn, không ai phản hồi.', embeds: [], components: [] });
                }
            });
        });
    },
    playerrank: (message, args) => {
        db.all(`
            SELECT d.UserID as ID, SUM(d.Money) as Total
            FROM Detail d
            LEFT JOIN Admin a ON d.UserID = a.ID
            WHERE d.Description LIKE 'Booking from%'
            AND a.ID IS NULL
            GROUP BY d.UserID
            ORDER BY Total DESC
            LIMIT 10
        `, [], (err, rows) => {
            if (!rows || rows.length === 0) return message.reply('No player bookings found.');
            const rank = rows.map((r, i) => `#${i+1} <@${r.ID}>: ${r.Total}`).join('\n');
            message.reply(`🏆 **Player Ranking (Booking Only)** 🏆\n${rank}`);
        });
    }
};
