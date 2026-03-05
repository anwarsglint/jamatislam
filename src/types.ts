export interface NewsItem {
  id: number;
  title: string;
  content: string;
  category: string;
  image_url: string;
  video_url: string;
  created_at: string;
}

export interface LeadershipProfile {
  id: number;
  name: string;
  designation: string;
  bio: string;
  image_url: string;
  message: string;
}

export interface SiteSettings {
  site_name: string;
  hero_title: string;
  hero_subtitle: string;
  establishment_year: string;
  about_text: string;
  mission_text: string;
  contact_address: string;
  contact_email: string;
  contact_phone: string;
  theme_color: string;
  accent_color: string;
  donation_bank_name: string;
  donation_acc_name: string;
  donation_acc_no: string;
  donation_bkash: string;
  donation_nagad: string;
  pillar1_title: string;
  pillar1_text: string;
  pillar2_title: string;
  pillar2_text: string;
  pillar3_title: string;
  pillar3_text: string;
  logo_url: string;
  hero_image_url: string;
  rukon_password: string;
  rukon_dashboard_links: string;
  join_links: string;
  hijri_offset: string;
  facebook_url: string;
  youtube_url: string;
  twitter_url: string;
  instagram_url: string;
  vision_image_url: string;
  support_bg_color: string;
  footer_bg_color: string;
  [key: string]: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  cover_url: string;
  content: string;
  created_at: string;
}

export interface EventItem {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
}

export interface MissionVisionItem {
  id: number;
  title: string;
  content: string;
  icon_type: string;
  order_index: number;
}
