
export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: any;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  titleBn?: string;
  descriptionBn?: string;
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
  proficiency?: number;
  description?: string;
  nameBn?: string;
  descriptionBn?: string;
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
}

export interface JobExperience {
  id: string;
  companyName: string;
  website: string;
  logoUrl: string;
  duration: string;
  description: string;
  durationBn?: string;
  descriptionBn?: string;
}

export interface EventData {
  title: string;
  subtitle: string;
  titleBn?: string;
  subtitleBn?: string;
  animationType: 'float' | 'pulse' | 'none';
  theme: 'auto' | 'islamic' | 'party' | 'minimal';
}

export interface SEOData {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  favicon?: string;
  metaTitleBn?: string;
  metaDescriptionBn?: string;
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
  title: string;
  bio: string;
  currentWork: string;
  profileImage: string;
  aboutText: string;
  email: string;
  phone: string;
  nameBn?: string;
  titleBn?: string;
  bioBn?: string;
  currentWorkBn?: string;
  aboutTextBn?: string;
  theme: 'neon' | 'gold' | 'rose' | 'emerald';
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
  logoUrl?: string;
  whatsappNumber: string;
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
