import { browser } from '$app/environment';

export type Locale = 'en' | 'th' | 'tw';

const translations = {
  en: {
    nav_events: 'EVENTS',
    nav_menu: 'MENU',
    menu_home: 'Home',
    menu_about: 'About',
    menu_works: 'Works',
    menu_upcoming: 'Upcoming',
    menu_partnership: 'Partnership',
    menu_contact: 'Contact',
    ev_eyebrow: 'Ticketing & Shows',
    ev_title: 'Upcoming Events',
    ev_tickets: 'TICKETS',
    ev_status_available: 'AVAILABLE',
    ev_status_sold_out: 'SOLD OUT',
    ev_status_limited: 'LIMITED',
    ev_footer: 'Curated with love by One Heart Productions.',
    home_marquee: 'Trusted By Global Partners',
    story_words: ["BRINGING", "THE", "BEST", "OF", "GLOBAL", "DRAG", "EXPERIENCES", "TO", "ASIA."],
    story_highlight: 'POWER AS ONE.'
  },
  th: {
    nav_events: 'อีเวนต์',
    nav_menu: 'เมนู',
    menu_home: 'หน้าแรก',
    menu_about: 'เกี่ยวกับเรา',
    menu_works: 'ผลงาน',
    menu_upcoming: 'กำหนดการ',
    menu_partnership: 'ร่วมเป็นพันธมิตร',
    menu_contact: 'ติดต่อเรา',
    ev_eyebrow: 'รอบการแสดงและจำหน่ายบัตร',
    ev_title: 'อีเวนต์ที่กำลังจะเกิดขึ้น',
    ev_tickets: 'ซื้อบัตร',
    ev_status_available: 'เปิดจำหน่าย',
    ev_status_sold_out: 'SOLD OUT',
    ev_status_limited: 'เหลือจำกัด',
    ev_footer: 'สร้างสรรค์ประสบการณ์โดย One Heart Productions',
    home_marquee: 'ได้รับความไว้วางใจจากพันธมิตรระดับโลก',
    story_words: ["ยกระดับ", "ประสบการณ์", "โชว์แดร็ก", "ระดับโลก", "สู่ภูมิภาค", "เอเชีย"],
    story_highlight: 'POWER AS ONE.'
  },
  tw: {
    nav_events: '活動盛事',
    nav_menu: '選單',
    menu_home: '首頁',
    menu_about: '關於我們',
    menu_works: '作品集',
    menu_upcoming: '近期盛事',
    menu_partnership: '合作夥伴',
    menu_contact: '聯繫我們',
    ev_eyebrow: '演出與票務',
    ev_title: '近期盛事',
    ev_tickets: '立即購票',
    ev_status_available: '熱賣中',
    ev_status_sold_out: '已售罄',
    ev_status_limited: '即將售罄',
    ev_footer: '由 One Heart Productions 精心策劃',
    home_marquee: '深受全球合作夥伴信賴',
    story_words: ["將", "全球", "頂級", "變裝秀", "體驗", "引進", "亞洲"],
    story_highlight: 'POWER AS ONE.'
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

  t(key: keyof typeof translations.en) {
    return translations[this.currentLocale][key] || translations.en[key];
  }
}

export const i18n = new I18nManager();
