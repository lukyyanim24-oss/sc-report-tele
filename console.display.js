const moment = require('moment');
const fs = require('fs');

// ANSI Color Codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

class ConsoleDisplay {
    constructor() {
        this.startTime = new Date();
        this.commandsUsed = 0;
        this.reportsMade = 0;
        this.ensureLogFile();
    }

    ensureLogFile() {
        if (!fs.existsSync('./bot_console.log')) {
            fs.writeFileSync('./bot_console.log', '=== Telegram Bot Console Log ===\n');
        }
    }

    showBanner() {
        console.clear();
        console.log(`\n${colors.cyan}⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢸⣿⣿⣷⣜⢿⣧⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡄⠻⣿⣿⣿⣿⣦⠄⠄${colors.reset}`);
        console.log(`${colors.cyan}⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⣿⣿⣿⣿⣮⡻⣷⡙⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣿⣿⣆⠙⣿⣿⣿⣿⣧⠄${colors.reset}`);
        console.log(`${colors.cyan}⣿⣿⣿⣿⣿⣿⣿⣿⣿⠏⣿⣿⣿⣿⣿⣿⣧⢸⣿⣿⣿⡘⢿⣮⡛⣷⡙⢿⣿⡏⢻⣿⣿⣿⣧⠙⢿⣿⣿⣷⠘⢿⣿⣆⢿⣿⣿⣿⣿⣆${colors.reset}`);
        console.log(`${colors.cyan}⣿⣿⣿⣿⣿⣿⣿⣿⡿⠐⣿⣿⣿⣿⣿⣿⠃⠄⢣⠻⣿⣧⠄⠙⢷⡀⠙⢦⡙⢿⡄⠹⣿⣿⣿⣇⠄⠻⣿⣿⣇⠈⢻⣿⡎⢿⣿⣿⣿⣿${colors.reset}`);
        console.log(`${colors.cyan}⣿⣿⣿⣿⣿⣿⣿⣿⡇⠄⣿⣿⣿⣿⣿⠋⠄⣼⣆⢧⠹⣿⣆⠄⠈⠛⣄⠄⢬⣒⠙⠂⠈⢿⣿⣿⡄⠄⠈⢿⣿⡀⠄⠙⣿⠘⣿⣿⣿⣿${colors.reset}`);
        console.log(`${colors.cyan}⣿⣿⣿⣿⣿⣿⣿⣿⡇⠄⣿⣿⣿⣿⠏⢀⣼⣿⣿⣎⠁⠐⢿⠆⠄⠄⠈⠢⠄⠙⢷⣤⡀⠄⠙⠿⠷⠄⠄⠄⠹⠇⠄⠄⠘⠄⢸⣿⣿⣿${colors.reset}`);
        console.log(`${colors.cyan}⣿⣿⣿⣿⣿⣿⣿⣿⠄⠄⢻⣿⣿⠏⢀⣾⣿⣿⣿⣿⡦⠄⠄⡘⢆⠄⠄⠄⠄⠄⠄⠙⠻⡄⠄⠄⠉⡆⠄⠄⠄⠑⠄⢠⡀⠄⠄⣿⡿⣿${colors.reset}`);
        console.log(`${colors.cyan}⣿⣿⣿⣿⣿⣿⣿⣿⠄⠄⢸⣿⠋⣰⣿⣿⡿⢟⣫⣵⣾⣷⡄⢻⣄⠁⠄⠄⠠⣄⠄⠄⠄⠈⠂⠄⠄⠈⠄⠱⠄⠄⠄⠄⢷⢀⣠⣽⡇⣿${colors.reset}`);
        console.log(`${colors.cyan}⣿⣿⣿⣿⣿⣿⣿⣿⡄⠄⠄⢁⣚⣫⣭⣶⣾⣿⣿⣿⣿⣿⣿⣦⣽⣷⣄⠄⠄⠘⢷⣄⠄⠄⠄⠄⣠⠄⠄⠄⠄⠈⠉⠈⠻⢸⣿⣿⡇⣿${colors.reset}`);
        console.log(`${colors.cyan}⣿⣿⣿⣿⣿⣿⣿⣿⡇⠄⢠⣾⣿⣿⣿⣿⣿⡿⠿⠿⠟⠛⠿⣿⣿⣿⣿⣷⣤⣤⣤⣿⣷⣶⡶⠋⢀⡠⡐⢒⢶⣝⢿⡟⣿⢸⣿⣿⡃⣿${colors.reset}`);
        console.log(`${colors.cyan}⣿⣿⣿⢹⣿⢿⣿⣿⣷⢠⣿⣿⣿⣿⣯⠷⠐⠋⠋⠛⠉⠁⠛⠛⢹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡀⡏⠊⡼⢷⢱⣿⡾⡷⣿⢸⡏⣿⢰⣿${colors.reset}`);
        console.log(`${colors.cyan}⣿⣿⣿⢸⣿⡘⡿⣿⣿⠎⣿⠟⠋⢁⡀⡠⣒⡤⠬⢭⣖⢝⢷⣶⣬⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⢃⢔⠭⢵⣣⣿⠓⢵⣿⢸⢃⡇⢸⣿${colors.reset}`);
        console.log(`${colors.cyan}⣿⣿⣿⡄⣿⡇⠄⡘⣿⣷⡸⣴⣾⣿⢸⢱⢫⡞⣭⢻⡼⡏⣧⢿⣿⣿⣿⣿⣿⣿⣿⡿⣿⢿⡿⣿⣧⣕⣋⣉⣫⣵⣾⣿⡏⢸⠸⠁⢸⡏${colors.reset}`);
        console.log(`${colors.cyan}⣿⣿⣿⡇⠸⣷⠄⠈⠘⢿⣧⠹⣹⣿⣸⡼⣜⢷⣕⣪⡼⣣⡟⣾⣿⣿⢯⡻⣟⢯⡻⣿⣮⣷⣝⢮⣻⣿⢿⣿⣝⣿⣿⢿⣿⢀⠁⠄⢸⠄${colors.reset}`);
        console.log(`${colors.cyan}⣿⣿⡿⣇⠄⠹⡆⠄⠄⠈⠻⣧⠩⣊⣷⠝⠮⠕⠚⠓⠚⣩⣤⣝⢿⣿⣯⡿⣮⣷⣿⣾⣿⢻⣿⣿⣿⣾⣷⣽⣿⣿⣿⣿⡟⠄⠄⠄⠄⢸${colors.reset}`);
        console.log(`${colors.cyan}⠹⣿⡇⢹⠄⠄⠐⠄⠄⠄⠄⠈⠣⠉⡻⣟⢿⣝⢿⣝⠿⡿⣷⣝⣷⣝⣿⣿⣿⣿⣿⣿⣿⣿⣧⢹⣿⣿⣿⣿⣿⣿⣿⣿⡟⣠⠄⠄⠄⠄⠈${colors.reset}`);
        console.log(`${colors.cyan}⠄⠘⠇⠄⠄⠄⠄⠄⠄⠄⠄⠄⠠⣌⠈⢳⢝⣮⣻⣿⣿⣮⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⠄⠄⠄⠄⢀${colors.reset}`);
        console.log(`${colors.cyan}⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢻⣷⣤⣝⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠇⠄⠄⠄⠄⣼${colors.reset}`);
        console.log(`${colors.cyan}⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⢿⣿⣿⣿⣿⣿⣿⠏⠄⠄⠄⠄⣰⢩${colors.reset}`);
        console.log(`${colors.cyan}⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢻⣿⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⠛⠋⠉⠉⠉⠄⠄⠄⠄⣸⣿⣿⣿⣿⡿⠃⠄⠄⠄⠄⣰⣿⣧${colors.reset}`);
        console.log(`${colors.cyan}⣷⡀⠄⠈⢦⡀⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⢻⣯⣿⣿⣿⣿⣿⣿⣿⣿⣷⣤⣤⣤⣶⣶⣶⣶⣾⣿⣿⣿⣿⡿⠋⠄⠄⠄⠄⠄⣰⣿⣿⣿${colors.reset}`);
        console.log(`${colors.cyan}⣿⣿⣦⡱⣌⢻⣦⡀⠄⠄⠄⠄⠄⠄⠄⠄⠄⠙⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠋⠄⠄⠄⠄⠄⠄⢰⣿⣿⣿⣿${colors.reset}`);
        console.log(`${colors.cyan}⣿⣿⣿⣿⣿⣷⣿⣿⣦⣐⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠉⠛⠻⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣫⡔⢀⣴⠄⠄⠄⡼⣠⣿⣿⣿⣿⣿${colors.reset}`);
        console.log(`${colors.cyan}⣿⣿⣿⣿⣿⣿⣿⣿⣿⠏⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠉⠉⠉⠙⠛⢛⣛⣛⣭⣾⣿⣴⣿⢇⣤⣦⣾⣿⣿⣿⣿⣿⣿⣿${colors.reset}`);
        console.log(`${colors.cyan}⣿⣿⣿⣿⣿⣿⣿⠟⠁⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠈⠛⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿${colors.reset}`);
        console.log(``);
        console.log(`${colors.magenta}ケ  Cpu Monitoring System ${colors.reset}`);
        console.log(`${colors.magenta}ケ  Thanks for using ─ Love You Pyreyouuu💖${colors.reset}`);
        console.log(`${colors.white}ケ 𝗩𝗲𝗿𝘀𝗶𝗼𝗻 : 𝟭${colors.reset}`);
        console.log(``);
        console.log(`${colors.blue}✆Telegram: ${colors.green}@veyora888${colors.reset}`);
        console.log(`${colors.yellow}ケ  Powered by GyzenLyoraa${colors.reset}`);
        console.log(`${colors.cyan}⚡ Dynamic Settings System Active${colors.reset}\n`);
    }

    showStatus(botUsername, premiumCount, accessCount) {
        const uptime = this.getUptime();
        console.log(`${colors.green}══════════════════════════════════════════${colors.reset}`);
        console.log(`${colors.yellow}🤖 BOT INFORMATION${colors.reset}`);
        console.log(`${colors.green}══════════════════════════════════════════${colors.reset}`);
        console.log(`${colors.cyan}📍 Bot Username: @${botUsername}${colors.reset}`);
        console.log(`${colors.cyan}⏰ Start Time: ${moment(this.startTime).format('YYYY-MM-DD HH:mm:ss')}${colors.reset}`);
        console.log(`${colors.cyan}⏱️  Uptime: ${uptime}${colors.reset}`);
        console.log(`${colors.cyan}👑 Premium Users: ${premiumCount}${colors.reset}`);
        console.log(`${colors.cyan}🎫 Access Users: ${accessCount}${colors.reset}`);
        console.log(`${colors.cyan}📊 Commands Used: ${this.commandsUsed}${colors.reset}`);
        console.log(`${colors.cyan}📈 Reports Made: ${this.reportsMade}${colors.reset}`);
        console.log(`${colors.green}══════════════════════════════════════════${colors.reset}`);
        console.log(`${colors.yellow}📋 AVAILABLE COMMANDS${colors.reset}`);
        console.log(`${colors.green}══════════════════════════════════════════${colors.reset}`);
        console.log(`${colors.white}/start - Main menu with photo${colors.reset}`);
        console.log(`${colors.white}/menu - Show all available commands${colors.reset}`);
        console.log(`${colors.white}/reportacc - Report Telegram account${colors.reset}`);
        console.log(`${colors.white}/reportch - Report Telegram channel${colors.reset}`);
        console.log(`${colors.white}/myprem - Check premium status${colors.reset}`);
        console.log(`${colors.white}/access [id] [nominal] - Add access (owner only)${colors.reset}`);
        console.log(`${colors.white}/addprem [id] - Add premium user (owner only)${colors.reset}`);
        console.log(`${colors.white}/removeprem [id] - Remove premium (owner only)${colors.reset}`);
        console.log(`${colors.white}/listprem - List all premium users (owner only)${colors.reset}`);
        console.log(`${colors.white}/listaccess - List all access users (owner only)${colors.reset}`);
        console.log(`${colors.white}/help - Show help menu${colors.reset}`);
        console.log(`${colors.green}══════════════════════════════════════════${colors.reset}`);
        console.log(`${colors.yellow}🚀 Bot is running and ready to receive commands...${colors.reset}\n`);
    }

    logCommand(userId, username, command, args = '') {
        this.commandsUsed++;
        const timestamp = moment().format('HH:mm:ss');
        const logLine = `${colors.cyan}[${timestamp}] ${colors.green}CMD: ${colors.white}/${command} ${colors.yellow}${args} ${colors.magenta}| User: @${username} (${userId})${colors.reset}`;
        
        console.log(logLine);
        
        // Save to log file
        const fileLog = `[${moment().format('YYYY-MM-DD HH:mm:ss')}] CMD: /${command} ${args} | User: @${username} (${userId})`;
        fs.appendFileSync('./bot_console.log', fileLog + '\n');
    }

    logReport(userId, target, type, count, success) {
        this.reportsMade++;
        const timestamp = moment().format('HH:mm:ss');
        const logLine = `${colors.cyan}[${timestamp}] ${colors.yellow}REPORT: ${colors.white}${type} ${colors.cyan}| Target: ${target} ${colors.green}| Count: ${count} ${success ? '✅' : '❌'}${colors.reset}`;
        
        console.log(logLine);
        
        const fileLog = `[${moment().format('YYYY-MM-DD HH:mm:ss')}] REPORT: ${type} | Target: ${target} | Count: ${count} | User: ${userId}`;
        fs.appendFileSync('./bot_console.log', fileLog + '\n');
    }

    logAdminAction(userId, action, targetId) {
        const timestamp = moment().format('HH:mm:ss');
        const logLine = `${colors.cyan}[${timestamp}] ${colors.magenta}ADMIN: ${colors.white}${action} ${colors.cyan}| Target: ${targetId} ${colors.green}| By: ${userId}${colors.reset}`;
        
        console.log(logLine);
        
        const fileLog = `[${moment().format('YYYY-MM-DD HH:mm:ss')}] ADMIN: ${action} | Target: ${targetId} | By: ${userId}`;
        fs.appendFileSync('./bot_console.log', fileLog + '\n');
    }

    logAccess(userId, access, action) {
        const timestamp = moment().format('HH:mm:ss');
        const logLine = `${colors.cyan}[${timestamp}] ${colors.blue}ACCESS: ${colors.white}${action} ${colors.cyan}| User: ${userId} ${colors.green}| Access: ${access}${colors.reset}`;
        
        console.log(logLine);
        
        const fileLog = `[${moment().format('YYYY-MM-DD HH:mm:ss')}] ACCESS: ${action} | User: ${userId} | Access: ${access}`;
        fs.appendFileSync('./bot_console.log', fileLog + '\n');
    }

    getUptime() {
        const now = new Date();
        const diff = now - this.startTime;
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    showError(error) {
        const timestamp = moment().format('HH:mm:ss');
        console.log(`${colors.red}[${timestamp}] ⚠️  ERROR: ${error.message}${colors.reset}`);
        
        const fileLog = `[${moment().format('YYYY-MM-DD HH:mm:ss')}] ERROR: ${error.message}`;
        fs.appendFileSync('./bot_console.log', fileLog + '\n');
    }

    showShutdown() {
        console.log(`\n${colors.yellow}⏹️  BOT DIMATIKAN${colors.reset}`);
        console.log(`${colors.blue}✆Telegram: ${colors.green}@veyora888${colors.reset}`);
        console.log(`${colors.yellow}ケ  Powered by GyzenLyoraa${colors.reset}`);
        console.log(`${colors.green}👋 Goodbye!${colors.reset}\n`);
    }
}

module.exports = new ConsoleDisplay();