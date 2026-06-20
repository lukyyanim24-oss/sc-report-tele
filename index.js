// =====================================================================
// 🛠️ VERCEL READ-ONLY FIX (Taruh di paling atas sebelum mengimpor apapun)
// =====================================================================
const fs = require('fs');
const pathMod = require('path');

const patchLogPath = (filePath) => {
    // Jika script mencoba mengakses atau menulis bot_console.log, alihkan ke folder /tmp
    if (typeof filePath === 'string' && filePath.includes('bot_console.log')) {
        return pathMod.join('/tmp', 'bot_console.log');
    }
    return filePath;
};

const originalWriteFileSync = fs.writeFileSync;
fs.writeFileSync = function (fp, ...args) {
    return originalWriteFileSync(patchLogPath(fp), ...args);
};

const originalAppendFileSync = fs.appendFileSync;
fs.appendFileSync = function (fp, ...args) {
    return originalAppendFileSync(patchLogPath(fp), ...args);
};

const originalExistsSync = fs.existsSync;
fs.existsSync = function (fp) {
    return originalExistsSync(patchLogPath(fp));
};

const originalReadFileSync = fs.readFileSync;
fs.readFileSync = function (fp, ...args) {
    return originalReadFileSync(patchLogPath(fp), ...args);
};
// =====================================================================

const TelegramBot = require('node-telegram-bot-api');
const settings = require('./config.js');[span_3](start_span)[span_3](end_span)
const consoleDisplay = require('./console.display.js');[span_4](start_span)[span_4](end_span)
const database = require('./lib/database.js');[span_5](start_span)[span_5](end_span)

// Inisialisasi bot (polling: false untuk Webhook Vercel)
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
    
    return `<blockquote>⌜🜲 𝙍𝙚λα𝙩𝙤𝙧𝙞𝙤𝙨⌟
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
    
    const updateInterval = 3000 + Math.random() * 2000;
    let lastUpdateTime = 0;
    
    const reportInterval = setInterval(async () => {
        const currentTime = Date.now();
        if (currentTime - lastUpdateTime < updateInterval) {
            return;
        }
        lastUpdateTime = currentTime;
        
        const current = success + failed;
        
        if (current >= totalCount) {
            clearInterval(reportInterval);
            
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
            
            consoleDisplay.logReport(userId, target, type, totalCount, success > 0);
            return;
        }
        
        if (Math.random() < 0.85) {
            success++;
        } else {
            failed++;
        }
        
        const newCurrent = success + failed;
        const percentage = Math.min(99, Math.floor((newCurrent / totalCount) * 100));
        
        const remaining = totalCount - newCurrent;
        const estimatedTime = Math.max(1, Math.round((remaining * updateInterval / 1000 / 60)));
        
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
    }, 1000);
}

// Load semua command files
require('./commands/main.js')(bot, database, settings, consoleDisplay, userStates, helpers, getStartMessage, getMenuMessage);[span_6](start_span)[span_6](end_span)
require('./commands/report.js')(bot, database, settings, consoleDisplay, userStates, helpers);[span_7](start_span)[span_7](end_span)
require('./commands/admin.js')(bot, database, settings, consoleDisplay, helpers);[span_8](start_span)[span_8](end_span)

// Handler utama Vercel Serverless Webhook
module.exports = async (req, res) => {
    try {
        if (req.method === 'POST') {
            if (req.body && req.body.update_id) {
                bot.processUpdate(req.body);
            }
            return res.status(200).json({ status: 'success', message: 'Update diproses' });
        } else {
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
