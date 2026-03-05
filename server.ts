import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const db = new Database("database.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    video_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS leadership (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    designation TEXT NOT NULL,
    bio TEXT,
    image_url TEXT,
    message TEXT
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT,
    location TEXT,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT,
    cover_url TEXT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS mission_vision (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    icon_type TEXT DEFAULT 'number',
    order_index INTEGER DEFAULT 0
  );
`);

// Seed initial data if empty
const settingsCount = db.prepare("SELECT COUNT(*) as count FROM site_settings").get() as { count: number };
if (settingsCount.count === 0) {
  const insertSetting = db.prepare("INSERT INTO site_settings (key, value) VALUES (?, ?)");
  insertSetting.run("site_name", "বাংলাদেশ জামায়াতে ইসলামী, কোতোয়ালি থানা, রংপুর");
  insertSetting.run("hero_title", "বাংলাদেশ জামায়াতে ইসলামী, কোতোয়ালি থানা");
  insertSetting.run("hero_subtitle", "রংপুর মহানগরীর হৃদপিণ্ড ও আন্দোলনের অবিচল কাফেলা");
  insertSetting.run("establishment_year", "১৯৪১");
  insertSetting.run("about_text", "একটি ইনসাফপূর্ণ সমাজ বিনির্মাণে আমরা বদ্ধপরিকর। আমাদের লক্ষ্য ইসলামের সুমহান আদর্শের ভিত্তিতে একটি নৈতিক ও সমৃদ্ধ বাংলাদেশ গঠন।");
  insertSetting.run("mission_text", "আল্লাহর সন্তুষ্টি অর্জনের লক্ষ্যে মানুষের সার্বিক কল্যাণে একটি ইনসাফপূর্ণ সমাজ প্রতিষ্ঠা করা।");
  insertSetting.run("contact_address", "কোতোয়ালি থানা অফিস, রংপুর মহানগরী");
  insertSetting.run("contact_email", "info@ji-rangpur.org");
  insertSetting.run("contact_phone", "+৮৮০ ১XXX XXXXXX");
  insertSetting.run("theme_color", "#006747");
  insertSetting.run("accent_color", "#D4AF37");
  insertSetting.run("donation_bank_name", "Islami Bank Bangladesh PLC");
  insertSetting.run("donation_acc_name", "Jamaat-e-Islami Kotwali Thana");
  insertSetting.run("donation_acc_no", "2050XXXXXXXXXXXXX");
  insertSetting.run("donation_bkash", "017XXXXXXXX");
  insertSetting.run("donation_nagad", "017XXXXXXXX");
  insertSetting.run("pillar1_title", "আদর্শিক পুনর্গঠন");
  insertSetting.run("pillar1_text", "ব্যক্তি ও সমাজ জীবনে ইসলামের সুমহান আদর্শ প্রতিষ্ঠার মাধ্যমে একটি নৈতিক সমাজ গঠন।");
  insertSetting.run("pillar2_title", "সামাজিক ন্যায়বিচার");
  insertSetting.run("pillar2_text", "সকল প্রকার শোষণ ও অবিচারের অবসান ঘটিয়ে ইনসাফপূর্ণ রাষ্ট্র ব্যবস্থা কায়েম।");
  insertSetting.run("pillar3_title", "গণতান্ত্রিক অধিকার");
  insertSetting.run("pillar3_text", "জনগণের মৌলিক অধিকার ও ভোটাধিকার নিশ্চিত করার মাধ্যমে একটি জবাবদিহিমূলক রাষ্ট্র গঠন।");
  insertSetting.run("logo_url", "");
  insertSetting.run("hero_image_url", "https://picsum.photos/seed/hero/1920/1080");
  insertSetting.run("vision_image_url", "https://picsum.photos/seed/vision/800/1000");
  insertSetting.run("support_bg_color", "#09090b");
  insertSetting.run("footer_bg_color", "#09090b");
  insertSetting.run("hijri_offset", "1");
  insertSetting.run("rukon_password", "KR@2026");
  insertSetting.run("rukon_dashboard_links", JSON.stringify([
    { title: "রুকন মাসিক রিপোর্ট", url: "https://docs.google.com/spreadsheets/d/..." },
    { title: "থানা দায়িত্বশীল রিপোর্ট", url: "https://docs.google.com/spreadsheets/d/..." }
  ]));
  insertSetting.run("join_links", JSON.stringify({
    worker: "https://docs.google.com/forms/d/...",
    supporter: "https://docs.google.com/forms/d/..."
  }));
}

const booksCount = db.prepare("SELECT COUNT(*) as count FROM books").get() as { count: number };
if (booksCount.count === 0) {
  const insertBook = db.prepare("INSERT INTO books (title, author, cover_url, content) VALUES (?, ?, ?, ?)");
  insertBook.run(
    "ইসলামী সমাজ বিনির্মাণ",
    "সাইয়েদ আবুল আ'লা মওদুদী",
    "https://picsum.photos/seed/book1/400/600",
    "ইসলামী সমাজ বিনির্মাণের রূপরেখা এখানে বিস্তারিত আলোচনা করা হয়েছে..."
  );
  insertBook.run(
    "আন্দোলনের পাথেয়",
    "অধ্যাপক গোলাম আযম",
    "https://picsum.photos/seed/book2/400/600",
    "ইসলামী আন্দোলনের কর্মীদের জন্য প্রয়োজনীয় দিকনির্দেশনা..."
  );
}

const newsCount = db.prepare("SELECT COUNT(*) as count FROM news").get() as { count: number };
if (newsCount.count === 0) {
  const insertNews = db.prepare("INSERT INTO news (title, content, category, image_url) VALUES (?, ?, ?, ?)");
  const categories = ["Organizational", "National", "International", "Social Service"];
  for (let i = 1; i <= 20; i++) {
    insertNews.run(
      `Sample News Title ${i}: Important Update from Kotwali Thana`,
      `This is the detailed content for sample news item ${i}. It covers various aspects of our organizational activities in Rangpur City. We are committed to serving the people and establishing justice.`,
      categories[i % categories.length],
      `https://picsum.photos/seed/news${i}/800/600`
    );
  }
}

const leadershipCount = db.prepare("SELECT COUNT(*) as count FROM leadership").get() as { count: number };
if (leadershipCount.count === 0) {
  const insertLeadership = db.prepare("INSERT INTO leadership (name, designation, bio, image_url, message) VALUES (?, ?, ?, ?, ?)");
  insertLeadership.run(
    "Maulana Golam Kibria",
    "Thana Ameer",
    "Maulana Golam Kibria is a dedicated leader serving the community...",
    "https://picsum.photos/seed/ameer/400/400",
    "Our goal is to build a society based on Islamic values."
  );
  insertLeadership.run(
    "Md. Jahangir Alam",
    "Secretary",
    "Md. Jahangir Alam has been instrumental in organizing local activities...",
    "https://picsum.photos/seed/secretary/400/400",
    "Unity and discipline are the keys to our success."
  );
}

const missionVisionCount = db.prepare("SELECT COUNT(*) as count FROM mission_vision").get() as { count: number };
if (missionVisionCount.count === 0) {
  const insertMV = db.prepare("INSERT INTO mission_vision (title, content, order_index) VALUES (?, ?, ?)");
  insertMV.run("আদর্শিক পুনর্গঠন", "ব্যক্তি ও সমাজ জীবনে ইসলামের সুমহান আদর্শ প্রতিষ্ঠার মাধ্যমে একটি নৈতিক সমাজ গঠন।", 1);
  insertMV.run("সামাজিক ন্যায়বিচার", "সকল প্রকার শোষণ ও অবিচারের অবসান ঘটিয়ে ইনসাফপূর্ণ রাষ্ট্র ব্যবস্থা কায়েম।", 2);
  insertMV.run("গণতান্ত্রিক অধিকার", "জনগণের মৌলিক অধিকার ও ভোটাধিকার নিশ্চিত করার মাধ্যমে একটি জবাবদিহিমূলক রাষ্ট্র গঠন।", 3);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/settings", (req, res) => {
    const settings = db.prepare("SELECT * FROM site_settings").all();
    const settingsMap = settings.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json(settingsMap);
  });

  app.post("/api/settings", (req, res) => {
    const { settings } = req.body;
    const updateSetting = db.prepare("INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)");
    const transaction = db.transaction((data) => {
      for (const [key, value] of Object.entries(data)) {
        updateSetting.run(key, value as string);
      }
    });
    transaction(settings);
    res.json({ success: true });
  });

  app.get("/api/news", (req, res) => {
    const news = db.prepare("SELECT * FROM news ORDER BY created_at DESC").all();
    res.json(news);
  });

  app.post("/api/news", (req, res) => {
    const { title, content, category, image_url, video_url } = req.body;
    const info = db.prepare("INSERT INTO news (title, content, category, image_url, video_url) VALUES (?, ?, ?, ?, ?)").run(title, content, category, image_url, video_url);
    res.json({ id: info.lastInsertRowid });
  });

  app.delete("/api/news/:id", (req, res) => {
    db.prepare("DELETE FROM news WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/leadership", (req, res) => {
    const leadership = db.prepare("SELECT * FROM leadership").all();
    res.json(leadership);
  });

  app.post("/api/leadership/:id", (req, res) => {
    const { name, designation, bio, image_url, message } = req.body;
    db.prepare("UPDATE leadership SET name = ?, designation = ?, bio = ?, image_url = ?, message = ? WHERE id = ?")
      .run(name, designation, bio, image_url, message, req.params.id);
    res.json({ success: true });
  });

  app.put("/api/leadership/:id", (req, res) => {
    const { name, designation, bio, image_url, message } = req.body;
    db.prepare("UPDATE leadership SET name = ?, designation = ?, bio = ?, image_url = ?, message = ? WHERE id = ?")
      .run(name, designation, bio, image_url, message, req.params.id);
    res.json({ success: true });
  });

  app.get("/api/events", (req, res) => {
    const events = db.prepare("SELECT * FROM events ORDER BY date ASC").all();
    res.json(events);
  });

  app.post("/api/events", (req, res) => {
    const { title, date, time, location, description } = req.body;
    const info = db.prepare("INSERT INTO events (title, date, time, location, description) VALUES (?, ?, ?, ?, ?)").run(title, date, time, location, description);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/events/:id", (req, res) => {
    const { title, date, time, location, description } = req.body;
    db.prepare("UPDATE events SET title = ?, date = ?, time = ?, location = ?, description = ? WHERE id = ?")
      .run(title, date, time, location, description, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/events/:id", (req, res) => {
    db.prepare("DELETE FROM events WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/books", (req, res) => {
    const books = db.prepare("SELECT * FROM books ORDER BY created_at DESC").all();
    res.json(books);
  });

  app.post("/api/books", (req, res) => {
    const { title, author, cover_url, content } = req.body;
    const info = db.prepare("INSERT INTO books (title, author, cover_url, content) VALUES (?, ?, ?, ?)").run(title, author, cover_url, content);
    res.json({ id: info.lastInsertRowid });
  });

  app.post("/api/books/:id", (req, res) => {
    const { title, author, cover_url, content } = req.body;
    db.prepare("UPDATE books SET title = ?, author = ?, cover_url = ?, content = ? WHERE id = ?")
      .run(title, author, cover_url, content, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/books/:id", (req, res) => {
    db.prepare("DELETE FROM books WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/mission_vision", (req, res) => {
    const items = db.prepare("SELECT * FROM mission_vision ORDER BY order_index ASC").all();
    res.json(items);
  });

  app.post("/api/mission_vision", (req, res) => {
    const { title, content, order_index } = req.body;
    const info = db.prepare("INSERT INTO mission_vision (title, content, order_index) VALUES (?, ?, ?)").run(title, content, order_index || 0);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/mission_vision/:id", (req, res) => {
    const { title, content, order_index } = req.body;
    db.prepare("UPDATE mission_vision SET title = ?, content = ?, order_index = ? WHERE id = ?")
      .run(title, content, order_index, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/mission_vision/:id", (req, res) => {
    db.prepare("DELETE FROM mission_vision WHERE id = ?").run(req.params.id);
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
