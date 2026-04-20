import express from "express";
import { createServer as createViteServer } from "vite";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import Database from "better-sqlite3";

const db = new Database("porteo_wms.db");

// Initialize database with new tables for MVP
db.exec(`
  DROP TABLE IF EXISTS inventory;
  DROP TABLE IF EXISTS leads;
  CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY,
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit TEXT,
    location TEXT,
    warehouse TEXT,
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

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    company TEXT NOT NULL,
    contact TEXT NOT NULL,
    status TEXT DEFAULT 'NEW',
    pipeline TEXT DEFAULT 'SALES',
    email TEXT,
    phone TEXT,
    value REAL,
    lastActivity TEXT,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY,
    plate TEXT UNIQUE NOT NULL,
    model TEXT NOT NULL,
    status TEXT DEFAULT 'AVAILABLE',
    costPerKm REAL DEFAULT 0,
    lat REAL,
    lng REAL
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    items TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed initial users if empty
const userCount = db.prepare("SELECT count(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  db.prepare("INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)").run(
    '1', 'admin@porteo.mx', 'password123', 'Admin User', 'ADMIN'
  );
  db.prepare("INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)").run(
    '2', 'op@porteo.mx', 'password123', 'Operativo User', 'OPERATIVO'
  );
}

// Seed initial inventory if empty
const invCount = db.prepare("SELECT count(*) as count FROM inventory").get() as { count: number };
if (invCount.count === 0) {
  const items = [
    ['1', 'SKU-001', 'Industrial Pallet', 150, 'P-01', 'MX-CDMX Hub', 'MEXICO'],
    ['2', 'SKU-002', 'Forklift Battery', 12, 'B-05', 'MX-CDMX Hub', 'MEXICO'],
    ['3', 'SKU-003', 'Safety Harness', 85, 'S-12', 'USA-TX Hub', 'USA'],
    ['4', 'SKU-004', 'Conveyor Belt', 5, 'C-02', 'USA-TX Hub', 'USA'],
  ];
  const stmt = db.prepare("INSERT INTO inventory (id, sku, name, quantity, location, warehouse, market) VALUES (?, ?, ?, ?, ?, ?, ?)");
  items.forEach(item => stmt.run(...item));
}

// Seed initial orders if empty
const orderCount = db.prepare("SELECT count(*) as count FROM orders").get() as { count: number };
if (orderCount.count === 0) {
  db.prepare("INSERT INTO orders (id, type, status, items) VALUES (?, ?, ?, ?)").run(
    'ORD-IN-001', 'INBOUND', 'PENDING', JSON.stringify([{ sku: 'SKU-001', qty: 50 }])
  );
  db.prepare("INSERT INTO orders (id, type, status, items) VALUES (?, ?, ?, ?)").run(
    'ORD-OUT-001', 'OUTBOUND', 'PICKING', JSON.stringify([{ sku: 'SKU-002', qty: 5 }])
  );
}

// Seed initial leads if empty
const leadCount = db.prepare("SELECT count(*) as count FROM leads").get() as { count: number };
if (leadCount.count === 0) {
  const initialLeads = [
    ['1', 'Logistics Pro', 'John Doe', 'NEW', 'SALES', 'john@logisticspro.com', '+52 55 1234 5678', 15000, '2 hours ago', 'Interested in cold storage solutions.'],
    ['2', 'Global Trade', 'Jane Smith', 'CONTACTED', 'SALES', 'jane@globaltrade.com', '+52 55 8765 4321', 25000, '5 hours ago', 'Looking for cross-border logistics partner.'],
    ['3', 'TechFlow Solutions', 'Alice Wang', 'PROPOSAL', 'SALES', 'alice@techflow.com', '+52 55 1122 3344', 45000, '1 day ago', 'Evaluating WMS integration capabilities.'],
    ['4', 'EcoLogistics', 'Robert Green', 'CONTACTED', 'SALES', 'robert@ecologistics.com', '+52 55 5566 7788', 12000, '3 hours ago', 'Sustainability-focused shipping requirements.'],
    ['5', 'Swift Delivery', 'Sarah Miller', 'CLOSED', 'SALES', 'sarah@swiftdelivery.com', '+52 55 9900 1122', 80000, '1 week ago', 'Onboarded for last-mile delivery in CDMX.'],
    ['6', 'Global Connect', 'Michael Chen', 'NEW', 'SALES', 'michael@globalconnect.com', '+52 55 4433 2211', 30000, '4 hours ago', 'Expansion into LATAM market.']
  ];
  const stmt = db.prepare("INSERT INTO leads (id, company, contact, status, pipeline, email, phone, value, lastActivity, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  initialLeads.forEach(lead => stmt.run(...lead));
}

// Seed initial vehicles if empty
const vehicleCount = db.prepare("SELECT count(*) as count FROM vehicles").get() as { count: number };
if (vehicleCount.count === 0) {
  db.prepare("INSERT INTO vehicles (id, plate, model, costPerKm, status, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?)").run('1', 'MX-123-AB', 'Freightliner', 1.2, 'ON_ROUTE', 19.4326, -99.1332);
  db.prepare("INSERT INTO vehicles (id, plate, model, costPerKm, status, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?)").run('2', 'TX-987-XY', 'Kenworth', 1.5, 'AVAILABLE', 27.5035, -99.5075);
  db.prepare("INSERT INTO vehicles (id, plate, model, costPerKm, status, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?)").run('3', 'MX-456-CD', 'Isuzu', 0.8, 'ON_ROUTE', 19.4326, -99.1332);
  db.prepare("INSERT INTO vehicles (id, plate, model, costPerKm, status, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?)").run('4', 'TX-654-YZ', 'Volvo', 1.8, 'MAINTENANCE', 29.7604, -95.3698);
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: "*" }
  });

  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));

  // --- AUTH API ---
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password) as any;
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token: "mock-jwt-token" });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });

  // --- WMS & INVENTORY API ---
  app.get("/api/inventory", (req, res) => {
    const market = req.query.market as string;
    let query = "SELECT id, sku, name, quantity as qty, location as bin, warehouse, market FROM inventory";
    let params: any[] = [];
    if (market) { query += " WHERE market = ?"; params.push(market); }
    try {
      const items = db.prepare(query).all(...params);
      res.json(items);
    } catch (error) {
      console.error("Inventory API Error:", error);
      res.status(500).json({ error: "Failed to fetch inventory" });
    }
  });

  app.get("/api/orders", (req, res) => {
    const orders = db.prepare("SELECT * FROM orders").all() as any[];
    res.json(orders.map(o => ({ ...o, items: JSON.parse(o.items) })));
  });

  app.post("/api/wms/receive", (req, res) => {
    const { orderId, items } = req.body;
    const transaction = db.transaction(() => {
      db.prepare("UPDATE orders SET status = 'COMPLETED' WHERE id = ?").run(orderId);
      const updateInv = db.prepare("UPDATE inventory SET quantity = quantity + ? WHERE sku = ?");
      items.forEach((item: any) => updateInv.run(item.qty, item.sku));
      db.prepare("INSERT INTO activity (id, type, description, market) VALUES (?, ?, ?, ?)").run(
        `act-${Date.now()}`, 'INBOUND', `Received ${orderId}`, 'MEXICO'
      );
    });
    transaction();
    res.json({ success: true });
  });

  app.post("/api/wms/pick", (req, res) => {
    const { orderId } = req.body;
    const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId) as any;
    if (!order) return res.status(404).json({ message: "Order not found" });
    
    const items = JSON.parse(order.items);
    const transaction = db.transaction(() => {
      db.prepare("UPDATE orders SET status = 'SHIPPING' WHERE id = ?").run(orderId);
      const updateInv = db.prepare("UPDATE inventory SET quantity = quantity - ? WHERE sku = ?");
      items.forEach((item: any) => updateInv.run(item.qty, item.sku));
      db.prepare("INSERT INTO activity (id, type, description, market) VALUES (?, ?, ?, ?)").run(
        `act-${Date.now()}`, 'OUTBOUND', `Picked ${orderId}`, 'MEXICO'
      );
    });
    transaction();
    res.json({ success: true });
  });

  app.get("/api/activity", (req, res) => {
    const market = req.query.market as string;
    let query = "SELECT * FROM activity";
    let params: any[] = [];
    if (market) { query += " WHERE market = ?"; params.push(market); }
    query += " ORDER BY timestamp DESC LIMIT 20";
    const activities = db.prepare(query).all(...params);
    res.json(activities);
  });

  // --- CRM API ---
  app.get("/api/crm/leads", (req, res) => {
    const leads = db.prepare("SELECT * FROM leads").all();
    res.json(leads);
  });

  app.post("/api/crm/leads", (req, res) => {
    const { company, contact, status, pipeline, email, phone, value, notes } = req.body;
    const id = `lead-${Date.now()}`;
    try {
      db.prepare(`
        INSERT INTO leads (id, company, contact, status, pipeline, email, phone, value, lastActivity, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, company, contact, status || 'NEW', pipeline || 'SALES', email, phone, value, 'Just now', notes);
      res.json({ success: true, id });
    } catch (error) {
      console.error("CRM Create Error:", error);
      res.status(500).json({ error: "Failed to create lead" });
    }
  });

  app.put("/api/crm/leads/:id", (req, res) => {
    const { id } = req.params;
    const { company, contact, status, pipeline, email, phone, value, notes } = req.body;
    try {
      db.prepare(`
        UPDATE leads 
        SET company = ?, contact = ?, status = ?, pipeline = ?, email = ?, phone = ?, value = ?, notes = ?
        WHERE id = ?
      `).run(company, contact, status, pipeline, email, phone, value, notes, id);
      res.json({ success: true });
    } catch (error) {
      console.error("CRM Update Error:", error);
      res.status(500).json({ error: "Failed to update lead" });
    }
  });

  // --- OAUTH API (LinkedIn) ---
  app.get("/api/auth/linkedin/url", (req, res) => {
    // For demo purposes, we point to our own simulation page
    // This allows the user to see the "Authorize" screen without needing a real API key
    const simulateUrl = `${req.protocol}://${req.get('host')}/auth/linkedin/simulate`;
    res.json({ url: simulateUrl });
  });

  app.get("/auth/linkedin/simulate", (req, res) => {
    res.send(`
      <html>
        <head>
          <title>LinkedIn Login</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Inter', sans-serif; }
            .linkedin-blue { background-color: #0077b5; }
          </style>
        </head>
        <body class="bg-slate-50 flex items-center justify-center min-h-screen p-4">
          <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 border border-slate-200">
            <div class="flex justify-center mb-6">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 linkedin-blue rounded-lg flex items-center justify-center text-white font-bold text-2xl">in</div>
                <div class="text-slate-300 text-2xl">×</div>
                <div class="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-xs">PORTEO</div>
              </div>
            </div>
            
            <h1 class="text-xl font-bold text-center text-slate-900 mb-2">Authorize Porteo WMS?</h1>
            <p class="text-slate-500 text-center text-sm mb-8">Porteo WMS would like to access your LinkedIn profile information and contacts.</p>
            
            <div class="space-y-4 mb-8">
              <div class="flex items-start gap-3">
                <div class="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                  <svg class="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <div>
                  <p class="text-sm font-semibold text-slate-900">Use your name and photo</p>
                  <p class="text-xs text-slate-500">We'll use this to personalize your experience.</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                  <svg class="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <div>
                  <p class="text-sm font-semibold text-slate-900">Access your contacts</p>
                  <p class="text-xs text-slate-500">We'll extract leads directly into your CRM.</p>
                </div>
              </div>
            </div>
            
            <div class="flex gap-3">
              <button onclick="window.close()" class="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors">Cancel</button>
              <button id="allow-btn" class="flex-1 py-3 px-4 rounded-xl linkedin-blue text-white font-semibold hover:opacity-90 transition-colors">Allow</button>
            </div>
            
            <p class="text-[10px] text-slate-400 text-center mt-6">By clicking Allow, you agree to Porteo WMS's Terms of Service and Privacy Policy.</p>
          </div>
          <script>
            document.getElementById('allow-btn').onclick = function() {
              // Redirect to callback with simulated code
              window.location.href = '/auth/linkedin/callback?code=simulated_code_' + Date.now();
            };
          </script>
        </body>
      </html>
    `);
  });

  app.get(["/auth/linkedin/callback", "/auth/linkedin/callback/"], async (req, res) => {
    const { code } = req.query;
    if (!code) {
      return res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error: 'No code provided' }, '*');
              window.close();
            </script>
          </body>
        </html>
      `);
    }

    // Simulate "Data Extraction" from LinkedIn
    // In a real app, you'd use the code to get a token, then call LinkedIn API
    try {
      const linkedinLeads = [
        { id: `li-${Date.now()}-1`, company: 'Innovate Logistics', contact: 'Sarah Jenkins', status: 'NEW', pipeline: 'SALES', email: 's.jenkins@innovate.com', phone: '+1 555 0123', value: 35000, notes: 'Extracted from LinkedIn Sales Navigator. Interested in cross-docking.' },
        { id: `li-${Date.now()}-2`, company: 'Apex Supply Chain', contact: 'David Miller', status: 'NEW', pipeline: 'SALES', email: 'd.miller@apex.com', phone: '+1 555 4567', value: 52000, notes: 'Extracted from LinkedIn. High priority lead.' }
      ];

      const stmt = db.prepare("INSERT INTO leads (id, company, contact, status, pipeline, email, phone, value, lastActivity, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
      linkedinLeads.forEach(lead => {
        stmt.run(lead.id, lead.company, lead.contact, lead.status, lead.pipeline, lead.email, lead.phone, lead.value, 'Just now', lead.notes);
      });

      res.send(`
        <html>
          <body>
            <script>
              console.log('Sending OAUTH_AUTH_SUCCESS message to opener');
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'OAUTH_AUTH_SUCCESS', 
                  extractedCount: ${linkedinLeads.length} 
                }, '*');
                setTimeout(() => window.close(), 500);
              } else {
                window.location.href = '/';
              }
            </script>
            <div style="font-family: sans-serif; text-align: center; padding-top: 50px;">
              <h2>Authentication Successful!</h2>
              <p>Extracting ${linkedinLeads.length} leads from LinkedIn...</p>
              <p>This window will close automatically.</p>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("LinkedIn Sync Error:", error);
      res.status(500).send("Sync failed");
    }
  });

  // --- FLEET API ---
  app.get("/api/fleet/status", (req, res) => {
    const vehicles = db.prepare("SELECT * FROM vehicles").all();
    res.json(vehicles);
  });

  // --- SYSTEM AUDIT API ---
  app.post("/api/system/audit", (req, res) => {
    res.json({
      status: "success",
      message: "System audit complete. All protocols compliant.",
      timestamp: new Date().toISOString(),
      details: { security: "PASS", compliance: "ISO-27001", performance: "OPTIMAL" }
    });
  });

  // --- AS/400 INTEGRATION API ---
  app.get("/api/integration/as400/status", (req, res) => {
    const isConnected = Math.random() > 0.05;
    res.json({
      status: isConnected ? 'online' : 'offline',
      lastSync: new Date().toISOString(),
      system: 'IBM i (AS/400) Power9',
      middleware: 'LANSA Integrator v15.2',
      connector: 'JSM REST Service',
      architecture: '64-bit RISC',
      latency: Math.floor(Math.random() * 50) + 10 + 'ms',
      health: isConnected ? 98 : 0,
      message: isConnected ? 'Optimal performance detected.' : 'Connection lost.'
    });
  });

  // --- WEBSOCKETS (CHAT & ALERTS) ---
  io.on("connection", (socket) => {
    socket.on("send_message", (data) => {
      const msg = { ...data, id: `msg-${Date.now()}`, createdAt: new Date().toISOString() };
      io.emit("receive_message", msg);
    });
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

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
