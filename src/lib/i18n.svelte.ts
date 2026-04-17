import { browser } from '$app/environment';

export type Locale = 'en' | 'th' | 'tw';

const translations = {
  en: {
    // Navigation
    nav_events: 'EVENTS',
    nav_menu: 'MENU',
    
    // Menu
    menu_home: 'Home',
    menu_about: 'About',
    menu_works: 'Works',
    menu_upcoming: 'Upcoming',
    menu_partnership: 'Partnership',
    menu_contact: 'Contact',
    
    // Events Panel
    ev_eyebrow: 'Ticketing & Shows',
    ev_title: 'Upcoming Events',
    ev_tickets: 'TICKETS',
    ev_status_available: 'AVAILABLE',
    ev_status_sold_out: 'SOLD OUT',
    ev_status_limited: 'LIMITED',
    ev_footer: 'A One Heart Productions Experience',
    ev_view_timeline: 'Timeline',
    ev_view_by_artist: 'By Artist',
    
    // Hero Section
    hero_eyebrow: 'Power As One',
    hero_title_line1: 'ONE HEART',
    hero_title_line2: 'PRODUCTIONS',
    
    // Featured Toast
    toast_eyebrow: 'UPCOMING SHOW',
    toast_cta: 'DISCOVER',
    
    // Home Marquee
    home_marquee: 'GLOBAL PARTNERS',
    
    // Story Section
    story_words: ["BRINGING", "THE", "BEST", "OF", "GLOBAL", "DRAG", "EXPERIENCES", "TO", "ASIA"],
    story_highlight: 'POWER AS ONE',
    
    // Page Titles
    page_about: 'About',
    page_contact: 'Contact',
    page_upcoming: 'Upcoming',
    page_partnership: 'Partnership / Booking',
    page_press: 'Press / Media Kit',
    page_projects: 'Projects / Tours',
    page_team: 'Team / Founders',
    
    // Accessibility / Misc
    video_fallback: 'Your browser does not support the video tag.',
    aria_close_menu: 'Close menu',
    aria_open_menu: 'Open menu',
    aria_open_events: 'Open events',
    aria_close_events: 'Close events',
    nav_main: 'Main Navigation',
    nav_upcoming_events: 'Upcoming Events',
  },
  th: {
    // Navigation
    nav_events: 'อีเวนต์',
    nav_menu: 'เมนู',
    
    // Menu
    menu_home: 'หน้าแรก',
    menu_about: 'เกี่ยวกับ',
    menu_works: 'ผลงาน',
    menu_upcoming: 'อีเวนต์',
    menu_partnership: 'พาร์ทเนอร์',
    menu_contact: 'ติดต่อ',
    
    // Events Panel
    ev_eyebrow: 'รอบการแสดงและจำหน่ายบัตร',
    ev_title: 'อีเวนต์ที่กำลังจะเกิดขึ้น',
    ev_tickets: 'ซื้อบัตร',
    ev_status_available: 'ซื้อบัตร',
    ev_status_sold_out: 'SOLD OUT',
    ev_status_limited: 'ใกล้หมด',
    ev_footer: 'โดย One Heart Productions',
    ev_view_timeline: 'ไทม์ไลน์',
    ev_view_by_artist: 'ตามศิลปิน',
    
    // Hero Section
    hero_eyebrow: 'Power As One',
    hero_title_line1: 'ONE HEART',
    hero_title_line2: 'PRODUCTIONS',
    
    // Featured Toast
    toast_eyebrow: 'อีเวนต์ที่กำลังจะมาถึง',
    toast_cta: 'ดูรายละเอียด',
    
    // Home Marquee
    home_marquee: 'พันธมิตรระดับโลก',
    
    // Story Section
    story_words: ["ที่สุด", "แห่ง", "ประสบการณ์", "แดร็ก", "ระดับโลก", "สู่", "เอเชีย"],
    story_highlight: 'POWER AS ONE',
    
    // Page Titles
    page_about: 'เกี่ยวกับเรา',
    page_contact: 'ติดต่อ',
    page_upcoming: 'อีเวนต์ที่กำลังจะเกิดขึ้น',
    page_partnership: 'พาร์ทเนอร์ / จอง',
    page_press: 'สื่อ / ชุดข้อมูล',
    page_projects: 'โปรเจกต์ / ทัวร์',
    page_team: 'ทีม / ผู้ก่อตั้ง',
    
    // Accessibility / Misc
    video_fallback: 'เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอ',
    aria_close_menu: 'ปิดเมนู',
    aria_open_menu: 'เปิดเมนู',
    aria_open_events: 'เปิดอีเวนต์',
    aria_close_events: 'ปิดอีเวนต์',
    nav_main: 'เมนูหลัก',
    nav_upcoming_events: 'อีเวนต์ที่กำลังจะเกิดขึ้น',
  },
  tw: {
    // Navigation
    nav_events: '活動',
    nav_menu: '選單',
    
    // Menu
    menu_home: '首頁',
    menu_about: '關於',
    menu_works: '作品',
    menu_upcoming: '盛事',
    menu_partnership: '合作',
    menu_contact: '聯絡',
    
    // Events Panel
    ev_eyebrow: '演出與票務',
    ev_title: '近期盛事',
    ev_tickets: '立即預訂',
    ev_status_available: '立即預訂',
    ev_status_sold_out: '已售罄',
    ev_status_limited: '即將完售',
    ev_footer: '由 One Heart Productions 策劃',
    ev_view_timeline: '時間軸',
    ev_view_by_artist: '依藝人',
    
    // Hero Section
    hero_eyebrow: 'Power As One',
    hero_title_line1: 'ONE HEART',
    hero_title_line2: 'PRODUCTIONS',
    
    // Featured Toast
    toast_eyebrow: '即將登場',
    toast_cta: '了解更多',
    
    // Home Marquee
    home_marquee: '全球合作夥伴',
    
    // Story Section
    story_words: ["將", "世界級", "變裝體驗", "帶到", "亞洲"],
    story_highlight: 'POWER AS ONE',
    
    // Page Titles
    page_about: '關於我們',
    page_contact: '聯絡我們',
    page_upcoming: '近期盛事',
    page_partnership: '合作 / 預約',
    page_press: '媒體 / 新聞資料',
    page_projects: '專案 / 巡迴',
    page_team: '團隊 / 創辦人',
    
    // Accessibility / Misc
    video_fallback: '您的瀏覽器不支援影片播放',
    aria_close_menu: '關閉選單',
    aria_open_menu: '開啟選單',
    aria_open_events: '開啟活動',
    aria_close_events: '關閉活動',
    nav_main: '主選單',
    nav_upcoming_events: '近期盛事',
  }
};

class I18nManager {
  currentLocale: Locale = $state(
    (browser && (localStorage.getItem('lang') as Locale)) || 'en'
  );

  setLocale(locale: Locale) {
    this.currentLocale = locale;
    if (browser) {
      localStorage.setItem('lang', locale);
    }
  }

  t(key: keyof typeof translations.en): string {
    const value = translations[this.currentLocale][key] ?? translations.en[key];
    return Array.isArray(value) ? value.join(' ') : value;
  }
  
  tArray(key: 'story_words'): string[] {
    const value = translations[this.currentLocale][key] ?? translations.en[key];
    return Array.isArray(value) ? value : [];
  }
}

export const i18n = new I18nManager();
