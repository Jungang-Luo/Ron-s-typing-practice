import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("typing_master.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mode TEXT,
    wpm REAL,
    accuracy REAL,
    errors INTEGER,
    weak_keys TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/history", (req, res) => {
    const history = db.prepare("SELECT * FROM scores ORDER BY created_at DESC LIMIT 50").all();
    res.json(history);
  });

  app.post("/api/scores", (req, res) => {
    const { mode, wpm, accuracy, errors, weak_keys } = req.body;
    const stmt = db.prepare(`
      INSERT INTO scores (mode, wpm, accuracy, errors, weak_keys)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(mode, wpm, accuracy, errors, JSON.stringify(weak_keys));
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
