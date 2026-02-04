
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PortfolioData } from '../types';
import { 
  Github, Linkedin, Mail, Phone, ExternalLink, ArrowRight, User, 
  BookOpen, Code, Facebook, Instagram, Twitter, Globe, MessageCircle, Youtube, Clock, Calendar, Sparkles, Languages
} from 'lucide-react';

interface PortfolioProps {
  data: PortfolioData;
  lang: 'en' | 'bn';
  setLang: (lang: 'en' | 'bn') => void;
  t: any;
}

const DigitalClock: React.FC<{ label: string; lang: string }> = ({ label, lang }) => {
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
    <div className="flex items-center gap-3 bg-cyan-500/5 px-4 py-1.5 rounded-full border border-cyan-500/20 text-[11px] font-mono text-cyan-400 shadow-xl shadow-cyan-950/20 backdrop-blur-sm">
      <div className="hidden sm:flex items-center gap-1.5 border-r border-cyan-500/20 pr-3 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
        {label}
      </div>
      <div className="flex items-center gap-1.5 border-r border-cyan-500/20 pr-3">
        <Calendar size={12} className="text-cyan-500" />
        <span>{dateTime.date}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Clock size={12} className="animate-pulse text-cyan-400" />
        <span>{dateTime.time} <span className="text-[9px] text-slate-600 ml-1">BST</span></span>
      </div>
    </div>
  );
};

const Portfolio: React.FC<PortfolioProps> = ({ data, lang, setLang, t }) => {
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const getPlatformIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('facebook')) return <Facebook size={20} />;
    if (p.includes('github')) return <Github size={20} />;
    if (p.includes('linkedin')) return <Linkedin size={20} />;
    if (p.includes('instagram')) return <Instagram size={20} />;
    if (p.includes('twitter') || p.includes(' x')) return <Twitter size={20} />;
    if (p.includes('whatsapp')) return <MessageCircle size={20} />;
    if (p.includes('youtube')) return <Youtube size={20} />;
    return <Globe size={20} />;
  };

  return (
    <div className="bg-gradient-mesh min-h-screen selection:bg-cyan-500/30 selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-8">
              <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent hover:scale-105 transition-all duration-300 neon-text active:scale-95">
                {data.name}
              </a>
              <div className="hidden xl:block">
                <DigitalClock label={t.clockLabel} lang={lang} />
              </div>
            </div>
            <div className="flex gap-4 sm:gap-8 items-center">
              {['about', 'blog', 'contact'].map((id) => (
                <a 
                  key={id}
                  href={`#${id}`} 
                  onClick={(e) => scrollToSection(e, id)} 
                  className="hidden md:block text-slate-400 hover:text-cyan-400 transition-all duration-300 font-semibold text-sm tracking-wide relative group"
                >
                  {id === 'about' ? t.navAbout : id === 'blog' ? t.navBlog : t.navContact}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
                </a>
              ))}
              
              {/* Language Switcher */}
              <button 
                onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
                className="flex items-center gap-2 bg-slate-900/50 hover:bg-slate-800 border border-white/10 px-4 py-2 rounded-full transition-all duration-300 text-xs font-bold active:scale-90 hover:border-cyan-500/30 shadow-lg hover:shadow-cyan-500/10"
              >
                <Languages size={14} className="text-cyan-400" />
                <span className="uppercase tracking-widest">{lang}</span>
              </button>

              <Link to="/login" className="bg-cyan-600 hover:bg-cyan-500 px-6 py-2.5 rounded-full text-xs transition-all duration-300 font-bold shadow-lg shadow-cyan-900/40 border border-cyan-400/20 uppercase tracking-widest active:scale-95 hover:shadow-cyan-500/20">
                {t.navAdmin}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-48 pb-32 px-4 relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 items-center">
          <div className="flex-1 space-y-8 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-4 animate-bounce">
              <Sparkles size={14} /> {t.heroWelcome}
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight text-white">
              {t.heroIam} <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">{data.name}</span>
            </h1>
            <h2 className="text-2xl md:text-3xl text-slate-400 font-light italic">{data.title}</h2>
            <p className="text-lg text-slate-400 max-w-xl leading-relaxed mx-auto md:mx-0">
              {data.bio}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center md:justify-start pt-4">
              <a 
                href={`mailto:${data.email}`} 
                className="bg-white text-slate-950 hover:bg-cyan-400 hover:text-white transition-all duration-500 px-10 py-4 rounded-full font-bold flex items-center justify-center gap-3 shadow-2xl shadow-white/5 active:scale-95 group"
              >
                {t.heroEmailBtn} <Mail size={18} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <div className="flex gap-4 justify-center">
                {data.socialLinks.map((social) => (
                  <a 
                    key={social.id} 
                    href={social.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="w-14 h-14 rounded-full flex items-center justify-center bg-slate-900/50 hover:bg-cyan-600 hover:text-white border border-white/5 hover:border-cyan-500/50 transition-all duration-300 active:scale-90 shadow-lg hover:shadow-cyan-500/20" 
                    title={social.platform}
                  >
                    {getPlatformIcon(social.platform)}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-10 bg-cyan-600/20 rounded-full blur-[80px] opacity-40 animate-pulse group-hover:opacity-60 transition-opacity"></div>
            <div className="relative w-56 h-56 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-slate-900 shadow-2xl p-1 bg-gradient-to-tr from-cyan-500 to-blue-600 group-hover:scale-105 transition-transform duration-500">
                <img 
                  src={data.profileImage} 
                  alt={data.name}
                  className="w-full h-full object-cover rounded-full"
                />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-slate-900 border border-white/10 px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2 group-hover:-translate-y-1 transition-transform">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">{t.heroStatus}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Skills Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
             <h2 className="text-4xl font-black flex justify-center items-center gap-3 tracking-tight">
               <Code className="text-cyan-400" /> {t.skillsHeader}
             </h2>
             <div className="h-1.5 w-24 bg-cyan-600 mx-auto rounded-full group-hover:w-32 transition-all"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {data.skills.map((skill) => (
              <div key={skill.id} className="bg-slate-900/40 p-6 rounded-2xl border border-white/5 text-center group hover:border-cyan-500/40 transition-all duration-300 cursor-default hover:-translate-y-2 shadow-xl shadow-black/20 hover:bg-slate-900/60">
                <p className="font-bold text-slate-400 group-hover:text-cyan-400 transition-colors uppercase tracking-widest text-xs">{skill.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 scroll-mt-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="glass p-10 md:p-20 rounded-[40px] border border-white/5 relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] group-hover:bg-blue-600/20 transition-all duration-700"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-600/10 rounded-full blur-[80px] group-hover:bg-cyan-600/20 transition-all duration-700"></div>
            
            <h2 className="text-4xl font-black mb-10 flex items-center gap-4 tracking-tight group-hover:translate-x-2 transition-transform">
              <User className="text-cyan-400" size={32} /> {t.aboutHeader}
            </h2>
            <div className="text-slate-400 text-lg md:text-xl leading-[2] whitespace-pre-wrap font-medium">
              {data.aboutText}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-32 px-4 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="space-y-4">
              <h2 className="text-5xl font-black flex items-center gap-4 tracking-tight">
                <BookOpen className="text-cyan-400" /> {t.blogHeader}
              </h2>
              <div className="h-1.5 w-32 bg-cyan-600 rounded-full"></div>
            </div>
            <p className="text-slate-500 max-w-sm font-medium">{t.blogDesc}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {data.projects.map((project) => (
              <div key={project.id} className="group glass rounded-3xl overflow-hidden border border-white/5 hover:border-cyan-500/40 transition-all duration-500 shadow-2xl flex flex-col h-full hover:-translate-y-3">
                <div className="aspect-[16/10] overflow-hidden relative">
                  <div className="absolute inset-0 bg-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 duration-500"></div>
                  <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-cyan-400 transition-colors duration-300">{project.title}</h3>
                  <p className="text-slate-400 mb-8 line-clamp-3 text-sm leading-relaxed flex-1">{project.description}</p>
                  <a href={project.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 text-cyan-400 font-black text-xs uppercase tracking-[0.2em] hover:text-cyan-200 transition-all w-fit group/btn active:scale-95">
                    {t.blogReadMore} <ExternalLink size={14} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform duration-300" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <footer id="contact" className="py-32 glass border-t border-white/5 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-20">
          <div className="space-y-10">
            <div className="space-y-6">
                <h2 className="text-6xl font-black tracking-tighter hover:tracking-normal transition-all duration-500">{t.contactHeader}</h2>
                <p className="text-slate-400 text-lg leading-loose max-w-lg">{t.contactSub}</p>
            </div>
            <div className="space-y-6">
              <a 
                href={`mailto:${data.email}`} 
                className="flex items-center gap-6 text-slate-300 hover:text-cyan-400 transition-all duration-300 group w-fit active:scale-95"
              >
                <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center border border-white/5 group-hover:border-cyan-500/50 group-hover:shadow-2xl group-hover:shadow-cyan-500/10 transition-all duration-300 group-hover:bg-cyan-600 group-hover:text-slate-950">
                  <Mail size={24} />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{t.contactEmailLabel}</p>
                    <span className="text-lg font-bold">{data.email}</span>
                </div>
              </a>
              <a 
                href={`tel:${data.phone}`}
                className="flex items-center gap-6 text-slate-300 hover:text-cyan-400 transition-all duration-300 group w-fit active:scale-95"
              >
                <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center border border-white/5 group-hover:border-cyan-500/50 group-hover:shadow-2xl group-hover:shadow-cyan-500/10 transition-all duration-300 group-hover:bg-cyan-600 group-hover:text-slate-950">
                  <Phone size={24} />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{t.contactPhoneLabel}</p>
                    <span className="text-lg font-bold">{data.phone}</span>
                </div>
              </a>
            </div>
          </div>
          
          <div className="bg-slate-950/50 p-10 md:p-16 rounded-[40px] border border-white/5 space-y-10 relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-600/5 blur-3xl group-hover:bg-cyan-600/10 transition-all duration-500"></div>
            <p className="text-xs font-black uppercase text-slate-500 tracking-[0.4em]">{t.contactSocialLabel}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {data.socialLinks.map((social) => (
                <a key={social.id} href={social.url} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-4 p-6 bg-slate-900/50 rounded-3xl hover:bg-cyan-600 transition-all duration-500 group border border-white/5 active:scale-90 hover:shadow-2xl hover:shadow-cyan-500/20">
                  <span className="text-slate-400 group-hover:text-white transition-colors duration-300">{getPlatformIcon(social.platform)}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-cyan-100 transition-colors duration-300">{social.platform}</span>
                </a>
              ))}
            </div>
            <div className="pt-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6 text-slate-500 text-xs font-bold uppercase tracking-widest">
              <p className="hover:text-slate-300 transition-colors">&copy; {new Date().getFullYear()} {data.name}</p>
              <Link to="/login" className="hover:text-cyan-400 transition-all duration-300 flex items-center gap-2 group/admin">
                {t.footerAdmin} <ArrowRight size={14} className="group-hover/admin:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Portfolio;
