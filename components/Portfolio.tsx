
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PortfolioData } from '../types';
import { 
  Github, Linkedin, Mail, Phone, ExternalLink, ArrowRight, User, 
  BookOpen, Code, Facebook, Instagram, Twitter, Globe, Youtube, Clock, Calendar, Image as ImageIcon, Bell, Briefcase, X, ChevronDown, Maximize2
} from 'lucide-react';
import Chat from './Chat';
import EventSection from './EventSection';

interface PortfolioProps {
  data: PortfolioData;
  lang: 'en' | 'bn';
  setLang: (lang: 'en' | 'bn') => void;
  t: any;
  onUpdate: (newData: PortfolioData) => void;
}

const COUNTRIES = [
  { name: 'Bangladesh', code: 'BD' },
  { name: 'USA', code: 'US' },
  { name: 'UK', code: 'UK' },
  { name: 'India', code: 'IN' },
  { name: 'Canada', code: 'CA' },
  { name: 'Australia', code: 'AU' },
  { name: 'Germany', code: 'DE' },
  { name: 'France', code: 'FR' },
  { name: 'UAE', code: 'AE' },
  { name: 'Other', code: 'OT' }
];

const DigitalClock: React.FC<{ label: string; lang: string; accentColor: string }> = ({ label, lang, accentColor }) => {
  const [dateTime, setDateTime] = useState<{ time: string; date: string }>({ time: '', date: '' });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeOptions: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Dhaka',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      const dateOptions: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Dhaka',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      };
      const bdTime = new Intl.DateTimeFormat(lang === 'bn' ? 'bn-BD' : 'en-US', timeOptions).format(now);
      const bdDate = new Intl.DateTimeFormat(lang === 'bn' ? 'bn-BD' : 'en-GB', dateOptions).format(now);
      setDateTime({ time: bdTime, date: bdDate });
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [lang]);

  return (
    <div className="flex items-center gap-3 bg-slate-900/60 px-5 py-2 rounded-full border border-white/10 text-[11px] font-mono shadow-2xl backdrop-blur-xl hover:border-white/20 transition-all cursor-default" style={{ borderColor: `${accentColor}33`, color: accentColor }}>
      <div className="hidden sm:flex items-center gap-2 border-r border-white/10 pr-4">
        <div className="relative w-8 h-5 flex items-center justify-center">
          <div className="flag-wrapper w-6 h-4 relative shadow-lg border border-white/5 overflow-visible">
             <div className="flag-cloth absolute inset-0 bg-[#006a4e]">
                <div className="flag-circle absolute top-1/2 left-[45%] -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#f42a41]"></div>
                <div className="flag-wind-shimmer absolute inset-0"></div>
             </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 border-r border-white/10 pr-4">
        <Calendar size={12} style={{ color: accentColor }} />
        <span className="font-bold">{dateTime.date}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Clock size={12} className="animate-pulse" style={{ color: accentColor }} />
        <span className="font-bold">{dateTime.time} <span className="text-[9px] opacity-40 ml-1">BST</span></span>
      </div>
    </div>
  );
};

import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

const Portfolio: React.FC<PortfolioProps> = ({ data, lang, setLang, t, onUpdate }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<any | null>(null);
  const [asyncError, setAsyncError] = useState<Error | null>(null);

  if (asyncError) {
    throw asyncError;
  }
  
  const theme = data.theme || 'neon';
  const themeConfig = {
    neon: { accent: '#0ea5e9', gradient: 'radial-gradient(at 0% 0%, hsla(200,100%,8%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(210,100%,10%,1) 0, transparent 50%), radial-gradient(at 50% 100%, hsla(220,100%,6%,1) 0, transparent 50%)' },
    gold: { accent: '#d4af37', gradient: 'radial-gradient(at 0% 0%, hsla(45,100%,8%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(35,100%,10%,1) 0, transparent 50%), radial-gradient(at 50% 100%, hsla(40,100%,6%,1) 0, transparent 50%)' },
    rose: { accent: '#e11d48', gradient: 'radial-gradient(at 0% 0%, hsla(340,100%,8%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(330,100%,10%,1) 0, transparent 50%), radial-gradient(at 50% 100%, hsla(345,100%,6%,1) 0, transparent 50%)' },
    emerald: { accent: '#10b981', gradient: 'radial-gradient(at 0% 0%, hsla(150,100%,8%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(160,100%,10%,1) 0, transparent 50%), radial-gradient(at 50% 100%, hsla(155,100%,6%,1) 0, transparent 50%)' }
  }[theme];

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) { 
      const yOffset = -80; 
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const getPlatformIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('facebook')) return <Facebook size={18} />;
    if (p.includes('github')) return <Github size={18} />;
    if (p.includes('linkedin')) return <Linkedin size={18} />;
    if (p.includes('twitter')) return <Twitter size={18} />;
    if (p.includes('instagram')) return <Instagram size={18} />;
    if (p.includes('youtube')) return <Youtube size={18} />;
    return <Globe size={18} />;
  };

  const getNoticeTimestamp = () => {
    if (!data.notice?.updatedAt) return '';
    const date = new Date(data.notice.updatedAt);
    return new Intl.DateTimeFormat(lang === 'bn' ? 'bn-BD' : 'en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(date);
  };

  const layout = data.layout || 'default';

  return (
    <div className={`min-h-screen transition-all duration-1000 selection:bg-white/10 layout-${layout}`} style={layout === 'default' ? { backgroundColor: '#020617', backgroundImage: themeConfig.gradient } : {}}>
      {/* Lightbox Modal: Profile */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/98 backdrop-blur-[40px] animate-in fade-in zoom-in duration-300 cursor-zoom-out" onClick={() => setIsProfileOpen(false)}>
           <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-all p-4 bg-white/5 rounded-full backdrop-blur-md border border-white/10 hover:scale-110 shadow-2xl"><X size={32} /></button>
           <div className="relative max-w-[min(90vw,650px)] w-full aspect-square p-3 bg-white/5 border border-white/10 rounded-full overflow-hidden shadow-3xl" onClick={(e) => e.stopPropagation()}>
              <img src={data.profileImage} className="w-full h-full object-cover rounded-full border-[6px] border-slate-950 shadow-inner" alt={data.name} />
           </div>
        </div>
      )}

      {/* Lightbox Modal: General Image */}
      {selectedImage && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/98 backdrop-blur-[40px] animate-in fade-in zoom-in duration-300 cursor-zoom-out" onClick={() => setSelectedImage(null)}>
           <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-all p-4 bg-white/5 rounded-full backdrop-blur-md border border-white/10 hover:scale-110 shadow-2xl"><X size={32} /></button>
           <div className="relative max-w-[90vw] max-h-[90vh] p-3 bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-3xl" onClick={(e) => e.stopPropagation()}>
              <img src={selectedImage} className="w-full h-full max-h-[85vh] object-contain rounded-2xl" alt="Enlarged view" />
           </div>
        </div>
      )}

      {/* Lightbox Modal: Blog Post */}
      {selectedBlog && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/98 backdrop-blur-[40px] animate-in fade-in zoom-in duration-300 cursor-zoom-out" onClick={() => setSelectedBlog(null)}>
           <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-all p-4 bg-white/5 rounded-full backdrop-blur-md border border-white/10 hover:scale-110 shadow-2xl"><X size={32} /></button>
           <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-white/10 rounded-[32px] overflow-hidden shadow-3xl flex flex-col cursor-default" onClick={(e) => e.stopPropagation()}>
              <div className="w-full h-64 sm:h-80 shrink-0 relative cursor-zoom-in" onClick={() => setSelectedImage(selectedBlog.image)}>
                <img src={selectedBlog.image} className="w-full h-full object-cover" alt={selectedBlog.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
              </div>
              <div className="p-8 sm:p-12 overflow-y-auto flex-1 scrollbar-hide">
                <h2 className="text-3xl sm:text-4xl font-black mb-6 text-white">{selectedBlog.title}</h2>
                <div className="text-slate-300 text-base sm:text-lg leading-relaxed whitespace-pre-wrap opacity-90">
                  {selectedBlog.description}
                </div>
                {selectedBlog.link && selectedBlog.link !== '#' && (
                  <a href={selectedBlog.link} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 text-slate-950" style={{ backgroundColor: themeConfig.accent }}>
                    {t.blogReadMore} <ExternalLink size={14} />
                  </a>
                )}
              </div>
           </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 h-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-full flex justify-between items-center">
            <div className="flex items-center gap-6">
              <a href="#" className="text-xl font-black tracking-tighter hover:scale-105 transition-all" style={{ color: themeConfig.accent }}>{data.name}<span className="text-white">.</span></a>
              {data.showClock && <div className="hidden lg:block"><DigitalClock label={t.clockLabel} lang={lang} accentColor={themeConfig.accent} /></div>}
            </div>
            <div className="flex gap-4 items-center">
              <div className="hidden md:flex gap-6">
                {data.showAbout && <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="text-slate-400 hover:text-white font-bold text-[9px] uppercase tracking-widest transition-colors">{t.navAbout}</a>}
                {data.showGallery && <a href="#gallery" onClick={(e) => scrollToSection(e, 'gallery')} className="text-slate-400 hover:text-white font-bold text-[9px] uppercase tracking-widest transition-colors">{t.navGallery}</a>}
                {data.showBlog && <a href="#blog" onClick={(e) => scrollToSection(e, 'blog')} className="text-slate-400 hover:text-white font-bold text-[9px] uppercase tracking-widest transition-colors">{t.navBlog}</a>}
              </div>
              <button onClick={() => setLang(lang === 'en' ? 'bn' : 'en')} className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-[8px] font-black hover:bg-white/10 transition-all">{lang.toUpperCase()}</button>
              <Link to="/login" className="w-10 h-10 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110" style={{ backgroundColor: themeConfig.accent, color: '#000' }}><User size={16} /></Link>
            </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-48 pb-24 px-6 lg:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row gap-12 items-center">
          <div className="flex-1 space-y-10 text-center lg:text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: themeConfig.accent }}></span>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t.heroStatus}</span>
              </div>
              <h1 className="text-4xl lg:text-7xl font-black text-white leading-[1] tracking-tighter">{t.heroIam} <br/> <span style={{ color: themeConfig.accent }}>{data.name}</span></h1>
            </div>
            <h2 className="text-xl lg:text-3xl text-slate-400 italic font-medium opacity-80">{data.title}</h2>
            {data.showWork && (
              <div className="flex items-center justify-center lg:justify-start gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl w-fit mx-auto lg:mx-0 shadow-2xl backdrop-blur-2xl transition-all hover:bg-white/10">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-900 border border-white/5 shadow-inner" style={{ color: themeConfig.accent }}><Briefcase size={20} /></div>
                <div className="text-left">
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{t.heroWorkLabel}</p>
                  <p className="text-xs lg:text-sm font-black text-white leading-tight">{data.currentWork}</p>
                </div>
              </div>
            )}
            <p className="text-lg lg:text-xl text-slate-400 max-w-xl font-medium leading-relaxed opacity-70 mx-auto lg:mx-0">
              {isBioExpanded ? data.bio : `${data.bio.substring(0, 200)}...`}
              <button 
                onClick={() => setIsBioExpanded(!isBioExpanded)} 
                className="ml-2 font-black text-[10px] uppercase tracking-widest hover:underline"
                style={{ color: themeConfig.accent }}
              >
                {isBioExpanded ? 'Show Less' : 'Read More'}
              </button>
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
              <a href={`mailto:${data.email}`} className="px-12 py-5 rounded-full font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-3xl transition-all hover:scale-105 active:scale-95" style={{ backgroundColor: themeConfig.accent, color: '#000' }}>{t.heroEmailBtn} <Mail size={20} /></a>
              <div className="flex gap-3.5 justify-center">
                {data.socialLinks.map((social) => (
                  <a key={social.id} href={social.url} target="_blank" rel="noreferrer" className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 hover:border-white/40 hover:bg-white/10 transition-all hover:scale-110 shadow-2xl" style={{ color: themeConfig.accent }}>
                    {getPlatformIcon(social.platform)}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="relative group cursor-zoom-in" onClick={() => setIsProfileOpen(true)}>
            <div className="absolute -inset-16 rounded-full blur-[100px] opacity-10 animate-pulse transition-all group-hover:opacity-20" style={{ backgroundColor: themeConfig.accent }}></div>
            <div className="relative z-10 w-64 h-64 lg:w-[420px] lg:h-[420px] p-3 bg-white/5 border border-white/10 rounded-full backdrop-blur-3xl shadow-3xl transition-all duration-700 hover:scale-[1.03]">
              <img src={data.profileImage} className="w-full h-full object-cover rounded-full border-4 border-slate-950/50" alt={data.name} />
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-950/50 opacity-0 hover:opacity-100 transition-all duration-500"><Maximize2 className="text-white" size={40} /></div>
            </div>
          </div>
        </div>
      </header>

      {/* Notice Board */}
      {data.showNotice && data.notice?.text && (
        <div className="fixed top-20 left-0 right-0 z-[40] px-6 lg:px-12 pointer-events-none">
          <div className="max-w-7xl mx-auto bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-xl overflow-hidden shadow-3xl flex items-center h-10 pointer-events-auto">
            <div className="bg-slate-950 px-4 h-full flex items-center gap-2 shrink-0 z-10 border-r border-white/5" style={{ color: themeConfig.accent }}>
              <Bell size={14} className="animate-bounce" />
              <span className="text-[8px] font-black uppercase tracking-[0.2em]">{t.noticeLabel}</span>
            </div>
            <div className="flex-1 overflow-hidden relative flex items-center">
              <div className="marquee-wrapper flex items-center gap-10 whitespace-nowrap">
                <p className="text-[11px] font-bold text-white pl-4">
                  <span className="opacity-40 font-mono text-[9px] mr-2">[{getNoticeTimestamp()}]</span>
                  {data.notice.text}
                </p>
                <span className="text-slate-700 font-black">/ / /</span>
                <p className="text-[11px] font-bold text-white">
                  <span className="opacity-40 font-mono text-[9px] mr-2">[{getNoticeTimestamp()}]</span>
                  {data.notice.text}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Section */}
      {/* Skills */}
      {data.showSkills && (
        <section className="py-24 px-6 lg:px-12 bg-white/[0.01] border-y border-white/5">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-2xl lg:text-3xl font-black mb-12 tracking-tighter flex items-center justify-center gap-3 text-white">
              <Code size={24} style={{ color: themeConfig.accent }} /> {t.skillsHeader}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {data.skills.map((s) => (
                <div key={s.id} className="bg-slate-900/60 p-5 rounded-2xl border border-white/10 text-center group hover:bg-white/10 hover:border-white/30 hover:scale-110 hover:-translate-y-1 transition-all shadow-xl cursor-default">
                  <p className="font-black text-[10px] uppercase tracking-[0.2em]" style={{ color: themeConfig.accent }}>{s.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Job Experience */}
      {data.showWork && data.jobExperiences && data.jobExperiences.length > 0 && (
        <section className="py-24 px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-black mb-16 tracking-tighter flex items-center gap-4 text-white uppercase">
              <Briefcase size={40} style={{ color: themeConfig.accent }} /> {t.jobExperienceHeader || "Experience"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {data.jobExperiences.map((job) => (
                <div key={job.id} className="glass p-8 rounded-[32px] border border-white/10 flex flex-col gap-6 items-start hover:border-white/30 transition-all h-full">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                    <img src={job.logoUrl} alt={job.companyName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <a href={job.website} target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity">
                        <h3 className="text-xl font-black text-white">{job.companyName}</h3>
                      </a>
                    </div>
                    <p className="text-sm font-bold text-slate-400">{job.duration}</p>
                    <p className="text-sm text-slate-300 leading-relaxed">{job.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About */}
      {data.showAbout && (
        <section id="about" className="py-24 px-6 lg:px-12 scroll-mt-20">
          <div className="max-w-3xl mx-auto glass p-10 lg:p-16 rounded-[48px] border border-white/10 shadow-3xl relative overflow-hidden text-center transition-all hover:border-white/20">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full opacity-20" style={{ backgroundColor: themeConfig.accent }}></div>
            <h2 className="text-3xl lg:text-4xl font-black mb-10 tracking-tighter flex items-center justify-center gap-3 text-white"><User size={32} style={{ color: themeConfig.accent }} /> {t.aboutHeader}</h2>
            <div className="text-slate-400 text-lg lg:text-xl leading-[1.8] font-medium whitespace-pre-wrap opacity-80">{data.aboutText}</div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {data.showGallery && (
        <section id="gallery" className="py-24 px-6 lg:px-12 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-black mb-16 tracking-tighter flex items-center gap-4 text-white uppercase"><ImageIcon size={40} style={{ color: themeConfig.accent }} /> {t.galleryHeader}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.gallery.map((item) => (
                <div key={item.id} className="group relative aspect-square overflow-hidden rounded-[32px] border border-white/10 shadow-3xl bg-slate-900 hover:border-white/30 transition-all hover:-translate-y-2 cursor-zoom-in" onClick={() => setSelectedImage(item.image)}>
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-1000 group-hover:brightness-110" />
                  <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-all duration-700 flex flex-col justify-end p-8 backdrop-blur-[2px]">
                     <h3 className="text-lg font-black text-white mb-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">{item.title}</h3>
                     <div className="w-10 h-1 rounded-full scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" style={{ backgroundColor: themeConfig.accent }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blog */}
      {data.showBlog && (
        <section id="blog" className="py-24 px-6 lg:px-12 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-black mb-16 tracking-tighter flex items-center gap-4 text-white uppercase"><BookOpen size={40} style={{ color: themeConfig.accent }} /> {t.blogHeader}</h2>
            <div className="grid md:grid-cols-3 gap-10">
              {data.projects.map((p) => (
                <div key={p.id} className="group glass rounded-[32px] overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-700 flex flex-col h-full shadow-3xl hover:-translate-y-2">
                  <div className="aspect-video overflow-hidden cursor-zoom-in" onClick={() => setSelectedImage(p.image)}>
                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition duration-1000 group-hover:brightness-110" />
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                    <h3 className="text-xl font-black mb-3 text-white group-hover:text-sky-400 transition-colors">{p.title}</h3>
                    <p className="text-slate-400 mb-8 flex-1 text-sm opacity-70 leading-relaxed line-clamp-3">{p.description}</p>
                    <button onClick={() => setSelectedBlog(p)} className="font-black text-[9px] uppercase tracking-[0.2em] flex items-center gap-2.5 transition-all w-fit group/btn hover:scale-105 active:scale-95 hover:brightness-125" style={{ color: themeConfig.accent }}>
                      {t.blogReadMore} <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Event Section */}
      {data.showEventSection && data.event && (
        <EventSection 
          title={data.event.title} 
          subtitle={data.event.subtitle} 
          animationType={data.event.animationType}
          theme={data.event.theme}
        />
      )}

      {/* Footer */}
      {data.showContact && (
        <footer id="contact" className="py-24 glass border-t border-white/10 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6 text-center space-y-16">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-6xl font-black tracking-tighter text-white">{t.contactHeader}</h2>
              <p className="text-slate-400 text-lg max-w-lg mx-auto font-medium opacity-60">{t.contactSub}</p>
            </div>
            <div className="flex flex-col lg:flex-row gap-10 justify-center items-center">
              <a href={`mailto:${data.email}`} className="group flex items-center gap-4 text-xl lg:text-2xl font-black text-slate-300 hover:text-white transition-all hover:scale-105 hover:-translate-y-1 active:scale-95">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/30 transition-all" style={{ color: themeConfig.accent }}>
                  <Mail size={24} />
                </div>
                {data.email}
              </a>
              <a href={`tel:${data.phone}`} className="group flex items-center gap-4 text-xl lg:text-2xl font-black text-slate-300 hover:text-white transition-all hover:scale-105 hover:-translate-y-1 active:scale-95">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/30 transition-all" style={{ color: themeConfig.accent }}>
                  <Phone size={24} />
                </div>
                {data.phone}
              </a>
            </div>
            <div className="pt-20 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
              <p className="text-slate-600 font-black text-[9px] uppercase tracking-[0.3em]">&copy; {new Date().getFullYear()} {data.name} // ALL RIGHTS RESERVED</p>
              <Link to="/login" className="text-slate-600 font-black uppercase tracking-[0.2em] text-[9px] hover:text-white transition-all flex items-center gap-2 hover:translate-x-1" aria-label="Admin Dashboard">
                <User size={14} className="mr-1" /> <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </footer>
      )}

      {data.showLiveChat && <Chat accentColor={themeConfig.accent} whatsappNumber={data.whatsappNumber} />}

      <style>{`
        .flag-wrapper {
          perspective: 600px;
          transform-style: preserve-3d;
        }
        .flag-cloth {
          animation: flag-wind-animation 3.5s ease-in-out infinite;
          transform-origin: left center;
          box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }
        @keyframes flag-wind-animation {
          0% { transform: rotateY(0deg) skewY(0deg); }
          25% { transform: rotateY(15deg) skewY(2deg); }
          50% { transform: rotateY(0deg) skewY(0deg); }
          75% { transform: rotateY(-15deg) skewY(-2deg); }
          100% { transform: rotateY(0deg) skewY(0deg); }
        }
        .flag-wind-shimmer {
          background: linear-gradient(
            105deg,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0) 35%,
            rgba(255,255,255,0.06) 48%,
            rgba(0,0,0,0.12) 50%,
            rgba(255,255,255,0.06) 52%,
            rgba(255,255,255,0) 65%,
            rgba(255,255,255,0) 100%
          );
          background-size: 200% 100%;
          animation: shimmer-flow 3.5s ease-in-out infinite;
        }
        @keyframes shimmer-flow {
          0% { background-position: -100% 0; }
          100% { background-position: 100% 0; }
        }
        @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        .marquee-wrapper { animation: marquee 35s linear infinite; display: flex; }
        .marquee-wrapper:hover { animation-play-state: paused; }
        .shadow-3xl { box-shadow: 0 50px 120px -30px rgba(0,0,0,0.8); }
        .glass { background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(24px); }

        /* BRUTALIST LAYOUT */
        .layout-brutalist {
          background-color: #f4f4f0;
          color: #111;
          font-family: 'Space Grotesk', system-ui, sans-serif;
        }
        .layout-brutalist .glass {
          background: #fff;
          backdrop-filter: none;
          border: 4px solid #111;
          border-radius: 0;
          box-shadow: 8px 8px 0px 0px #111;
        }
        .layout-brutalist h1, .layout-brutalist h2, .layout-brutalist h3 {
          color: #111;
          text-transform: uppercase;
          letter-spacing: -0.05em;
        }
        .layout-brutalist p, .layout-brutalist span, .layout-brutalist a {
          color: #333;
        }
        .layout-brutalist button, .layout-brutalist a.px-12 {
          border-radius: 0 !important;
          border: 3px solid #111;
          box-shadow: 4px 4px 0px 0px #111;
          background: #fff;
          color: #111 !important;
        }
        .layout-brutalist img {
          border-radius: 0 !important;
          border: 4px solid #111;
        }
        .layout-brutalist .rounded-full, .layout-brutalist .rounded-2xl, .layout-brutalist .rounded-\[32px\], .layout-brutalist .rounded-\[48px\] {
          border-radius: 0 !important;
        }
        .layout-brutalist .text-white { color: #111 !important; }
        .layout-brutalist .bg-white\/5 { background-color: #fff !important; border: 2px solid #111 !important; }
        .layout-brutalist .border-white\/10 { border-color: #111 !important; }

        /* MINIMAL LAYOUT */
        .layout-minimal {
          background-color: #fafafa;
          color: #333;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .layout-minimal .glass {
          background: transparent;
          backdrop-filter: none;
          border: none;
          box-shadow: none;
        }
        .layout-minimal h1, .layout-minimal h2, .layout-minimal h3 {
          color: #111;
          font-weight: 300;
          letter-spacing: -0.02em;
        }
        .layout-minimal p, .layout-minimal span, .layout-minimal a {
          color: #666;
        }
        .layout-minimal img {
          border-radius: 16px !important;
          filter: grayscale(20%);
        }
        .layout-minimal .border-white\/10, .layout-minimal .border-white\/5 {
          border-color: #eaeaea !important;
        }
        .layout-minimal .bg-white\/5 {
          background-color: #fff !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
        }
        .layout-minimal .text-white { color: #111 !important; }
        .layout-minimal .bg-slate-900\/60, .layout-minimal .bg-slate-900 {
          background-color: #fff !important;
        }
        .layout-minimal .shadow-3xl { box-shadow: none !important; }

        /* SPLIT LAYOUT */
        .layout-split {
          background-color: #050505;
          color: #fff;
        }
        @media (min-width: 1024px) {
          .layout-split header > div {
            max-width: 100%;
            padding: 0;
            gap: 0;
          }
          .layout-split header .flex-1 {
            padding: 4rem 6rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .layout-split header .relative.group {
            width: 50vw;
            height: 100vh;
            border-radius: 0;
            border: none;
            padding: 0;
            margin: -6rem -3rem -6rem 0; /* Negate padding */
          }
          .layout-split header img {
            border-radius: 0 !important;
            border: none;
            height: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Portfolio;
