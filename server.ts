import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("porteo_wms.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY,
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit TEXT,
    location TEXT,
    palletId TEXT,
    customer TEXT,
    brand TEXT,
    category TEXT,
    velocity TEXT,
    market TEXT
  );

  CREATE TABLE IF NOT EXISTS activity (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    market TEXT NOT NULL
  );
`);

// Seed data if empty
const count = db.prepare("SELECT count(*) as count FROM inventory").get() as { count: number };
if (count.count === 0) {
  const seedInventory = [
    { id: 'inv-usa-001', sku: 'ENG-V8-USA', name: 'V8 Engine Block (US Spec)', quantity: 120, unit: 'units', location: 'A-01-01', palletId: 'PAL-USA-1001', customer: 'AutoCorp Global', brand: 'PowerTech', category: 'Engine', velocity: 'High', market: 'USA' },
    { id: 'inv-usa-002', sku: 'TRN-6SPD-USA', name: '6-Speed Transmission', quantity: 85, unit: 'units', location: 'B-02-05', palletId: 'PAL-USA-2001', customer: 'TruckMasters US', brand: 'GearShift', category: 'Other', velocity: 'Medium', market: 'USA' },
    { id: 'inv-mex-001', sku: 'BRK-CER-MEX', name: 'Ceramic Brake Pads (MX Spec)', quantity: 2500, unit: 'sets', location: 'M-04-12', palletId: 'PAL-MEX-2045', customer: 'SpeedyParts MX', brand: 'StopSafe', category: 'Brakes', velocity: 'High', market: 'MEXICO' },
    { id: 'inv-mex-002', sku: 'OIL-SYN-MEX', name: 'Synthetic Oil 5W-30', quantity: 500, unit: 'liters', location: 'L-01-10', palletId: 'PAL-MEX-3001', customer: 'Lubricantes del Norte', brand: 'UltraOil', category: 'Other', velocity: 'Low', market: 'MEXICO' }
  ];

  const insert = db.prepare(`
    INSERT INTO inventory (id, sku, name, quantity, unit, location, palletId, customer, brand, category, velocity, market)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const item of seedInventory) {
    insert.run(item.id, item.sku, item.name, item.quantity, item.unit, item.location, item.palletId, item.customer, item.brand, item.category, item.velocity, item.market);
  }
}

// Random activity generator
setInterval(() => {
  const types = ['receiving', 'picking', 'shipping', 'audit', 'relocation'];
  const markets = ['USA', 'MEXICO'];
  const type = types[Math.floor(Math.random() * types.length)];
  const market = markets[Math.floor(Math.random() * markets.length)];
  
  const descriptions: Record<string, string[]> = {
    receiving: ['New shipment arrived from GlobalParts', 'Unloading completed for TRK-992', 'Put-away initiated for Pallet P-882'],
    picking: ['Wave 45 released for Amazon orders', 'Picking completed for Order ORD-112', 'Urgent pick request for SKU-V8'],
    shipping: ['BOL generated for Truck TRK-001', 'Loading completed for Dock 4', 'Shipment departed for Chicago DC'],
    audit: ['Cyclic count completed for Zone A', 'Discrepancy resolved for SKU-004', 'Inventory audit initiated by AI'],
    relocation: ['Pallet P-101 moved to Zone A-04', 'Slotting optimization applied to Rack 4', 'High-velocity items relocated to Picking Zone']
  };

  const description = descriptions[type][Math.floor(Math.random() * descriptions[type].length)];
  
  db.prepare("INSERT INTO activity (id, type, description, market) VALUES (?, ?, ?, ?)").run(
    `act-${Date.now()}`,
    type,
    description,
    market
  );

  // Keep only last 50 activities per market
  db.prepare("DELETE FROM activity WHERE id NOT IN (SELECT id FROM activity WHERE market = ? ORDER BY timestamp DESC LIMIT 50) AND market = ?").run(market, market);
}, 15000); // Every 15 seconds

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/inventory", (req, res) => {
    const market = req.query.market as string;
    let query = "SELECT * FROM inventory";
    let params: any[] = [];
    
    if (market) {
      query += " WHERE market = ?";
      params.push(market);
    }
    
    const items = db.prepare(query).all(...params);
    res.json(items);
  });

  app.get("/api/activity", (req, res) => {
    const market = req.query.market as string;
    let query = "SELECT * FROM activity";
    let params: any[] = [];
    
    if (market) {
      query += " WHERE market = ?";
      params.push(market);
    }
    
    query += " ORDER BY timestamp DESC LIMIT 20";
    
    const activities = db.prepare(query).all(...params);
    res.json(activities);
  });

  // AS/400 & LANSA Integration Mock Proxy
  app.get("/api/integration/as400/status", (req, res) => {
    // In a real scenario, this would call the LANSA REST API
    const isConnected = Math.random() > 0.05; // 95% chance of being "connected"
    res.json({
      status: isConnected ? 'online' : 'offline',
      lastSync: new Date().toISOString(),
      system: 'IBM i (AS/400) Power9',
      middleware: 'LANSA Integrator v15.2',
      connector: 'JSM REST Service',
      architecture: '64-bit RISC',
      latency: Math.floor(Math.random() * 50) + 10 + 'ms',
      health: isConnected ? 98 : 0,
      message: isConnected 
        ? 'Optimal performance detected in LANSA Server Modules. No bottlenecks found in JSM transaction logs.'
        : 'Connection lost. LANSA Server Module is unreachable.'
    });
  });

  app.post("/api/system/audit", (req, res) => {
    res.json({
      status: 'success',
      message: 'System audit complete. All protocols compliant.',
      timestamp: new Date().toISOString(),
      details: {
        security: 'A+',
        compliance: '100%',
        performance: 'Optimal'
      }
    });
  });

  app.post("/api/integration/as400/sync", async (req, res) => {
    // Simulate syncing inventory from AS/400 physical files via LANSA
    await new Promise(resolve => setTimeout(resolve, 2000));
    res.json({
      success: true,
      syncedItems: 124,
      message: 'Inventory successfully synchronized from AS/400 physical files via LANSA REST API.'
    });
  });

  app.post("/api/activity", (req, res) => {
    const { type, description, market } = req.body;
    if (!type || !description || !market) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const id = `act-${Date.now()}`;
    db.prepare("INSERT INTO activity (id, type, description, market) VALUES (?, ?, ?, ?)").run(
      id,
      type,
      description,
      market
    );
    
    res.json({ id, type, description, market });
  });

  app.post("/api/inventory", (req, res) => {
    const item = req.body;
    const insert = db.prepare(`
      INSERT INTO inventory (id, sku, name, quantity, unit, location, palletId, customer, brand, category, velocity, market)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    try {
      insert.run(
        item.id || `inv-${Date.now()}`,
        item.sku,
        item.name,
        item.quantity,
        item.unit,
        item.location,
        item.palletId,
        item.customer,
        item.brand,
        item.category,
        item.velocity,
        item.market
      );
      res.status(201).json({ success: true });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.patch("/api/inventory/:id", (req, res) => {
    const { id } = req.params;
    const { quantity, location } = req.body;
    
    try {
      if (quantity !== undefined && location !== undefined) {
        db.prepare("UPDATE inventory SET quantity = ?, location = ? WHERE id = ?").run(quantity, location, id);
      } else if (quantity !== undefined) {
        db.prepare("UPDATE inventory SET quantity = ? WHERE id = ?").run(quantity, id);
      } else if (location !== undefined) {
        db.prepare("UPDATE inventory SET location = ? WHERE id = ?").run(location, id);
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
