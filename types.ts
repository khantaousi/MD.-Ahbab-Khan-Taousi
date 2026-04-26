
export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: any;
}

export interface Project {
  id: string;
  title: string;
  titleBn?: string;
  description: string;
  descriptionBn?: string;
  image: string;
  link: string;
}

export interface GalleryItem {
  id: string;
  image: string;
  title: string;
  titleBn?: string;
}

export interface Skill {
  id: string;
  name: string;
  nameBn?: string;
  proficiency?: number;
  description?: string;
  descriptionBn?: string;
  category?: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

export interface Notice {
  text: string;
  updatedAt: string;
  speed?: number;
  isAuto?: boolean;
}

export interface JobExperience {
  id: string;
  companyName: string;
  website: string;
  logoUrl: string;
  duration: string;
  durationBn?: string;
  description: string;
  descriptionBn?: string;
}

export interface EventData {
  title: string;
  titleBn?: string;
  subtitle: string;
  subtitleBn?: string;
  animationType: 'float' | 'pulse' | 'none';
  theme: 'auto' | 'islamic' | 'party' | 'minimal';
  isAuto?: boolean;
}

export interface SEOData {
  metaTitle: string;
  metaTitleBn?: string;
  metaDescription: string;
  metaDescriptionBn?: string;
  metaKeywords: string;
  favicon?: string;
}

export type OrderStatus = 'pending' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  customerName: string;
  contact: string;
  country: string;
  productTitle: string;
  status: OrderStatus;
  timestamp: string;
}

export interface PortfolioData {
  name: string;
  nameBn?: string;
  title: string;
  titleBn?: string;
  bio: string;
  bioBn?: string;
  currentWork: string;
  currentWorkBn?: string;
  profileImage: string;
  aboutText: string;
  aboutTextBn?: string;
  email: string;
  phone: string;
  theme: 'neon' | 'gold' | 'rose' | 'emerald' | 'custom';
  customColor?: string;
  layout: 'default' | 'minimal' | 'brutalist' | 'split' | 'classic';
  // Visibility Controls
  showAbout: boolean;
  showSkills: boolean;
  showBlog: boolean;
  showGallery: boolean;
  showContact: boolean;
  showClock: boolean;
  showNotice: boolean;
  showWork: boolean;
  showJobExperience: boolean;
  showEventSection: boolean;
  showSkillsChart: boolean;
  showAIChatBot?: boolean;
  showFileTransfer?: boolean;
  logoUrl?: string;
  whatsappNumber: string;
  countryCode?: string;
  timezone?: string;
  socialLinks: SocialLink[];
  projects: Project[];
  gallery: GalleryItem[];
  skills: Skill[];
  jobExperiences: JobExperience[];
  orders?: Order[];
  notice: Notice;
  event: EventData;
  seo: SEOData;
}

export interface AuthState {
  isLoggedIn: boolean;
}
