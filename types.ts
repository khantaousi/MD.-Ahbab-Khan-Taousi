
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

export interface Product {
  id: string;
  name: string;
  amount: string;
  currency: string;
  description: string;
  image: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  productId: string;
  productName: string;
  productImage?: string; // Added for better identification
  customerName: string;
  customerContact: string;
  customerCountry: string;
  timestamp: string;
  status: OrderStatus; // Added status field
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
  // Visibility Controls
  showAbout: boolean;
  showSkills: boolean;
  showBlog: boolean;
  showGallery: boolean;
  showContact: boolean;
  showClock: boolean;
  showNotice: boolean;
  showWork: boolean;
  showProducts: boolean;
  socialLinks: SocialLink[];
  projects: Project[];
  gallery: GalleryItem[];
  skills: Skill[];
  notice: Notice;
  products: Product[];
  orders: Order[];
}

export interface AuthState {
  isLoggedIn: boolean;
}
