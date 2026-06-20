const fs = require('fs');
const path = require('path');

const PREMIUM_FILE = './premium_users.json';
const ACCESS_FILE = './access_users.json';

// Load atau create premium users
let premiumUsers = [];
if (fs.existsSync(PREMIUM_FILE)) {
    premiumUsers = JSON.parse(fs.readFileSync(PREMIUM_FILE, 'utf8'));
} else {
    fs.writeFileSync(PREMIUM_FILE, JSON.stringify([], null, 2));
}

// Load atau create access users
let accessUsers = [];
if (fs.existsSync(ACCESS_FILE)) {
    accessUsers = JSON.parse(fs.readFileSync(ACCESS_FILE, 'utf8'));
} else {
    fs.writeFileSync(ACCESS_FILE, JSON.stringify([], null, 2));
}

module.exports = {
    // Premium system
    getPremiumUsers: () => premiumUsers,
    
    addPremium: (userId, username = '') => {
        if (!premiumUsers.some(u => u.id == userId)) {
            premiumUsers.push({
                id: userId,
                username: username,
                addedAt: new Date().toISOString(),
                type: 'premium'
            });
            fs.writeFileSync(PREMIUM_FILE, JSON.stringify(premiumUsers, null, 2));
            return true;
        }
        return false;
    },
    
    removePremium: (userId) => {
        const index = premiumUsers.findIndex(u => u.id == userId);
        if (index > -1) {
            premiumUsers.splice(index, 1);
            fs.writeFileSync(PREMIUM_FILE, JSON.stringify(premiumUsers, null, 2));
            return true;
        }
        return false;
    },
    
    isPremium: (userId) => {
        return premiumUsers.some(u => u.id == userId);
    },
    
    // Access system
    getAccessUsers: () => accessUsers,
    
    addAccess: (userId, nominal, username = '') => {
        // Cari user kalau sudah ada
        const existingIndex = accessUsers.findIndex(u => u.id == userId);
        
        if (existingIndex > -1) {
            // Update existing user
            accessUsers[existingIndex].access += parseInt(nominal);
            accessUsers[existingIndex].updatedAt = new Date().toISOString();
        } else {
            // Add new user
            accessUsers.push({
                id: userId,
                username: username,
                access: parseInt(nominal),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                used: 0
            });
        }
        
        fs.writeFileSync(ACCESS_FILE, JSON.stringify(accessUsers, null, 2));
        return parseInt(nominal);
    },
    
    useAccess: (userId) => {
        const userIndex = accessUsers.findIndex(u => u.id == userId);
        
        if (userIndex > -1 && accessUsers[userIndex].access > 0) {
            accessUsers[userIndex].access -= 1;
            accessUsers[userIndex].used += 1;
            accessUsers[userIndex].updatedAt = new Date().toISOString();
            
            fs.writeFileSync(ACCESS_FILE, JSON.stringify(accessUsers, null, 2));
            
            return {
                success: true,
                remaining: accessUsers[userIndex].access,
                message: `-1 Access | Remaining: ${accessUsers[userIndex].access}`
            };
        }
        
        return {
            success: false,
            remaining: 0,
            message: 'Access habis!'
        };
    },
    
    getUserAccess: (userId) => {
        const user = accessUsers.find(u => u.id == userId);
        return user ? user.access : 0;
    },
    
    removeAccess: (userId) => {
        const index = accessUsers.findIndex(u => u.id == userId);
        if (index > -1) {
            accessUsers.splice(index, 1);
            fs.writeFileSync(ACCESS_FILE, JSON.stringify(accessUsers, null, 2));
            return true;
        }
        return false;
    },
    
    hasAccess: (userId) => {
        const user = accessUsers.find(u => u.id == userId);
        return user && user.access > 0;
    }
};