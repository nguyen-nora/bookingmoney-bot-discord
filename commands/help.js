const { EmbedBuilder } = require('discord.js');

module.exports = {
    help: (message) => {
        const helpEmbed = new EmbedBuilder()
            .setTitle('ContinentalMoney Bot Help')
            .setDescription('Commands you can use with this bot')
            .setColor(0x00AE86)
            .addFields(
                { name: 'Admin Commands', value: 
                    '`/addad @user` – Add admin (only main admin)\n' +
                    '`/balance @user` – Check balance of any user\n' +
                    '`/deposit @user <amount>` – Add money to any user\n' +
                    '`/showbank @user` – Show bank image (optional)\n' +
                    '`/setplayer @user` – Set user as player\n' +
                    '`/unsetplayer @user` – Remove player role\n'
                },
                { name: 'User Commands', value: 
                    '`/balance` – Check your own balance\n' +
                    '`/transfer @user <amount>` – Transfer money to another user\n' +
                    '`/history` – View your own transaction history\n' +
                    '`/transactions @user` – View transaction history of any user\n' +
                    '`/userrank` – User ranking by balance\n'
                },
                { name: 'Booking Commands', value:
                    '`/booking @player <amount>` – Book a player\n' +
                    '`/playerrank` – Player ranking by booking money\n'
                }
            )
            .setFooter({ text: 'Use the commands as shown. Mention users where required.' });
        message.reply({ embeds: [helpEmbed] });
    }
};
