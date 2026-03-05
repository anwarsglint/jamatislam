import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { dataService } from './services/dataService';
import { 
  Search, 
  Menu, 
  X, 
  Newspaper, 
  Users, 
  Calendar, 
  Settings, 
  Moon, 
  Sun, 
  ChevronRight,
  Plus,
  Trash2,
  Save,
  LogOut,
  Bell,
  Clock,
  Heart,
  CreditCard,
  Smartphone,
  MapPin,
  Mail,
  Phone,
  BookOpen,
  FileText,
  ExternalLink,
  ShieldCheck,
  Image as ImageIcon,
  Facebook,
  Youtube,
  Twitter,
  Instagram,
  Play,
  ArrowRight,
  Target,
  Shield,
  Book as BookIcon,
  Video,
  Share2,
  Download,
  Info
} from 'lucide-react';
import { Coordinates, CalculationMethod, PrayerTimes as AdhanPrayerTimes, SunnahTimes } from 'adhan';
import moment from 'moment-hijri';
import { NewsItem, LeadershipProfile, SiteSettings, EventItem, Book, MissionVisionItem } from './types';

// Prayer Times Component
const PrayerTimesWidget = () => {
  const [times, setTimes] = useState<any>(null);
  const [sunnah, setSunnah] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextPrayer, setNextPrayer] = useState<{ name: string, time: Date, countdown: string } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      if (times) {
        const coords = new Coordinates(25.7439, 89.2752);
        const params = CalculationMethod.Karachi();
        const prayerTimes = new AdhanPrayerTimes(coords, now, params);
        
        const prayers = [
          { name: 'ফজর', time: prayerTimes.fajr },
          { name: 'যোহর', time: prayerTimes.dhuhr },
          { name: 'আসর', time: prayerTimes.asr },
          { name: 'মাগরিব', time: prayerTimes.maghrib },
          { name: 'এশা', time: prayerTimes.isha },
        ];

        let next = prayers.find(p => p.time > now);
        if (!next) {
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowPrayers = new AdhanPrayerTimes(coords, tomorrow, params);
          next = { name: 'ফজর', time: tomorrowPrayers.fajr };
        }

        const diff = next.time.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setNextPrayer({
          name: next.name,
          time: next.time,
          countdown: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        });
      }
    }, 1000);
    
    const coords = new Coordinates(25.7439, 89.2752);
    const params = CalculationMethod.Karachi();
    const date = new Date();
    const prayerTimes = new AdhanPrayerTimes(coords, date, params);
    const sunnahTimes = new SunnahTimes(prayerTimes);
    
    setTimes({
      'ফজর': moment(prayerTimes.fajr).format('hh:mm A'),
      'সূর্যোদয়': moment(prayerTimes.sunrise).format('hh:mm A'),
      'যোহর': moment(prayerTimes.dhuhr).format('hh:mm A'),
      'আসর': moment(prayerTimes.asr).format('hh:mm A'),
      'মাগরিব': moment(prayerTimes.maghrib).format('hh:mm A'),
      'এশা': moment(prayerTimes.isha).format('hh:mm A'),
    });

    setSunnah({
      'সেহরি শেষ': moment(prayerTimes.fajr).subtract(10, 'minutes').format('hh:mm A'),
      'ইফতার': moment(prayerTimes.maghrib).format('hh:mm A'),
      'তাহাজ্জুদ': moment(sunnahTimes.lastThirdOfTheNight).format('hh:mm A'),
    });

    return () => clearInterval(timer);
  }, [times]);

  if (!times) return null;

  return (
    <div className="space-y-6">
      {nextPrayer && (
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 text-center relative overflow-hidden group shadow-xl shadow-black/5">
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <Clock className="w-32 h-32 text-black" />
          </div>
          <p className="text-sm uppercase tracking-[0.4em] font-black text-gray-400 mb-4">পরবর্তী ওয়াক্ত: {nextPrayer.name}</p>
          <p className="text-7xl font-black font-mono tracking-tighter text-black bn-num">
            {nextPrayer.countdown}
          </p>
          <p className="text-xs font-bold text-gray-400 mt-6 uppercase tracking-[0.2em]">ঘণ্টা : মিনিট : সেকেন্ড</p>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {Object.entries(times).map(([name, time]) => (
          <div key={name} className="bg-white p-5 rounded-3xl border border-gray-100 text-center hover:shadow-lg transition-all">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-bold">{name}</p>
            <p className="font-black text-lg text-black bn-num">{time as string}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(sunnah || {}).map(([name, time]) => (
          <div key={name} className="bg-white p-5 rounded-3xl border border-gray-100 text-center hover:shadow-lg transition-all">
            <p className="text-[10px] uppercase tracking-widest text-gold mb-2 font-black">{name}</p>
            <p className="font-black text-lg text-black bn-num">{time as string}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Multi-Language Calendar Component
const MultiCalendarWidget = ({ settings }: { settings: SiteSettings | null }) => {
  const [date, setDate] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const offset = parseInt(settings?.hijri_offset || '0');
  
  // Bengali Year Calculation (Bangabda - Revised Bangladesh Calendar)
  const getBengaliDate = (d: Date) => {
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    
    // Bengali months and their days (Revised Bangladesh Calendar)
    const bnMonths = ["বৈশাখ", "জ্যৈষ্ঠ", "আষাঢ়", "শ্রাবণ", "ভাদ্র", "আশ্বিন", "কার্তিক", "অগ্রহায়ণ", "পৌষ", "মাঘ", "ফাল্গুন", "চৈত্র"];
    
    // Check for leap year
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    
    // Days in each month
    const monthDays = [31, 31, 31, 31, 31, 30, 30, 30, 30, 30, isLeapYear ? 31 : 30, 30];
    
    // Bengali year starts on April 14
    let bnYear = year - 593;
    if (month < 4 || (month === 4 && day < 14)) {
      bnYear -= 1;
    }
    
    // Calculate month and day
    // This is a simplified calculation relative to April 14
    let bnDay, bnMonthIdx;
    
    // Days since April 14
    const startOfBnYear = new Date(year, 3, 14); // April 14 of current Gregorian year
    if (d < startOfBnYear) {
      startOfBnYear.setFullYear(year - 1);
    }
    
    const diffTime = Math.abs(d.getTime() - startOfBnYear.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    let remainingDays = diffDays;
    bnMonthIdx = 0;
    while (remainingDays >= monthDays[bnMonthIdx]) {
      remainingDays -= monthDays[bnMonthIdx];
      bnMonthIdx++;
    }
    bnDay = remainingDays + 1;
    
    const bnDayStr = bnDay.toLocaleString('bn-BD');
    const bnYearStr = bnYear.toLocaleString('bn-BD', { useGrouping: false });
    
    return `${bnDayStr} ${bnMonths[bnMonthIdx]} ${bnYearStr} বঙ্গাব্দ`;
  };

  const bnDate = getBengaliDate(date);
  const enDate = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  // User requested 1 day behind: "ajke 10 tarikh kkintu amader website a dekhabe 9 tarikh"
  const hjDate = moment(date).add(offset - 1, 'days').format('iD iMMMM iYYYY');
  const timeStr = date.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  return (
    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] border border-gray-100 dark:border-zinc-800 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Calendar className="w-32 h-32" />
      </div>
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-islamic-green/10 rounded-2xl">
            <Calendar className="w-6 h-6 text-islamic-green" />
          </div>
          <div>
            <h4 className="text-xl font-black text-gray-900 dark:text-white">সময় ও তারিখ</h4>
            <p className="text-[8px] text-gray-500 uppercase tracking-[0.3em] font-black">Rangpur, Bangladesh</p>
          </div>
        </div>
        <div className="text-2xl font-black text-islamic-green font-mono tracking-tighter bn-num">
          {timeStr}
        </div>
      </div>
      
      <div className="grid gap-4 relative z-10">
        <div className="p-5 bg-gray-50 dark:bg-zinc-800/50 rounded-[1.5rem] flex justify-between items-center group hover:bg-white dark:hover:bg-zinc-800 transition-all duration-500 border border-transparent hover:border-gray-200 dark:hover:border-zinc-700">
          <div>
            <p className="text-[8px] uppercase tracking-[0.3em] text-gray-400 font-black mb-1">English Calendar (AD)</p>
            <p className="text-lg font-black text-gray-900 dark:text-white bn-num">{enDate}</p>
          </div>
          <div className="text-[10px] font-black text-gray-300 group-hover:text-gray-400 transition-colors">AD</div>
        </div>
        <div className="p-5 bg-islamic-green/5 rounded-[1.5rem] border border-islamic-green/10 flex justify-between items-center group hover:bg-islamic-green/10 transition-all duration-500">
          <div>
            <p className="text-[8px] uppercase tracking-[0.3em] text-islamic-green font-black mb-1">বঙ্গাব্দ (বাংলা বর্ষ)</p>
            <p className="text-lg font-black text-islamic-green bn-num">{bnDate}</p>
          </div>
          <div className="text-[10px] font-black text-islamic-green/40 group-hover:text-islamic-green/60 transition-colors">BE</div>
        </div>
        <div className="p-5 bg-gold/5 rounded-[1.5rem] border border-gold/10 flex justify-between items-center group hover:bg-gold/10 transition-all duration-500">
          <div>
            <p className="text-[8px] uppercase tracking-[0.3em] text-gold font-black mb-1">হিজরি (আরবি বর্ষ)</p>
            <p className="text-lg font-black text-gold bn-num">{hjDate}</p>
          </div>
          <div className="text-[10px] font-black text-gold/40 group-hover:text-gold/60 transition-colors">AH</div>
        </div>
      </div>
    </div>
  );
};
// Book Section Component
const BookSection = ({ books }: { books: Book[] }) => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  return (
    <section id="books" className="py-24 bg-gray-50 dark:bg-zinc-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-islamic-green font-black text-sm uppercase tracking-[0.4em] mb-4 block">Library</span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">আদর্শিক পাঠাগার</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            ইসলামী আন্দোলনের কর্মীদের জন্য প্রয়োজনীয় বইসমূহ এখানে পড়তে পারবেন।
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {books.map((book) => (
            <motion.div
              key={book.id}
              whileHover={{ y: -10 }}
              onClick={() => setSelectedBook(book)}
              className="cursor-pointer group"
            >
              <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-xl mb-4 relative">
                <img src={book.cover_url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-white" />
                </div>
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-islamic-green transition-colors">{book.title}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">{book.author}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedBook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-4xl max-h-[90vh] rounded-[3rem] overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">{selectedBook.title}</h3>
                  <p className="text-sm text-gray-500">{selectedBook.author}</p>
                </div>
                <button onClick={() => setSelectedBook(null)} className="p-3 bg-gray-100 dark:bg-zinc-800 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-12 overflow-y-auto prose dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap leading-relaxed text-lg">
                  {selectedBook.content}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

// Rukon Dashboard Component
const RukonDashboard = ({ isOpen, onClose, settings }: { isOpen: boolean, onClose: () => void, settings: SiteSettings | null }) => {
  const links = JSON.parse(settings?.rukon_dashboard_links || '[]');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl"
          >
            <div className="p-10 bg-islamic-green text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black">সাংগঠনিক ড্যাশবোর্ড</h3>
                  <p className="text-sm opacity-80">রুকন ও দায়িত্বশীলদের জন্য সংরক্ষিত</p>
                </div>
              </div>
              <button onClick={onClose} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-10 space-y-8">
              <div className="grid gap-4">
                <h4 className="font-bold text-gray-500 uppercase tracking-widest text-xs">গুরুত্বপূর্ণ লিঙ্কসমূহ</h4>
                {links.map((link: any, idx: number) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-6 bg-gray-50 dark:bg-zinc-800 rounded-3xl group hover:bg-islamic-green hover:text-white transition-all duration-500"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-islamic-green/10 rounded-2xl flex items-center justify-center text-islamic-green group-hover:bg-white/20 group-hover:text-white transition-all">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="font-bold text-lg block">{link.title}</span>
                        {link.description && (
                          <span className="text-xs opacity-60 block mt-1 group-hover:text-white/80">{link.description}</span>
                        )}
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0" />
                  </a>
                ))}
              </div>

              <div className="p-6 bg-gold/10 rounded-3xl border border-gold/20">
                <p className="text-sm text-gold font-bold leading-relaxed">
                  <Bell className="w-4 h-4 inline mr-2" />
                  সতর্কতা: এই লিঙ্কগুলো শুধুমাত্র দায়িত্বশীলদের জন্য। দয়া করে কারো সাথে শেয়ার করবেন না।
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Navbar = ({ onSearch, onAdminOpen, onRukonOpen, settings }: { onSearch: (val: string) => void, onAdminOpen: () => void, onRukonOpen: () => void, settings: SiteSettings | null }) => {
  const [searchValue, setSearchValue] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const adminPass = settings?.admin_password || 'PASSWORD';
    const rukonPass = settings?.rukon_password || 'KR@2026';
    
    if (searchValue.toUpperCase() === adminPass.toUpperCase() || searchValue === 'RMK@2026') {
      onAdminOpen();
      setSearchValue('');
    } else if (searchValue === rukonPass) {
      onRukonOpen();
      setSearchValue('');
    } else {
      onSearch(searchValue);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'py-3 bg-white shadow-xl' : 'py-6 bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {settings?.logo_url ? (
              <img src={settings.logo_url} className="w-14 h-14 object-contain" referrerPolicy="no-referrer" />
            ) : (
              <div className={`w-14 h-14 bg-islamic-green rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-islamic-green/20 transition-transform duration-500 ${scrolled ? 'scale-90' : 'scale-100'}`}>
                JI
              </div>
            )}
            <div className={`transition-opacity duration-500 ${scrolled ? 'opacity-100' : 'opacity-100'}`}>
              <h1 className={`text-xl font-black leading-tight ${scrolled ? 'text-gray-900' : 'text-gray-900 dark:text-white'}`}>
                {settings?.site_name || 'Jamaat-e-Islami'}
              </h1>
              <p className={`text-[10px] uppercase tracking-[0.2em] font-black ${scrolled ? 'text-islamic-green' : 'text-gray-600 dark:text-gray-400'}`}>
                Kotwali Thana, Rangpur
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-12">
            {['Home', 'News', 'Leadership', 'Events', 'Donate'].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase()}`} 
                className={`text-lg font-black uppercase tracking-[0.2em] transition-all hover:text-islamic-green relative group ${
                  scrolled ? 'text-gray-900' : 'text-gray-900 dark:text-white'
                }`}
              >
                {item}
                <span className="absolute -bottom-2 left-0 w-0 h-1.5 bg-islamic-green transition-all group-hover:w-full rounded-full"></span>
              </a>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden xl:flex items-center gap-4 mr-4">
              {settings?.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className={`p-2 rounded-lg transition-colors ${scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white/70 hover:bg-white/10'}`}>
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {settings?.youtube_url && (
                <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className={`p-2 rounded-lg transition-colors ${scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white/70 hover:bg-white/10'}`}>
                  <Youtube className="w-5 h-5" />
                </a>
              )}
            </div>
            <form onSubmit={handleSearch} className="relative hidden sm:block">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search..."
                className={`pl-12 pr-6 py-2.5 rounded-full border-none text-sm focus:ring-2 focus:ring-islamic-green transition-all w-48 focus:w-72 ${
                  scrolled ? 'bg-gray-100 dark:bg-zinc-800' : 'bg-white/10 dark:bg-white/5 backdrop-blur-md text-white placeholder:text-white/50'
                }`}
              />
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${scrolled ? 'text-gray-400' : 'text-white/50'}`} />
            </form>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`lg:hidden p-2 rounded-xl transition-colors ${
                scrolled ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-zinc-800' : 'text-white bg-white/10'
              }`}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const AdminDashboard = ({ onClose }: { onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState<'news' | 'leadership' | 'settings' | 'events' | 'books' | 'links'>('news');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [leadership, setLeadership] = useState<LeadershipProfile[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [missionVision, setMissionVision] = useState<MissionVisionItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [quickLinks, setQuickLinks] = useState<{title: string, url: string}[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchData = async () => {
    try {
      const [newsRes, leadRes, setRes, eventRes, bookRes, mvRes] = await Promise.all([
        dataService.getNews().catch(() => []),
        dataService.getLeadership().catch(() => []),
        dataService.getSettings().catch(() => null),
        dataService.getEvents().catch(() => []),
        dataService.getBooks().catch(() => []),
        dataService.getMissionVision().catch(() => [])
      ]);
      
      setNews(newsRes || []);
      setLeadership(leadRes || []);
      setSettings(setRes);
      setEvents(eventRes || []);
      setBooks(bookRes || []);
      setMissionVision(mvRes || []);
      
      if (setRes) {
        setQuickLinks(JSON.parse(setRes.rukon_dashboard_links || '[]'));
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const updatedSettings: any = {};
      formData.forEach((value, key) => {
        updatedSettings[key] = value;
      });

      await dataService.saveSettings(updatedSettings);
      alert('Settings saved successfully!');
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNews = async () => {
    const title = prompt('News Title:');
    if (!title) return;
    await dataService.saveNews({
      title,
      content: 'Content goes here...',
      category: 'General',
      image_url: 'https://picsum.photos/seed/news/800/600'
    });
    fetchData();
  };

  const handleDeleteNews = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    await dataService.deleteNews(id);
    fetchData();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[100] bg-white dark:bg-zinc-950 flex flex-col"
    >
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-200 dark:border-zinc-800 p-6 flex flex-col gap-8">
          <div className="flex items-center gap-3 text-islamic-green">
            <Settings className="w-6 h-6" />
            <h2 className="font-bold text-xl">Admin Dashboard</h2>
          </div>
          
          <div className="flex flex-col gap-2">
            {[
              { id: 'news', label: 'News Engine', icon: Newspaper },
              { id: 'leadership', label: 'Leadership', icon: Users },
              { id: 'events', label: 'Calendar', icon: Calendar },
              { id: 'mission_vision', label: 'Mission & Vision', icon: Target },
              { id: 'books', label: 'Library', icon: BookOpen },
              { id: 'links', label: 'Quick Links', icon: ExternalLink },
              { id: 'settings', label: 'Site Settings', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-islamic-green text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-auto">
            <button 
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Exit Dashboard
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold capitalize">{activeTab} Management</h3>
              {activeTab === 'news' && (
                <button 
                  onClick={handleAddNews}
                  className="bg-islamic-green text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-opacity-90"
                >
                  <Plus className="w-4 h-4" /> Add News
                </button>
              )}
              {activeTab === 'books' && (
                <button 
                  onClick={async () => {
                    const title = prompt('Book Title:');
                    if (!title) return;
                    await dataService.saveBook({
                      title,
                      author: 'Author Name',
                      cover_url: 'https://picsum.photos/seed/book/400/600',
                      content: 'Content goes here...'
                    });
                    fetchData();
                  }}
                  className="bg-islamic-green text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-opacity-90"
                >
                  <Plus className="w-4 h-4" /> Add Book
                </button>
              )}
            </div>

            {activeTab === 'news' && (
              <div className="grid gap-6">
                {editingNews ? (
                  <div className="p-8 bg-gray-50 dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xl font-bold">Edit News Item</h4>
                      <button onClick={() => setEditingNews(null)} className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-lg"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="grid gap-4">
                      <input 
                        value={editingNews.title}
                        onChange={e => setEditingNews({...editingNews, title: e.target.value})}
                        className="w-full bg-white dark:bg-zinc-800 border-none rounded-xl p-4"
                        placeholder="Title"
                      />
                      <select 
                        value={editingNews.category}
                        onChange={e => setEditingNews({...editingNews, category: e.target.value})}
                        className="w-full bg-white dark:bg-zinc-800 border-none rounded-xl p-4"
                      >
                        <option>General</option>
                        <option>Political</option>
                        <option>Social</option>
                        <option>Religious</option>
                      </select>
                      <textarea 
                        value={editingNews.content}
                        onChange={e => setEditingNews({...editingNews, content: e.target.value})}
                        className="w-full bg-white dark:bg-zinc-800 border-none rounded-xl p-4 h-40"
                        placeholder="Content"
                      />
                      <div className="flex items-center gap-4">
                        <img src={editingNews.image_url} className="w-20 h-20 rounded-xl object-cover" />
                        <label className="flex-1 cursor-pointer bg-white dark:bg-zinc-800 p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-zinc-700 hover:border-islamic-green transition-colors text-center">
                          <ImageIcon className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                          <span className="text-sm font-medium text-gray-500">Change Image</span>
                          <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, base64 => setEditingNews({...editingNews, image_url: base64}))} />
                        </label>
                      </div>
                      <button 
                        onClick={async () => {
                          await dataService.saveNews(editingNews);
                          setEditingNews(null);
                          fetchData();
                        }}
                        className="w-full bg-islamic-green text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                      >
                        <Save className="w-5 h-5" /> Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {news.map((item) => (
                      <div key={item.id} className="p-4 border border-gray-200 dark:border-zinc-800 rounded-xl flex justify-between items-center group hover:border-islamic-green transition-colors">
                        <div className="flex items-center gap-4">
                          <img src={item.image_url} className="w-12 h-12 rounded-lg object-cover" />
                          <div>
                            <h4 className="font-bold">{item.title}</h4>
                            <p className="text-xs text-gray-500">{item.category} • {new Date(item.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingNews(item)} className="p-2 text-gray-400 hover:text-islamic-green"><Settings className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteNews(item.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'leadership' && (
              <div className="grid gap-6">
                {leadership.map((lead) => (
                  <div key={lead.id} className="p-8 border border-gray-200 dark:border-zinc-800 rounded-[2rem] bg-gray-50 dark:bg-zinc-900/50">
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="space-y-4">
                        <img src={lead.image_url} className="w-40 h-40 rounded-3xl object-cover shadow-xl" referrerPolicy="no-referrer" />
                        <label className="block cursor-pointer bg-white dark:bg-zinc-800 p-3 rounded-xl border border-gray-200 dark:border-zinc-700 text-center text-xs font-bold hover:border-islamic-green transition-colors">
                          Upload Photo
                          <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, async base64 => {
                            await dataService.saveLeadership({ ...lead, image_url: base64 });
                            fetchData();
                          })} />
                        </label>
                      </div>
                      <div className="flex-1 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest font-black text-gray-400">Full Name</label>
                            <input 
                              defaultValue={lead.name} 
                              onBlur={async e => {
                                await dataService.saveLeadership({ ...lead, name: e.target.value });
                              }}
                              className="w-full bg-white dark:bg-zinc-800 border-none rounded-xl p-3 text-sm font-bold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest font-black text-gray-400">Designation</label>
                            <input 
                              defaultValue={lead.designation} 
                              onBlur={async e => {
                                await dataService.saveLeadership({ ...lead, designation: e.target.value });
                              }}
                              className="w-full bg-white dark:bg-zinc-800 border-none rounded-xl p-3 text-sm font-bold"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-widest font-black text-gray-400">Short Quote / Message</label>
                          <textarea 
                            defaultValue={lead.message}
                            onBlur={async e => {
                              await dataService.saveLeadership({ ...lead, message: e.target.value });
                            }}
                            className="w-full bg-white dark:bg-zinc-800 border-none rounded-xl p-3 text-sm h-20 leading-relaxed"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-widest font-black text-gray-400">Full Biography</label>
                          <textarea 
                            defaultValue={lead.bio}
                            onBlur={async e => {
                              await dataService.saveLeadership({ ...lead, bio: e.target.value });
                            }}
                            className="w-full bg-white dark:bg-zinc-800 border-none rounded-xl p-3 text-sm h-40 leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'events' && (
              <div className="grid gap-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xl font-bold">Latest Programs (Events)</h4>
                  <button 
                    onClick={async () => {
                      const title = prompt('Event Title:');
                      if (!title) return;
                      await dataService.saveEvent({
                        title,
                        date: new Date().toISOString(),
                        time: '10:00 AM',
                        location: 'Kotwali Thana Office',
                        description: 'Event description goes here...'
                      });
                      fetchData();
                    }}
                    className="bg-islamic-green text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-opacity-90"
                  >
                    <Plus className="w-4 h-4" /> Add Event
                  </button>
                </div>
                <div className="grid gap-4">
                  {events.map((event) => (
                    <div key={event.id} className="p-6 bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 space-y-4">
                      <div className="grid md:grid-cols-4 gap-4">
                        <div className="grid gap-1 md:col-span-2">
                          <label className="text-[10px] font-bold uppercase opacity-40">Title</label>
                          <input 
                            defaultValue={event.title} 
                            onBlur={async (e) => {
                              await dataService.saveEvent({ ...event, title: e.target.value });
                            }}
                            className="bg-white dark:bg-zinc-800 border-none rounded-lg p-2 text-sm font-bold"
                          />
                        </div>
                        <div className="grid gap-1">
                          <label className="text-[10px] font-bold uppercase opacity-40">Date</label>
                          <input 
                            type="date"
                            defaultValue={new Date(event.date).toISOString().split('T')[0]} 
                            onBlur={async (e) => {
                              await dataService.saveEvent({ ...event, date: e.target.value });
                            }}
                            className="bg-white dark:bg-zinc-800 border-none rounded-lg p-2 text-sm font-bold"
                          />
                        </div>
                        <div className="grid gap-1">
                          <label className="text-[10px] font-bold uppercase opacity-40">Time</label>
                          <input 
                            defaultValue={event.time} 
                            onBlur={async (e) => {
                              await dataService.saveEvent({ ...event, time: e.target.value });
                            }}
                            className="bg-white dark:bg-zinc-800 border-none rounded-lg p-2 text-sm font-bold"
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-1">
                          <label className="text-[10px] font-bold uppercase opacity-40">Location</label>
                          <input 
                            defaultValue={event.location} 
                            onBlur={async (e) => {
                              await dataService.saveEvent({ ...event, location: e.target.value });
                            }}
                            className="bg-white dark:bg-zinc-800 border-none rounded-lg p-2 text-sm font-bold"
                          />
                        </div>
                        <div className="grid gap-1">
                          <label className="text-[10px] font-bold uppercase opacity-40">Description</label>
                          <textarea 
                            defaultValue={event.description}
                            onBlur={async (e) => {
                              await dataService.saveEvent({ ...event, description: e.target.value });
                            }}
                            className="w-full bg-white dark:bg-zinc-800 border-none rounded-lg p-2 text-sm h-10"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button 
                          onClick={async () => {
                            if (!confirm('Delete this event?')) return;
                            await dataService.deleteEvent(event.id);
                            fetchData();
                          }}
                          className="text-red-500 text-xs font-bold hover:underline"
                        >
                          Delete Event
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'mission_vision' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-3xl font-black">Mission & Vision Items</h3>
                  <button 
                    onClick={async () => {
                      const title = prompt('Title:');
                      if (!title) return;
                      await dataService.saveMissionVision({
                        title,
                        content: 'Description here...',
                        icon_type: 'Target',
                        order_index: missionVision.length
                      });
                      fetchData();
                    }}
                    className="bg-islamic-green text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" /> Add Item
                  </button>
                </div>
                <div className="grid gap-6">
                  {missionVision.map((mv) => (
                    <div key={mv.id} className="p-6 bg-gray-50 dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800">
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="grid gap-2">
                          <label className="text-xs font-bold uppercase opacity-40">Title</label>
                          <input 
                            defaultValue={mv.title}
                            onBlur={async (e) => {
                              await dataService.saveMissionVision({ ...mv, title: e.target.value });
                            }}
                            className="bg-white dark:bg-zinc-800 border-none rounded-lg p-3 text-sm font-bold"
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-xs font-bold uppercase opacity-40">Order Index</label>
                          <input 
                            type="number"
                            defaultValue={mv.order_index}
                            onBlur={async (e) => {
                              await dataService.saveMissionVision({ ...mv, order_index: parseInt(e.target.value) });
                            }}
                            className="bg-white dark:bg-zinc-800 border-none rounded-lg p-3 text-sm"
                          />
                        </div>
                      </div>
                      <div className="grid gap-2 mb-4">
                        <label className="text-xs font-bold uppercase opacity-40">Content</label>
                        <textarea 
                          defaultValue={mv.content}
                          onBlur={async (e) => {
                            await dataService.saveMissionVision({ ...mv, content: e.target.value });
                          }}
                          className="bg-white dark:bg-zinc-800 border-none rounded-lg p-3 text-sm h-24"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button 
                          onClick={async () => {
                            if (!confirm('Delete this item?')) return;
                            await dataService.deleteMissionVision(mv.id);
                            fetchData();
                          }}
                          className="text-red-500 text-xs font-bold hover:underline"
                        >
                          Delete Item
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'books' && (
              <div className="grid gap-6">
                {books.map((book) => (
                  <div key={book.id} className="p-6 border border-gray-200 dark:border-zinc-800 rounded-xl space-y-4">
                    <div className="flex gap-6">
                      <div className="space-y-4">
                        <img src={book.cover_url} className="w-20 h-28 rounded-lg object-cover shadow-md" referrerPolicy="no-referrer" />
                        <label className="block cursor-pointer bg-white dark:bg-zinc-800 p-2 rounded-lg border border-gray-200 dark:border-zinc-700 text-center text-[10px] font-bold hover:border-islamic-green transition-colors">
                          Change Cover
                          <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, async base64 => {
                            await dataService.saveBook({ ...book, cover_url: base64 });
                            fetchData();
                          })} />
                        </label>
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-1">
                            <label className="text-[10px] font-bold uppercase opacity-40">Title</label>
                            <input 
                              defaultValue={book.title} 
                              onBlur={async (e) => {
                                await dataService.saveBook({ ...book, title: e.target.value });
                              }}
                              className="bg-gray-50 dark:bg-zinc-900 border-none rounded-lg p-2 text-sm"
                            />
                          </div>
                          <div className="grid gap-1">
                            <label className="text-[10px] font-bold uppercase opacity-40">Author</label>
                            <input 
                              defaultValue={book.author} 
                              onBlur={async (e) => {
                                await dataService.saveBook({ ...book, author: e.target.value });
                              }}
                              className="bg-gray-50 dark:bg-zinc-900 border-none rounded-lg p-2 text-sm"
                            />
                          </div>
                        </div>
                        <div className="grid gap-1">
                          <label className="text-[10px] font-bold uppercase opacity-40">Cover URL</label>
                          <input 
                            defaultValue={book.cover_url} 
                            onBlur={async (e) => {
                              await dataService.saveBook({ ...book, cover_url: e.target.value });
                            }}
                            className="bg-gray-50 dark:bg-zinc-900 border-none rounded-lg p-2 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-1">
                      <label className="text-[10px] font-bold uppercase opacity-40">Content</label>
                      <textarea 
                        defaultValue={book.content}
                        onBlur={async (e) => {
                          await dataService.saveBook({ ...book, content: e.target.value });
                        }}
                        className="w-full bg-gray-50 dark:bg-zinc-900 border-none rounded-lg p-4 text-sm h-48 font-mono"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button 
                        onClick={async () => {
                          if (!confirm('Delete this book?')) return;
                          await dataService.deleteBook(book.id);
                          fetchData();
                        }}
                        className="text-red-500 text-xs font-bold hover:underline"
                      >
                        Delete Book
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'links' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-3xl font-black">Quick Links Management</h3>
                  <button 
                    onClick={() => setQuickLinks([...quickLinks, { title: '', url: '', description: '' }])}
                    className="bg-islamic-green text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-opacity-90 transition-all"
                  >
                    <Plus className="w-5 h-5" /> Add New Link
                  </button>
                </div>

                <div className="grid gap-6">
                  {quickLinks.map((link: any, idx) => (
                    <div key={idx} className="bg-gray-50 dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 space-y-4">
                      <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 grid gap-2 w-full">
                          <label className="text-xs font-medium uppercase tracking-widest opacity-60">Link Title</label>
                          <input 
                            value={link.title}
                            onChange={(e) => {
                              const newLinks = [...quickLinks];
                              newLinks[idx].title = e.target.value;
                              setQuickLinks(newLinks);
                            }}
                            className="bg-white dark:bg-zinc-800 border-none rounded-lg p-3 text-sm w-full"
                            placeholder="e.g. রুকন মাসিক রিপোর্ট"
                          />
                        </div>
                        <div className="flex-[2] grid gap-2 w-full">
                          <label className="text-xs font-medium uppercase tracking-widest opacity-60">URL</label>
                          <input 
                            value={link.url}
                            onChange={(e) => {
                              const newLinks = [...quickLinks];
                              newLinks[idx].url = e.target.value;
                              setQuickLinks(newLinks);
                            }}
                            className="bg-white dark:bg-zinc-800 border-none rounded-lg p-3 text-sm w-full"
                            placeholder="https://docs.google.com/..."
                          />
                        </div>
                        <button 
                          onClick={() => setQuickLinks(quickLinks.filter((_, i) => i !== idx))}
                          className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="grid gap-2 w-full">
                        <label className="text-xs font-medium uppercase tracking-widest opacity-60">Instructions / Description</label>
                        <textarea 
                          value={link.description || ''}
                          onChange={(e) => {
                            const newLinks = [...quickLinks];
                            newLinks[idx].description = e.target.value;
                            setQuickLinks(newLinks);
                          }}
                          className="bg-white dark:bg-zinc-800 border-none rounded-lg p-3 text-sm w-full h-20"
                          placeholder="Enter instructions for this link..."
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={async () => {
                    setIsSaving(true);
                    try {
                      await dataService.saveSettings({ 
                        rukon_dashboard_links: JSON.stringify(quickLinks) 
                      });
                      alert('Quick links saved successfully!');
                      fetchData();
                    } catch (error) {
                      alert('Failed to save links.');
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  disabled={isSaving}
                  className="bg-islamic-green text-white px-8 py-4 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-lg shadow-islamic-green/20 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Quick Links'}
                </button>
              </div>
            )}

            {activeTab === 'settings' && settings && (
              <form onSubmit={handleSaveSettings} className="space-y-8">
                <div className="grid gap-6 p-6 bg-gray-50 dark:bg-zinc-900 rounded-2xl">
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    <Settings className="w-5 h-5 text-islamic-green" /> General Settings
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-xs font-medium uppercase tracking-widest opacity-60">Site Name</label>
                      <input name="site_name" defaultValue={settings.site_name} className="bg-white dark:bg-zinc-800 border-none rounded-lg p-3 text-sm" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-medium uppercase tracking-widest opacity-60">Establishment Year</label>
                      <input name="establishment_year" defaultValue={settings.establishment_year} className="bg-white dark:bg-zinc-800 border-none rounded-lg p-3 text-sm" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                      <label className="block text-sm font-bold">Site Logo</label>
                      <div className="flex items-center gap-4">
                        <img src={settings.logo_url} className="w-20 h-20 object-contain bg-gray-100 rounded-xl p-2" />
                        <label className="flex-1 cursor-pointer bg-white dark:bg-zinc-800 p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-zinc-700 hover:border-islamic-green transition-colors text-center">
                          <ImageIcon className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                          <span className="text-xs font-bold text-gray-500">Upload Logo</span>
                          <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, base64 => setSettings({...settings, logo_url: base64}))} />
                        </label>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm font-bold">Hero Background</label>
                      <div className="flex items-center gap-4">
                        <img src={settings.hero_image_url} className="w-20 h-20 object-cover rounded-xl" />
                        <label className="flex-1 cursor-pointer bg-white dark:bg-zinc-900 p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-zinc-700 hover:border-islamic-green transition-colors text-center">
                          <ImageIcon className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                          <span className="text-xs font-bold text-gray-500">Upload Hero</span>
                          <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, base64 => setSettings({...settings, hero_image_url: base64}))} />
                        </label>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm font-bold">Vision Image</label>
                      <div className="flex items-center gap-4">
                        <img src={settings.vision_image_url} className="w-20 h-20 object-cover rounded-xl" />
                        <label className="flex-1 cursor-pointer bg-white dark:bg-zinc-900 p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-zinc-700 hover:border-islamic-green transition-colors text-center">
                          <ImageIcon className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                          <span className="text-xs font-bold text-gray-500">Upload Vision</span>
                          <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, base64 => setSettings({...settings, vision_image_url: base64}))} />
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-medium uppercase tracking-widest opacity-60">Hero Title</label>
                    <input name="hero_title" defaultValue={settings.hero_title} className="bg-white dark:bg-zinc-800 border-none rounded-lg p-3 text-sm" />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-medium uppercase tracking-widest opacity-60">Hero Subtitle</label>
                    <input name="hero_subtitle" defaultValue={settings.hero_subtitle} className="bg-white dark:bg-zinc-800 border-none rounded-lg p-3 text-sm" />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-medium uppercase tracking-widest opacity-60">About Text</label>
                    <textarea name="about_text" defaultValue={settings.about_text} className="bg-white dark:bg-zinc-800 border-none rounded-lg p-3 text-sm h-24" />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-medium uppercase tracking-widest opacity-60">Mission Text</label>
                    <textarea name="mission_text" defaultValue={settings.mission_text} className="bg-white dark:bg-zinc-800 border-none rounded-lg p-3 text-sm h-24" />
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-4 bg-white dark:bg-zinc-800 rounded-xl space-y-4">
                      <h5 className="font-bold text-sm border-b pb-2">Pillar 1</h5>
                      <input name="pillar1_title" defaultValue={settings.pillar1_title} placeholder="Pillar 1 Title" className="w-full bg-gray-50 dark:bg-zinc-900 border-none rounded-lg p-2 text-xs font-bold" />
                      <textarea name="pillar1_text" defaultValue={settings.pillar1_text} placeholder="Pillar 1 Text" className="w-full bg-gray-50 dark:bg-zinc-900 border-none rounded-lg p-2 text-xs h-20" />
                    </div>
                    <div className="p-4 bg-white dark:bg-zinc-800 rounded-xl space-y-4">
                      <h5 className="font-bold text-sm border-b pb-2">Pillar 2</h5>
                      <input name="pillar2_title" defaultValue={settings.pillar2_title} placeholder="Pillar 2 Title" className="w-full bg-gray-50 dark:bg-zinc-900 border-none rounded-lg p-2 text-xs font-bold" />
                      <textarea name="pillar2_text" defaultValue={settings.pillar2_text} placeholder="Pillar 2 Text" className="w-full bg-gray-50 dark:bg-zinc-900 border-none rounded-lg p-2 text-xs h-20" />
                    </div>
                    <div className="p-4 bg-white dark:bg-zinc-800 rounded-xl space-y-4">
                      <h5 className="font-bold text-sm border-b pb-2">Pillar 3</h5>
                      <input name="pillar3_title" defaultValue={settings.pillar3_title} placeholder="Pillar 3 Title" className="w-full bg-gray-50 dark:bg-zinc-900 border-none rounded-lg p-2 text-xs font-bold" />
                      <textarea name="pillar3_text" defaultValue={settings.pillar3_text} placeholder="Pillar 3 Text" className="w-full bg-gray-50 dark:bg-zinc-900 border-none rounded-lg p-2 text-xs h-20" />
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 p-6 bg-gray-50 dark:bg-zinc-900 rounded-2xl">
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-islamic-green" /> Security & Dashboard
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-xs font-medium uppercase tracking-widest opacity-60">Admin Password (Search Bar)</label>
                      <input name="admin_password" defaultValue={settings.admin_password || 'PASSWORD'} className="bg-white dark:bg-zinc-800 border-none rounded-lg p-3 text-sm" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-medium uppercase tracking-widest opacity-60">Rukon Password (Search Bar)</label>
                      <input name="rukon_password" defaultValue={settings.rukon_password || 'KR@2026'} className="bg-white dark:bg-zinc-800 border-none rounded-lg p-3 text-sm" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-medium uppercase tracking-widest opacity-60">Rukon Dashboard Links (JSON)</label>
                    <textarea name="rukon_dashboard_links" defaultValue={settings.rukon_dashboard_links} className="bg-white dark:bg-zinc-800 border-none rounded-lg p-3 text-sm h-32 font-mono" />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-medium uppercase tracking-widest opacity-60">Join Links (JSON)</label>
                    <textarea name="join_links" defaultValue={settings.join_links} className="bg-white dark:bg-zinc-800 border-none rounded-lg p-3 text-sm h-24 font-mono" />
                  </div>
                </div>

                <div className="grid gap-6 p-6 bg-gray-50 dark:bg-zinc-900 rounded-2xl">
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-islamic-green" /> Localization
                  </h4>
                  <div className="grid gap-2">
                    <label className="text-xs font-medium uppercase tracking-widest opacity-60">Hijri Date Offset (Days)</label>
                    <input name="hijri_offset" defaultValue={settings.hijri_offset || '0'} className="bg-white dark:bg-zinc-800 border-none rounded-lg p-3 text-sm" />
                  </div>
                </div>

                <div className="grid gap-6 p-6 bg-gray-50 dark:bg-zinc-900 rounded-2xl">
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    <Settings className="w-5 h-5 text-islamic-green" /> Design Settings
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-xs font-medium uppercase tracking-widest opacity-60">Theme Color (Hex)</label>
                      <input name="theme_color" defaultValue={settings.theme_color} className="bg-white dark:bg-zinc-800 border-none rounded-lg p-3 text-sm" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-medium uppercase tracking-widest opacity-60">Accent Color (Hex)</label>
                      <input name="accent_color" defaultValue={settings.accent_color} className="bg-white dark:bg-zinc-800 border-none rounded-lg p-3 text-sm" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-medium uppercase tracking-widest opacity-60">Support Section BG (Hex)</label>
                      <input name="support_bg_color" defaultValue={settings.support_bg_color} className="bg-white dark:bg-zinc-800 border-none rounded-lg p-3 text-sm" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-medium uppercase tracking-widest opacity-60">Footer BG (Hex)</label>
                      <input name="footer_bg_color" defaultValue={settings.footer_bg_color} className="bg-white dark:bg-zinc-800 border-none rounded-lg p-3 text-sm" />
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 p-6 bg-gray-50 dark:bg-zinc-900 rounded-2xl">
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-islamic-green" /> Social Media Links
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-xs font-medium uppercase tracking-widest opacity-60">Facebook URL</label>
                      <input name="facebook_url" defaultValue={settings.facebook_url} className="bg-white dark:bg-zinc-800 border-none rounded-lg p-3 text-sm" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-medium uppercase tracking-widest opacity-60">YouTube URL</label>
                      <input name="youtube_url" defaultValue={settings.youtube_url} className="bg-white dark:bg-zinc-800 border-none rounded-lg p-3 text-sm" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-medium uppercase tracking-widest opacity-60">Twitter URL</label>
                      <input name="twitter_url" defaultValue={settings.twitter_url} className="bg-white dark:bg-zinc-800 border-none rounded-lg p-3 text-sm" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-medium uppercase tracking-widest opacity-60">Instagram URL</label>
                      <input name="instagram_url" defaultValue={settings.instagram_url} className="bg-white dark:bg-zinc-800 border-none rounded-lg p-3 text-sm" />
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 p-6 bg-gray-50 dark:bg-zinc-900 rounded-2xl">
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-islamic-green" /> Contact Settings
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-xs font-medium uppercase tracking-widest opacity-60">Address</label>
                      <input name="contact_address" defaultValue={settings.contact_address} className="bg-white dark:bg-zinc-800 border-none rounded-lg p-3 text-sm" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-medium uppercase tracking-widest opacity-60">Email</label>
                      <input name="contact_email" defaultValue={settings.contact_email} className="bg-white dark:bg-zinc-800 border-none rounded-lg p-3 text-sm" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-medium uppercase tracking-widest opacity-60">Phone</label>
                      <input name="contact_phone" defaultValue={settings.contact_phone} className="bg-white dark:bg-zinc-800 border-none rounded-lg p-3 text-sm" />
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 p-6 bg-gray-50 dark:bg-zinc-900 rounded-2xl">
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-islamic-green" /> Pillars of the Movement
                  </h4>
                  <div className="space-y-6">
                    <div className="grid gap-4 p-4 bg-white dark:bg-zinc-800 rounded-xl">
                      <input name="pillar1_title" defaultValue={settings.pillar1_title} className="font-bold bg-transparent border-none p-0" placeholder="Pillar 1 Title" />
                      <textarea name="pillar1_text" defaultValue={settings.pillar1_text} className="text-sm bg-transparent border-none p-0 h-16" placeholder="Pillar 1 Text" />
                    </div>
                    <div className="grid gap-4 p-4 bg-white dark:bg-zinc-800 rounded-xl">
                      <input name="pillar2_title" defaultValue={settings.pillar2_title} className="font-bold bg-transparent border-none p-0" placeholder="Pillar 2 Title" />
                      <textarea name="pillar2_text" defaultValue={settings.pillar2_text} className="text-sm bg-transparent border-none p-0 h-16" placeholder="Pillar 2 Text" />
                    </div>
                    <div className="grid gap-4 p-4 bg-white dark:bg-zinc-800 rounded-xl">
                      <input name="pillar3_title" defaultValue={settings.pillar3_title} className="font-bold bg-transparent border-none p-0" placeholder="Pillar 3 Title" />
                      <textarea name="pillar3_text" defaultValue={settings.pillar3_text} className="text-sm bg-transparent border-none p-0 h-16" placeholder="Pillar 3 Text" />
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 p-6 bg-gray-50 dark:bg-zinc-900 rounded-2xl">
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" /> Donation Settings
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-xs font-medium uppercase tracking-widest opacity-60">Bank Name</label>
                      <input name="donation_bank_name" defaultValue={settings.donation_bank_name} className="bg-white dark:bg-zinc-800 border-none rounded-lg p-2 text-sm" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-medium uppercase tracking-widest opacity-60">Account Name</label>
                      <input name="donation_acc_name" defaultValue={settings.donation_acc_name} className="bg-white dark:bg-zinc-800 border-none rounded-lg p-2 text-sm" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-medium uppercase tracking-widest opacity-60">Account Number</label>
                      <input name="donation_acc_no" defaultValue={settings.donation_acc_no} className="bg-white dark:bg-zinc-800 border-none rounded-lg p-2 text-sm" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-medium uppercase tracking-widest opacity-60">bKash Number</label>
                      <input name="donation_bkash" defaultValue={settings.donation_bkash} className="bg-white dark:bg-zinc-800 border-none rounded-lg p-2 text-sm" />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-medium uppercase tracking-widest opacity-60">Nagad Number</label>
                      <input name="donation_nagad" defaultValue={settings.donation_nagad} className="bg-white dark:bg-zinc-800 border-none rounded-lg p-2 text-sm" />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSaving}
                  className="bg-islamic-green text-white px-6 py-4 rounded-xl font-bold w-full hover:bg-opacity-90 transition-all shadow-lg shadow-islamic-green/20 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save All Changes'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isRukonOpen, setIsRukonOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [leadership, setLeadership] = useState<LeadershipProfile[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [missionVision, setMissionVision] = useState<MissionVisionItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [visibleNews, setVisibleNews] = useState(6);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [selectedLeader, setSelectedLeader] = useState<LeadershipProfile | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    dataService.getNews().then(setNews).catch(e => console.error("News fetch failed", e));
    dataService.getLeadership().then(setLeadership).catch(e => console.error("Leadership fetch failed", e));
    dataService.getEvents().then(setEvents).catch(e => console.error("Events fetch failed", e));
    dataService.getSettings().then(setSettings).catch(e => console.error("Settings fetch failed", e));
    dataService.getBooks().then(setBooks).catch(e => console.error("Books fetch failed", e));
    dataService.getMissionVision().then(setMissionVision).catch(e => console.error("MissionVision fetch failed", e));
  }, []);

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <style>{`
        :root {
          --islamic-green: ${settings?.theme_color || '#006747'};
          --gold: ${settings?.accent_color || '#D4AF37'};
        }
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
        
        * {
          font-family: 'Hind Siliguri', sans-serif;
        }
        
        .font-serif {
          font-family: 'Playfair Display', serif;
        }

        /* Fix for Bengali numbers clarity */
        .bn-num {
          font-family: 'Hind Siliguri', sans-serif;
          font-feature-settings: "tnum";
          font-variant-numeric: tabular-nums;
        }

        .bg-islamic-green { background-color: var(--islamic-green); }
        .text-islamic-green { color: var(--islamic-green); }
        .border-islamic-green { border-color: var(--islamic-green); }
        .shadow-islamic-green\\/20 { --tw-shadow-color: var(--islamic-green); }
        .bg-gold { background-color: var(--gold); }
        .text-gold { color: var(--gold); }
        .border-gold { border-color: var(--gold); }
        .bg-islamic-green\\/20 { background-color: color-mix(in srgb, var(--islamic-green) 20%, transparent); }
        .bg-islamic-green\\/10 { background-color: color-mix(in srgb, var(--islamic-green) 10%, transparent); }
        .bg-islamic-green\\/5 { background-color: color-mix(in srgb, var(--islamic-green) 5%, transparent); }
        .border-islamic-green\\/30 { border-color: color-mix(in srgb, var(--islamic-green) 30%, transparent); }
        .border-islamic-green\\/10 { border-color: color-mix(in srgb, var(--islamic-green) 10%, transparent); }
        .bg-gold\\/10 { background-color: color-mix(in srgb, var(--gold) 10%, transparent); }
        .bg-gold\\/5 { background-color: color-mix(in srgb, var(--gold) 5%, transparent); }
        .border-gold\\/30 { border-color: color-mix(in srgb, var(--gold) 30%, transparent); }
        .border-gold\\/10 { border-color: color-mix(in srgb, var(--gold) 10%, transparent); }
      `}</style>
      <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300 selection:bg-islamic-green selection:text-white">
        {/* Scroll Progress Bar */}
        <div className="fixed top-0 left-0 w-full h-1 z-[60]">
          <div 
            className="h-full bg-gold transition-all duration-100" 
            style={{ width: `${scrollProgress}%` }}
          ></div>
        </div>

        <Navbar onSearch={(v) => console.log(v)} onAdminOpen={() => setIsAdminOpen(true)} onRukonOpen={() => setIsRukonOpen(true)} settings={settings} />

        <main>
          {/* Hero Section */}
          <section id="home" className="relative min-h-[85vh] flex items-center overflow-hidden bg-zinc-950">
            <div className="absolute inset-0 z-0">
              <img 
                src={settings?.hero_image_url || "https://picsum.photos/seed/rangpur-city/1920/1080"} 
                className="w-full h-full object-cover opacity-40 scale-105 animate-pulse-slow"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                >
                  <motion.span 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="inline-flex items-center gap-3 px-6 py-2 bg-gold border border-gold/30 text-zinc-950 text-sm font-black uppercase tracking-[0.4em] rounded-full mb-8 shadow-2xl shadow-gold/20"
                  >
                    <span className="w-3 h-3 bg-zinc-950 rounded-full animate-pulse"></span>
                    প্রতিষ্ঠাকাল: {settings?.establishment_year || '১৯৪১'}
                  </motion.span>
                  
                  <h2 className="text-6xl md:text-8xl font-black text-white leading-[0.9] mb-8 tracking-tighter">
                    {settings?.hero_title || 'বাংলাদেশ জামায়াতে ইসলামী, কোতোয়ালি থানা'}
                  </h2>
                  
                  <div className="flex items-center gap-6 mb-10">
                    <div className="h-20 w-1 bg-gold rounded-full"></div>
                    <div>
                      <p className="text-2xl md:text-3xl font-bold text-gray-200 mb-2">
                        {settings?.site_name || 'কোতোয়ালি থানা, রংপুর মহানগরী'}
                      </p>
                      <p className="text-lg text-gray-400 italic font-serif">
                        "{settings?.hero_subtitle || 'রংপুর মহানগরীর হৃদপিণ্ড ও আন্দোলনের অবিচল কাফেলা।'}"
                      </p>
                    </div>
                  </div>

                      <div className="flex flex-wrap gap-6 mb-12">
                        <a 
                          href={JSON.parse(settings?.join_links || '{}').worker || '#'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="group bg-islamic-green text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-islamic-green-dark transition-all shadow-2xl shadow-islamic-green/40 flex items-center gap-3"
                        >
                          আমাদের সাথে যোগ দিন
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </a>
                        <button 
                          onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
                          className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-white/20 transition-all"
                        >
                          সর্বশেষ কর্মসূচি
                        </button>
                      </div>

                      <div className="flex items-center gap-6">
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Social Connect:</span>
                        <div className="flex gap-4">
                          {settings?.facebook_url && (
                            <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center hover:bg-islamic-green hover:text-white transition-all border border-white/10">
                              <Facebook className="w-5 h-5" />
                            </a>
                          )}
                          {settings?.youtube_url && (
                            <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all border border-white/10">
                              <Youtube className="w-5 h-5" />
                            </a>
                          )}
                          {settings?.twitter_url && (
                            <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all border border-white/10">
                              <Twitter className="w-5 h-5" />
                            </a>
                          )}
                          {settings?.instagram_url && (
                            <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all border border-white/10">
                              <Instagram className="w-5 h-5" />
                            </a>
                          )}
                        </div>
                      </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="hidden lg:block relative"
                  >
                    <div className="space-y-8">
                      <PrayerTimesWidget />
                      <MultiCalendarWidget settings={settings} />
                    </div>
                  </motion.div>
                  {/* Decorative elements */}
                  <div className="absolute -top-20 -right-20 w-64 h-64 bg-islamic-green/20 rounded-full blur-[100px]"></div>
                  <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gold/10 rounded-full blur-[100px]"></div>
                </div>
              </div>
            
            {/* Scroll Indicator */}
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 flex flex-col items-center gap-2"
            >
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Scroll Down</span>
              <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent"></div>
            </motion.div>
          </section>

          {/* Vision Section (New) */}
          <section className="py-32 bg-white dark:bg-zinc-950 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-24 items-center">
                <div className="relative">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative z-10"
                  >
                    <img 
                      src={settings?.vision_image_url || "https://picsum.photos/seed/vision/800/1000"} 
                      className="rounded-[4rem] shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-12 -right-12 bg-islamic-green p-12 rounded-[3rem] shadow-2xl text-white max-w-xs">
                      <p className="text-4xl font-black mb-2">"ইনসাফ"</p>
                      <p className="text-sm opacity-80 leading-relaxed">
                        একটি ইনসাফপূর্ণ সমাজ বিনির্মাণে আমরা প্রতিটি পদক্ষেপে বদ্ধপরিকর।
                      </p>
                    </div>
                  </motion.div>
                  <div className="absolute -top-12 -left-12 w-48 h-48 border-[20px] border-gold/10 rounded-full"></div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                >
                  <span className="text-islamic-green font-black text-sm uppercase tracking-[0.4em] mb-6 block">Our Vision & Mission</span>
                  <h3 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white leading-tight mb-8">
                    {settings?.mission_text || 'একটি আধুনিক ও আদর্শিক সমাজ বিনির্মাণ।'}
                  </h3>
                  <div className="space-y-8">
                    {missionVision.length > 0 ? (
                      missionVision.sort((a, b) => a.order_index - b.order_index).map((mv, idx) => (
                        <div key={mv.id} className="flex gap-6">
                          <div className={`flex-shrink-0 w-12 h-12 ${idx % 2 === 0 ? 'bg-islamic-green/10 text-islamic-green' : 'bg-gold/10 text-gold'} rounded-2xl flex items-center justify-center font-bold text-xl`}>
                            {String(idx + 1).padStart(2, '০')}
                          </div>
                          <div>
                            <h4 className="text-xl font-bold mb-2">{mv.title}</h4>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                              {mv.content}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex gap-6">
                          <div className="flex-shrink-0 w-12 h-12 bg-islamic-green/10 rounded-2xl flex items-center justify-center text-islamic-green font-bold text-xl">
                            ০১
                          </div>
                          <div>
                            <h4 className="text-xl font-bold mb-2">{settings?.pillar1_title || 'আদর্শিক পুনর্গঠন'}</h4>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                              {settings?.pillar1_text || 'ব্যক্তি ও সমাজ জীবনে ইসলামের সুমহান আদর্শ প্রতিষ্ঠার মাধ্যমে একটি নৈতিক সমাজ গঠন।'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-6">
                          <div className="flex-shrink-0 w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center text-gold font-bold text-xl">
                            ০২
                          </div>
                          <div>
                            <h4 className="text-xl font-bold mb-2">{settings?.pillar2_title || 'সামাজিক ন্যায়বিচার'}</h4>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                              {settings?.pillar2_text || 'সকল প্রকার শোষণ ও অবিচারের অবসান ঘটিয়ে ইনসাফপূর্ণ রাষ্ট্র ব্যবস্থা কায়েম।'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-6">
                          <div className="flex-shrink-0 w-12 h-12 bg-islamic-green/10 rounded-2xl flex items-center justify-center text-islamic-green font-bold text-xl">
                            ০৩
                          </div>
                          <div>
                            <h4 className="text-xl font-bold mb-2">{settings?.pillar3_title || 'গণতান্ত্রিক অধিকার'}</h4>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                              {settings?.pillar3_text || 'জনগণের মৌলিক ও গণতান্ত্রিক অধিকার রক্ষায় রাজপথের আপোষহীন সংগ্রাম।'}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Events Section */}
          <section id="events" className="py-32 bg-white dark:bg-zinc-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-20">
                <span className="text-islamic-green font-black text-sm uppercase tracking-[0.4em] mb-4 block">Latest Programs</span>
                <h3 className="text-5xl font-black text-gray-900 dark:text-white mb-6">সর্বশেষ কর্মসূচি</h3>
                <div className="w-24 h-2 bg-gold mx-auto rounded-full"></div>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {events.map((event, idx) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-zinc-50 dark:bg-zinc-900 p-8 rounded-[3rem] border border-gray-100 dark:border-zinc-800 hover:shadow-2xl transition-all group"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-4 bg-islamic-green/10 rounded-2xl text-islamic-green">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Date</p>
                        <p className="font-bold text-gray-900 dark:text-white bn-num">{new Date(event.date).toLocaleDateString('bn-BD')}</p>
                      </div>
                    </div>
                    <h4 className="text-2xl font-black mb-4 group-hover:text-islamic-green transition-colors">{event.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                      {event.description}
                    </p>
                    <button className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-islamic-green group/btn">
                      Details <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <BookSection books={books} />

          {/* History Section */}
          <section className="py-24 bg-white dark:bg-zinc-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-3xl font-bold mb-6 text-islamic-green">আমাদের ঐতিহ্য ও বিবর্তন</h3>
                  <h4 className="text-xl font-bold mb-4">মহানগরীর নিউক্লিয়াস</h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6 text-lg">
                    রংপুর জেলা শাখা থেকে আলাদা হয়ে যখন রংপুর মহানগর জামায়াত একটি পূর্ণাঙ্গ সাংগঠনিক ইউনিটের মর্যাদা পায় (২০১১-২০১২), 
                    তখন থেকেই কোতোয়ালি থানা শাখা একটি শক্তিশালী ও আধুনিক ইউনিট হিসেবে পুনর্গঠিত হয়। সিটি কর্পোরেশন এলাকার প্রাণকেন্দ্র হওয়ায় 
                    এই থানাটি সংগঠনের রাজনৈতিক ও দাওয়াতী কার্যক্রমের মূল কেন্দ্রবিন্দু বা 'নিউক্লিয়াস' হিসেবে কাজ করে।
                  </p>
                </motion.div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <img src="https://picsum.photos/seed/hist1/400/500" className="rounded-2xl w-full h-64 object-cover" referrerPolicy="no-referrer" />
                    <img src="https://picsum.photos/seed/hist2/400/300" className="rounded-2xl w-full h-40 object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="space-y-4 pt-8">
                    <img src="https://picsum.photos/seed/hist3/400/300" className="rounded-2xl w-full h-40 object-cover" referrerPolicy="no-referrer" />
                    <img src="https://picsum.photos/seed/hist4/400/500" className="rounded-2xl w-full h-64 object-cover" referrerPolicy="no-referrer" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Three Pillars Section */}
          <section className="py-24 bg-gray-50 dark:bg-zinc-900/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h3 className="text-3xl font-bold mb-4">বিশেষ তিনটি স্তম্ভ</h3>
                <div className="w-20 h-1 bg-gold mx-auto rounded-full"></div>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    title: "মেধার সূতিকাগার",
                    subtitle: "Academic Strength",
                    desc: "উত্তরবঙ্গের শ্রেষ্ঠ বিদ্যাপীঠ কারমাইকেল কলেজ এবং রংপুর মেডিকেল কলেজ এই থানার আওতাভুক্ত। এখান থেকেই ছাত্র শিবিরের মাধ্যমে একদল দক্ষ, দেশপ্রেমিক ও আদর্শিক নেতৃত্ব তৈরি হয়ে মূল সংগঠনের হাল ধরেছে।",
                    icon: Users,
                    color: "bg-blue-500"
                  },
                  {
                    title: "গণমানুষের সেবায়",
                    subtitle: "Social Welfare",
                    desc: "আমরা কেবল রাজনীতিতে নয়, মানুষের সুখে-দুখে পাশে থাকাতে বিশ্বাসী। বিশেষ করে মাহিগঞ্জ ও ধাপ এলাকায় অসংখ্য মসজিদ, মাদরাসা এবং সামাজিক প্রতিষ্ঠানের মাধ্যমে আমরা সাধারণ মানুষের অতি আপনজনে পরিণত হয়েছি।",
                    icon: Heart,
                    color: "bg-red-500"
                  },
                  {
                    title: "রাজপথের আপোষহীন কাফেলা",
                    subtitle: "Movement",
                    desc: "৯০-এর দশকের ঐতিহাসিক এরশাদ বিরোধী আন্দোলন থেকে শুরু করে বর্তমান সময়ের প্রতিটি গণতান্ত্রিক ও জাতীয় সংকটে কোতোয়ালি থানা জামায়াত রংপুর মহানগরীর রাজপথে অগ্রণী ভূমিকা পালন করে আসছে।",
                    icon: Newspaper,
                    color: "bg-islamic-green"
                  }
                ].map((pillar, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all"
                  >
                    <div className={`w-12 h-12 ${pillar.color} text-white rounded-2xl flex items-center justify-center mb-6`}>
                      <pillar.icon className="w-6 h-6" />
                    </div>
                    <h4 className="text-xl font-bold mb-1">{pillar.title}</h4>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">{pillar.subtitle}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {pillar.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Leadership Section */}
          <section id="leadership" className="py-32 bg-zinc-50 dark:bg-zinc-900/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                <div className="max-w-2xl">
                  <span className="text-islamic-green font-black text-sm uppercase tracking-[0.4em] mb-4 block">Leadership & Discipline</span>
                  <h3 className="text-5xl font-black text-gray-900 dark:text-white mb-6">নেতৃত্ব ও শৃঙ্খলা</h3>
                  <p className="text-gray-500 text-lg leading-relaxed">
                    জামায়াতের স্বতন্ত্র বৈশিষ্ট্য হলো এর অভ্যন্তরীণ গণতন্ত্র। গঠনতন্ত্র অনুযায়ী কোনো ব্যক্তি পদের মোহ রাখে না।
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="p-4 bg-white dark:bg-zinc-800 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-700">
                    <Users className="w-8 h-8 text-islamic-green" />
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-12 gap-12 items-start">
                <div className="lg:col-span-4 space-y-8">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="bg-white dark:bg-zinc-800 p-10 rounded-[3rem] shadow-2xl shadow-islamic-green/5 border border-gray-100 dark:border-zinc-700 relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-islamic-green/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
                    <h4 className="text-2xl font-black mb-6 text-islamic-green">নির্বাচনী প্রক্রিয়া</h4>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                      প্রতি ১ বা ২ বছর অন্তর **'রুকন'**দের পবিত্র আমানত ও গোপন ভোটের মাধ্যমে অত্যন্ত স্বচ্ছ প্রক্রিয়ায় নেতৃত্ব নির্বাচিত হয়।
                    </p>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="bg-islamic-green text-white p-10 rounded-[3rem] shadow-2xl shadow-islamic-green/20 relative overflow-hidden group"
                  >
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
                    <h4 className="text-2xl font-black mb-6 text-gold">সাংগঠনিক বিন্যাস</h4>
                    <p className="text-white/80 leading-relaxed text-lg">
                      তৃণমূলের কাজকে বেগবান করতে থানাকে উত্তর ও দক্ষিণ জোন এবং বিভিন্ন ওয়ার্ড ইউনিটে ভাগ করা হয়েছে।
                    </p>
                  </motion.div>
                </div>

                <div className="lg:col-span-8 grid md:grid-cols-2 gap-8">
                  {leadership.map((lead, idx) => (
                    <motion.div 
                      key={lead.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.2 }}
                      className="bg-white dark:bg-zinc-800 rounded-[4rem] p-10 border border-gray-100 dark:border-zinc-700 shadow-xl hover:shadow-2xl transition-all duration-500 group"
                    >
                      <div className="text-center">
                        <div className="relative inline-block mb-10">
                          <div className="absolute inset-0 bg-gold rounded-[2.5rem] rotate-6 group-hover:rotate-12 transition-transform duration-500"></div>
                          <img 
                            src={lead.image_url} 
                            className="relative w-48 h-48 rounded-[2.5rem] object-cover border-8 border-white dark:border-zinc-800 mx-auto shadow-2xl" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-islamic-green rounded-2xl flex items-center justify-center text-white shadow-xl">
                            <Heart className="w-5 h-5" />
                          </div>
                        </div>
                        <h4 className="text-3xl font-black text-gray-900 dark:text-white mb-2">{lead.name}</h4>
                        <p className="text-islamic-green font-black text-xs uppercase tracking-[0.3em] mb-6">{lead.designation}</p>
                        <div className="relative px-6">
                          <span className="absolute top-0 left-0 text-6xl text-islamic-green/10 font-serif">"</span>
                          <p className="text-gray-600 dark:text-gray-400 italic text-lg leading-relaxed mb-8">
                            {lead.message}
                          </p>
                          <span className="absolute bottom-0 right-0 text-6xl text-islamic-green/10 font-serif rotate-180">"</span>
                        </div>
                        <button 
                          onClick={() => setSelectedLeader(lead)}
                          className="inline-flex items-center gap-3 text-sm font-black uppercase tracking-widest text-islamic-green hover:text-islamic-green-dark transition-colors group/btn"
                        >
                          View Biography 
                          <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* News Portal Section */}
          <section id="news" className="py-32 bg-white dark:bg-zinc-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                <div className="max-w-2xl">
                  <span className="text-islamic-green font-black text-sm uppercase tracking-[0.4em] mb-4 block">Kotha News Engine</span>
                  <h3 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6">নিউজ পোর্টাল</h3>
                  <p className="text-gray-500 text-lg leading-relaxed">
                    সংগঠনের সর্বশেষ কর্মসূচি, গুরুত্বপূর্ণ বিবৃতি এবং সামাজিক কর্মকাণ্ডের জীবন্ত আর্কাইভ।
                  </p>
                </div>
                <button 
                  onClick={() => {
                    const newsSection = document.getElementById('news');
                    if (newsSection) {
                      newsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                    setVisibleNews(news.length);
                  }}
                  className="group bg-zinc-100 dark:bg-zinc-800 text-gray-900 dark:text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-islamic-green hover:text-white transition-all flex items-center gap-3"
                >
                  View All Updates
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="grid md:grid-cols-12 gap-10">
                {/* Featured News */}
                {news.length > 0 && (
                  <motion.article 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="md:col-span-7 group relative h-[600px] rounded-[4rem] overflow-hidden shadow-2xl"
                  >
                    <img 
                      src={news[0].image_url} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-12">
                      <span className="inline-block px-4 py-1 bg-islamic-green text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-6">
                        {news[0].category}
                      </span>
                      <h4 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight group-hover:text-gold transition-colors">
                        {news[0].title}
                      </h4>
                      <div className="flex items-center gap-6 text-white/60 text-sm font-bold">
                        <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {new Date(news[0].created_at).toLocaleDateString('bn-BD')}</span>
                        <button 
                          onClick={() => setSelectedNews(news[0])}
                          className="text-white hover:text-gold transition-colors flex items-center gap-2"
                        >
                          বিস্তারিত পড়ুন <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.article>
                )}

                {/* Secondary News Grid */}
                <div className="md:col-span-5 grid gap-8">
                  {news.slice(1, visibleNews).map((item, idx) => (
                    <motion.article 
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => setSelectedNews(item)}
                      className="group flex gap-6 items-center bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 hover:shadow-xl transition-all cursor-pointer"
                    >
                      <div className="w-32 h-32 flex-shrink-0 rounded-3xl overflow-hidden">
                        <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <span className="text-islamic-green text-[10px] font-black uppercase tracking-widest mb-2 block">{item.category}</span>
                        <h5 className="font-black text-lg text-gray-900 dark:text-white line-clamp-2 group-hover:text-islamic-green transition-colors leading-tight mb-2">
                          {item.title}
                        </h5>
                        <time className="text-xs text-gray-400 font-bold">{new Date(item.created_at).toLocaleDateString('bn-BD')}</time>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </div>

              {visibleNews < news.length && (
                <div className="text-center mt-20">
                  <button 
                    onClick={() => setVisibleNews(prev => prev + 6)}
                    className="group px-12 py-5 bg-zinc-100 dark:bg-zinc-800 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-islamic-green hover:text-white transition-all flex items-center gap-3 mx-auto"
                  >
                    Load More News
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Donation Section */}
          <section id="donate" className="py-32 relative overflow-hidden" style={{ backgroundColor: settings?.support_bg_color || '#09090b' }}>
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-islamic-green rounded-full -translate-x-1/2 -translate-y-1/2 blur-[120px]"></div>
              <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gold rounded-full translate-x-1/2 translate-y-1/2 blur-[120px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="grid lg:grid-cols-2 gap-24 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <span className="text-gold font-black text-sm uppercase tracking-[0.4em] mb-6 block">Support the Movement</span>
                  <h3 className="text-6xl md:text-8xl font-black text-white mb-12 leading-tight">
                    আপনার অবদান <br />
                    <span className="text-islamic-green italic font-serif">পরিবর্তন</span> আনে।
                  </h3>
                  <p className="text-white text-3xl mb-20 leading-relaxed opacity-95 font-medium max-w-2xl">
                    একটি ইনসাফপূর্ণ সমাজ বিনির্মাণে আপনার ক্ষুদ্র অবদানও আমাদের শক্তি যোগায়। আমাদের সামাজিক ও দাওয়াতী কার্যক্রমে শরিক হোন।
                  </p>
                  
                  <div className="grid grid-cols-2 gap-12">
                    <div className="p-12 bg-white/10 rounded-[4rem] border border-white/20 backdrop-blur-2xl group hover:bg-white/20 transition-all duration-500">
                      <p className="text-7xl font-black text-white mb-6 bn-num">১০কে+</p>
                      <p className="text-white text-sm uppercase tracking-[0.4em] font-black opacity-70">পরিবার উপকৃত</p>
                    </div>
                    <div className="p-12 bg-islamic-green/20 rounded-[4rem] border border-islamic-green/30 backdrop-blur-2xl group hover:bg-islamic-green/30 transition-all duration-500">
                      <p className="text-7xl font-black text-white mb-6 bn-num">১০০%</p>
                      <p className="text-white text-sm uppercase tracking-[0.4em] font-black opacity-70">স্বচ্ছতা ও আমানত</p>
                    </div>
                  </div>
                </motion.div>

                <div className="space-y-8">
                  {settings && (
                    <>
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="p-10 bg-white dark:bg-zinc-900 rounded-[3rem] shadow-2xl relative overflow-hidden group"
                      >
                        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                          <CreditCard className="w-40 h-40" />
                        </div>
                        <div className="flex items-center gap-6 mb-8">
                          <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center">
                            <CreditCard className="w-7 h-7 text-blue-500" />
                          </div>
                          <div>
                            <h4 className="text-2xl font-black">Bank Transfer</h4>
                            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">{settings.donation_bank_name}</p>
                          </div>
                        </div>
                        <div className="grid gap-6">
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-1">Account Name</p>
                            <p className="text-lg font-bold">{settings.donation_acc_name}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-1">Account Number</p>
                            <p className="text-3xl font-mono font-black text-islamic-green tracking-tighter">{settings.donation_acc_no}</p>
                          </div>
                        </div>
                      </motion.div>

                      <div className="grid md:grid-cols-2 gap-8">
                        <motion.div 
                          whileHover={{ y: -10 }}
                          className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-zinc-800"
                        >
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-pink-50 dark:bg-pink-900/20 rounded-2xl flex items-center justify-center">
                              <Smartphone className="w-6 h-6 text-pink-500" />
                            </div>
                            <h5 className="font-black text-xl">bKash</h5>
                          </div>
                          <p className="text-2xl font-mono font-black text-pink-600 mb-1">{settings.donation_bkash}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Personal Number</p>
                        </motion.div>

                        <motion.div 
                          whileHover={{ y: -10 }}
                          className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-zinc-800"
                        >
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center">
                              <Smartphone className="w-6 h-6 text-orange-500" />
                            </div>
                            <h5 className="font-black text-xl">Nagad</h5>
                          </div>
                          <p className="text-2xl font-mono font-black text-orange-600 mb-1">{settings.donation_nagad}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Personal Number</p>
                        </motion.div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Calendar Section */}
          <section id="events" className="py-32 bg-white dark:bg-zinc-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-24 items-center">
                <div>
                  <span className="text-islamic-green font-black text-sm uppercase tracking-[0.4em] mb-6 block">Upcoming Programs</span>
                  <h3 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-8 leading-tight">
                    আমাদের <br />
                    <span className="text-islamic-green italic font-serif">কর্মসূচি</span> সমূহ।
                  </h3>
                  <p className="text-gray-500 text-xl mb-12 leading-relaxed">
                    সংগঠনের নিয়মিত সেমিনার, সামাজিক কাজ এবং শিক্ষা শিবিরের আপডেট পেতে আমাদের ক্যালেন্ডার অনুসরণ করুন।
                  </p>
                  
                  <div className="space-y-6">
                    {events.map((event, idx) => (
                      <motion.div 
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex gap-8 items-center p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-[2rem] border border-gray-100 dark:border-zinc-800 hover:shadow-lg transition-all group"
                      >
                        <div className="flex-shrink-0 w-20 h-20 bg-white dark:bg-zinc-800 rounded-2xl shadow-lg flex flex-col items-center justify-center border border-gray-100 dark:border-zinc-700 group-hover:bg-islamic-green group-hover:text-white transition-colors">
                          <span className="text-2xl font-black">{new Date(event.date).getDate()}</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                            {new Date(event.date).toLocaleString('default', { month: 'short' })}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-xl font-black mb-1 group-hover:text-islamic-green transition-colors">{event.title}</h4>
                          <p className="text-gray-500 text-sm flex items-center gap-2">
                            <Clock className="w-4 h-4" /> {event.time} • {event.location}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="text-white pt-32 pb-12 relative overflow-hidden" style={{ backgroundColor: settings?.footer_bg_color || '#09090b' }}>
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-12 gap-20 mb-24">
              <div className="lg:col-span-5">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-islamic-green rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-islamic-green/20">
                    JI
                  </div>
                  <div>
                    <h2 className="text-2xl font-black leading-tight">{settings?.site_name || 'বাংলাদেশ জামায়াতে ইসলামী'}</h2>
                    <p className="text-xs uppercase tracking-[0.3em] font-bold text-gray-500">কোতোয়ালি থানা, রংপুর</p>
                  </div>
                </div>
                <p className="text-white text-2xl leading-relaxed mb-12 max-w-md font-medium opacity-90">
                  {settings?.about_text || 'একটি ইনসাফপূর্ণ সমাজ বিনির্মাণে আমরা বদ্ধপরিকর। আমাদের লক্ষ্য ইসলামের সুমহান আদর্শের ভিত্তিতে একটি নৈতিক ও সমৃদ্ধ বাংলাদেশ গঠন।'}
                </p>
                <div className="flex gap-4">
                  {settings?.facebook_url && (
                    <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-islamic-green transition-all border border-white/10">
                      <Facebook className="w-6 h-6" />
                    </a>
                  )}
                  {settings?.youtube_url && (
                    <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-red-600 transition-all border border-white/10">
                      <Youtube className="w-6 h-6" />
                    </a>
                  )}
                  {settings?.twitter_url && (
                    <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-sky-500 transition-all border border-white/10">
                      <Twitter className="w-6 h-6" />
                    </a>
                  )}
                  {settings?.instagram_url && (
                    <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-pink-600 transition-all border border-white/10">
                      <Instagram className="w-6 h-6" />
                    </a>
                  )}
                </div>
              </div>

              <div className="lg:col-span-7 grid sm:grid-cols-3 gap-12">
                <div>
                  <h5 className="font-black mb-8 uppercase tracking-[0.3em] text-xs text-gold">Quick Links</h5>
                  <ul className="space-y-5 text-white font-black text-base opacity-90">
                    <li><a href="#" className="hover:text-islamic-green transition-colors">আমাদের সম্পর্কে</a></li>
                    <li><a href="#news" className="hover:text-islamic-green transition-colors">নিউজ পোর্টাল</a></li>
                    <li><a href="#leadership" className="hover:text-islamic-green transition-colors">নেতৃত্ব</a></li>
                    <li><a href="#donate" className="hover:text-islamic-green transition-colors">দান করুন</a></li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-black mb-10 uppercase tracking-[0.4em] text-sm text-gold">Resources</h5>
                  <ul className="space-y-5 text-white font-black text-base opacity-90">
                    <li><a href="#" className="hover:text-islamic-green transition-colors">গঠনতন্ত্র</a></li>
                    <li><a href="#" className="hover:text-islamic-green transition-colors">প্রকাশনা</a></li>
                    <li><a href="#" className="hover:text-islamic-green transition-colors">ভিডিও গ্যালারি</a></li>
                    <li><a href="#" className="hover:text-islamic-green transition-colors">সদস্য ফরম</a></li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-black mb-10 uppercase tracking-[0.4em] text-sm text-gold">Contact</h5>
                  <ul className="space-y-8 text-white font-black text-base opacity-90">
                    <li className="flex gap-5">
                      <MapPin className="w-6 h-6 text-islamic-green flex-shrink-0" />
                      <span>{settings?.contact_address || 'কোতোয়ালি থানা অফিস, রংপুর মহানগরী'}</span>
                    </li>
                    <li className="flex gap-5">
                      <Mail className="w-6 h-6 text-islamic-green flex-shrink-0" />
                      <span>{settings?.contact_email || 'info@ji-rangpur.org'}</span>
                    </li>
                    <li className="flex gap-5">
                      <Phone className="w-6 h-6 text-islamic-green flex-shrink-0" />
                      <span>{settings?.contact_phone || '+৮৮০ ১XXX XXXXXX'}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                © 2026 Jamaat-e-Islami Kotwali Thana. Crafted for Excellence.
              </p>
              <div className="flex items-center gap-8">
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)} 
                  className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest"
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
                <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-gray-600">
                  <a href="#" className="hover:text-white transition-colors">Privacy</a>
                  <a href="#" className="hover:text-white transition-colors">Terms</a>
                  <button onClick={() => setIsAdminOpen(true)} className="hover:text-white transition-colors">Admin</button>
                </div>
              </div>
            </div>
          </div>
        </footer>

        <AnimatePresence>
          {isAdminOpen && <AdminDashboard onClose={() => setIsAdminOpen(false)} />}
          {selectedNews && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white dark:bg-zinc-900 w-full max-w-4xl max-h-[90vh] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col"
              >
                <div className="relative h-64 md:h-96">
                  <img src={selectedNews.image_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <button 
                    onClick={() => setSelectedNews(null)}
                    className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-md text-white rounded-2xl hover:bg-red-500 transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-8 left-8 right-8">
                    <span className="px-3 py-1 bg-islamic-green text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-4 inline-block">
                      {selectedNews.category}
                    </span>
                    <h3 className="text-3xl md:text-4xl font-black text-white leading-tight">{selectedNews.title}</h3>
                  </div>
                </div>
                <div className="p-10 overflow-y-auto">
                  <div className="flex items-center gap-6 text-gray-400 text-sm font-bold mb-8 border-b border-gray-100 dark:border-zinc-800 pb-8">
                    <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {new Date(selectedNews.created_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Kotwali Thana Media</span>
                  </div>
                  <div className="prose dark:prose-invert max-w-none">
                    <div className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
                      {selectedNews.content}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
          {selectedLeader && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white dark:bg-zinc-900 w-full max-w-3xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row"
              >
                <div className="md:w-1/3 bg-islamic-green/5 p-8 flex flex-col items-center justify-center border-r border-gray-100 dark:border-zinc-800">
                  <img src={selectedLeader.image_url} className="w-48 h-48 rounded-[2.5rem] object-cover shadow-2xl mb-6" referrerPolicy="no-referrer" />
                  <h3 className="text-2xl font-black text-center">{selectedLeader.name}</h3>
                  <p className="text-islamic-green font-black text-xs uppercase tracking-widest mt-2">{selectedLeader.designation}</p>
                </div>
                <div className="md:w-2/3 p-12 relative">
                  <button 
                    onClick={() => setSelectedLeader(null)}
                    className="absolute top-6 right-6 p-3 bg-gray-100 dark:bg-zinc-800 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <div className="prose dark:prose-invert max-w-none">
                    <h4 className="text-xl font-black mb-6 text-islamic-green">Biography & Message</h4>
                    <div className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap text-lg">
                      {selectedLeader.bio || selectedLeader.message || 'Biography not available.'}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <RukonDashboard isOpen={isRukonOpen} onClose={() => setIsRukonOpen(false)} settings={settings} />
      </div>
    </div>
  );
}
