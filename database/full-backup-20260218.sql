PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT DEFAULT 'Operator',
    role TEXT DEFAULT 'operator',
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO users VALUES(2,'admin@logbook','$2a$10$OA4i2HL3vQ5WIwlUOPkFa.1nHISi56At4pE6ZEUx.usTkVOb4ICwO','System Operator','admin',NULL,'2026-02-17 18:45:16');
CREATE TABLE vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    truck_name TEXT NOT NULL,
    truck_number TEXT UNIQUE NOT NULL,
    model TEXT,
    current_mileage INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO vehicles VALUES(1,'DAV1','GN 9945-12','DAV',45000,'active','2026-02-17 21:01:03');
INSERT INTO vehicles VALUES(2,'DAV2','GN 4067-18','DAV',62000,'active','2026-02-17 21:01:03');
INSERT INTO vehicles VALUES(3,'DAV3','GW 1295 Y','DAV',38000,'active','2026-02-17 21:01:03');
INSERT INTO vehicles VALUES(4,'VOLVO','GR 5772-11','VOLVO',89000,'active','2026-02-17 21:01:03');
CREATE TABLE mechanics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    phone TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO mechanics VALUES(1,'RAZAK','0244XXXXXX',1,'2026-02-18 00:25:00');
INSERT INTO mechanics VALUES(3,'DANIEL','0244XXXXXX',1,'2026-02-18 00:13:50');
INSERT INTO mechanics VALUES(4,'JOE','0244XXXXXX',1,'2026-02-18 00:13:50');
INSERT INTO mechanics VALUES(5,'SIAW','0244XXXXXX',1,'2026-02-18 00:13:50');
CREATE TABLE maintenance_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id INTEGER NOT NULL,
    mechanic_id INTEGER NOT NULL,
    service_date DATE NOT NULL,
    nature_of_fault TEXT NOT NULL,
    remarks TEXT,
    part_name TEXT,
    item_cost DECIMAL(10,2) DEFAULT 0.00,
    workmanship_cost DECIMAL(10,2) DEFAULT 0.00,
    total_cost DECIMAL(10,2) GENERATED ALWAYS AS (item_cost + workmanship_cost) STORED,
    mechanic_signature TEXT,
    next_maintenance_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (mechanic_id) REFERENCES mechanics(id)
);
INSERT INTO maintenance_logs VALUES(1,4,1,'2025-08-20','Axle conversion, oil change','Single to double axle conversion (100,000), Oil change (2,000), Labor (2,000), Delivery (1,500)','Double axles kit, Oil filter',102000,3500,NULL,'2025-11-20','2026-02-17 21:01:03');
INSERT INTO maintenance_logs VALUES(2,1,3,'2025-09-23','Multiple repairs','Air brake booster, gearbox top, welded step, new front tires, oil change','Air brake booster, Gearbox cover, Tires (2), Oil filter',10200,3500,NULL,'2025-12-23','2026-02-17 21:01:03');
INSERT INTO maintenance_logs VALUES(3,2,4,'2025-11-21','Routine oil change','Oil and filter change','Oil filter, Engine oil',1200,800,NULL,'2026-02-21','2026-02-17 21:01:03');
INSERT INTO maintenance_logs VALUES(4,3,5,'2025-11-21','Routine oil change','Oil and filter change','Oil filter, Engine oil',1200,800,NULL,'2026-02-21','2026-02-17 21:01:03');
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('vehicles',4);
INSERT INTO sqlite_sequence VALUES('mechanics',5);
INSERT INTO sqlite_sequence VALUES('maintenance_logs',4);
COMMIT;
