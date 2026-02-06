
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PortfolioData, Product, Order } from '../types';
import { CLOUD_SYNC_CONFIG } from '../constants';
import { 
  Github, Linkedin, Mail, Phone, ExternalLink, ArrowRight, User, 
  BookOpen, Code, Facebook, Instagram, Twitter, Globe, MessageCircle, Youtube, Clock, Calendar, Sparkles, Languages, Image as ImageIcon, Bell, Briefcase, ShoppingBag, X, Send, RefreshCw, ChevronDown, Maximize2
} from 'lucide-react';

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
        {/* Bangladesh Flag CSS Render */}
        <div className="w-5 h-3.5 rounded-[2px] overflow-hidden flex-shrink-0 relative border border-white/5 shadow-sm">
           <div className="absolute inset-0 bg-[#006a4e]"></div>
           <div className="absolute top-1/2 left-[45%] -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#f42a41]"></div>
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

const Portfolio: React.FC<PortfolioProps> = ({ data, lang, setLang, t, onUpdate }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [orderName, setOrderName] = useState('');
  const [orderContact, setOrderContact] = useState('');
  const [orderCountry, setOrderCountry] = useState('BD');
  const [isOrdering, setIsOrdering] = useState(false);
  
  const theme = data.theme || 'neon';
  const themeConfig = {
    neon: { accent: '#0ea5e9', gradient: 'radial-gradient(at 0% 0%, hsla(200,100%,8%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(210,100%,10%,1) 0, transparent 50%), radial-gradient(at 50% 100%, hsla(220,100%,6%,1) 0, transparent 50%)' },
    gold: { accent: '#d4af37', gradient: 'radial-gradient(at 0% 0%, hsla(45,100%,8%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(35,100%,10%,1) 0, transparent 50%), radial-gradient(at 50% 100%, hsla(40,100%,6%,1) 0, transparent 50%)' },
    rose: { accent: '#e11d48', gradient: 'radial-gradient(at 0% 0%, hsla(340,100%,8%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(330,100%,10%,1) 0, transparent 50%), radial-gradient(at 50% 100%, hsla(345,100%,6%,1) 0, transparent 50%)' },
    emerald: { accent: '#10b981', gradient: 'radial-gradient(at 0% 0%, hsla(150,100%,8%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(160,100%,10%,1) 0, transparent 50%), radial-gradient(at 50% 100%, hsla(155,100%,6%,1) 0, transparent 50%)' }
  }[theme];

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9+]/g, '');
    setOrderContact(val);
    if (val.startsWith('+880') || val.startsWith('880')) {
      setOrderCountry('BD');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setIsOrdering(true);
    
    const newOrder: Order = {
      id: Date.now().toString(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productImage: selectedProduct.image,
      customerName: orderName,
      customerContact: orderContact,
      customerCountry: orderCountry, 
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    const updatedData = {
      ...data,
      orders: [...(data.orders || []), newOrder]
    };

    try {
      const response = await fetch(CLOUD_SYNC_CONFIG.API_URL, {
        method: 'POST',
        body: JSON.stringify(updatedData)
      });
      if (response.ok) {
        onUpdate(updatedData);
        alert(t.orderSuccess);
        setSelectedProduct(null);
        setOrderName('');
        setOrderContact('');
        setOrderCountry('BD');
      }
    } catch (error) {
      console.error("Order failed:", error);
    } finally {
      setIsOrdering(false);
    }
  };

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

  return (
    <div className="min-h-screen transition-all duration-1000 selection:bg-white/10" style={{ backgroundColor: '#020617', backgroundImage: themeConfig.gradient }}>
      {/* Profile Image Modal (Lightbox) */}
      {isProfileOpen && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/98 backdrop-blur-[40px] animate-in fade-in zoom-in duration-300 cursor-zoom-out"
          onClick={() => setIsProfileOpen(false)}
        >
           <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-all p-4 bg-white/5 rounded-full backdrop-blur-md border border-white/10 hover:scale-110 active:scale-95 shadow-2xl hover:bg-white/10">
             <X size={32} />
           </button>
           <div className="relative max-w-[min(90vw,650px)] w-full aspect-square p-3 bg-white/5 border border-white/10 rounded-full overflow-hidden shadow-[0_0_150px_rgba(0,0,0,0.9)]" onClick={(e) => e.stopPropagation()}>
              <img src={data.profileImage} className="w-full h-full object-cover rounded-full border-[6px] border-slate-950 shadow-inner" alt={data.name} />
           </div>
        </div>
      )}

      {/* Order Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-500">
           <div className="bg-slate-900/80 border border-white/10 rounded-[32px] w-full max-w-md p-8 shadow-3xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: themeConfig.accent }}></div>
              <button onClick={() => setSelectedProduct(null)} className="absolute top-5 right-5 text-slate-500 hover:text-white transition-all p-2 hover:bg-white/5 rounded-full hover:scale-110 active:scale-95"><X size={20} /></button>
              
              <div className="mb-8 text-center">
                <h3 className="text-xl font-black mb-1 text-white">{t.orderModalTitle}</h3>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: themeConfig.accent }}></div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{selectedProduct.name}</p>
                </div>
              </div>
              
              <form onSubmit={handlePlaceOrder} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">{t.orderNameLabel}</label>
                  <input required value={orderName} onChange={(e) => setOrderName(e.target.value)} className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-6 py-4 font-bold text-sm focus:border-white/40 focus:bg-slate-900 transition-all outline-none" placeholder="Name" />
                </div>
                
                <div className="flex flex-row gap-3">
                  <div className="w-[80px] shrink-0 space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">{t.orderCountryLabel}</label>
                    <div className="relative group/sel">
                      <select value={orderCountry} onChange={(e) => setOrderCountry(e.target.value)} className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-3 py-4 appearance-none focus:border-white/40 focus:bg-slate-900 transition-all font-black text-xs outline-none cursor-pointer text-center group-hover/sel:border-white/20" style={{ color: themeConfig.accent }}>
                        {COUNTRIES.map(c => <option key={c.code} value={c.code} className="bg-slate-900">{c.code}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none group-hover/sel:text-white transition-colors" size={12} />
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">{t.orderContactLabel}</label>
                    <input 
                      required 
                      type="tel" 
                      value={orderContact} 
                      onChange={handlePhoneChange} 
                      className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-6 py-4 font-bold text-sm focus:border-white/40 focus:bg-slate-900 transition-all outline-none" 
                      placeholder="+880..." 
                    />
                  </div>
                </div>

                <button type="submit" disabled={isOrdering} className="w-full py-5 rounded-2xl font-black text-[9px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 active:scale-[0.97] hover:scale-[1.02] hover:-translate-y-1 shadow-2xl hover:brightness-110" style={{ backgroundColor: themeConfig.accent, color: '#000' }}>
                  {isOrdering ? <RefreshCw className="animate-spin" size={16} /> : <Send size={16} />} {t.orderConfirmBtn}
                </button>
              </form>
           </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 transition-all h-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-full">
          <div className="flex justify-between h-full items-center">
            <div className="flex items-center gap-6">
              <a href="#" className="text-xl font-black tracking-tighter hover:scale-110 transition-transform origin-left" style={{ color: themeConfig.accent }}>{data.name}<span className="text-white">.</span></a>
              {data.showClock && <div className="hidden lg:block"><DigitalClock label={t.clockLabel} lang={lang} accentColor={themeConfig.accent} /></div>}
            </div>
            <div className="flex gap-4 lg:gap-6 items-center">
              <div className="hidden md:flex gap-6">
                {data.showAbout && <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="text-slate-400 hover:text-white font-bold text-[9px] uppercase tracking-widest transition-all hover:translate-y-[-1px] active:scale-95">{t.navAbout}</a>}
                {data.showProducts && <a href="#shop" onClick={(e) => scrollToSection(e, 'shop')} className="text-slate-400 hover:text-white font-bold text-[9px] uppercase tracking-widest transition-all hover:translate-y-[-1px] active:scale-95">{t.navProducts}</a>}
                {data.showGallery && <a href="#gallery" onClick={(e) => scrollToSection(e, 'gallery')} className="text-slate-400 hover:text-white font-bold text-[9px] uppercase tracking-widest transition-all hover:translate-y-[-1px] active:scale-95">{t.navGallery}</a>}
                {data.showBlog && <a href="#blog" onClick={(e) => scrollToSection(e, 'blog')} className="text-slate-400 hover:text-white font-bold text-[9px] uppercase tracking-widest transition-all hover:translate-y-[-1px] active:scale-95">{t.navBlog}</a>}
              </div>
              <button onClick={() => setLang(lang === 'en' ? 'bn' : 'en')} className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-[8px] font-black hover:bg-white/10 hover:border-white/30 transition-all tracking-widest uppercase hover:scale-110 active:scale-95">{lang.toUpperCase()}</button>
              <Link to="/login" className="w-10 h-10 rounded-full flex items-center justify-center shadow-2xl hover:brightness-110 active:scale-95 hover:scale-110 hover:-translate-y-0.5 transition-all" style={{ backgroundColor: themeConfig.accent, color: '#000' }} aria-label="Admin">
                <User size={16} />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Notice Board */}
      {data.showNotice && data.notice?.text && (
        <div className="fixed top-20 left-0 right-0 z-[40] px-6 lg:px-12">
          <div className="max-w-7xl mx-auto bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-xl overflow-hidden shadow-3xl flex items-center h-10 hover:border-white/20 transition-colors">
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

      {/* Hero */}
      <header className="pt-48 pb-24 px-6 lg:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row gap-12 items-center">
          <div className="flex-1 space-y-10 text-center lg:text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-2 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: themeConfig.accent }}></span>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t.heroStatus}</span>
              </div>
              <h1 className="text-4xl lg:text-7xl font-black text-white leading-[1] tracking-tighter">{t.heroIam} <br/> <span className="hover:opacity-80 transition-opacity cursor-default" style={{ color: themeConfig.accent }}>{data.name}</span></h1>
            </div>
            <h2 className="text-xl lg:text-3xl text-slate-400 italic font-medium opacity-80">{data.title}</h2>
            
            {/* WORK BADGE */}
            {data.showWork && (
              <div className="flex items-center justify-center lg:justify-start gap-3.5 p-3.5 lg:p-4 bg-white/5 border border-white/10 rounded-2xl w-fit mx-auto lg:mx-0 shadow-2xl backdrop-blur-2xl group hover:border-white/30 hover:bg-white/10 hover:scale-105 hover:-translate-y-1 transition-all duration-500 cursor-default">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-900 border border-white/5 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-500" style={{ color: themeConfig.accent }}>
                  <Briefcase size={20} />
                </div>
                <div className="text-left">
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{t.heroWorkLabel}</p>
                  <p className="text-xs lg:text-sm font-black text-white leading-tight tracking-normal">{data.currentWork}</p>
                </div>
              </div>
            )}

            <p className="text-lg lg:text-xl text-slate-400 max-w-xl font-medium leading-relaxed opacity-70 mx-auto lg:mx-0">{data.bio}</p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start pt-5">
              <a href={`mailto:${data.email}`} className="px-12 py-5 rounded-full font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-3xl hover:brightness-110 hover:scale-105 hover:-translate-y-1 active:scale-95 transition-all" style={{ backgroundColor: themeConfig.accent, color: '#000' }}>{t.heroEmailBtn} <Mail size={20} /></a>
              <div className="flex gap-3.5 justify-center">
                {data.socialLinks.map((social) => (
                  <a key={social.id} href={social.url} target="_blank" rel="noreferrer" className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 hover:border-white/40 hover:bg-white/10 transition-all hover:scale-110 hover:-translate-y-1 active:scale-90 shadow-2xl" style={{ color: themeConfig.accent }}>
                    {getPlatformIcon(social.platform)}
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-16 rounded-full blur-[100px] opacity-10 animate-pulse transition-all group-hover:opacity-20" style={{ backgroundColor: themeConfig.accent }}></div>
            
            {/* CLICKABLE PROFILE IMAGE */}
            <div 
              className="relative z-10 w-64 h-64 lg:w-[420px] lg:h-[420px] p-3 bg-white/5 border border-white/10 rounded-full backdrop-blur-3xl shadow-3xl cursor-zoom-in group/img transition-all duration-700 hover:scale-[1.03] hover:border-white/30 active:scale-95"
              onClick={() => setIsProfileOpen(true)}
            >
              <img src={data.profileImage} className="w-full h-full object-cover rounded-full border-4 border-slate-950/50 shadow-inner transition-all duration-700 group-hover/img:brightness-110" alt={data.name} />
              
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-950/50 opacity-0 group-hover/img:opacity-100 transition-all duration-500 backdrop-blur-[3px]">
                 <div className="bg-white/10 p-5 rounded-full border border-white/20 shadow-2xl transform scale-50 group-hover/img:scale-100 transition-all duration-500">
                    <Maximize2 className="text-white" size={40} />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Products Section */}
      {data.showProducts && (
        <section id="shop" className="py-24 px-6 lg:px-12 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
               <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl hover:scale-110 hover:rotate-6 transition-all" style={{ color: themeConfig.accent }}>
                  <ShoppingBag size={28} />
               </div>
               <h2 className="text-3xl lg:text-4xl font-black tracking-tighter text-white">{t.productsHeader}</h2>
               <div className="h-0.5 w-16 mx-auto rounded-full" style={{ backgroundColor: themeConfig.accent }}></div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {data.products?.map((product) => (
                <div key={product.id} className="group glass rounded-[40px] overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-700 flex flex-col h-full shadow-3xl hover:-translate-y-2">
                   <div className="aspect-[4/5] overflow-hidden relative">
                      <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition duration-1000 group-hover:brightness-110" />
                      <div className="absolute top-6 right-6 bg-slate-950/80 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-xl text-lg font-black shadow-2xl group-hover:scale-110 transition-transform" style={{ color: themeConfig.accent }}>{product.currency}{product.amount}</div>
                   </div>
                   <div className="p-8 space-y-5 flex flex-1 flex-col">
                      <h3 className="text-xl font-black text-white group-hover:text-sky-400 transition-colors">{product.name}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed flex-1 opacity-70">{product.description}</p>
                      <button onClick={() => setSelectedProduct(product)} className="w-full py-4 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] transition-all bg-white text-slate-950 hover:bg-slate-200 hover:scale-[1.03] hover:-translate-y-1 active:scale-95 shadow-3xl">{t.orderBtn}</button>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Skills */}
      {data.showSkills && (
        <section className="py-24 px-6 lg:px-12 bg-white/[0.01] border-y border-white/5">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl lg:text-3xl font-black text-center mb-12 tracking-tighter flex items-center justify-center gap-3"><Code size={24} style={{ color: themeConfig.accent }} /> {t.skillsHeader}</h2>
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

      {/* About */}
      {data.showAbout && (
        <section id="about" className="py-24 px-6 lg:px-12 scroll-mt-20">
          <div className="max-w-3xl mx-auto glass p-10 lg:p-16 rounded-[48px] border border-white/10 shadow-3xl relative overflow-hidden text-center hover:border-white/20 transition-colors">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full opacity-20" style={{ backgroundColor: themeConfig.accent }}></div>
            <h2 className="text-3xl lg:text-4xl font-black mb-10 tracking-tighter flex items-center justify-center gap-3 text-white"><User size={32} style={{ color: themeConfig.accent }} /> {t.aboutHeader}</h2>
            <div className="text-slate-400 text-lg lg:text-xl leading-[1.8] font-medium whitespace-pre-wrap opacity-80">{data.aboutText}</div>
          </div>
        </section>
      )}

      {/* Gallery Section */}
      {data.showGallery && (
        <section id="gallery" className="py-24 px-6 lg:px-12 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-black mb-16 tracking-tighter flex items-center gap-4 text-white hover:opacity-90 transition-opacity cursor-default"><ImageIcon size={40} style={{ color: themeConfig.accent }} /> {t.galleryHeader}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.gallery.length > 0 ? data.gallery.map((item) => (
                <div key={item.id} className="group relative aspect-square overflow-hidden rounded-[32px] border border-white/10 shadow-3xl bg-slate-900 hover:border-white/30 transition-all hover:-translate-y-2">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-1000 group-hover:brightness-110" />
                  <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-all duration-700 flex flex-col justify-end p-8 backdrop-blur-[2px]">
                     <h3 className="text-lg font-black text-white mb-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">{item.title}</h3>
                     <div className="w-10 h-1 rounded-full scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" style={{ backgroundColor: themeConfig.accent }}></div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-20 text-center text-slate-500 uppercase tracking-[0.3em] font-black text-[10px] border-2 border-dashed border-white/10 rounded-[32px]">Module Offline</div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Blog */}
      {data.showBlog && (
        <section id="blog" className="py-24 px-6 lg:px-12 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-black mb-16 tracking-tighter flex items-center gap-4 text-white hover:opacity-90 transition-opacity cursor-default"><BookOpen size={40} style={{ color: themeConfig.accent }} /> {t.blogHeader}</h2>
            <div className="grid md:grid-cols-3 gap-10">
              {data.projects.map((p) => (
                <div key={p.id} className="group glass rounded-[32px] overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-700 flex flex-col h-full shadow-3xl hover:-translate-y-2">
                  <div className="aspect-video overflow-hidden">
                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition duration-1000 group-hover:brightness-110" />
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                    <h3 className="text-xl font-black mb-3 text-white group-hover:text-sky-400 transition-colors">{p.title}</h3>
                    <p className="text-slate-400 mb-8 flex-1 text-sm opacity-70 leading-relaxed line-clamp-3">{p.description}</p>
                    <a href={p.link} target="_blank" rel="noreferrer" className="font-black text-[9px] uppercase tracking-[0.2em] flex items-center gap-2.5 transition-all w-fit group/btn hover:scale-105 active:scale-95 hover:brightness-125" style={{ color: themeConfig.accent }}>
                      {t.blogReadMore} <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
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
              <Link to="/login" className="text-slate-600 font-black uppercase tracking-[0.2em] text-[9px] hover:text-white transition-all flex items-center gap-2 hover:scale-110 active:scale-95 hover:translate-x-1" aria-label="Admin Dashboard">
                <User size={14} className="mr-1" /> <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </footer>
      )}
      
      <style>{`
        @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        .marquee-wrapper { animation: marquee 40s linear infinite; display: flex; }
        .marquee-wrapper:hover { animation-play-state: paused; }
        .shadow-3xl { box-shadow: 0 50px 120px -30px rgba(0,0,0,0.8); }
        .glass { background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(24px); }
      `}</style>
    </div>
  );
};

export default Portfolio;
