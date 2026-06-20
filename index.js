const TelegramBot = require('node-telegram-bot-api');
const settings = require('./config.js');
const consoleDisplay = require('./console.display.js');
const database = require('./lib/database.js');

// 1. UBAH DI SINI: Matikan polling (polling: false) agar tidak crash di serverless Vercel
const bot = new TelegramBot(settings.token, { 
  polling: false,
  request: {
    timeout: 60000
  }
});

// Show banner on start
consoleDisplay.showBanner();

// Global state management (dipindahkan dari main.js)
const userStates = {};

// Helper functions yang digunakan oleh semua command files
const helpers = {
    checkUserAccess: (userId, chatId) => {
        if (userId == settings.ownerId || database.isPremium(userId)) {
            return true;
        }
        
        if (database.hasAccess(userId)) {
            return true;
        }
        
        // Kirim dengan photo dari config
        bot.sendPhoto(chatId, settings.panel, {
            caption: '❌ *Akses Ditolak!*\n\n' +
            'Hanya premium/access users yang boleh menggunakan fitur report.\n\n' +
            `Gunakan /myprem untuk cek status\n` +
            `Hubungi @${settings.dev} untuk info premium/access`,
            parse_mode: 'Markdown'
        });
        return false;
    },
    
    getUserStatus: (userId) => {
        if (userId == settings.ownerId) return '👑 Owner';
        if (database.isPremium(userId)) return '⭐ Premium';
        if (database.hasAccess(userId)) return `🎫 Access (${database.getUserAccess(userId)})`;
        return '🔒 Regular';
    },
    
    showAllCommands: (chatId) => {
        const menuMessage = `<blockquote>📋 ALL COMMANDS</blockquote>
🕷 General Commands:
<blockquote>/myprem - Check your status</blockquote>
🕷 Report Commands:
<blockquote>/reportacc - Report Telegram account
/reportch - Report Telegram channel
Note: Hanya premium/access users boleh pakai</blockquote>
🕷 Owner Commands:
<blockquote>/access id nominal - Add access
/addprem id - Add premium user
/removeprem id - Remove premium
/listprem - List premium users
/listaccess - List access users</blockquote>`;
        
        bot.sendPhoto(chatId, settings.panel, {
            caption: menuMessage,
            parse_mode: 'HTML'
        });
    },
    
    startReportProcess: async (chatId, userId, type, target, reason, count, accessMessage) => {
        // Kirim notifikasi access digunakan
        if (accessMessage && !accessMessage.includes('habis')) {
            bot.sendMessage(chatId, `📢 ${accessMessage}`);
        }
        
        // Kirim pesan awal dengan photo dari config
        const initialMessage = await bot.sendPhoto(chatId, settings.panel, {
            caption: getReportStartMessage(type, target, reason, count, 0),
            parse_mode: 'HTML'
        });
        
        // Simulasi report process dengan progress bar
        simulateReportWithProgress(chatId, userId, type, target, reason, count, initialMessage.message_id);
    }
};

// Function untuk start message
const getStartMessage = (userId, userName) => {
    return `<blockquote>👋 Olá @${userName}</blockquote>
「🤖 Telegram Auto Report Bot」
<blockquote>𝙄𝙣𝙛𝙣𝙧𝙢𝙖𝙩𝙞𝙤𝙣:
ケ ボット名 : GyzenLyoraa
ケ 開発者 : GyzenOfficial.t.me
ケ バージョン : 1.0.0
ケ ユーザー名 : ᴘᴜʙʟɪᴄ
ケ ユーザーID : ${userId}
ケ ユーザー名 : @${userName}</blockquote>
<blockquote>📌 Fitur Tersedia:
• Denunciar perfil da conta
• Denunciar imagens privadas do canal
• Sistema de relatórios duplo</blockquote>`;
};

// Function untuk menu message
const getMenuMessage = (userId, userName, status) => {
    return `<blockquote>📋 ALL COMMANDS</blockquote>
🕷 General Commands:
<blockquote>/myprem - Check your status</blockquote>
🕷 Report Commands:
<blockquote>/reportacc - Report Telegram account
/reportch - Report Telegram channel
Note: Hanya premium/access users boleh pakai</blockquote>
🕷 Owner Commands:
<blockquote>/access id nominal - Add access
/addprem id - Add premium user
/removeprem id - Remove premium
/listprem - List premium users
/listaccess - List access users</blockquote>`;
};

// Function untuk progress bar
const getProgressBar = (percentage) => {
    const filled = '▰';
    const empty = '▱';
    const total = 10;
    const filledCount = Math.floor(percentage / 10);
    const emptyCount = total - filledCount;
    return filled.repeat(filledCount) + empty.repeat(emptyCount);
};

// Function untuk report start message
const getReportStartMessage = (type, target, reason, count, percentage) => {
    const progressBar = getProgressBar(percentage);
    const moduleName = `REPORT ${type.toUpperCase()}`;
    
    return `<blockquote>⌜🜲 𝙍𝙚𝙡𝙖𝙩ο𝙧𝙞𝙤𝙨⌟
<i>Elite Report System</i>

⚘ <b>${moduleName}</b>

📌 Target: ${target}
📝 Reason: ${reason}
🔢 Count: ${count} reports

${progressBar} ${percentage}%

<code>INITIALIZING REPORT SEQUENCE</code></blockquote>`;
};

// Function untuk progress message
const getReportProgressMessage = (type, target, reason, count, percentage, success, failed, estimatedTime) => {
    const progressBar = getProgressBar(percentage);
    const moduleName = `REPORT ${type.toUpperCase()}`;
    const current = success + failed;
    
    let statusText = '';
    if (percentage < 30) {
        statusText = 'SCANNING TARGET';
    } else if (percentage < 60) {
        statusText = 'PREPARING REPORTS';
    } else if (percentage < 90) {
        statusText = 'SENDING REPORTS';
    } else {
        statusText = 'FINALIZING';
    }
    
    return `<blockquote>⌜🜲 𝙍𝙚𝙡𝙖𝙩𝙤𝙧𝙞𝙤𝙨⌟
<i>Elite Report System</i>

⚘ <b>${moduleName}</b>

📌 Target: ${target}
✅ Success: ${success}
❌ Failed: ${failed}
📊 Progress: ${current}/${count}
⏱️ Estimated: ${estimatedTime} mins

${progressBar} ${percentage}%

<code>${statusText} • ${current}/${count} COMPLETE</code></blockquote>`;
};

// Function untuk completion message
const getReportCompleteMessage = (type, target, reason, count, success, failed) => {
    const moduleName = `REPORT ${type.toUpperCase()}`;
    const percentage = 100;
    const progressBar = getProgressBar(percentage);
    
    return `<blockquote>⌜🜲 𝙍𝙚𝙡𝙖𝙩𝙤𝙧𝙞𝙤𝙨⌟
<i>Elite Report System</i>

⚘ <b>${moduleName}</b>

🎯 Target: ${target}
✅ Success: ${success}
❌ Failed: ${failed}
📊 Total: ${count} reports
⏱️ Finished: ${new Date().toLocaleTimeString()}

${progressBar} ${percentage}%

<code>REPORT COMPLETED • SECURE • STABLE • ELITE</code></blockquote>`;
};

// Function simulateReport dengan progress bar dan edit message
async function simulateReportWithProgress(chatId, userId, type, target, reason, count, messageId) {
    let success = 0;
    let failed = 0;
    const totalCount = count;
    
    // Update progress setiap 2-5 detik (lebih lambat)
    const updateInterval = 3000 + Math.random() * 2000; // 3-5 detik
    let lastUpdateTime = 0;
    
    const reportInterval = setInterval(async () => {
        const currentTime = Date.now();
        if (currentTime - lastUpdateTime < updateInterval) {
            return;
        }
        lastUpdateTime = currentTime;
        
        // Update progress
        const current = success + failed;
        
        // Stop jika sudah selesai
        if (current >= totalCount) {
            clearInterval(reportInterval);
            
            // Update final message
            try {
                await bot.editMessageCaption(
                    getReportCompleteMessage(type, target, reason, totalCount, success, failed),
                    {
                        chat_id: chatId,
                        message_id: messageId,
                        parse_mode: 'HTML'
                    }
                );
            } catch (error) {
                console.log('Error editing final message:', error.message);
            }
            
            // Log ke console
            consoleDisplay.logReport(userId, target, type, totalCount, success > 0);
            return;
        }
        
        // Simulasi report (85% success rate)
        if (Math.random() < 0.85) {
            success++;
        } else {
            failed++;
        }
        
        // Hitung progress
        const newCurrent = success + failed;
        const percentage = Math.min(99, Math.floor((newCurrent / totalCount) * 100));
        
        // Hitung estimated time (dalam menit)
        const remaining = totalCount - newCurrent;
        const estimatedTime = Math.max(1, Math.round((remaining * updateInterval / 1000 / 60)));
        
        // Update progress message setiap 5 report atau jika progress signifikan
        if (newCurrent % 5 === 0 || percentage % 10 === 0 || newCurrent === totalCount) {
            try {
                await bot.editMessageCaption(
                    getReportProgressMessage(type, target, reason, totalCount, percentage, success, failed, estimatedTime),
                    {
                        chat_id: chatId,
                        message_id: messageId,
                        parse_mode: 'HTML'
                    }
                );
            } catch (error) {
                console.log('Error editing progress message:', error.message);
            }
        }
    }, 1000); // Check every second, but update based on random interval
}

// Load semua command files
require('./commands/main.js')(bot, database, settings, consoleDisplay, userStates, helpers, getStartMessage, getMenuMessage);
require('./commands/report.js')(bot, database, settings, consoleDisplay, userStates, helpers);
require('./commands/admin.js')(bot, database, settings, consoleDisplay, helpers);

// 2. UBAH DI SINI: Bagian bawah dirombak total menjadi Handler Webhook Vercel Serverless
module.exports = async (req, res) => {
    try {
        if (req.method === 'POST') {
            // Telegram mengirim data update lewat POST request ke Webhook
            if (req.body && req.body.update_id) {
                bot.processUpdate(req.body);
            }
            return res.status(200).json({ status: 'success', message: 'Update diproses' });
        } else {
            // Jika diakses via browser biasa (GET)
            return res.status(200).send(`
                <div style="text-align: center; margin-top: 15%; font-family: 'Segoe UI', sans-serif;">
                    <h1 style="color: #24292e;">SC AUTO REPORT TELEGRAM [ GYZEN ]</h1>
                    <p style="color: #28a745; font-size: 18px; font-weight: bold;">Status: Terhubung & Aktif di Vercel (Mode Webhook)</p>
                    <p style="color: #6a737d;">Pastikan kamu sudah menembak setWebhook menggunakan URL domain dari Vercel ini.</p>
                </div>
            `);
        }
    } catch (error) {
        console.error('Error handling request:', error);
        return res.status(500).json({ error: error.message });
    }
};
