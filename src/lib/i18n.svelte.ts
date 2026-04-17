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
    ev_footer: 'A One Heart Productions Experience',
    home_marquee: 'GLOBAL PARTNERS',
    story_words: ["BRINGING", "THE", "BEST", "OF", "GLOBAL", "DRAG", "EXPERIENCES", "TO", "ASIA."],
    story_highlight: 'POWER AS ONE.'
  },
  th: {
    nav_events: 'อีเวนต์',
    nav_menu: 'เมนู',
    menu_home: 'หน้าแรก',
    menu_about: 'เกี่ยวกับ',
    menu_works: 'ผลงาน',
    menu_upcoming: 'อีเวนต์',
    menu_partnership: 'พาร์ทเนอร์',
    menu_contact: 'ติดต่อ',
    ev_eyebrow: 'รอบการแสดงและจำหน่ายบัตร',
    ev_title: 'อีเวนต์ที่กำลังจะเกิดขึ้น',
    ev_tickets: 'ซื้อบัตร',
    ev_status_available: 'ซื้อบัตร',
    ev_status_sold_out: 'SOLD OUT',
    ev_status_limited: 'ใกล้หมด',
    ev_footer: 'โดย One Heart Productions',
    home_marquee: 'พันธมิตรระดับโลก',
    story_words: ["ที่สุด", "แห่ง", "ประสบการณ์", "แดร็ก", "ระดับโลก", "สู่", "เอเชีย"],
    story_highlight: 'POWER AS ONE.'
  },
  tw: {
    nav_events: '活動',
    nav_menu: '選單',
    menu_home: '首頁',
    menu_about: '關於',
    menu_works: '作品',
    menu_upcoming: '盛事',
    menu_partnership: '合作',
    menu_contact: '聯絡',
    ev_eyebrow: '演出與票務',
    ev_title: '近期盛事',
    ev_tickets: '立即預訂',
    ev_status_available: '立即預訂',
    ev_status_sold_out: '已售罄',
    ev_status_limited: '即將完售',
    ev_footer: '由 One Heart Productions 策劃',
    home_marquee: '全球合作夥伴',
    story_words: ["將", "世界級", "變裝體驗", "帶到", "亞洲"],
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
