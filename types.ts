
export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
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

export interface PortfolioData {
  name: string;
  title: string;
  bio: string;
  profileImage: string;
  aboutText: string;
  email: string;
  phone: string;
  socialLinks: SocialLink[];
  projects: Project[];
  skills: Skill[];
}

export interface AuthState {
  isLoggedIn: boolean;
}
