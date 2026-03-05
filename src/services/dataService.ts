
const DEFAULT_SETTINGS = {
  site_name: "বাংলাদেশ জামায়াতে ইসলামী, কোতোয়ালি থানা, রংপুর",
  hero_title: "বাংলাদেশ জামায়াতে ইসলামী, কোতোয়ালি থানা",
  hero_subtitle: "রংপুর মহানগরীর হৃদপিণ্ড ও আন্দোলনের অবিচল কাফেলা",
  establishment_year: "১৯৪১",
  about_text: "একটি ইনসাফপূর্ণ সমাজ বিনির্মাণে আমরা বদ্ধপরিকর। আমাদের লক্ষ্য ইসলামের সুমহান আদর্শের ভিত্তিতে একটি নৈতিক ও সমৃদ্ধ বাংলাদেশ গঠন।",
  mission_text: "আল্লাহর সন্তুষ্টি অর্জনের লক্ষ্যে মানুষের সার্বিক কল্যাণে একটি ইনসাফপূর্ণ সমাজ প্রতিষ্ঠা করা।",
  contact_address: "কোতোয়ালি থানা অফিস, রংপুর মহানগরী",
  contact_email: "info@ji-rangpur.org",
  contact_phone: "+৮৮০ ১XXX XXXXXX",
  theme_color: "#006747",
  accent_color: "#D4AF37",
  logo_url: "",
  hero_image_url: "https://picsum.photos/seed/hero/1920/1080",
  vision_image_url: "https://picsum.photos/seed/vision/800/1000",
  hijri_offset: "1",
  rukon_password: "KR@2026",
  rukon_dashboard_links: JSON.stringify([
    { title: "রুকন মাসিক রিপোর্ট", url: "https://docs.google.com/spreadsheets/d/...", description: "মাসিক রিপোর্ট জমা দেওয়ার লিঙ্ক" },
    { title: "থানা দায়িত্বশীল রিপোর্ট", url: "https://docs.google.com/spreadsheets/d/...", description: "দায়িত্বশীলদের জন্য রিপোর্ট লিঙ্ক" }
  ]),
  join_links: JSON.stringify({
    worker: "https://docs.google.com/forms/d/...",
    supporter: "https://docs.google.com/forms/d/..."
  })
};

const INITIAL_NEWS = Array.from({ length: 10 }).map((_, i) => ({
  id: i + 1,
  title: `Sample News Title ${i + 1}: Important Update`,
  content: `This is the detailed content for sample news item ${i + 1}.`,
  category: ["Organizational", "National", "International", "Social Service"][i % 4],
  image_url: `https://picsum.photos/seed/news${i + 1}/800/600`,
  created_at: new Date().toISOString()
}));

const INITIAL_LEADERSHIP = [
  {
    id: 1,
    name: "Maulana Golam Kibria",
    designation: "Thana Ameer",
    bio: "Maulana Golam Kibria is a dedicated leader serving the community...",
    image_url: "https://picsum.photos/seed/ameer/400/400",
    message: "Our goal is to build a society based on Islamic values."
  },
  {
    id: 2,
    name: "Md. Jahangir Alam",
    designation: "Secretary",
    bio: "Md. Jahangir Alam has been instrumental in organizing local activities...",
    image_url: "https://picsum.photos/seed/secretary/400/400",
    message: "Unity and discipline are the keys to our success."
  }
];

class DataService {
  private isLocal = false;
  private initialized = false;
  private initPromise: Promise<void>;

  constructor() {
    this.initPromise = this.checkBackend();
  }

  private async checkBackend() {
    if (this.initialized) return;
    
    // If we are on a known static hosting domain or localhost without a server
    const isStaticHosting = window.location.hostname.includes('netlify.app') || 
                           window.location.hostname.includes('github.io') ||
                           window.location.hostname.includes('pages.dev') ||
                           window.location.hostname.includes('ais-pre-') || // AI Studio preview
                           window.location.hostname.includes('ais-dev-');

    try {
      if (isStaticHosting) {
        // Even on static hosting, we might have a backend if it's AI Studio dev environment
        // but for Netlify drag-and-drop, we want to default to local if /api/settings fails
      }
      
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error("Backend not responding");
      
      // Check if it's actually JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error("Not a JSON response (likely a redirect to index.html)");
      }

      const data = await res.json();
      if (!data || typeof data !== 'object') throw new Error("Invalid JSON data");

      this.isLocal = false;
    } catch (e) {
      console.warn("DataService: Backend not available, falling back to localStorage.", e);
      this.isLocal = true;
      this.initLocalStorage();
    }
    this.initialized = true;
  }

  private async ensureInitialized() {
    await this.initPromise;
  }

  private initLocalStorage() {
    if (!localStorage.getItem('ji_settings')) {
      localStorage.setItem('ji_settings', JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem('ji_news')) {
      localStorage.setItem('ji_news', JSON.stringify(INITIAL_NEWS));
    }
    if (!localStorage.getItem('ji_leadership')) {
      localStorage.setItem('ji_leadership', JSON.stringify(INITIAL_LEADERSHIP));
    }
    if (!localStorage.getItem('ji_events')) {
      localStorage.setItem('ji_events', JSON.stringify([]));
    }
    if (!localStorage.getItem('ji_books')) {
      localStorage.setItem('ji_books', JSON.stringify([]));
    }
    if (!localStorage.getItem('ji_mission_vision')) {
      localStorage.setItem('ji_mission_vision', JSON.stringify([]));
    }
  }

  async getSettings() {
    await this.ensureInitialized();
    try {
      if (this.isLocal) return JSON.parse(localStorage.getItem('ji_settings') || JSON.stringify(DEFAULT_SETTINGS));
      return fetch('/api/settings').then(r => r.json());
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  }

  async saveSettings(settings: any) {
    await this.ensureInitialized();
    if (this.isLocal) {
      const current = JSON.parse(localStorage.getItem('ji_settings') || '{}');
      const updated = { ...current, ...settings };
      localStorage.setItem('ji_settings', JSON.stringify(updated));
      return { success: true };
    }
    return fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings })
    }).then(r => r.json());
  }

  async getNews() {
    await this.ensureInitialized();
    if (this.isLocal) return JSON.parse(localStorage.getItem('ji_news') || '[]');
    return fetch('/api/news').then(r => r.json());
  }

  async saveNews(item: any) {
    await this.ensureInitialized();
    if (this.isLocal) {
      const news = JSON.parse(localStorage.getItem('ji_news') || '[]');
      if (item.id) {
        const idx = news.findIndex((n: any) => n.id === item.id);
        news[idx] = { ...news[idx], ...item };
      } else {
        item.id = Date.now();
        item.created_at = new Date().toISOString();
        news.unshift(item);
      }
      localStorage.setItem('ji_news', JSON.stringify(news));
      return item;
    }
    return fetch('/api/news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    }).then(r => r.json());
  }

  async deleteNews(id: number) {
    await this.ensureInitialized();
    if (this.isLocal) {
      const news = JSON.parse(localStorage.getItem('ji_news') || '[]');
      const filtered = news.filter((n: any) => n.id !== id);
      localStorage.setItem('ji_news', JSON.stringify(filtered));
      return { success: true };
    }
    return fetch(`/api/news/${id}`, { method: 'DELETE' }).then(r => r.json());
  }

  async getLeadership() {
    await this.ensureInitialized();
    if (this.isLocal) return JSON.parse(localStorage.getItem('ji_leadership') || '[]');
    return fetch('/api/leadership').then(r => r.json());
  }

  async saveLeadership(item: any) {
    await this.ensureInitialized();
    if (this.isLocal) {
      const lead = JSON.parse(localStorage.getItem('ji_leadership') || '[]');
      const idx = lead.findIndex((l: any) => l.id === item.id);
      lead[idx] = { ...lead[idx], ...item };
      localStorage.setItem('ji_leadership', JSON.stringify(lead));
      return { success: true };
    }
    return fetch(`/api/leadership/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    }).then(r => r.json());
  }

  async getEvents() {
    await this.ensureInitialized();
    if (this.isLocal) return JSON.parse(localStorage.getItem('ji_events') || '[]');
    return fetch('/api/events').then(r => r.json());
  }

  async saveEvent(item: any) {
    await this.ensureInitialized();
    if (this.isLocal) {
      const events = JSON.parse(localStorage.getItem('ji_events') || '[]');
      if (item.id) {
        const idx = events.findIndex((e: any) => e.id === item.id);
        events[idx] = { ...events[idx], ...item };
      } else {
        item.id = Date.now();
        events.push(item);
      }
      localStorage.setItem('ji_events', JSON.stringify(events));
      return item;
    }
    return fetch(item.id ? `/api/events/${item.id}` : '/api/events', {
      method: item.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    }).then(r => r.json());
  }

  async deleteEvent(id: number) {
    await this.ensureInitialized();
    if (this.isLocal) {
      const events = JSON.parse(localStorage.getItem('ji_events') || '[]');
      const filtered = events.filter((e: any) => e.id !== id);
      localStorage.setItem('ji_events', JSON.stringify(filtered));
      return { success: true };
    }
    return fetch(`/api/events/${id}`, { method: 'DELETE' }).then(r => r.json());
  }

  async getBooks() {
    await this.ensureInitialized();
    if (this.isLocal) return JSON.parse(localStorage.getItem('ji_books') || '[]');
    return fetch('/api/books').then(r => r.json());
  }

  async getMissionVision() {
    await this.ensureInitialized();
    if (this.isLocal) return JSON.parse(localStorage.getItem('ji_mission_vision') || '[]');
    return fetch('/api/mission_vision').then(r => r.json());
  }

  async saveMissionVision(item: any) {
    await this.ensureInitialized();
    if (this.isLocal) {
      const mv = JSON.parse(localStorage.getItem('ji_mission_vision') || '[]');
      if (item.id) {
        const idx = mv.findIndex((m: any) => m.id === item.id);
        mv[idx] = { ...mv[idx], ...item };
      } else {
        item.id = Date.now();
        mv.push(item);
      }
      localStorage.setItem('ji_mission_vision', JSON.stringify(mv));
      return item;
    }
    return fetch(item.id ? `/api/mission_vision/${item.id}` : '/api/mission_vision', {
      method: item.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    }).then(r => r.json());
  }

  async deleteMissionVision(id: number) {
    await this.ensureInitialized();
    if (this.isLocal) {
      const mv = JSON.parse(localStorage.getItem('ji_mission_vision') || '[]');
      const filtered = mv.filter((m: any) => m.id !== id);
      localStorage.setItem('ji_mission_vision', JSON.stringify(filtered));
      return { success: true };
    }
    return fetch(`/api/mission_vision/${id}`, { method: 'DELETE' }).then(r => r.json());
  }

  async saveBook(item: any) {
    await this.ensureInitialized();
    if (this.isLocal) {
      const books = JSON.parse(localStorage.getItem('ji_books') || '[]');
      if (item.id) {
        const idx = books.findIndex((b: any) => b.id === item.id);
        books[idx] = { ...books[idx], ...item };
      } else {
        item.id = Date.now();
        books.push(item);
      }
      localStorage.setItem('ji_books', JSON.stringify(books));
      return item;
    }
    return fetch(item.id ? `/api/books/${item.id}` : '/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    }).then(r => r.json());
  }

  async deleteBook(id: number) {
    await this.ensureInitialized();
    if (this.isLocal) {
      const books = JSON.parse(localStorage.getItem('ji_books') || '[]');
      const filtered = books.filter((b: any) => b.id !== id);
      localStorage.setItem('ji_books', JSON.stringify(filtered));
      return { success: true };
    }
    return fetch(`/api/books/${id}`, { method: 'DELETE' }).then(r => r.json());
  }
}

export const dataService = new DataService();
