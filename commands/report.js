module.exports = function(bot, database, settings, consoleDisplay, userStates, helpers) {
    
    // Command: /reportacc
    bot.onText(/\/reportacc/, (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const userName = msg.from.username || msg.from.first_name;
        
        consoleDisplay.logCommand(userId, userName, 'reportacc');
        
        // Cek access - SEMUA USER BISA LIHAT COMMAND INI
        // Tapi hanya premium/access yang bisa pakai
        if (!helpers.checkUserAccess(userId, chatId)) return;
        
        userStates[userId] = { state: 'waiting_reportacc_target' };
        
        bot.sendMessage(chatId,
            '📝 *REPORT ACCOUNT*\n\n' +
            'Silakan kirim link target yang ingin di-report:\n\n' +
            'Contoh: https://t.me/username\n' +
            'atau: @username\n\n' +
            '⚠️ *Penting:* Target harus berupa akun Telegram',
            { parse_mode: 'Markdown' }
        );
    });

    // Command: /reportch
    bot.onText(/\/reportch/, (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const userName = msg.from.username || msg.from.first_name;
        
        consoleDisplay.logCommand(userId, userName, 'reportch');
        
        // Cek access - SEMUA USER BISA LIHAT COMMAND INI
        // Tapi hanya premium/access yang bisa pakai
        if (!helpers.checkUserAccess(userId, chatId)) return;
        
        userStates[userId] = { state: 'waiting_reportch_target' };
        
        bot.sendMessage(chatId,
            '📝 *REPORT CHANNEL*\n\n' +
            'Silakan kirim link channel yang ingin di-report:\n\n' +
            'Contoh: https://t.me/channelname\n' +
            'atau: @channelname\n\n' +
            '⚠️ *Laporan akan fokus pada:*\n' +
            '• Personal Data > Private Image',
            { parse_mode: 'Markdown' }
        );
    });

    // Handle text messages untuk state report
    bot.on('message', (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const text = msg.text;
        
        // Skip jika bukan text atau command
        if (!text || text.startsWith('/')) return;
        
        const userState = userStates[userId];
        if (!userState) return;
        
        if (userState.state === 'waiting_reportacc_target') {
            userStates[userId] = {
                state: 'waiting_reportacc_reason',
                target: text
            };
            
            bot.sendMessage(chatId,
                '✅ *Target diterima!*\n\n' +
                'Sekarang kirim alasan/reason untuk report:\n\n' +
                'Contoh: "Spam messages" atau "Harassment"\n' +
                '⚠️ *Report akan dilakukan di bagian:*\n' +
                '• Other',
                { parse_mode: 'Markdown' }
            );
            
        } else if (userState.state === 'waiting_reportacc_reason') {
            userStates[userId] = {
                state: 'waiting_reportacc_count',
                target: userState.target,
                reason: text
            };
            
            bot.sendMessage(chatId,
                '✅ *Reason diterima!*\n\n' +
                'Sekarang kirim jumlah report (1-1000):\n\n' +
                'Contoh: 10\n' +
                '⚠️ *Note:* Delay 2 detik per report',
                { parse_mode: 'Markdown' }
            );
            
        } else if (userState.state === 'waiting_reportacc_count') {
            const count = parseInt(text);
            
            if (isNaN(count) || count < 1 || count > 1000) {
                bot.sendMessage(chatId, '❌ Jumlah harus antara 1-1000!');
                return;
            }
            
            delete userStates[userId];
            
            // Gunakan 1 access
            const accessResult = database.useAccess(userId);
            if (!accessResult.success && !database.isPremium(userId) && userId != settings.ownerId) {
                bot.sendMessage(chatId, '❌ Access habis!');
                return;
            }
            
            // Start report process
            helpers.startReportProcess(chatId, userId, 'ACCOUNT', userState.target, userState.reason, count, accessResult.message);
            
        } else if (userState.state === 'waiting_reportch_target') {
            userStates[userId] = {
                state: 'waiting_reportch_reason',
                target: text
            };
            
            bot.sendMessage(chatId,
                '✅ *Target channel diterima!*\n\n' +
                'Sekarang kirim alasan/reason untuk report:\n\n' +
                'Contoh: "Posting private images"\n' +
                '⚠️ *Report akan fokus pada:*\n' +
                '• Personal Data > Private Image',
                { parse_mode: 'Markdown' }
            );
            
        } else if (userState.state === 'waiting_reportch_reason') {
            userStates[userId] = {
                state: 'waiting_reportch_count',
                target: userState.target,
                reason: text
            };
            
            bot.sendMessage(chatId,
                '✅ *Reason diterima!*\n\n' +
                'Sekarang kirim jumlah report (1-1000):\n\n' +
                'Contoh: 10\n' +
                '⚠️ *Note:* Delay 2 detik per report',
                { parse_mode: 'Markdown' }
            );
            
        } else if (userState.state === 'waiting_reportch_count') {
            const count = parseInt(text);
            
            if (isNaN(count) || count < 1 || count > 1000) {
                bot.sendMessage(chatId, '❌ Jumlah harus antara 1-1000!');
                return;
            }
            
            delete userStates[userId];
            
            // Gunakan 1 access
            const accessResult = database.useAccess(userId);
            if (!accessResult.success && !database.isPremium(userId) && userId != settings.ownerId) {
                bot.sendMessage(chatId, '❌ Access habis!');
                return;
            }
            
            // Start report process
            helpers.startReportProcess(chatId, userId, 'CHANNEL', userState.target, userState.reason, count, accessResult.message);
        }
    });
};