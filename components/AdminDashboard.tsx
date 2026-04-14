import React, { useState, useEffect } from 'react';
import { PortfolioData, Project, Skill, SocialLink, GalleryItem, JobExperience, OrderStatus } from '../types';
import { THEME_OPTIONS, CURRENCY_SYMBOLS } from '../constants';
import { auth } from '../firebase';
import { updatePassword, updateEmail, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { 
  Save, LogOut, Plus, Trash2, Camera, Link as LinkIcon, 
  FileText, Layout, Info, BookOpen, Shield, Cloud, RefreshCw, 
  Image as ImageIcon, Bell, Clock, Briefcase, ShoppingBag, 
  ListChecks, Activity, User, Code, X, ChevronRight, CheckCircle2, AlertCircle,
  Phone, Mail, Sparkles, Lock, Globe, BarChart, Eraser, Loader2, Share2, Copy,
  Facebook, Github, Linkedin, Twitter, Instagram, Youtube, MessageCircle, Languages,
  Eye, EyeOff
} from 'lucide-react';
import { removeBackground } from "@imgly/background-removal";
import ProfileImageUploader from './ProfileImageUploader';
import VisitorAnalytics from './VisitorAnalytics';
import EventSection from './EventSection';

interface AdminDashboardProps {
  data: PortfolioData;
  onUpdate: (newData: PortfolioData) => void;
  onLogout: () => void;
  lang: string;
  t: any;
}

const SOCIAL_PLATFORMS = [
  'Facebook', 'GitHub', 'LinkedIn', 'Twitter', 'Instagram', 'YouTube', 'WhatsApp', 'Globe', 'Other'
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ data, onUpdate, onLogout, lang, t }) => {
  const [formData, setFormData] = useState<PortfolioData>(data);
  const [activeTab, setActiveTab] = useState<'basic' | 'about' | 'skills' | 'blog' | 'gallery' | 'notice' | 'contact' | 'visibility' | 'jobExperience' | 'event' | 'security' | 'seo' | 'analytics'>('basic');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [passwordError, setPasswordError] = useState('');

  const [newEmail, setNewEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [emailError, setEmailError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    setShowWelcome(true);
    const timer = setTimeout(() => setShowWelcome(false), 5000);
    return () => clearTimeout(timer);
  }, []);
  
  const currentThemeColor = formData.theme === 'custom' 
    ? (formData.customColor || '#0ea5e9') 
    : (THEME_OPTIONS.find(th => th.id === formData.theme)?.color || '#0ea5e9');

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-800' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 33, label: lang === 'bn' ? 'দুর্বল' : 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { score: 66, label: lang === 'bn' ? 'মাঝারি' : 'Normal', color: 'bg-yellow-500' };
    return { score: 100, label: lang === 'bn' ? 'শক্তিশালী' : 'Hard', color: 'bg-green-500' };
  };

  const compressImage = (base64: string, maxWidth = 800, quality = 0.7): Promise<string> => {
    if (!base64 || !base64.startsWith('data:image')) return Promise.resolve(base64);
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
        }
        // Use webp to preserve transparency and keep size small
        resolve(canvas.toDataURL('image/webp', quality));
      };
      img.onerror = () => resolve(base64);
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setHasUnsavedChanges(true);
  };

  const handleToggle = (name: keyof PortfolioData) => {
    setFormData(prev => ({ ...prev, [name]: !prev[name] }));
    setHasUnsavedChanges(true);
  };

  const handleSEOChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      seo: { ...prev.seo, [name]: value }
    }));
    setHasUnsavedChanges(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'logo' | 'blog' | 'gallery' | 'job', id?: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const compressed = await compressImage(base64, (type === 'job' || type === 'logo') ? 200 : 800, type === 'logo' ? 0.9 : 0.7);
        
        if (type === 'profile') setFormData(prev => ({ ...prev, profileImage: compressed }));
        if (type === 'logo') setFormData(prev => ({ ...prev, logoUrl: compressed }));
        if (type === 'blog' && id) updateBlogPost(id, 'image', compressed);
        if (type === 'gallery' && id) updateGalleryItem(id, 'image', compressed);
        if (type === 'job' && id) updateJobExperience(id, 'logoUrl', compressed);
        setHasUnsavedChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogoBackground = async () => {
    if (!formData.logoUrl) return;
    
    setIsRemovingBackground(true);
    try {
      // Fetch the image to get a blob if it's a URL, or use the base64 directly
      const response = await removeBackground(formData.logoUrl, {
        progress: (key, current, total) => {
          console.log(`Background removal progress: ${key} ${current}/${total}`);
        }
      });
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        // Don't compress with low quality for logo to keep transparency clean
        const compressed = await compressImage(base64, 200, 0.9);
        setFormData(prev => ({ ...prev, logoUrl: compressed }));
        setHasUnsavedChanges(true);
        setIsRemovingBackground(false);
      };
      reader.readAsDataURL(response);
    } catch (error) {
      console.error('Failed to remove background:', error);
      setIsRemovingBackground(false);
      alert('Failed to remove background. Please try again or use a different image.');
    }
  };

  const copyBlogLink = (id: string) => {
    const url = `${window.location.origin}/#blog-${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      // Compress all images in formData before saving to ensure we stay under Firestore limits
      const compressedData = { ...formData };
      
      if (compressedData.profileImage && compressedData.profileImage.startsWith('data:image')) {
        compressedData.profileImage = await compressImage(compressedData.profileImage);
      }

      if (compressedData.logoUrl && compressedData.logoUrl.startsWith('data:image')) {
        compressedData.logoUrl = await compressImage(compressedData.logoUrl, 200);
      }
      
      if (compressedData.projects) {
        compressedData.projects = await Promise.all(compressedData.projects.map(async p => ({
          ...p,
          image: p.image.startsWith('data:image') ? await compressImage(p.image) : p.image
        })));
      }
      
      if (compressedData.gallery) {
        compressedData.gallery = await Promise.all(compressedData.gallery.map(async i => ({
          ...i,
          image: i.image.startsWith('data:image') ? await compressImage(i.image) : i.image
        })));
      }

      if (compressedData.jobExperiences) {
        compressedData.jobExperiences = await Promise.all(compressedData.jobExperiences.map(async j => ({
          ...j,
          logoUrl: j.logoUrl.startsWith('data:image') ? await compressImage(j.logoUrl, 200) : j.logoUrl
        })));
      }

      await onUpdate(compressedData);
      setFormData(compressedData);
      setSaveStatus('saved');
      setHasUnsavedChanges(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) { 
      setSaveStatus('idle'); 
      alert(lang === 'bn' ? "পাবলিশ করতে সমস্যা হয়েছে!" : "Publish failed!");
    }
  };

  const handleLogoutClick = async () => {
    await auth.signOut();
    onLogout();
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      setEmailError(lang === 'bn' ? 'সঠিক ইমেইল দিন' : 'Please enter a valid email');
      setEmailStatus('error');
      return;
    }
    if (!currentPassword) {
      setEmailError(lang === 'bn' ? 'বর্তমান পাসওয়ার্ড দিন' : 'Please enter current password');
      setEmailStatus('error');
      return;
    }

    setEmailStatus('saving');
    try {
      if (auth.currentUser && auth.currentUser.email) {
        const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updateEmail(auth.currentUser, newEmail);
        setEmailStatus('success');
        setNewEmail('');
        setCurrentPassword('');
        setTimeout(() => setEmailStatus('idle'), 3000);
      }
    } catch (error: any) {
      console.error(error);
      let errorMessage = error.message;
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = lang === 'bn' ? 'ভুল পাসওয়ার্ড' : 'Incorrect password';
      }
      setEmailError(errorMessage);
      setEmailStatus('error');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError(lang === 'bn' ? 'পাসওয়ার্ড মিলছে না' : 'Passwords do not match');
      setPasswordStatus('error');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError(lang === 'bn' ? 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে' : 'Password must be at least 6 characters');
      setPasswordStatus('error');
      return;
    }
    if (!currentPassword) {
      setPasswordError(lang === 'bn' ? 'বর্তমান পাসওয়ার্ড দিন' : 'Please enter current password');
      setPasswordStatus('error');
      return;
    }

    setPasswordStatus('saving');
    try {
      if (auth.currentUser && auth.currentUser.email) {
        const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(auth.currentUser, newPassword);
        setPasswordStatus('success');
        setNewPassword('');
        setConfirmPassword('');
        setCurrentPassword('');
        setTimeout(() => setPasswordStatus('idle'), 3000);
      } else {
        throw new Error('No user logged in');
      }
    } catch (error: any) {
      console.error(error);
      let errorMessage = error.message;
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = lang === 'bn' ? 'ভুল পাসওয়ার্ড' : 'Incorrect password';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = lang === 'bn' ? 'নিরাপত্তার কারণে আপনাকে আবার লগইন করতে হবে' : 'Please re-login to change password for security reasons';
      }
      setPasswordError(errorMessage);
      setPasswordStatus('error');
    }
  };

  // Blog Actions
  const addBlogPost = () => {
    const newPost: Project = { id: Date.now().toString(), title: "New Blog Post", description: "Content here...", image: "https://picsum.photos/600/400", link: "#" };
    setFormData(prev => ({ ...prev, projects: [...(prev.projects || []), newPost] }));
    setHasUnsavedChanges(true);
  };

  const updateBlogPost = (id: string, field: keyof Project, value: string) => {
    setFormData(prev => ({ ...prev, projects: (prev.projects || []).map(p => p.id === id ? { ...p, [field]: value } : p) }));
    setHasUnsavedChanges(true);
  };

  const removeBlogPost = (id: string) => {
    setFormData(prev => ({ ...prev, projects: (prev.projects || []).filter(p => p.id !== id) }));
    setHasUnsavedChanges(true);
  };

  // Skill Actions
  const addSkill = () => {
    const newSkill: Skill = { id: Date.now().toString(), name: "New Skill", proficiency: 80 };
    setFormData(prev => ({ ...prev, skills: [...(prev.skills || []), newSkill] }));
    setHasUnsavedChanges(true);
  };

  const updateSkill = (id: string, field: keyof Skill, value: string | number) => {
    setFormData(prev => ({ ...prev, skills: (prev.skills || []).map(s => s.id === id ? { ...s, [field]: value } : s) }));
    setHasUnsavedChanges(true);
  };

  const removeSkill = (id: string) => {
    setFormData(prev => ({ ...prev, skills: (prev.skills || []).filter(s => s.id !== id) }));
    setHasUnsavedChanges(true);
  };

  // Gallery Actions
  const addGalleryItem = () => {
    const newItem: GalleryItem = { id: Date.now().toString(), image: "https://picsum.photos/800/800", title: "New Memory" };
    setFormData(prev => ({ ...prev, gallery: [...(prev.gallery || []), newItem] }));
    setHasUnsavedChanges(true);
  };

  const updateGalleryItem = (id: string, field: keyof GalleryItem, value: string) => {
    setFormData(prev => ({ ...prev, gallery: (prev.gallery || []).map(i => i.id === id ? { ...i, [field]: value } : i) }));
    setHasUnsavedChanges(true);
  };

  const removeGalleryItem = (id: string) => {
    setFormData(prev => ({ ...prev, gallery: (prev.gallery || []).filter(i => i.id !== id) }));
    setHasUnsavedChanges(true);
  };

  // Social Link Actions
  const addSocialLink = () => {
    const newSocial: SocialLink = { id: Date.now().toString(), platform: "GitHub", url: "https://" };
    setFormData(prev => ({ ...prev, socialLinks: [...(prev.socialLinks || []), newSocial] }));
    setHasUnsavedChanges(true);
  };

  const updateSocialLink = (id: string, field: keyof SocialLink, value: string) => {
    setFormData(prev => ({ ...prev, socialLinks: (prev.socialLinks || []).map(l => l.id === id ? { ...l, [field]: value } : l) }));
    setHasUnsavedChanges(true);
  };

  const removeSocialLink = (id: string) => {
    setFormData(prev => ({ ...prev, socialLinks: (prev.socialLinks || []).filter(l => l.id !== id) }));
    setHasUnsavedChanges(true);
  };

  // Job Experience Actions
  const addJobExperience = () => {
    const newJob: JobExperience = { id: Date.now().toString(), companyName: "New Company", website: "https://", logoUrl: "https://picsum.photos/100/100", duration: "1 year", description: "Role" };
    setFormData(prev => ({ ...prev, jobExperiences: [...(prev.jobExperiences || []), newJob] }));
    setHasUnsavedChanges(true);
  };

  const updateJobExperience = (id: string, field: keyof JobExperience, value: string) => {
    setFormData(prev => ({ ...prev, jobExperiences: (prev.jobExperiences || []).map(j => j.id === id ? { ...j, [field]: value } : j) }));
    setHasUnsavedChanges(true);
  };

  const removeJobExperience = (id: string) => {
    setFormData(prev => ({ ...prev, jobExperiences: (prev.jobExperiences || []).filter(j => j.id !== id) }));
    setHasUnsavedChanges(true);
  };

  // Order Actions
  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setFormData(prev => ({
      ...prev,
      orders: (prev.orders || []).map(o => o.id === id ? { ...o, status } : o)
    }));
    setHasUnsavedChanges(true);
  };

  const removeOrder = (id: string) => {
    setFormData(prev => ({ ...prev, orders: (prev.orders || []).filter(o => o.id !== id) }));
    setHasUnsavedChanges(true);
  };

  const VisibilityToggle = ({ label, field }: { label: string, field: keyof PortfolioData }) => (
    <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-white/20 transition-all">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{label}</span>
      <button 
        onClick={() => handleToggle(field)}
        className={`w-14 h-7 rounded-full transition-all relative ${formData[field] ? 'bg-cyan-500' : 'bg-slate-800'}`}
        style={formData[field] ? { backgroundColor: currentThemeColor } : {}}
      >
        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${formData[field] ? 'left-8' : 'left-1'}`}></div>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      {showWelcome && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="glass border border-white/10 px-8 py-4 rounded-full shadow-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: currentThemeColor }}>
              <Sparkles size={16} className="text-slate-950" />
            </div>
            <span className="font-black uppercase tracking-[0.2em] text-xs">Welcome Chief</span>
          </div>
        </div>
      )}
      <header className="glass border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Shield size={20} style={{ color: currentThemeColor }} />
            <div>
                <h1 className="text-lg font-black">{t.adminHeader}</h1>
                <p className="text-[8px] text-slate-500 uppercase tracking-widest">{hasUnsavedChanges ? (lang === 'bn' ? "পরিবর্তনগুলো সেভ করা হয়নি" : "Unsaved Changes") : t.adminSub}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saveStatus === 'saving'} className="flex items-center gap-2 px-6 py-3 rounded-full font-black text-[9px] uppercase tracking-widest h-10 transition-all active:scale-95" style={{ backgroundColor: currentThemeColor, color: '#000' }}>
              {saveStatus === 'saving' ? <RefreshCw className="animate-spin" size={14} /> : <Cloud size={14} />} 
              {saveStatus === 'saving' ? t.adminSaving : t.adminSave}
            </button>
            <button onClick={handleLogoutClick} className="w-10 h-10 flex items-center justify-center bg-slate-900 hover:bg-red-500 rounded-2xl transition-all"><LogOut size={18} /></button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid md:grid-cols-[260px_1fr] gap-8">
        <aside className="glass rounded-[32px] p-4 border border-white/10 space-y-1.5 shadow-3xl h-fit sticky top-28">
            {[
              { id: 'basic', label: t.adminBasic, icon: <Info size={16} /> },
              { id: 'analytics', label: lang === 'bn' ? 'অ্যানালিটিক্স' : 'Analytics', icon: <BarChart size={16} /> },
              { id: 'visibility', label: t.adminVisibility, icon: <Activity size={16} /> },
              { id: 'contact', label: t.adminContact, icon: <Phone size={16} /> },
              { id: 'notice', label: t.adminNotice, icon: <Bell size={16} /> },
              { id: 'about', label: t.aboutHeader, icon: <FileText size={16} /> },
              { id: 'blog', label: t.adminBlog, icon: <BookOpen size={16} /> },
              { id: 'gallery', label: t.adminGallery, icon: <ImageIcon size={16} /> },
              { id: 'skills', label: t.adminSkills, icon: <Layout size={16} /> },
              { id: 'jobExperience', label: t.adminJobExperience, icon: <Briefcase size={16} /> },
              { id: 'event', label: t.adminEvent, icon: <Sparkles size={16} /> },
              { id: 'seo', label: t.adminSEO || (lang === 'bn' ? 'এসইও সেটিংস' : 'SEO Settings'), icon: <Cloud size={16} /> },
              { id: 'security', label: lang === 'bn' ? 'নিরাপত্তা সেটিংস' : 'Security Settings', icon: <Lock size={16} /> },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all text-[9px] font-black uppercase tracking-widest ${activeTab === tab.id ? 'text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`} style={activeTab === tab.id ? { backgroundColor: currentThemeColor } : {}}>
                {tab.icon} {tab.label}
              </button>
            ))}
        </aside>

        <main className="glass rounded-[40px] p-8 border border-white/10 shadow-3xl overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-hide">
          
          {/* Analytics */}
          {activeTab === 'analytics' && (
            <VisitorAnalytics currentThemeColor={currentThemeColor} lang={lang} />
          )}

          {/* 1. Basic Identity */}
          {activeTab === 'basic' && (
            <div className="space-y-8 animate-in fade-in">
               <h2 className="text-2xl font-black">{t.adminBasic}</h2>
               <div className="flex flex-col lg:flex-row gap-10">
                  <div className="w-full lg:w-auto shrink-0">
                    <ProfileImageUploader 
                      currentImage={formData.profileImage} 
                      onImageUpdate={(base64) => {
                        setFormData(prev => ({ ...prev, profileImage: base64 }));
                        setHasUnsavedChanges(true);
                      }} 
                      t={t} 
                    />
                  </div>
                  <div className="flex-1 space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Display Name</label>
                      <input name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 font-bold focus:border-cyan-500/50 outline-none" placeholder="Name" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Professional Title</label>
                      <input name="title" value={formData.title} onChange={handleChange} className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 font-bold focus:border-cyan-500/50 outline-none" placeholder="Title" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Short Catchy Bio</label>
                      <textarea name="bio" value={formData.bio} onChange={handleChange} className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 h-32 focus:border-cyan-500/50 outline-none resize-none" placeholder="Bio" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Company / Status</label>
                      <input name="currentWork" value={formData.currentWork} onChange={handleChange} className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 font-bold focus:border-cyan-500/50 outline-none" placeholder="Current Workplace" />
                    </div>
                  </div>
               </div>

               <div className="pt-6 border-t border-white/5">
                  <h3 className="text-sm font-black uppercase tracking-widest mb-6">{t.adminTheme}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {THEME_OPTIONS.map(theme => (
                      <button 
                        key={theme.id} 
                        onClick={() => { setFormData(prev => ({ ...prev, theme: theme.id as any })); setHasUnsavedChanges(true); }}
                        className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${formData.theme === theme.id ? 'border-white bg-white/10' : 'border-white/5 bg-slate-900/50'}`}
                      >
                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.color }}></div>
                        <span className="text-[10px] font-black uppercase tracking-tighter">{theme.name}</span>
                      </button>
                    ))}
                    <button 
                      onClick={() => { setFormData(prev => ({ ...prev, theme: 'custom' })); setHasUnsavedChanges(true); }}
                      className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${formData.theme === 'custom' ? 'border-white bg-white/10' : 'border-white/5 bg-slate-900/50'}`}
                    >
                      <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center overflow-hidden" style={{ backgroundColor: formData.customColor || '#ffffff' }}>
                        {formData.theme === 'custom' && <div className="w-2 h-2 bg-white rounded-full shadow-lg"></div>}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-tighter">{lang === 'bn' ? 'কাস্টম' : 'Custom'}</span>
                    </button>
                  </div>

                  {formData.theme === 'custom' && (
                    <div className="mt-6 p-6 bg-white/5 rounded-3xl border border-white/10 animate-in fade-in slide-in-from-top-2">
                       <div className="flex flex-col md:flex-row items-center gap-6">
                          <div className="relative group">
                             <input 
                               type="color" 
                               value={formData.customColor || '#0ea5e9'} 
                               onChange={(e) => { setFormData(prev => ({ ...prev, customColor: e.target.value })); setHasUnsavedChanges(true); }}
                               className="w-20 h-20 rounded-2xl cursor-pointer bg-transparent border-none outline-none"
                             />
                             <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <Sparkles size={20} className="text-white mix-blend-difference" />
                             </div>
                          </div>
                          <div className="flex-1 space-y-2">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hex Color Code</label>
                             <div className="flex gap-2">
                                <input 
                                  type="text" 
                                  value={formData.customColor || '#0ea5e9'} 
                                  onChange={(e) => { setFormData(prev => ({ ...prev, customColor: e.target.value })); setHasUnsavedChanges(true); }}
                                  className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 font-mono text-xs uppercase outline-none focus:border-white/30"
                                  placeholder="#000000"
                                />
                                <div className="w-10 h-10 rounded-xl border border-white/10" style={{ backgroundColor: formData.customColor || '#0ea5e9' }}></div>
                             </div>
                          </div>
                       </div>
                    </div>
                  )}
               </div>


            </div>
          )}

          {/* 2. Visibility Controls */}
          {activeTab === 'visibility' && (
            <div className="space-y-8 animate-in fade-in">
               <h2 className="text-2xl font-black">{t.adminVisibility}</h2>
               <div className="grid md:grid-cols-2 gap-4">
                 <VisibilityToggle label={t.visLabelAbout} field="showAbout" />
                 <VisibilityToggle label={t.visLabelSkills} field="showSkills" />
                 <VisibilityToggle label={t.visLabelBlog} field="showBlog" />
                 <VisibilityToggle label={t.visLabelGallery} field="showGallery" />
                 <VisibilityToggle label={t.visLabelNotice} field="showNotice" />
                 <VisibilityToggle label={t.visLabelClock} field="showClock" />
                 <VisibilityToggle label={t.visLabelWork} field="showWork" />
                 <VisibilityToggle label={t.visLabelContact} field="showContact" />
                 <VisibilityToggle label={t.visLabelJobExperience} field="showJobExperience" />
                 <VisibilityToggle label={t.visLabelEvent} field="showEventSection" />
                 <VisibilityToggle label={lang === 'bn' ? 'স্কিল চার্ট দেখান' : 'Show Skills Chart'} field="showSkillsChart" />
               </div>
            </div>
          )}

          {/* 3. Skills */}
          {activeTab === 'skills' && (
            <div className="space-y-8 animate-in fade-in">
               <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-black">{t.adminSkills}</h2>
                  <button onClick={addSkill} className="bg-white/5 px-6 py-2 rounded-full border border-white/10 font-black text-[9px] uppercase hover:bg-white/10 transition-all">
                    <Plus size={14} className="inline mr-1" /> {t.adminNewSkill}
                  </button>
               </div>
               <div className="grid grid-cols-1 gap-4">
                  {formData.skills.map(skill => (
                    <div key={skill.id} className="bg-white/5 p-6 rounded-[32px] border border-white/5 focus-within:border-cyan-500/30 transition-all space-y-4">
                       <div className="flex items-center gap-4">
                         <Code size={18} style={{ color: currentThemeColor }} />
                         <div className="flex-1">
                            <input 
                              value={skill.name} 
                              onChange={(e) => updateSkill(skill.id, 'name', e.target.value)} 
                              className="w-full bg-transparent border-b border-white/10 outline-none font-black text-base" 
                              placeholder="Skill name" 
                            />
                         </div>
                         <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
                           <input 
                             type="number" 
                             value={skill.proficiency || 80} 
                             onChange={(e) => updateSkill(skill.id, 'proficiency', parseInt(e.target.value))} 
                             className="w-10 bg-transparent outline-none text-xs text-center font-bold" 
                             placeholder="%" 
                             min="0" 
                             max="100"  
                           />
                           <span className="text-[10px] font-black opacity-40">%</span>
                         </div>
                         <button onClick={() => removeSkill(skill.id)} className="text-red-500/50 hover:text-red-500 p-2 transition-colors"><Trash2 size={18} /></button>
                       </div>
                       <div className="w-full">
                          <textarea 
                            value={skill.description || ''} 
                            onChange={(e) => updateSkill(skill.id, 'description', e.target.value)} 
                            className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-cyan-500/20 resize-none h-20" 
                            placeholder="Description" 
                          />
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* 4. Job Experience */}
          {activeTab === 'jobExperience' && (
            <div className="space-y-8 animate-in fade-in">
               <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-black">{t.adminJobExperience}</h2>
                  <button onClick={addJobExperience} className="bg-white/5 px-6 py-2 rounded-full border border-white/10 font-black text-[9px] uppercase hover:bg-white/10 transition-all">
                    <Plus size={14} className="inline mr-1" /> {t.adminNewJob}
                  </button>
               </div>
               <div className="space-y-6">
                  {formData.jobExperiences.map(job => (
                    <div key={job.id} className="bg-white/5 rounded-[32px] p-6 border border-white/5 flex flex-col md:flex-row gap-6">
                       <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 shrink-0 relative group">
                          <img src={job.logoUrl} className="w-full h-full object-cover" />
                           <label className="absolute inset-0 flex items-center justify-center bg-slate-950/70 opacity-0 group-hover:opacity-100 cursor-pointer transition-all">
                              <Camera size={24} />
                              <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'job', job.id)} />
                           </label>
                       </div>
                       <div className="flex-1 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <input value={job.companyName} onChange={(e) => updateJobExperience(job.id, 'companyName', e.target.value)} className="bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 font-black text-sm outline-none" placeholder="Company Name" />
                             <input value={job.website} onChange={(e) => updateJobExperience(job.id, 'website', e.target.value)} className="bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 font-mono text-xs outline-none" placeholder="Website URL" />
                             <input value={job.duration} onChange={(e) => updateJobExperience(job.id, 'duration', e.target.value)} className="bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 font-bold text-sm outline-none" placeholder="Duration" />
                             <input value={job.logoUrl} onChange={(e) => updateJobExperience(job.id, 'logoUrl', e.target.value)} className="bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 font-mono text-xs outline-none" placeholder="Logo URL" />
                          </div>
                          <div className="w-full">
                            <textarea value={job.description} onChange={(e) => updateJobExperience(job.id, 'description', e.target.value)} className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm outline-none resize-none h-24" placeholder="Description" />
                          </div>
                       </div>
                       <button onClick={() => removeJobExperience(job.id)} className="text-red-500/50 hover:text-red-500 p-2 h-fit"><Trash2 size={20} /></button>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* 6. Notice */}
          {activeTab === 'notice' && (
            <div className="space-y-8 animate-in fade-in">
               <h2 className="text-2xl font-black">{t.adminNotice}</h2>
               <div className="bg-white/5 rounded-[40px] p-10 border border-white/10 space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                     <Bell size={24} className="animate-bounce" style={{ color: currentThemeColor }} />
                     <h3 className="text-sm font-black uppercase tracking-widest">Global Broadcast Text</h3>
                  </div>
                  <textarea 
                    value={formData.notice?.text || ''} 
                    onChange={(e) => {
                      setFormData(prev => ({ 
                        ...prev, 
                        notice: { ...prev.notice, text: e.target.value, updatedAt: new Date().toISOString() } 
                      }));
                      setHasUnsavedChanges(true);
                    }} 
                    className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-5 font-bold text-sm focus:border-cyan-500/50 outline-none h-44 resize-none" 
                    placeholder="Enter urgent update or welcome message..." 
                  />
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scroll Speed (Seconds)</label>
                     <input 
                       type="number" 
                       value={formData.notice?.speed || 45} 
                       onChange={(e) => {
                         setFormData(prev => ({ 
                           ...prev, 
                           notice: { ...prev.notice, speed: Number(e.target.value) } 
                         }));
                         setHasUnsavedChanges(true);
                       }} 
                       className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 font-bold focus:border-cyan-500/50 outline-none" 
                       placeholder="45" 
                     />
                     <p className="text-[9px] text-slate-500 uppercase tracking-widest">Recommended: 35 to 50 (Higher number = Slower speed)</p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                     <Clock size={12} />
                     {t.noticePublished}: {formData.notice?.updatedAt ? new Date(formData.notice.updatedAt).toLocaleString() : 'N/A'}
                  </div>
               </div>
            </div>
          )}

          {/* 7. About */}
          {activeTab === 'about' && (
            <div className="space-y-8 animate-in fade-in">
               <h2 className="text-2xl font-black">{t.aboutHeader}</h2>
               <div className="w-full">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Long-form Bio</label>
                  <textarea 
                    name="aboutText" 
                    value={formData.aboutText} 
                    onChange={handleChange} 
                    className="w-full bg-slate-900/50 border border-white/10 rounded-[32px] px-8 py-8 font-medium text-lg leading-relaxed focus:border-cyan-500/50 outline-none h-[500px] resize-none scrollbar-hide" 
                    placeholder="Write detailed about yourself..." 
                  />
               </div>
            </div>
          )}

          {/* 8. Blog / Projects */}
          {activeTab === 'blog' && (
            <div className="space-y-8 animate-in fade-in">
               <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-black">{t.adminBlog}</h2>
                  <button onClick={addBlogPost} className="bg-white/5 px-6 py-2 rounded-full border border-white/10 font-black text-[9px] uppercase hover:bg-white/10 transition-all">
                    <Plus size={14} className="inline mr-1" /> {t.adminNewPost}
                  </button>
               </div>
               <div className="space-y-6">
                  {formData.projects.map(post => (
                    <div key={post.id} className="bg-white/5 rounded-[40px] p-8 border border-white/5 flex flex-col lg:flex-row gap-8 group hover:bg-white/[0.07] transition-all">
                       <div className="w-full lg:w-48 h-48 rounded-3xl overflow-hidden relative shrink-0 border border-white/10">
                          <img src={post.image} className="w-full h-full object-cover" />
                          <label className="absolute inset-0 flex items-center justify-center bg-slate-950/70 opacity-0 group-hover:opacity-100 cursor-pointer transition-all"><Camera size={24} /><input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'blog', post.id)} /></label>
                       </div>
                       <div className="flex-1 space-y-4">
                          <div className="w-full">
                             <input 
                               value={post.title} 
                               onChange={(e) => updateBlogPost(post.id, 'title', e.target.value)} 
                               className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 font-black text-lg outline-none focus:border-cyan-500/30" 
                               placeholder="Post Title" 
                             />
                          </div>
                          <div className="w-full">
                             <textarea 
                               value={post.description} 
                               onChange={(e) => updateBlogPost(post.id, 'description', e.target.value)} 
                               className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm min-h-[100px] outline-none focus:border-cyan-500/30 resize-none" 
                               placeholder="Description Content" 
                             />
                          </div>
                          <div className="flex gap-4">
                             <div className="flex-1 relative">
                                <LinkIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input 
                                  value={post.link} 
                                  onChange={(e) => updateBlogPost(post.id, 'link', e.target.value)} 
                                  className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-10 py-3 text-xs font-mono outline-none" 
                                  placeholder="External Link" 
                                />
                             </div>
                             <button 
                                onClick={() => copyBlogLink(post.id)} 
                                className={`p-3 rounded-xl transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-widest ${copiedId === post.id ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                             >
                                {copiedId === post.id ? <CheckCircle2 size={18} /> : <Share2 size={18} />}
                                {copiedId === post.id ? (lang === 'bn' ? 'কপি হয়েছে' : 'Copied') : (lang === 'bn' ? 'শেয়ার' : 'Share')}
                             </button>
                             <button onClick={() => removeBlogPost(post.id)} className="bg-red-500/10 text-red-500 p-3 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18} /></button>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* 9. Gallery */}
          {activeTab === 'gallery' && (
            <div className="space-y-8 animate-in fade-in">
               <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-black">{t.adminGallery}</h2>
                  <button onClick={addGalleryItem} className="bg-white/5 px-6 py-2 rounded-full border border-white/10 font-black text-[9px] uppercase hover:bg-white/10 transition-all">
                    <Plus size={14} className="inline mr-1" /> {t.adminNewPhoto}
                  </button>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {formData.gallery.map(item => (
                    <div key={item.id} className="bg-white/5 rounded-[32px] overflow-hidden border border-white/5 group hover:border-white/20 transition-all">
                       <div className="aspect-square relative overflow-hidden">
                          <img src={item.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                          <label className="absolute inset-0 flex items-center justify-center bg-slate-950/70 opacity-0 group-hover:opacity-100 cursor-pointer transition-all"><Camera size={24} /><input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'gallery', item.id)} /></label>
                       </div>
                       <div className="p-4 flex flex-col gap-2">
                          <input 
                            value={item.title} 
                            onChange={(e) => updateGalleryItem(item.id, 'title', e.target.value)} 
                            className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none" 
                            placeholder="Photo Tag" 
                          />
                          <button onClick={() => removeGalleryItem(item.id)} className="text-red-500/50 hover:text-red-500 p-2 transition-colors self-end"><Trash2 size={16} /></button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* 10. Contact Settings */}
          {activeTab === 'contact' && (
            <div className="space-y-12 animate-in fade-in">
               <h2 className="text-2xl font-black">{t.adminContact}</h2>
               <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 border-b border-white/5 pb-2">Primary Info</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.contactEmailLabel}</label>
                         <div className="relative">
                            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                            <input name="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-12 py-4 font-bold outline-none" placeholder="example@mail.com" />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.contactPhoneLabel}</label>
                         <div className="relative">
                            <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                            <input name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-12 py-4 font-bold outline-none" placeholder="+880123456789" />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">WhatsApp Number</label>
                         <div className="relative">
                            <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                            <input name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-12 py-4 font-bold outline-none" placeholder="+880123456789" />
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                       <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">{t.contactSocialLabel}</h3>
                       <button onClick={addSocialLink} className="text-[9px] font-black text-cyan-400 uppercase tracking-widest hover:brightness-125 transition-all"><Plus size={14} className="inline mr-1" /> {lang === 'bn' ? "লিংক যোগ করুন" : "Add Link"}</button>
                    </div>
                    <div className="space-y-3">
                       {formData.socialLinks.map(link => (
                         <div key={link.id} className="bg-white/5 border border-white/5 rounded-[24px] p-4 flex flex-col gap-4 group/link hover:border-white/20 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-white/10 text-slate-400 group-hover/link:text-cyan-400 transition-colors">
                                {(() => {
                                  const p = link.platform.toLowerCase();
                                  if (p === 'facebook') return <Facebook size={18} />;
                                  if (p === 'github') return <Github size={18} />;
                                  if (p === 'linkedin') return <Linkedin size={18} />;
                                  if (p === 'twitter') return <Twitter size={18} />;
                                  if (p === 'instagram') return <Instagram size={18} />;
                                  if (p === 'youtube') return <Youtube size={18} />;
                                  if (p === 'whatsapp') return <MessageCircle size={18} />;
                                  return <Globe size={18} />;
                                })()}
                              </div>
                              <div className="flex-1 flex gap-2">
                                <select 
                                  value={SOCIAL_PLATFORMS.includes(link.platform) ? link.platform : 'Other'} 
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    updateSocialLink(link.id, 'platform', val === 'Other' ? '' : val);
                                  }} 
                                  className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-[9px] font-black uppercase tracking-widest text-white cursor-pointer outline-none"
                                >
                                  {SOCIAL_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                                {!SOCIAL_PLATFORMS.filter(p => p !== 'Other').includes(link.platform) && (
                                  <input 
                                    value={link.platform} 
                                    onChange={(e) => updateSocialLink(link.id, 'platform', e.target.value)} 
                                    className="flex-1 bg-slate-950 border border-white/5 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:border-cyan-500/30" 
                                    placeholder="Platform Name" 
                                  />
                                )}
                              </div>
                              <button onClick={() => removeSocialLink(link.id)} className="text-red-500/50 hover:text-red-500 p-2 transition-all"><Trash2 size={16} /></button>
                            </div>
                            <div className="relative">
                               <LinkIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                               <input 
                                 value={link.url} 
                                 onChange={(e) => updateSocialLink(link.id, 'url', e.target.value)} 
                                 className="w-full bg-slate-950 border border-white/5 rounded-xl px-10 py-2 text-xs font-mono outline-none focus:border-cyan-500/30" 
                                 placeholder="https://" 
                               />
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
               </div>
            </div>
          )}
          {/* 11. Event Settings */}
          {activeTab === 'event' && (
            <div className="space-y-8 animate-in fade-in">
               <h2 className="text-2xl font-black">{t.adminEvent}</h2>
               <div className="space-y-6">
                 <div className="w-full">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Section Title</label>
                       <input 
                         value={formData.event?.title || ''} 
                         onChange={(e) => {
                           setFormData(prev => ({ ...prev, event: { ...prev.event, title: e.target.value } }));
                           setHasUnsavedChanges(true);
                         }} 
                         className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 font-bold focus:border-cyan-500/50 outline-none" 
                         placeholder="EID MUBARAK" 
                       />
                    </div>
                 </div>
                 <div className="w-full">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Greeting Message</label>
                       <textarea 
                         value={formData.event?.subtitle || ''} 
                         onChange={(e) => {
                           setFormData(prev => ({ ...prev, event: { ...prev.event, subtitle: e.target.value } }));
                           setHasUnsavedChanges(true);
                         }} 
                         className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 h-32 focus:border-cyan-500/50 outline-none resize-none" 
                         placeholder="Greeting message..." 
                       />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visual Theme</label>
                      <select 
                        value={formData.event?.theme || 'auto'} 
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, event: { ...prev.event, theme: e.target.value as any } }));
                          setHasUnsavedChanges(true);
                        }} 
                        className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 font-bold focus:border-cyan-500/50 outline-none"
                      >
                        <option value="auto">Auto (Based on Title)</option>
                        <option value="islamic">Islamic / Eid</option>
                        <option value="party">Celebration / Party</option>
                        <option value="minimal">Minimal / Elegant</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Animation Style</label>
                      <select 
                        value={formData.event?.animationType || 'float'} 
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, event: { ...prev.event, animationType: e.target.value as any } }));
                          setHasUnsavedChanges(true);
                        }} 
                        className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 font-bold focus:border-cyan-500/50 outline-none"
                      >
                        <option value="float">Floating</option>
                        <option value="pulse">Pulsing</option>
                        <option value="none">No Animation</option>
                      </select>
                   </div>
                 </div>

                 {/* Event Preview */}
                 <div className="space-y-3 pt-4">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Live Preview</label>
                   <div className="rounded-[32px] overflow-hidden border border-white/10 bg-slate-950 relative group">
                     <div className="scale-[0.4] origin-top h-[150px] pointer-events-none">
                       <EventSection 
                         title={formData.event?.title || 'EVENT TITLE'} 
                         subtitle={formData.event?.subtitle || 'Event subtitle message goes here...'} 
                         theme={formData.event?.theme || 'auto'} 
                         animationType={formData.event?.animationType || 'float'} 
                       />
                     </div>
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none"></div>
                     <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-900/80 px-3 py-1 rounded-full border border-white/5 backdrop-blur-sm">
                       Preview Mode
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          )}

          {/* 11. SEO Settings */}
          {activeTab === 'seo' && (
            <div className="space-y-8 animate-in fade-in">
               <h2 className="text-2xl font-black">{t.adminSEO || (lang === 'bn' ? 'এসইও সেটিংস' : 'SEO Settings')}</h2>
               <div className="space-y-6">
                  <div className="w-full">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Meta Title</label>
                       <input 
                         name="metaTitle" 
                         value={formData.seo?.metaTitle || ''} 
                         onChange={handleSEOChange} 
                         className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 font-bold focus:border-cyan-500/50 outline-none" 
                         placeholder="Meta Title" 
                       />
                    </div>
                  </div>
                  <div className="w-full">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Meta Description</label>
                       <textarea 
                         name="metaDescription" 
                         value={formData.seo?.metaDescription || ''} 
                         onChange={handleSEOChange} 
                         className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 h-32 focus:border-cyan-500/50 outline-none resize-none" 
                         placeholder="Meta Description" 
                       />
                    </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Meta Keywords</label>
                     <input 
                       name="metaKeywords" 
                       value={formData.seo?.metaKeywords || ''} 
                       onChange={handleSEOChange} 
                       className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 font-bold focus:border-cyan-500/50 outline-none" 
                       placeholder="Keywords (comma separated)" 
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Favicon URL</label>
                     <div className="flex gap-4">
                        <div className="w-14 h-14 bg-slate-900 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                           {formData.seo?.favicon ? (
                              <img src={formData.seo.favicon} className="w-full h-full object-contain" alt="Favicon Preview" />
                           ) : (
                              <Globe size={20} className="text-slate-700" />
                           )}
                        </div>
                        <input 
                          name="favicon" 
                          value={formData.seo?.favicon || ''} 
                          onChange={handleSEOChange} 
                          className="flex-1 bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 font-bold focus:border-cyan-500/50 outline-none" 
                          placeholder="https://example.com/favicon.ico" 
                        />
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* 12. Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-8 animate-in fade-in">
               <h2 className="text-2xl font-black">{lang === 'bn' ? 'নিরাপত্তা সেটিংস' : 'Security Settings'}</h2>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 {/* Email Change */}
                 <div className="space-y-6">
                   <h3 className="text-xl font-bold">{lang === 'bn' ? 'ইমেইল পরিবর্তন' : 'Change Email'}</h3>
                   <form onSubmit={handleEmailChange} className="space-y-6">
                     {emailStatus === 'success' && (
                       <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl flex items-center gap-3">
                         <CheckCircle2 className="text-green-400" size={20} />
                         <p className="text-green-400 text-xs font-bold uppercase tracking-widest">
                           {lang === 'bn' ? 'ইমেইল সফলভাবে পরিবর্তন করা হয়েছে' : 'Email changed successfully'}
                         </p>
                       </div>
                     )}
                     {emailStatus === 'error' && (
                       <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3">
                         <AlertCircle className="text-red-400" size={20} />
                         <p className="text-red-400 text-xs font-bold uppercase tracking-widest">{emailError}</p>
                       </div>
                     )}
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          {lang === 'bn' ? 'নতুন ইমেইল' : 'New Email'}
                        </label>
                        <input 
                          type="email"
                          value={newEmail} 
                          onChange={(e) => setNewEmail(e.target.value)} 
                          className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 font-bold focus:border-cyan-500/50 outline-none" 
                          placeholder="new@example.com" 
                          required
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          {lang === 'bn' ? 'বর্তমান পাসওয়ার্ড' : 'Current Password'}
                        </label>
                        <div className="relative">
                          <input 
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword} 
                            onChange={(e) => setCurrentPassword(e.target.value)} 
                            className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 font-bold focus:border-cyan-500/50 outline-none pr-14" 
                            placeholder="••••••••" 
                            required
                          />
                          <button 
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                          >
                            {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                     </div>
                     <button 
                       type="submit" 
                       disabled={emailStatus === 'saving' || !newEmail || !currentPassword}
                       className="w-full bg-white/5 hover:bg-white/10 text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       {emailStatus === 'saving' ? (lang === 'bn' ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving...') : (lang === 'bn' ? 'ইমেইল পরিবর্তন করুন' : 'Update Email')}
                     </button>
                   </form>
                 </div>

                 {/* Password Change */}
                 <div className="space-y-6">
                   <h3 className="text-xl font-bold">{lang === 'bn' ? 'পাসওয়ার্ড পরিবর্তন' : 'Change Password'}</h3>
                   <form onSubmit={handlePasswordChange} className="space-y-6">
                   {passwordStatus === 'success' && (
                     <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl flex items-center gap-3">
                       <CheckCircle2 className="text-green-400" size={20} />
                       <p className="text-green-400 text-xs font-bold uppercase tracking-widest">
                         {lang === 'bn' ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে' : 'Password changed successfully'}
                       </p>
                     </div>
                   )}
                   {passwordStatus === 'error' && (
                     <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3">
                       <AlertCircle className="text-red-400" size={20} />
                       <p className="text-red-400 text-xs font-bold uppercase tracking-widest">{passwordError}</p>
                     </div>
                   )}
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                         {lang === 'bn' ? 'বর্তমান পাসওয়ার্ড' : 'Current Password'}
                       </label>
                       <div className="relative">
                         <input 
                           type={showCurrentPassword ? "text" : "password"}
                           value={currentPassword} 
                           onChange={(e) => setCurrentPassword(e.target.value)} 
                           className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 font-bold focus:border-cyan-500/50 outline-none pr-14" 
                           placeholder="••••••••" 
                           required
                         />
                         <button 
                           type="button"
                           onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                           className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                         >
                           {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                         </button>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between items-center">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                           {lang === 'bn' ? 'নতুন পাসওয়ার্ড' : 'New Password'}
                         </label>
                         {newPassword && (
                           <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${getPasswordStrength(newPassword).color} text-slate-950 transition-all duration-500`}>
                             {getPasswordStrength(newPassword).label}
                           </span>
                         )}
                       </div>
                       <div className="relative">
                         <input 
                           type={showNewPassword ? "text" : "password"}
                           value={newPassword} 
                           onChange={(e) => setNewPassword(e.target.value)} 
                           className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 font-bold focus:border-cyan-500/50 outline-none pr-14" 
                           placeholder="••••••••" 
                           required
                         />
                         <button 
                           type="button"
                           onClick={() => setShowNewPassword(!showNewPassword)}
                           className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                         >
                           {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                         </button>
                       </div>
                       {newPassword && (
                         <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mt-1">
                           <div 
                             className={`h-full transition-all duration-500 ${getPasswordStrength(newPassword).color}`}
                             style={{ width: `${getPasswordStrength(newPassword).score}%` }}
                           />
                         </div>
                       )}
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between items-center">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                           {lang === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'}
                         </label>
                         {confirmPassword && (
                           <div className="flex items-center gap-1">
                             {newPassword === confirmPassword ? (
                               <span className="text-[9px] font-black uppercase tracking-widest text-green-500 flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
                                 <CheckCircle2 size={10} /> {lang === 'bn' ? 'মিলেছে' : 'Matched'}
                               </span>
                             ) : (
                               <span className="text-[9px] font-black uppercase tracking-widest text-red-500 flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
                                 <AlertCircle size={10} /> {lang === 'bn' ? 'মিলেনি' : 'Not Matched'}
                               </span>
                             )}
                           </div>
                         )}
                       </div>
                       <div className="relative">
                         <input 
                           type={showConfirmPassword ? "text" : "password"}
                           value={confirmPassword} 
                           onChange={(e) => setConfirmPassword(e.target.value)} 
                           className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 font-bold focus:border-cyan-500/50 outline-none pr-14" 
                           placeholder="••••••••" 
                           required
                         />
                         <button 
                           type="button"
                           onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                           className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                         >
                           {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                         </button>
                       </div>
                    </div>
                   <button 
                     type="submit" 
                     disabled={passwordStatus === 'saving' || !newPassword || !confirmPassword || !currentPassword}
                     className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 bg-slate-800 hover:bg-slate-700 text-white border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {passwordStatus === 'saving' ? <RefreshCw className="animate-spin" size={16} /> : <Lock size={16} />} 
                     {passwordStatus === 'saving' ? (lang === 'bn' ? 'আপডেট হচ্ছে...' : 'Updating...') : (lang === 'bn' ? 'পাসওয়ার্ড আপডেট করুন' : 'Update Password')}
                   </button>
                 </form>
                 </div>
               </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .shadow-3xl { box-shadow: 0 40px 100px -20px rgba(0,0,0,0.7); }
        .glass { background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(24px); }
        input, textarea, select { transition: all 0.2s ease; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
