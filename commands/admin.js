module.exports = function(bot, database, settings, consoleDisplay, helpers) {
    
    // Command: /access (owner only)
    bot.onText(/\/access (.+)/, (msg, match) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const userName = msg.from.username || msg.from.first_name;
        
        consoleDisplay.logCommand(userId, userName, 'access', match[1]);
        
        // Cek owner
        if (userId != settings.ownerId) {
            bot.sendMessage(chatId, '❌ *Akses Ditolak!*\nHanya owner yang boleh menggunakan command ini.', {
                parse_mode: 'Markdown'
            });
            return;
        }
        
        const args = match[1].split(' ');
        if (args.length < 2) {
            bot.sendMessage(chatId, '❌ *Format Salah!*\nContoh: /access 123456789 5', {
                parse_mode: 'Markdown'
            });
            return;
        }
        
        const targetId = parseInt(args[0]);
        const nominal = parseInt(args[1]);
        
        if (isNaN(targetId) || isNaN(nominal) || nominal < 1) {
            bot.sendMessage(chatId, '❌ *Input tidak valid!*\nID dan nominal harus angka.', {
                parse_mode: 'Markdown'
            });
            return;
        }
        
        try {
            // Dapatkan username target jika ada
            bot.getChat(targetId).then(chat => {
                const targetUsername = chat.username || '';
                
                // Add access ke database
                const addedAccess = database.addAccess(targetId, nominal, targetUsername);
                
                consoleDisplay.logAdminAction(userId, `ADD_ACCESS ${nominal}`, targetId);
                
                // Kirim notifikasi ke target
                bot.sendMessage(targetId, 
                    `🎉 *ACCESS DITAMBAHKAN!*\n\n` +
                    `Anda mendapatkan *${nominal} Access* dari admin!\n\n` +
                    `✅ Anda sekarang bisa menggunakan command premium\n` +
                    `📊 Sisa Access: ${addedAccess}\n\n` +
                    `Gunakan /myprem untuk cek status`,
                    { parse_mode: 'Markdown' }
                ).catch(() => {
                    console.log('Tidak bisa kirim notifikasi ke target');
                });
                
                bot.sendMessage(chatId, 
                    `✅ *Access berhasil ditambahkan!*\n\n` +
                    `👤 Target: ${targetId}\n` +
                    `🎫 Access: +${nominal}\n` +
                    `📊 Total: ${addedAccess}\n` +
                    `📅 Waktu: ${new Date().toLocaleString()}`,
                    { parse_mode: 'Markdown' }
                );
                
            }).catch(err => {
                // Jika tidak bisa get chat, tetap tambah access
                database.addAccess(targetId, nominal, '');
                consoleDisplay.logAdminAction(userId, `ADD_ACCESS ${nominal}`, targetId);
                
                bot.sendMessage(chatId, 
                    `✅ *Access berhasil ditambahkan!*\n\n` +
                    `👤 Target: ${targetId}\n` +
                    `🎫 Access: +${nominal}\n` +
                    `📊 Total: ${nominal}\n` +
                    `📅 Waktu: ${new Date().toLocaleString()}`,
                    { parse_mode: 'Markdown' }
                );
            });
            
        } catch (error) {
            consoleDisplay.showError(error);
            bot.sendMessage(chatId, '❌ *Terjadi error!*\n' + error.message, {
                parse_mode: 'Markdown'
            });
        }
    });

    // Command: /addprem (owner only)
    bot.onText(/\/addprem (.+)/, (msg, match) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const userName = msg.from.username || msg.from.first_name;
        
        consoleDisplay.logCommand(userId, userName, 'addprem', match[1]);
        
        if (userId != settings.ownerId) {
            bot.sendMessage(chatId, '❌ *Akses Ditolak!*\nHanya owner yang boleh menggunakan command ini.', {
                parse_mode: 'Markdown'
            });
            return;
        }
        
        const targetId = parseInt(match[1]);
        if (isNaN(targetId)) {
            bot.sendMessage(chatId, '❌ ID tidak valid!');
            return;
        }
        
        try {
            bot.getChat(targetId).then(chat => {
                const success = database.addPremium(targetId, chat.username || '');
                
                if (success) {
                    consoleDisplay.logAdminAction(userId, 'ADD_PREMIUM', targetId);
                    
                    // Kirim notifikasi ke user
                    bot.sendMessage(targetId,
                        `🎉 *SELAMAT!*\n\n` +
                        `Anda telah di-upgrade ke *PREMIUM USER* oleh admin!\n\n` +
                        `✅ Akses fitur premium terbuka\n` +
                        `✅ Unlimited Reports\n` +
                        `✅ Dukungan penuh`,
                        { parse_mode: 'Markdown' }
                    ).catch(() => {});
                    
                    bot.sendMessage(chatId, `✅ Premium berhasil ditambahkan untuk user ${targetId}`);
                } else {
                    bot.sendMessage(chatId, '⚠️ User sudah premium!');
                }
            }).catch(() => {
                // Jika tidak bisa get chat, tetap tambah premium
                database.addPremium(targetId, '');
                consoleDisplay.logAdminAction(userId, 'ADD_PREMIUM', targetId);
                bot.sendMessage(chatId, `✅ Premium berhasil ditambahkan untuk user ${targetId}`);
            });
        } catch (error) {
            consoleDisplay.showError(error);
            bot.sendMessage(chatId, '❌ Error: ' + error.message);
        }
    });

    // Command: /removeprem (owner only)
    bot.onText(/\/removeprem (.+)/, (msg, match) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        
        if (userId != settings.ownerId) {
            bot.sendMessage(chatId, '❌ *Akses Ditolak!*', { parse_mode: 'Markdown' });
            return;
        }
        
        const targetId = parseInt(match[1]);
        if (isNaN(targetId)) {
            bot.sendMessage(chatId, '❌ ID tidak valid!');
            return;
        }
        
        const success = database.removePremium(targetId);
        if (success) {
            consoleDisplay.logAdminAction(userId, 'REMOVE_PREMIUM', targetId);
            bot.sendMessage(chatId, `✅ Premium dihapus untuk user ${targetId}`);
        } else {
            bot.sendMessage(chatId, '⚠️ User tidak ditemukan!');
        }
    });

    // Command: /listprem (owner only)
    bot.onText(/\/listprem/, (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        
        consoleDisplay.logCommand(userId, msg.from.username || msg.from.first_name, 'listprem');
        
        if (userId != settings.ownerId) {
            bot.sendMessage(chatId, '❌ *Akses Ditolak!*\nHanya owner yang boleh menggunakan command ini.', {
                parse_mode: 'Markdown'
            });
            return;
        }
        
        const premiumUsers = database.getPremiumUsers();
        let message = `⭐ *PREMIUM USERS*\n\nTotal: ${premiumUsers.length}\n\n`;
        
        premiumUsers.forEach((user, index) => {
            message += `${index + 1}. ${user.username ? '@' + user.username : 'No username'}\n`;
            message += `   🆔: ${user.id}\n\n`;
        });
        
        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    });

    // Command: /listaccess (owner only)
    bot.onText(/\/listaccess/, (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        
        consoleDisplay.logCommand(userId, msg.from.username || msg.from.first_name, 'listaccess');
        
        if (userId != settings.ownerId) {
            bot.sendMessage(chatId, '❌ *Akses Ditolak!*\nHanya owner yang boleh menggunakan command ini.', {
                parse_mode: 'Markdown'
            });
            return;
        }
        
        const accessUsers = database.getAccessUsers();
        let message = `🎫 *ACCESS USERS*\n\nTotal: ${accessUsers.length}\n\n`;
        
        accessUsers.forEach((user, index) => {
            message += `${index + 1}. ${user.username ? '@' + user.username : 'No username'}\n`;
            message += `   🆔: ${user.id}\n`;
            message += `   🎫 Access: ${user.access}\n`;
            message += `   📊 Used: ${user.used || 0}\n\n`;
        });
        
        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    });
};