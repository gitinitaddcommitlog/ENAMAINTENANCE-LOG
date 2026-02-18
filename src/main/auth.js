const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../database/ena-maintenance.db');

async function login(username, password) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath);
        
        db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
            if (err) {
                reject(err);
                return;
            }
            
            if (!user) {
                resolve({ success: false, message: 'User not found' });
                db.close();
                return;
            }
            
            try {
                const valid = await bcrypt.compare(password, user.password);
                if (valid) {
                    resolve({ 
                        success: true, 
                        user: {
                            id: user.id,
                            username: user.username,
                            full_name: user.full_name,
                            role: user.role
                        }
                    });
                } else {
                    resolve({ success: false, message: 'Invalid password' });
                }
            } catch (error) {
                resolve({ success: false, message: 'Authentication error' });
            }
            
            db.close();
        });
    });
}

module.exports = { login };
