const { app, BrowserWindow, Menu, ipcMain } = require('electron');
// Set app name and icon for Windows
app.setName('ENAWASTE MAINTENANCE LOG BOOK');
// For Windows taskbar and title bar
if (process.platform === 'win32') {
    app.setAppUserModelId('com.enawaste.maintenance');
}
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { login } = require('./src/main/auth');

let mainWindow;
let db;

function initDatabase() {
    db = new sqlite3.Database('./database/ena-maintenance.db', (err) => {
        if (err) console.error('Database error:', err);
        else console.log('Connected to database');
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 700,
        icon: path.join(__dirname, 'src/renderer/assets/images/g13.png'),
        title: 'ENAWASTE MAINTENANCE LOG BOOK',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        },
        show: false
    });

    mainWindow.loadFile('src/renderer/pages/login/login.html');
    
    // Prevent page title from changing
    mainWindow.on('page-title-updated', (event) => {
        event.preventDefault();
        mainWindow.setTitle('ENAWASTE MAINTENANCE LOG BOOK');
    });
    
    mainWindow.webContents.openDevTools();

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        initDatabase();
    });
}

app.whenReady().then(() => {
    createWindow();

    // Auth handlers
    ipcMain.handle('auth:login', async (event, username, password) => {
        return await login(username, password);
    });

    ipcMain.handle('auth:logout', () => {
        mainWindow.loadFile('src/renderer/pages/login/login.html');
    });

    ipcMain.handle('auth:getCurrentUser', () => {
        return global.currentUser || null;
    });

    // Vehicle handlers
    ipcMain.handle('db:getVehicles', async () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM vehicles ORDER BY id DESC', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    });

    ipcMain.handle('db:addVehicle', async (event, data) => {
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO vehicles (truck_name, truck_number, model, current_mileage, status) VALUES (?, ?, ?, ?, ?)',
                [data.truck_name, data.truck_number, data.model, data.current_mileage, data.status],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID });
                }
            );
        });
    });

    ipcMain.handle('db:updateVehicle', async (event, id, data) => {
        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE vehicles SET truck_name=?, truck_number=?, model=?, current_mileage=?, status=? WHERE id=?',
                [data.truck_name, data.truck_number, data.model, data.current_mileage, data.status, id],
                (err) => {
                    if (err) reject(err);
                    else resolve({ success: true });
                }
            );
        });
    });

    ipcMain.handle('db:deleteVehicle', async (event, id) => {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM vehicles WHERE id=?', [id], (err) => {
                if (err) reject(err);
                else resolve({ success: true });
            });
        });
    });

    // Maintenance logs handlers
    ipcMain.handle('db:getLogs', async () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM maintenance_logs ORDER BY service_date DESC', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    });

    ipcMain.handle('db:addLog', async (event, data) => {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO maintenance_logs 
                (vehicle_id, mechanic_id, service_date, nature_of_fault, remarks, part_name, item_cost, workmanship_cost, next_maintenance_date) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [data.vehicle_id, data.mechanic_id, data.service_date, data.nature_of_fault, 
                 data.remarks, data.part_name, data.item_cost, data.workmanship_cost, data.next_maintenance_date],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID });
                }
            );
        });
    });

    ipcMain.handle('db:getLogsByVehicle', async (event, vehicle_id) => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM maintenance_logs WHERE vehicle_id = ? ORDER BY service_date DESC', [vehicle_id], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    });

    // Mechanics handlers
    ipcMain.handle('db:getMechanics', async () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM mechanics ORDER BY id DESC', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    });

    ipcMain.handle('db:addMechanic', async (event, data) => {
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO mechanics (full_name, phone, is_active) VALUES (?, ?, ?)',
                [data.full_name, data.phone, data.is_active ? 1 : 0],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID });
                }
            );
        });
    });

    // Menu
    const menuTemplate = [
        {
            label: 'File',
            submenu: [{ role: 'quit' }]
        }
    ];
    
    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});