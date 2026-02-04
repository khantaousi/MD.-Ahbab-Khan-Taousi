
import React, { useState } from 'react';
import { PortfolioData, Project, Skill, SocialLink } from '../types';
import { CLOUD_SYNC_CONFIG } from '../constants';
import { 
  Save, LogOut, Plus, Trash2, Camera, Link as LinkIcon, 
  FileText, Layout, Info, BookOpen, Github, Linkedin, 
  Phone, Mail, Facebook, Instagram, Twitter, Globe, MessageCircle, Youtube, 
  ExternalLink, Shield, Rocket, Copy, Check, Cloud, RefreshCw
} from 'lucide-react';

interface AdminDashboardProps {
  data: PortfolioData;
  onUpdate: (newData: PortfolioData) => void;
  onLogout: () => void;
  lang: string;
  t: any;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ data, onUpdate, onLogout, lang, t }) => {
  const [formData, setFormData] = useState<PortfolioData>(data);
  const [activeTab, setActiveTab] = useState<'basic' | 'about' | 'skills' | 'blog' | 'contact' | 'deploy'>('basic');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [copyStatus, setCopyStatus] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profileImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    
    try {
      // 1. Update the cloud storage (KVDB)
      const response = await fetch(CLOUD_SYNC_CONFIG.API_URL, {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error("Cloud save failed");

      // 2. Update the local state via parent
      onUpdate(formData);
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error(error);
      alert(lang === 'bn' ? "পাবলিশ করতে সমস্যা হয়েছে! ইন্টারনাল কানেকশন চেক করুন।" : "Publish failed! Check your connection.");
      setSaveStatus('idle');
    }
  };

  const handleCopyConfig = () => {
    const jsonString = JSON.stringify(formData, null, 2);
    navigator.clipboard.writeText(jsonString);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  const addSkill = () => {
    const newSkill: Skill = { id: Date.now().toString(), name: lang === 'bn' ? "নতুন দক্ষতা" : "New Skill" };
    setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill] }));
  };

  const removeSkill = (id: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s.id !== id) }));
  };

  const updateSkill = (id: string, name: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.map(s => s.id === id ? { ...s, name } : s)
    }));
  };

  const addSocialLink = () => {
    const newSocial: SocialLink = { id: Date.now().toString(), platform: "Platform", url: "https://" };
    setFormData(prev => ({ ...prev, socialLinks: [...prev.socialLinks, newSocial] }));
  };

  const removeSocialLink = (id: string) => {
    setFormData(prev => ({ ...prev, socialLinks: prev.socialLinks.filter(s => s.id !== id) }));
  };

  const updateSocialLink = (id: string, field: keyof SocialLink, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  const addBlogPost = () => {
    const newPost: Project = {
      id: Date.now().toString(),
      title: lang === 'bn' ? "নতুন ব্লগ পোস্ট" : "New Blog Post",
      description: lang === 'bn' ? "পোস্টের সারসংক্ষেপ" : "Post Summary",
      image: "https://picsum.photos/600/400",
      link: "#"
    };
    setFormData(prev => ({ ...prev, projects: [...prev.projects, newPost] }));
  };

  const updateBlogPost = (id: string, field: keyof Project, value: string) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  const handleBlogPostImage = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateBlogPost(id, 'image', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBlogPost = (id: string) => {
    setFormData(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));
  };

  const getPlatformIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('facebook')) return <Facebook size={18} className="text-blue-400" />;
    if (p.includes('github')) return <Github size={18} className="text-slate-300" />;
    if (p.includes('linkedin')) return <Linkedin size={18} className="text-blue-500" />;
    if (p.includes('instagram')) return <Instagram size={18} className="text-pink-400" />;
    if (p.includes('twitter') || p.includes(' x')) return <Twitter size={18} className="text-slate-500" />;
    if (p.includes('whatsapp')) return <MessageCircle size={18} className="text-green-400" />;
    if (p.includes('youtube')) return <Youtube size={18} className="text-red-500" />;
    return <Globe size={18} className="text-cyan-400" />;
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100 selection:bg-cyan-500/30">
      {/* Header */}
      <header className="glass border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-900/20 group hover:scale-110 transition-transform">
                <Shield size={20} className="text-slate-950" />
            </div>
            <div>
                <h1 className="text-xl font-black text-white tracking-tight leading-none mb-1">{t.adminHeader}</h1>
                <p className="text-[10px] text-cyan-500 font-black uppercase tracking-[0.2em]">{t.adminSub}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className={`flex items-center gap-2 px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-xl active:scale-95 ${
                saveStatus === 'saved' ? 'bg-green-500 text-slate-950' : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 shadow-cyan-900/20 hover:shadow-cyan-500/20'
              } disabled:opacity-50`}
            >
              {saveStatus === 'saving' ? <RefreshCw size={16} className="animate-spin" /> : <Cloud size={16} />} 
              {saveStatus === 'saving' ? t.adminSaving : saveStatus === 'saved' ? t.adminSaved : t.adminSave}
            </button>
            <button
              onClick={onLogout}
              className="w-12 h-12 flex items-center justify-center bg-slate-900 hover:bg-red-500 hover:text-white rounded-full transition-all duration-300 border border-white/5 active:scale-90"
              title={t.adminLogout}
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 grid md:grid-cols-[280px_1fr] gap-10">
        {/* Sidebar Nav */}
        <aside className="space-y-6">
          <div className="glass rounded-[32px] p-4 border border-white/5 space-y-1">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4 mt-2 px-4">{t.adminMenu}</p>
            {[
              { id: 'basic', label: t.adminBasic, icon: <Info size={18} /> },
              { id: 'about', label: t.aboutHeader, icon: <FileText size={18} /> },
              { id: 'skills', label: t.adminSkills, icon: <Layout size={18} /> },
              { id: 'blog', label: t.adminBlog, icon: <BookOpen size={18} /> },
              { id: 'contact', label: t.adminContact, icon: <Phone size={18} /> },
              { id: 'deploy', label: t.adminDeploy, icon: <Rocket size={18} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 text-xs font-black uppercase tracking-widest active:scale-[0.98] ${activeTab === tab.id ? 'bg-cyan-600 text-slate-950 shadow-xl shadow-cyan-900/30' : 'hover:bg-white/5 text-slate-500 hover:text-cyan-400'}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
          
          <div className="px-6">
            <a href="/#" target="_blank" className="flex items-center gap-3 text-[10px] font-black text-cyan-500/60 hover:text-cyan-400 transition-all duration-300 uppercase tracking-[0.2em] group active:scale-95">
              {t.adminViewSite} <ExternalLink size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>
          </div>
        </aside>

        {/* Content Area */}
        <main className="glass rounded-[40px] p-8 md:p-12 border border-white/5 shadow-2xl overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-hide">
          {activeTab === 'basic' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight">{t.adminBasic}</h2>
              </div>
              
              <div className="grid lg:grid-cols-[200px_1fr] gap-12 items-start">
                <div className="space-y-6 flex flex-col items-center lg:items-start">
                  <div className="relative group w-48 h-48 active:scale-95 transition-transform">
                    <img src={formData.profileImage} className="w-full h-full object-cover rounded-[40px] border-2 border-white/5 group-hover:border-cyan-500/50 transition-all duration-300 relative z-10" />
                    <label className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/60 opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300 rounded-[40px]">
                      <Camera size={28} className="text-cyan-400 animate-pulse" />
                      <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                    </label>
                  </div>
                </div>
                
                <div className="space-y-8 flex-1">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Name</label>
                      <input name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 focus:border-cyan-500/50 focus:outline-none transition-all duration-300 font-bold hover:bg-slate-900 focus:bg-slate-900" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Title</label>
                      <input name="title" value={formData.title} onChange={handleChange} className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 focus:border-cyan-500/50 focus:outline-none transition-all duration-300 font-bold hover:bg-slate-900 focus:bg-slate-900" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bio</label>
                    <textarea name="bio" value={formData.bio} onChange={handleChange} className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-5 focus:border-cyan-500/50 focus:outline-none h-40 resize-none transition-all duration-300 font-medium leading-relaxed hover:bg-slate-900 focus:bg-slate-900" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight">{t.aboutHeader}</h2>
              </div>
              <textarea
                name="aboutText"
                value={formData.aboutText}
                onChange={handleChange}
                className="w-full bg-slate-900/50 border border-white/5 rounded-3xl px-8 py-8 focus:border-cyan-500/50 focus:outline-none h-[500px] leading-[2] resize-none transition-all duration-300 font-medium text-lg hover:bg-slate-900 focus:bg-slate-900"
              />
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-end border-b border-white/5 pb-8">
                <h2 className="text-3xl font-black tracking-tight">{t.adminSkills}</h2>
                <button onClick={addSkill} className="flex items-center gap-2 bg-cyan-600/10 hover:bg-cyan-600 text-cyan-400 hover:text-slate-950 px-8 py-3 rounded-full border border-cyan-500/20 transition-all duration-300 font-black uppercase tracking-widest text-[10px] active:scale-90">
                  <Plus size={16} /> {t.adminNewSkill}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {formData.skills.map((skill) => (
                  <div key={skill.id} className="flex gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-cyan-500/40 transition-all duration-300 items-center shadow-lg hover:bg-white/10">
                    <input value={skill.name} onChange={(e) => updateSkill(skill.id, e.target.value)} className="flex-1 bg-transparent border-none focus:outline-none text-sm font-bold uppercase tracking-wider text-slate-300 group-hover:text-white transition-colors" />
                    <button onClick={() => removeSkill(skill.id)} className="text-slate-600 hover:text-red-500 transition-all duration-300 p-2 opacity-0 group-hover:opacity-100 active:scale-75"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'blog' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-end border-b border-white/5 pb-8">
                <h2 className="text-3xl font-black tracking-tight">{t.adminBlog}</h2>
                <button onClick={addBlogPost} className="flex items-center gap-2 bg-cyan-600/10 hover:bg-cyan-600 text-cyan-400 hover:text-slate-950 px-8 py-3 rounded-full border border-cyan-500/20 transition-all duration-300 font-black uppercase tracking-widest text-[10px] active:scale-90">
                  <Plus size={16} /> {t.adminNewPost}
                </button>
              </div>
              <div className="space-y-8">
                {formData.projects.map((p) => (
                  <div key={p.id} className="bg-white/5 rounded-[32px] p-8 border border-white/5 grid lg:grid-cols-[300px_1fr] gap-10 group hover:border-cyan-500/20 transition-all duration-300 shadow-xl hover:bg-white/10">
                    <div className="space-y-6">
                      <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/5 group/img">
                        <img src={p.image} className="w-full h-full object-cover group-hover/img:scale-105 transition duration-500" />
                        <label className="absolute inset-0 flex items-center justify-center bg-slate-950/60 opacity-0 hover:opacity-100 cursor-pointer transition-all duration-300">
                           <Camera size={28} className="text-cyan-400 animate-pulse" /><input type="file" className="hidden" onChange={(e) => handleBlogPostImage(p.id, e)} accept="image/*" />
                        </label>
                      </div>
                      <button onClick={() => removeBlogPost(p.id)} className="w-full flex items-center justify-center gap-2 py-3 text-[10px] text-red-400/60 hover:text-white hover:bg-red-600 rounded-xl transition-all duration-300 border border-red-400/10 font-black uppercase tracking-[0.2em] active:scale-95"><Trash2 size={14} /> Remove Post</button>
                    </div>
                    <div className="space-y-6">
                      <input placeholder="Title" value={p.title} onChange={(e) => updateBlogPost(p.id, 'title', e.target.value)} className="bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 w-full focus:border-cyan-500/50 focus:outline-none font-bold text-lg transition-all duration-300 hover:bg-slate-900 focus:bg-slate-900" />
                      <textarea placeholder="Description" value={p.description} onChange={(e) => updateBlogPost(p.id, 'description', e.target.value)} className="bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 w-full focus:border-cyan-500/50 focus:outline-none h-28 resize-none text-sm font-medium leading-relaxed transition-all duration-300 hover:bg-slate-900 focus:bg-slate-900" />
                      <input placeholder="URL" value={p.link} onChange={(e) => updateBlogPost(p.id, 'link', e.target.value)} className="bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-3 w-full focus:border-cyan-500/50 focus:outline-none text-xs font-mono transition-all duration-300 text-cyan-400/80 hover:bg-slate-900 focus:bg-slate-900" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-black tracking-tight">{t.adminContact}</h2>
              <div className="grid md:grid-cols-2 gap-10">
                <input name="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 focus:border-cyan-500/50 focus:outline-none transition-all duration-300 font-bold hover:bg-slate-900" />
                <input name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 focus:border-cyan-500/50 focus:outline-none transition-all duration-300 font-bold hover:bg-slate-900" />
              </div>

              <div className="pt-12 border-t border-white/5 space-y-8">
                <div className="flex justify-between items-end">
                  <h3 className="text-xl font-black tracking-tight">Social Links</h3>
                  <button onClick={addSocialLink} className="flex items-center gap-2 bg-cyan-600/10 hover:bg-cyan-600 text-cyan-400 hover:text-slate-950 px-8 py-3 rounded-full border border-cyan-500/20 transition-all duration-300 font-black uppercase tracking-widest text-[10px] active:scale-90">
                    <Plus size={16} /> {t.adminNewLink}
                  </button>
                </div>
                <div className="grid gap-6">
                  {formData.socialLinks.map((social) => (
                    <div key={social.id} className="bg-white/5 p-8 rounded-[32px] border border-white/5 flex flex-col md:flex-row gap-10 items-center group transition-all duration-300 hover:border-cyan-500/30 hover:bg-white/10">
                      <div className="w-20 h-20 bg-slate-900 rounded-[24px] flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-300">
                        {getPlatformIcon(social.platform)}
                      </div>
                      <div className="flex-1 grid md:grid-cols-2 gap-8 w-full">
                        <input value={social.platform} onChange={(e) => updateSocialLink(social.id, 'platform', e.target.value)} className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-3 text-sm focus:border-cyan-500/50 focus:outline-none transition-all duration-300 font-bold" placeholder="Platform" />
                        <input value={social.url} onChange={(e) => updateSocialLink(social.id, 'url', e.target.value)} className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-3 text-sm focus:border-cyan-500/50 focus:outline-none transition-all duration-300 font-mono text-cyan-400/70" placeholder="URL" />
                      </div>
                      <button onClick={() => removeSocialLink(social.id)} className="p-4 text-slate-600 hover:text-red-500 transition-all duration-300 active:scale-75">
                        <Trash2 size={24} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'deploy' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-cyan-600/10 rounded-[40px] flex items-center justify-center mx-auto border border-cyan-500/20 shadow-2xl shadow-cyan-500/10">
                   <Rocket size={48} className="text-cyan-400 animate-pulse" />
                </div>
                <h2 className="text-4xl font-black tracking-tight">{t.deployTitle}</h2>
                <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">{t.deployDesc}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                 <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 space-y-2">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{t.deploySyncId}</p>
                    <p className="font-mono text-cyan-400">{CLOUD_SYNC_CONFIG.BUCKET_ID}</p>
                 </div>
                 <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 space-y-2">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Status</p>
                    <p className="font-bold text-green-400 flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div> {t.deployStatus}</p>
                 </div>
              </div>

              <div className="bg-slate-900/80 rounded-[40px] border border-white/5 p-10 space-y-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6">
                   <button 
                    onClick={handleCopyConfig}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${copyStatus ? 'bg-green-500 text-slate-950' : 'bg-slate-800 text-cyan-400 hover:bg-cyan-600 hover:text-slate-950'} active:scale-95 shadow-xl`}
                   >
                     {copyStatus ? <Check size={14} /> : <Copy size={14} />} {copyStatus ? t.deployCopied : t.deployCopy}
                   </button>
                </div>
                <div className="max-h-[300px] overflow-y-auto pr-4 scrollbar-hide">
                  <pre className="text-xs font-mono text-cyan-400/60 leading-relaxed whitespace-pre-wrap">
                    {JSON.stringify(formData, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
