
import { PortfolioData } from './types';

// Unique Sync ID for your portfolio. 
// Anyone using this same ID will see the same data.
export const CLOUD_SYNC_CONFIG = {
  BUCKET_ID: "ahbab_portfolio_v1_global",
  API_URL: "https://kvdb.io/An9rXmU8j8P7rPq8q8q8/data"
};

export const INITIAL_DATA: PortfolioData = {
  name: "John Doe",
  title: "Professional Web Developer",
  bio: "I am an experienced web developer and designer. I love learning new things and creating great digital solutions.",
  profileImage: "https://picsum.photos/400/400",
  aboutText: "Write details about yourself here. Discuss your work style, goals, and experience.",
  email: "example@mail.com",
  phone: "+880 1234 567 890",
  socialLinks: [
    { id: "1", platform: "GitHub", url: "https://github.com" },
    { id: "2", platform: "LinkedIn", url: "https://linkedin.com" },
    { id: "3", platform: "Facebook", url: "https://facebook.com" }
  ],
  projects: [
    {
      id: "1",
      title: "Blog Post 1",
      description: "Write a summary of your first blog post here.",
      image: "https://picsum.photos/600/400?random=1",
      link: "#"
    },
    {
      id: "2",
      title: "Blog Post 2",
      description: "Write an attractive description of your second blog post here.",
      image: "https://picsum.photos/600/400?random=2",
      link: "#"
    }
  ],
  skills: [
    { id: "1", name: "React" },
    { id: "2", name: "Tailwind CSS" },
    { id: "3", name: "TypeScript" },
    { id: "4", name: "Node.js" }
  ]
};

export const TRANSLATIONS = {
  en: {
    navAbout: "About",
    navBlog: "Blog",
    navContact: "Contact",
    navAdmin: "Admin",
    heroWelcome: "Welcome to my digital profile",
    heroIam: "I am",
    heroEmailBtn: "Send Email",
    heroStatus: "Available Now",
    clockLabel: "Bangladesh Time",
    skillsHeader: "Skills",
    aboutHeader: "About Me",
    blogHeader: "My Blog",
    blogReadMore: "Read More",
    blogDesc: "I regularly share my thoughts on various technology and lifestyle topics here.",
    contactHeader: "About Me",
    contactSub: "If you have any project or idea you want to work on, you can contact me directly.",
    contactEmailLabel: "Email Me",
    contactPhoneLabel: "Call Me",
    contactSocialLabel: "Social Networks",
    footerAdmin: "Admin Dashboard",
    loginHeader: "Admin Login",
    loginSub: "Access Dashboard",
    loginIdLabel: "User ID",
    loginPassLabel: "Password",
    loginBtn: "Login",
    loginBack: "Back to Home",
    adminHeader: "Admin Control",
    adminSub: "Management System",
    adminMenu: "Content Menu",
    adminBasic: "Basic Info",
    adminSkills: "Skills",
    adminBlog: "My Blog",
    adminContact: "Contact Info",
    adminDeploy: "Cloud Sync",
    adminSave: "Publish Globally",
    adminSaving: "Publishing...",
    adminSaved: "Published Live!",
    adminLogout: "Logout",
    adminViewSite: "View Website",
    adminNewSkill: "New Skill",
    adminNewPost: "New Post",
    adminNewLink: "New Link",
    deployTitle: "Cloud Configuration",
    deployDesc: "Your data is automatically synced to the cloud. Anyone with your website link will see these changes immediately.",
    deployStatus: "Sync Status: Active",
    deploySyncId: "Sync ID",
    syncLoading: "Syncing from cloud...",
    syncError: "Sync failed. Using offline data."
  },
  bn: {
    navAbout: "সম্পর্কে",
    navBlog: "ব্লগ",
    navContact: "যোগাযোগ",
    navAdmin: "অ্যাডমিন",
    heroWelcome: "স্বাগতম আমার ডিজিটাল প্রোফাইলে",
    heroIam: "আমি",
    heroEmailBtn: "ইমেইল পাঠান",
    heroStatus: "এখন এভেইলেবল",
    clockLabel: "বাংলাদেশ সময়",
    skillsHeader: "দক্ষতাসমূহ",
    aboutHeader: "আমার সম্পর্কে",
    blogHeader: "মাই ব্লগ",
    blogReadMore: "আরো পড়ুন",
    blogDesc: "নিয়মিত প্রযুক্তি এবং জীবনযাত্রার বিভিন্ন বিষয়ে আমার চিন্তাধারা শেয়ার করি এখানে।",
    contactHeader: "আমার সম্পর্কে",
    contactSub: "আপনার যদি কোনো প্রজেক্ট বা আইডিয়া থাকে যা নিয়ে আপনি কাজ করতে চান, সরাসরি আমার সাথে যোগাযোগ করতে পারেন।",
    contactEmailLabel: "ইমেইল করুন",
    contactPhoneLabel: "সরাসরি কল",
    contactSocialLabel: "সোশ্যাল নেটওয়ার্ক",
    footerAdmin: "অ্যাডমিন ড্যাশবোর্ড",
    loginHeader: "অ্যাডমিন লগইন",
    loginSub: "ড্যাশবোর্ড অ্যাক্সেস করুন",
    loginIdLabel: "ইউজার আইডি",
    loginPassLabel: "পাসওয়ার্ড",
    loginBtn: "লগইন",
    loginBack: "হোমপেজে ফিরুন",
    adminHeader: "অ্যাডমিন কন্ট্রোল",
    adminSub: "ম্যানেজমেন্ট সিস্টেম",
    adminMenu: "কন্টেন্ট মেনু",
    adminBasic: "সাধারণ তথ্য",
    adminSkills: "দক্ষতাসমূহ",
    adminBlog: "মাই ব্লগ",
    adminContact: "যোগাযোগ তথ্য",
    adminDeploy: "ক্লাউড সিঙ্ক",
    adminSave: "গ্লোবাল পাবলিশ",
    adminSaving: "পাবলিশ হচ্ছে...",
    adminSaved: "লাইভ হয়েছে!",
    adminLogout: "লগ আউট",
    adminViewSite: "ওয়েবসাইট ভিউ",
    adminNewSkill: "নতুন দক্ষতা",
    adminNewPost: "নতুন পোস্ট",
    adminNewLink: "নতুন লিংক",
    deployTitle: "ক্লাউড কনফিগারেশন",
    deployDesc: "আপনার সব পরিবর্তন এখন ক্লাউড ডাটাবেসে সেভ হবে। যারা আপনার সাইট ভিজিট করবে তারা সবাই সাথে সাথে পরিবর্তনগুলো দেখতে পাবে।",
    deployStatus: "সিঙ্ক স্ট্যাটাস: একটিভ",
    deploySyncId: "সিঙ্ক আইডি",
    syncLoading: "ক্লাউড থেকে ডাটা আসছে...",
    syncError: "সিঙ্ক ব্যর্থ হয়েছে। অফলাইন ডাটা ব্যবহার করা হচ্ছে।"
  }
};

export const ADMIN_CREDENTIALS = {
  id: "Admin",
  password: "Ahbab85565"
};
