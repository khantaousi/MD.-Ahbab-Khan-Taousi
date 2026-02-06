
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PortfolioData, Project, Skill, SocialLink, GalleryItem, Product, Order, OrderStatus } from '../types';
import { CLOUD_SYNC_CONFIG, THEME_OPTIONS, CURRENCY_SYMBOLS, ORDER_STATUS_OPTIONS } from '../constants';
import { 
  Save, LogOut, Plus, Trash2, Camera, Link as LinkIcon, 
  FileText, Layout, Info, BookOpen, Github, Linkedin, 
  Phone, Mail, Facebook, Instagram, Twitter, Globe, MessageCircle, Youtube, 
  ExternalLink, Shield, Rocket, Copy, Check, Cloud, RefreshCw, Palette, Eye, EyeOff, Image as ImageIcon, Bell, Clock, Briefcase, ShoppingBag, ListChecks, Calendar, MapPin, DollarSign, ChevronDown, Activity, Wifi, WifiOff,
  User, Code
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
  const [activeTab, setActiveTab] = useState<'basic' | 'about' | 'skills' | 'blog' | 'gallery' | 'notice' | 'contact' | 'deploy' | 'visibility' | 'products' | 'orders'>('basic');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const currentThemeColor = THEME_OPTIONS.find(th => th.id === formData.theme)?.color || '#0ea5e9';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setHasUnsavedChanges(true);
  };

  const handleNoticeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ 
      ...prev, 
      notice: { 
        text: e.target.value, 
        updatedAt: new Date().toISOString() 
      } 
    }));
    setHasUnsavedChanges(true);
  };

  const handleToggle = (name: keyof PortfolioData) => {
    setFormData(prev => ({ ...prev, [name]: !prev[name] }));
    setHasUnsavedChanges(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'blog' | 'gallery' | 'product', id?: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === 'profile') setFormData(prev => ({ ...prev, profileImage: base64 }));
        if (type === 'product' && id) updateProduct(id, 'image', base64);
        if (type === 'blog' && id) updateBlogPost(id, 'image', base64);
        if (type === 'gallery' && id) updateGalleryItem(id, 'image', base64);
        setHasUnsavedChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      const response = await fetch(CLOUD_SYNC_CONFIG.API_URL, { 
        method: 'POST', 
        body: JSON.stringify(formData) 
      });
      if (!response.ok) throw new Error("Cloud save failed");
      onUpdate(formData);
      setSaveStatus('saved');
      setHasUnsavedChanges(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) { 
      setSaveStatus('idle'); 
      alert(lang === 'bn' ? "পাবলিশ করতে সমস্যা হয়েছে! ইন্টারনেট কানেকশন চেক করুন।" : "Publish failed! Check your internet connection.");
    }
  };

  const addProduct = () => {
    const newProduct: Product = { id: Date.now().toString(), name: "New Product", amount: "0", currency: "৳", description: "Details...", image: "https://picsum.photos/600/600" };
    setFormData(prev => ({ ...prev, products: [...(prev.products || []), newProduct] }));
    setHasUnsavedChanges(true);
  };

  const updateProduct = (id: string, field: keyof Product, value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      products: (prev.products || []).map(p => p.id === id ? { ...p, [field]: value } : p) 
    }));
    setHasUnsavedChanges(true);
  };

  const removeProduct = (id: string) => {
    setFormData(prev => ({ ...prev, products: (prev.products || []).filter(p => p.id !== id) }));
    setHasUnsavedChanges(true);
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setFormData(prev => ({
      ...prev,
      orders: (prev.orders || []).map(o => o.id === id ? { ...o, status } : o)
    }));
    setHasUnsavedChanges(true);
  };

  const removeOrder = (id: string) => {
    const updatedOrders = (formData.orders || []).filter(o => o.id !== id);
    setFormData(prev => ({ ...prev, orders: updatedOrders }));
    setHasUnsavedChanges(true);
  };

  const addSkill = () => {
    setFormData(prev => ({ ...prev, skills: [...(prev.skills || []), { id: Date.now().toString(), name: "New Skill" }] }));
    setHasUnsavedChanges(true);
  };
  const removeSkill = (id: string) => {
    setFormData(prev => ({ ...prev, skills: (prev.skills || []).filter(s => s.id !== id) }));
    setHasUnsavedChanges(true);
  };
  const updateSkill = (id: string, name: string) => {
    setFormData(prev => ({ ...prev, skills: (prev.skills || []).map(s => s.id === id ? { ...s, name } : s) }));
    setHasUnsavedChanges(true);
  };
  
  const addGalleryItem = () => {
    setFormData(prev => ({ ...prev, gallery: [...(prev.gallery || []), { id: Date.now().toString(), image: "https://picsum.photos/800/800", title: "Moment" }] }));
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

  const addBlogPost = () => {
    setFormData(prev => ({ ...prev, projects: [...(prev.projects || []), { id: Date.now().toString(), title: "Post Title", description: "Summary", image: "https://picsum.photos/600/400", link: "#" }] }));
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

  const getStatusColor = (status: OrderStatus) => {
    return ORDER_STATUS_OPTIONS.find(o => o.id === status)?.color || '#64748b';
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100 selection:bg-white/20">
      <header className="glass border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center shadow-2xl border border-white/10 hover:scale-110 hover:rotate-6 transition-all">
                <Shield size={20} style={{ color: currentThemeColor }} />
            </div>
            <div>
                <h1 className="text-lg font-black tracking-tight">{t.adminHeader}</h1>
                <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.3em] opacity-60">
                   {hasUnsavedChanges ? <span className="text-amber-500 animate-pulse font-bold uppercase tracking-widest">Unsaved Changes</span> : t.adminSub}
                </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/" className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all bg-white/5 border border-white/10 h-10 hover:scale-105 active:scale-95">
               <Eye size={14} /> {t.adminViewSite}
            </Link>
            <button 
              onClick={handleSave} 
              disabled={saveStatus === 'saving'} 
              className="flex items-center gap-2.5 px-6 py-3 rounded-full font-black text-[9px] uppercase tracking-[0.2em] transition-all shadow-3xl active:scale-95 disabled:opacity-50 h-10 min-w-[140px] justify-center hover:scale-105 hover:-translate-y-0.5 hover:brightness-110" 
              style={{ backgroundColor: saveStatus === 'saved' ? '#10b981' : currentThemeColor, color: '#000' }}
            >
              {saveStatus === 'saving' ? <RefreshCw size={14} className="animate-spin" /> : <Cloud size={14} />} 
              {saveStatus === 'saving' ? t.adminSaving : saveStatus === 'saved' ? t.adminSaved : t.adminSave}
            </button>
            <button onClick={onLogout} className="w-10 h-10 flex items-center justify-center bg-slate-900/50 hover:bg-red-500 hover:text-white rounded-2xl transition-all active:scale-90 border border-white/10 hover:scale-105"><LogOut size={18} /></button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto p-6 lg:p-10 grid md:grid-cols-[260px_1fr] gap-8">
        <aside className="space-y-6">
          <div className="glass rounded-[32px] p-4 border border-white/10 space-y-1.5 shadow-3xl">
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4 mt-2 px-4 opacity-50">{t.adminMenu}</p>
            {[
              { id: 'basic', label: t.adminBasic, icon: <Info size={16} /> },
              { id: 'visibility', label: t.adminVisibility, icon: <Activity size={16} /> },
              { id: 'products', label: t.adminProducts, icon: <ShoppingBag size={16} /> },
              { id: 'orders', label: t.adminOrders, icon: <ListChecks size={16} /> },
              { id: 'notice', label: t.adminNotice, icon: <Bell size={16} /> },
              { id: 'about', label: t.aboutHeader, icon: <FileText size={16} /> },
              { id: 'blog', label: t.adminBlog, icon: <BookOpen size={16} /> },
              { id: 'gallery', label: t.adminGallery, icon: <ImageIcon size={16} /> },
              { id: 'skills', label: t.adminSkills, icon: <Layout size={16} /> },
            ].map((tab) => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id as any)} 
                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all text-[9px] font-black uppercase tracking-widest hover:scale-[1.03] active:scale-95 ${activeTab === tab.id ? 'text-slate-950 shadow-2xl' : 'text-slate-500 hover:text-white hover:bg-white/5'}`} 
                style={activeTab === tab.id ? { backgroundColor: currentThemeColor } : {}}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </aside>

        <main className="glass rounded-[40px] p-8 lg:p-12 border border-white/10 shadow-3xl overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-hide">
          {activeTab === 'basic' && (
            <div className="space-y-12 animate-in fade-in duration-500">
               <h2 className="text-2xl font-black tracking-tighter">{t.adminBasic}</h2>
               <div className="grid lg:grid-cols-[180px_1fr] gap-12 items-start">
                  <div className="relative group w-44 h-44 active:scale-95 transition-all shadow-3xl rounded-[32px] hover:scale-[1.02]">
                    <img src={formData.profileImage} className="w-full h-full object-cover rounded-[32px] border-2 border-white/10 group-hover:brightness-110 transition-all" />
                    <label className="absolute inset-0 flex items-center justify-center bg-slate-950/70 opacity-0 hover:opacity-100 cursor-pointer rounded-[32px] transition-all backdrop-blur-[2px]"><Camera size={32} className="text-white animate-pulse" /><input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'profile')} /></label>
                  </div>
                  <div className="space-y-8 flex-1">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                         <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Display Name</label>
                         <input name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 font-bold text-sm focus:border-white/30 outline-none transition-all hover:bg-slate-900" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Official Title</label>
                         <input name="title" value={formData.title} onChange={handleChange} className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 font-bold text-sm focus:border-white/30 outline-none transition-all hover:bg-slate-900" />
                      </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">{t.adminWorkplace}</label>
                       <input name="currentWork" value={formData.currentWork} onChange={handleChange} className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 font-bold text-sm focus:border-white/30 outline-none transition-all hover:bg-slate-900" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Bio</label>
                       <textarea name="bio" value={formData.bio} onChange={handleChange} className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 h-32 font-medium text-sm resize-none focus:border-white/30 outline-none transition-all hover:bg-slate-900" />
                    </div>
                    <div className="p-8 bg-white/[0.02] rounded-[32px] border border-white/5 space-y-6">
                       <label className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1"><Palette size={16} /> {t.adminTheme}</label>
                       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          {THEME_OPTIONS.map(theme => (
                            <button key={theme.id} onClick={() => { setFormData(prev => ({ ...prev, theme: theme.id as any })); setHasUnsavedChanges(true); }} className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all hover:scale-110 active:scale-95 ${formData.theme === theme.id ? 'bg-white/10 border-white/20 shadow-xl' : 'border-white/5 hover:border-white/10'}`} style={formData.theme === theme.id ? { borderColor: theme.color } : {}}>
                               <div className="w-8 h-8 rounded-xl shadow-lg" style={{ backgroundColor: theme.color }}></div>
                               <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{theme.name}</span>
                            </button>
                          ))}
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'visibility' && (
            <div className="space-y-12 animate-in fade-in duration-500">
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-black tracking-tighter">{t.adminVisibility}</h2>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Module Health & Sync Center</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                 {[
                   { key: 'showNotice', label: t.visLabelNotice, icon: <Bell size={18} /> },
                   { key: 'showProducts', label: t.visLabelProducts, icon: <ShoppingBag size={18} /> },
                   { key: 'showWork', label: t.visLabelWork, icon: <Briefcase size={18} /> },
                   { key: 'showAbout', label: t.visLabelAbout, icon: <User size={18} /> },
                   { key: 'showSkills', label: t.visLabelSkills, icon: <Code size={18} /> },
                   { key: 'showBlog', label: t.visLabelBlog, icon: <BookOpen size={18} /> },
                   { key: 'showGallery', label: t.visLabelGallery, icon: <ImageIcon size={18} /> },
                   { key: 'showClock', label: t.visLabelClock, icon: <Clock size={18} /> },
                   { key: 'showContact', label: t.visLabelContact, icon: <Phone size={18} /> },
                 ].map((item) => {
                   const isEnabled = !!formData[item.key as keyof PortfolioData];
                   return (
                    <button 
                      key={item.key} 
                      onClick={() => handleToggle(item.key as any)} 
                      className={`group relative flex items-center justify-between p-6 rounded-[24px] border transition-all duration-500 overflow-hidden hover:scale-[1.02] active:scale-95 ${isEnabled ? 'bg-slate-900/40' : 'bg-slate-950/20 opacity-50'}`}
                      style={{ 
                        borderColor: isEnabled ? `${currentThemeColor}44` : 'rgba(255,255,255,0.05)',
                        boxShadow: isEnabled ? `0 20px 40px -15px ${currentThemeColor}22` : 'none'
                      }}
                    >
                      {/* Status Glow Background */}
                      {isEnabled && (
                        <div className="absolute top-0 right-0 w-32 h-32 blur-[50px] opacity-10 -mr-10 -mt-10 transition-all group-hover:opacity-20" style={{ backgroundColor: currentThemeColor }}></div>
                      )}

                      <div className="flex items-center gap-4 relative z-10">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${isEnabled ? 'bg-white/5' : 'bg-slate-900'}`} style={{ color: isEnabled ? currentThemeColor : '#334155' }}>
                           {item.icon}
                        </div>
                        <div className="text-left">
                           <span className={`block font-black uppercase tracking-[0.1em] text-[10px] mb-1 ${isEnabled ? 'text-white' : 'text-slate-500'}`}>{item.label}</span>
                           <div className="flex items-center gap-1.5">
                              {isEnabled ? (
                                <>
                                  <Wifi size={10} className="text-emerald-500" />
                                  <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Online</span>
                                </>
                              ) : (
                                <>
                                  <WifiOff size={10} className="text-slate-700" />
                                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-700">Offline</span>
                                </>
                              )}
                           </div>
                        </div>
                      </div>

                      <div className="relative z-10">
                        <div className={`w-14 h-7 rounded-full p-1 transition-all duration-500 ${isEnabled ? '' : 'bg-slate-900'}`} style={{ backgroundColor: isEnabled ? `${currentThemeColor}33` : undefined }}>
                           <div className={`w-5 h-5 rounded-full transition-all duration-500 shadow-xl ${isEnabled ? 'translate-x-7' : 'translate-x-0'}`} style={{ backgroundColor: isEnabled ? currentThemeColor : '#1e293b' }}></div>
                        </div>
                      </div>
                    </button>
                   );
                 })}
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex justify-between items-center border-b border-white/5 pb-6">
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-black tracking-tighter">{t.adminProducts}</h2>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Manage your digital storefront items</p>
                </div>
                <button onClick={addProduct} className="bg-white/5 hover:bg-white text-slate-400 hover:text-slate-950 px-6 py-2.5 rounded-full border border-white/10 transition-all font-black text-[9px] uppercase tracking-[0.2em] flex items-center gap-2 shadow-3xl active:scale-95 hover:scale-105 hover:-translate-y-0.5"><Plus size={16} /> {t.adminNewProduct}</button>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                {(formData.products || []).map((p) => (
                  <div key={p.id} className="bg-white/[0.02] rounded-[32px] p-6 border border-white/10 space-y-6 relative group transition-all hover:bg-white/[0.04] hover:-translate-y-1">
                    <button onClick={() => removeProduct(p.id)} className="absolute top-4 right-4 p-2 text-slate-600 hover:text-red-500 transition-all z-20 hover:scale-125 active:scale-90"><Trash2 size={18} /></button>
                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-white/10 bg-slate-900 shadow-lg">
                        <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                        <label className="absolute inset-0 flex items-center justify-center bg-slate-950/70 opacity-0 hover:opacity-100 cursor-pointer transition-all"><Camera size={28} className="text-white animate-bounce" /><input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'product', p.id)} /></label>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">Product Name</label>
                        <input value={p.name} onChange={(e) => updateProduct(p.id, 'name', e.target.value)} className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 font-black text-sm outline-none focus:border-white/20 transition-all hover:bg-slate-900" placeholder="Item Name" />
                      </div>
                      <div className="grid grid-cols-[80px_1fr] gap-3">
                         <div className="space-y-1">
                           <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1 text-center block">Currency</label>
                           <select value={p.currency} onChange={(e) => updateProduct(p.id, 'currency', e.target.value)} className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-2 py-3 font-black text-center text-xs outline-none focus:border-white/20 appearance-none hover:bg-slate-900 cursor-pointer">
                              {CURRENCY_SYMBOLS.map(sym => <option key={sym} value={sym} className="bg-slate-900">{sym}</option>)}
                           </select>
                         </div>
                         <div className="space-y-1">
                           <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">Price (Amount)</label>
                           <input 
                            type="text" 
                            value={p.amount} 
                            onChange={(e) => updateProduct(p.id, 'amount', e.target.value)} 
                            className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 font-black text-sm outline-none focus:border-white/20 hover:bg-slate-900" 
                            placeholder="0.00" 
                           />
                         </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">Description</label>
                        <textarea value={p.description} onChange={(e) => updateProduct(p.id, 'description', e.target.value)} className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 h-24 text-xs font-medium resize-none outline-none focus:border-white/20 hover:bg-slate-900 transition-all" placeholder="Product details..." />
                      </div>
                    </div>
                  </div>
                ))}
                {(!formData.products || formData.products.length === 0) && (
                  <div className="col-span-full py-20 text-center bg-white/[0.01] rounded-[32px] border border-dashed border-white/10 text-slate-600 font-black uppercase tracking-[0.3em] text-[9px]">No items in shop</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <h2 className="text-2xl font-black tracking-tighter">{t.adminOrders}</h2>
              <div className="space-y-4">
                {(!formData.orders || formData.orders.length === 0) ? (
                  <div className="text-center py-20 bg-white/[0.01] rounded-[32px] border border-white/5 text-slate-600 font-black uppercase tracking-[0.3em] text-[9px]">Empty Queue</div>
                ) : (
                  [...(formData.orders || [])].sort((a,b) => b.id.localeCompare(a.id)).map((order) => (
                    <div key={order.id} className="bg-white/[0.02] p-6 rounded-[32px] border border-white/10 flex flex-col md:flex-row items-center gap-6 group hover:bg-white/[0.04] transition-all relative overflow-hidden hover:scale-[1.01]">
                       <div className="absolute left-0 top-0 bottom-0 w-1.5 transition-all group-hover:w-2.5" style={{ backgroundColor: getStatusColor(order.status) }}></div>
                       
                       <div className="w-20 h-20 bg-slate-900 rounded-xl overflow-hidden border border-white/10 shrink-0 shadow-lg group-hover:scale-110 transition-all">
                          {order.productImage ? (
                            <img src={order.productImage} className="w-full h-full object-cover" alt={order.productName} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-700"><ShoppingBag size={32} /></div>
                          )}
                       </div>

                       <div className="space-y-4 flex-1 w-full min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full bg-slate-950 border border-white/10 group-hover:border-white/30 transition-all" style={{ color: currentThemeColor }}>{order.productName}</span>
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg bg-white/5 text-white/40">{order.customerCountry}</span>
                            <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest opacity-60 ml-auto md:ml-0"><Calendar size={10} className="inline mr-1" /> {new Date(order.timestamp).toLocaleDateString()}</span>
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-lg font-black text-white truncate group-hover:text-white/90 transition-colors">{order.customerName}</h3>
                            <p className="text-slate-400 font-mono text-xs hover:text-white transition-colors cursor-default">{order.customerContact}</p>
                          </div>
                       </div>

                       <div className="flex flex-col items-end gap-3 shrink-0">
                          <div className="relative group/sel">
                            <select 
                              value={order.status} 
                              onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                              className="appearance-none bg-slate-950 border border-white/10 rounded-xl pl-4 pr-10 py-2.5 font-black text-[9px] uppercase tracking-widest focus:outline-none transition-all cursor-pointer group-hover/sel:border-white/30"
                              style={{ color: getStatusColor(order.status), borderColor: `${getStatusColor(order.status)}33` }}
                            >
                              {ORDER_STATUS_OPTIONS.map(opt => (
                                <option key={opt.id} value={opt.id} className="bg-slate-900 text-slate-100">{lang === 'bn' ? opt.labelBn : opt.labelEn}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 group-hover/sel:opacity-100 transition-opacity" size={14} />
                          </div>
                          <button onClick={() => removeOrder(order.id)} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-700 hover:text-red-500 hover:bg-red-500/10 transition-all border border-white/5 hover:scale-110 active:scale-90"><Trash2 size={18} /></button>
                       </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'notice' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <h2 className="text-2xl font-black tracking-tighter">{t.adminNotice}</h2>
               <div className="bg-white/[0.02] p-8 rounded-[32px] border border-white/10 space-y-6 shadow-3xl hover:border-white/20 transition-all">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Global Broadcast Message</label>
                    <textarea value={formData.notice?.text || ''} onChange={handleNoticeChange} className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-6 h-32 text-lg font-bold leading-relaxed outline-none focus:border-white/20 transition-all shadow-inner hover:bg-slate-900" placeholder="Message..." />
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 px-4">
                     <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center hover:scale-110 transition-transform" style={{ color: currentThemeColor }}>
                        <Clock size={16} />
                     </div>
                     <span className="text-[9px] font-black uppercase tracking-[0.2em] cursor-default">
                       {t.noticePublished}: {formData.notice?.updatedAt ? new Date(formData.notice.updatedAt).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-GB') : 'Inactive'}
                     </span>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <h2 className="text-2xl font-black tracking-tighter">{t.aboutHeader}</h2>
              <textarea name="aboutText" value={formData.aboutText} onChange={handleChange} className="w-full bg-slate-900/50 border border-white/10 rounded-[32px] px-8 py-8 focus:border-white/20 h-96 leading-[1.6] resize-none font-medium text-base outline-none shadow-3xl hover:bg-slate-900 transition-all" placeholder="Your story..." />
            </div>
          )}

          {activeTab === 'blog' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex justify-between items-center border-b border-white/5 pb-6">
                <h2 className="text-2xl font-black tracking-tighter">{t.adminBlog}</h2>
                <button onClick={addBlogPost} className="bg-white/5 hover:bg-white text-slate-400 hover:text-slate-950 px-6 py-2.5 rounded-full border border-white/10 transition-all font-black text-[9px] uppercase tracking-[0.2em] flex items-center gap-2 hover:scale-105 active:scale-95"><Plus size={16} /> {t.adminNewPost}</button>
              </div>
              <div className="space-y-6">
                {(formData.projects || []).map((p) => (
                  <div key={p.id} className="bg-white/[0.02] rounded-[32px] p-6 border border-white/10 grid lg:grid-cols-[200px_1fr] gap-8 group transition-all hover:bg-white/[0.04] hover:-translate-y-1">
                    <div className="space-y-4">
                      <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-slate-900 shadow-lg">
                        <img src={p.image} className="w-full h-full object-cover transition-all group-hover:scale-110" />
                        <label className="absolute inset-0 flex items-center justify-center bg-slate-950/70 opacity-0 hover:opacity-100 cursor-pointer transition-all"><Camera size={24} className="text-white animate-bounce" /><input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'blog', p.id)} /></label>
                      </div>
                      <button onClick={() => removeBlogPost(p.id)} className="w-full py-2.5 text-[8px] text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-500/10 font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95">Remove Post</button>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">Headline</label>
                        <input placeholder="Post Title" value={p.title} onChange={(e) => updateBlogPost(p.id, 'title', e.target.value)} className="bg-slate-950/50 border border-white/5 rounded-xl px-5 py-3 w-full font-black text-base outline-none focus:border-white/20 hover:bg-slate-900 transition-all" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest ml-1">Short Summary</label>
                        <textarea placeholder="Write a brief summary..." value={p.description} onChange={(e) => updateBlogPost(p.id, 'description', e.target.value)} className="bg-slate-950/50 border border-white/5 rounded-xl px-5 py-3 w-full h-24 text-xs font-medium resize-none outline-none focus:border-white/20 hover:bg-slate-900 transition-all" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex justify-between items-center border-b border-white/5 pb-6">
                <h2 className="text-2xl font-black tracking-tighter">{t.adminSkills}</h2>
                <button onClick={addSkill} className="bg-white/5 hover:bg-white text-slate-400 hover:text-slate-950 px-6 py-2.5 rounded-full border border-white/10 transition-all font-black text-[9px] uppercase tracking-[0.2em] active:scale-95 hover:scale-105"><Plus size={16} /> {t.adminNewSkill}</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {(formData.skills || []).map((skill) => (
                  <div key={skill.id} className="flex gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/5 group items-center transition-all hover:bg-white/[0.05] hover:scale-105 active:scale-95">
                    <input value={skill.name} onChange={(e) => updateSkill(skill.id, e.target.value)} className="flex-1 bg-transparent border-none focus:outline-none text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-white transition-colors" placeholder="Skill Name" />
                    <button onClick={() => removeSkill(skill.id)} className="text-slate-700 hover:text-red-500 p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:scale-125"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex justify-between items-center border-b border-white/5 pb-6">
                <h2 className="text-2xl font-black tracking-tighter">{t.adminGallery}</h2>
                <button onClick={addGalleryItem} className="bg-white/5 hover:bg-white text-slate-400 hover:text-slate-950 px-6 py-2.5 rounded-full border border-white/10 transition-all font-black text-[9px] uppercase tracking-[0.2em] active:scale-95 hover:scale-105"><Plus size={16} /> {t.adminNewPhoto}</button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {(formData.gallery || []).map((item) => (
                  <div key={item.id} className="bg-white/[0.02] rounded-[24px] p-5 border border-white/10 group space-y-4 transition-all hover:bg-white/[0.05] hover:-translate-y-1 shadow-xl">
                     <div className="relative aspect-square rounded-xl overflow-hidden border border-white/5 bg-slate-900 shadow-xl">
                        <img src={item.image} className="w-full h-full object-cover transition duration-1000 group-hover:scale-110" />
                        <label className="absolute inset-0 flex items-center justify-center bg-slate-950/70 opacity-0 hover:opacity-100 cursor-pointer transition-all"><Camera size={24} className="text-white animate-bounce" /><input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'gallery', item.id)} /></label>
                     </div>
                     <div className="flex gap-3">
                        <input value={item.title} onChange={(e) => updateGalleryItem(item.id, 'title', e.target.value)} className="flex-1 bg-slate-950/50 border border-white/5 rounded-lg px-3 py-2 text-[9px] font-black uppercase tracking-widest outline-none focus:border-white/20 hover:bg-slate-900 transition-all" placeholder="Photo Caption" />
                        <button onClick={() => removeGalleryItem(item.id)} className="p-2 text-slate-700 hover:text-red-500 transition-all hover:scale-125 active:scale-90"><Trash2 size={16} /></button>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
