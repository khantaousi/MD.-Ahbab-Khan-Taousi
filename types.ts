
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
}

export interface GalleryItem {
  id: string;
  image: string;
  title: string;
}

export interface Skill {
  id: string;
  name: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

export interface Notice {
  text: string;
  updatedAt: string;
}

export interface JobExperience {
  id: string;
  companyName: string;
  website: string;
  logoUrl: string;
  duration: string;
  description: string;
}

export interface EventData {
  title: string;
  subtitle: string;
  animationType: 'float' | 'pulse' | 'none';
  theme: 'auto' | 'islamic' | 'party' | 'minimal';
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
  theme: 'neon' | 'gold' | 'rose' | 'emerald';
  layout: 'default' | 'minimal' | 'brutalist' | 'split';
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
  showLiveChat: boolean;
  showEventSection: boolean;
  whatsappNumber: string;
  socialLinks: SocialLink[];
  projects: Project[];
  gallery: GalleryItem[];
  skills: Skill[];
  jobExperiences: JobExperience[];
  notice: Notice;
  event: EventData;
}

export interface AuthState {
  isLoggedIn: boolean;
}
