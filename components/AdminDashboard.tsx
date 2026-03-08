
import React, { useState } from 'react';
import { PortfolioData, Project, Skill, SocialLink, GalleryItem, Product, Order, OrderStatus } from '../types';
import { THEME_OPTIONS, CURRENCY_SYMBOLS, ORDER_STATUS_OPTIONS } from '../constants';
import { auth } from '../firebase';
import { 
  Save, LogOut, Plus, Trash2, Camera, Link as LinkIcon, 
  FileText, Layout, Info, BookOpen, Shield, Cloud, RefreshCw, 
  Image as ImageIcon, Bell, Clock, Briefcase, ShoppingBag, 
  ListChecks, Activity, User, Code, X, ChevronRight, CheckCircle2, AlertCircle,
  Phone, Mail
} from 'lucide-react';

interface AdminDashboardProps {
  data: PortfolioData;
  onUpdate: (newData: PortfolioData) => void;
  onLogout: () => void;
  lang: string;
  t: any;
}

const SOCIAL_PLATFORMS = [
  'Facebook', 'GitHub', 'LinkedIn', 'Twitter', 'Instagram', 'YouTube', 'WhatsApp', 'Globe'
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ data, onUpdate, onLogout, lang, t }) => {
  const [formData, setFormData] = useState<PortfolioData>(data);
  const [activeTab, setActiveTab] = useState<'basic' | 'about' | 'skills' | 'blog' | 'gallery' | 'notice' | 'contact' | 'visibility' | 'products' | 'orders'>('basic');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const currentThemeColor = THEME_OPTIONS.find(th => th.id === formData.theme)?.color || '#0ea5e9';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
        if (type === 'product' && id) {
           setFormData(prev => ({
             ...prev,
             products: (prev.products || []).map(p => 
               p.id === id ? { ...p, images: [...(p.images || []), base64].slice(0, 3) } : p
             )
           }));
        }
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
      await onUpdate(formData);
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

  // Product Actions
  const addProduct = () => {
    const newProduct: Product = { id: Date.now().toString(), name: "New Product", amount: "0", currency: "৳", description: "Details...", images: [] };
    setFormData(prev => ({ ...prev, products: [...(prev.products || []), newProduct] }));
    setHasUnsavedChanges(true);
  };

  const updateProduct = (id: string, field: keyof Product, value: any) => {
    setFormData(prev => ({ 
      ...prev, 
      products: (prev.products || []).map(p => p.id === id ? { ...p, [field]: value } : p) 
    }));
    setHasUnsavedChanges(true);
  };

  const removeProductImage = (productId: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      products: (prev.products || []).map(p => 
        p.id === productId ? { ...p, images: p.images.filter((_, i) => i !== index) } : p
      )
    }));
    setHasUnsavedChanges(true);
  };

  const removeProduct = (id: string) => {
    setFormData(prev => ({ ...prev, products: (prev.products || []).filter(p => p.id !== id) }));
    setHasUnsavedChanges(true);
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
    const newSkill: Skill = { id: Date.now().toString(), name: "New Skill" };
    setFormData(prev => ({ ...prev, skills: [...(prev.skills || []), newSkill] }));
    setHasUnsavedChanges(true);
  };

  const updateSkill = (id: string, name: string) => {
    setFormData(prev => ({ ...prev, skills: (prev.skills || []).map(s => s.id === id ? { ...s, name } : s) }));
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
              { id: 'visibility', label: t.adminVisibility, icon: <Activity size={16} /> },
              { id: 'contact', label: t.adminContact, icon: <Phone size={16} /> },
              { id: 'products', label: t.adminProducts, icon: <ShoppingBag size={16} /> },
              { id: 'orders', label: t.adminOrders, icon: <ListChecks size={16} /> },
              { id: 'notice', label: t.adminNotice, icon: <Bell size={16} /> },
              { id: 'about', label: t.aboutHeader, icon: <FileText size={16} /> },
              { id: 'blog', label: t.adminBlog, icon: <BookOpen size={16} /> },
              { id: 'gallery', label: t.adminGallery, icon: <ImageIcon size={16} /> },
              { id: 'skills', label: t.adminSkills, icon: <Layout size={16} /> },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all text-[9px] font-black uppercase tracking-widest ${activeTab === tab.id ? 'text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`} style={activeTab === tab.id ? { backgroundColor: currentThemeColor } : {}}>
                {tab.icon} {tab.label}
              </button>
            ))}
        </aside>

        <main className="glass rounded-[40px] p-8 border border-white/10 shadow-3xl overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-hide">
          
          {/* 1. Basic Identity */}
          {activeTab === 'basic' && (
            <div className="space-y-8 animate-in fade-in">
               <h2 className="text-2xl font-black">{t.adminBasic}</h2>
               <div className="flex flex-col lg:flex-row gap-10">
                  <div className="w-full lg:w-56 h-56 rounded-[40px] overflow-hidden relative group shrink-0 border border-white/10">
                    <img src={formData.profileImage} className="w-full h-full object-cover" />
                    <label className="absolute inset-0 flex items-center justify-center bg-slate-950/70 opacity-0 group-hover:opacity-100 cursor-pointer transition-all"><Camera size={32} className="text-white" /><input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'profile')} /></label>
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  </div>
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
                 <VisibilityToggle label={t.visLabelProducts} field="showProducts" />
                 <VisibilityToggle label={t.visLabelNotice} field="showNotice" />
                 <VisibilityToggle label={t.visLabelClock} field="showClock" />
                 <VisibilityToggle label={t.visLabelWork} field="showWork" />
                 <VisibilityToggle label={t.visLabelContact} field="showContact" />
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
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {formData.skills.map(skill => (
                    <div key={skill.id} className="bg-white/5 p-4 rounded-2xl flex items-center gap-3 border border-white/5 focus-within:border-cyan-500/30 transition-all">
                       <Code size={18} style={{ color: currentThemeColor }} />
                       <input 
                         value={skill.name} 
                         onChange={(e) => updateSkill(skill.id, e.target.value)} 
                         className="flex-1 bg-transparent border-none outline-none font-bold text-sm" 
                         placeholder="Skill name" 
                       />
                       <button onClick={() => removeSkill(skill.id)} className="text-red-500/50 hover:text-red-500 p-2"><Trash2 size={16} /></button>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* 4. Products */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-in fade-in">
               <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-black">{t.adminProducts}</h2>
                  <button onClick={addProduct} className="bg-white/5 px-6 py-2 rounded-full border border-white/10 font-black text-[9px] uppercase hover:bg-white/10 transition-all">
                    <Plus size={14} className="inline mr-1" /> {t.adminNewProduct}
                  </button>
               </div>
               <div className="grid md:grid-cols-2 gap-8">
                  {formData.products.map(p => (
                    <div key={p.id} className="bg-white/5 rounded-[32px] p-6 border border-white/10 space-y-6 group/prod transition-all hover:bg-white/[0.07]">
                       <div className="flex flex-wrap gap-3">
                         {p.images?.map((img, idx) => (
                           <div key={idx} className="relative w-20 h-20 rounded-2xl overflow-hidden group/img">
                              <img src={img} className="w-full h-full object-cover" />
                              <button onClick={() => removeProductImage(p.id, idx)} className="absolute top-1 right-1 bg-red-500 p-1 rounded-full opacity-0 group-hover/img:opacity-100 transition-all">
                                <X size={10} className="text-white" />
                              </button>
                           </div>
                         ))}
                         {(!p.images || p.images.length < 3) && (
                           <label className="w-20 h-20 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:border-white/30 transition-all bg-slate-900/50">
                              <Plus size={20} className="text-slate-500" />
                              <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'product', p.id)} />
                           </label>
                         )}
                       </div>
                       
                       <div className="space-y-4">
                          <input 
                            value={p.name} 
                            onChange={(e) => updateProduct(p.id, 'name', e.target.value)} 
                            className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 font-black text-sm outline-none focus:border-cyan-500/30" 
                            placeholder="Product Name" 
                          />
                          
                          <div className="flex gap-3">
                             <input 
                               value={p.amount} 
                               onChange={(e) => updateProduct(p.id, 'amount', e.target.value)} 
                               className="flex-1 bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 font-black text-sm outline-none focus:border-cyan-500/30" 
                               placeholder="Price" 
                             />
                             <select 
                               value={p.currency} 
                               onChange={(e) => updateProduct(p.id, 'currency', e.target.value)}
                               className="bg-slate-950/50 border border-white/5 rounded-xl px-3 py-3 font-black text-sm outline-none"
                             >
                               {CURRENCY_SYMBOLS.map(c => <option key={c} value={c}>{c}</option>)}
                             </select>
                          </div>

                          <textarea 
                            value={p.description} 
                            onChange={(e) => updateProduct(p.id, 'description', e.target.value)} 
                            className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-xs min-h-[80px] outline-none focus:border-cyan-500/30 resize-none" 
                            placeholder="Description" 
                          />
                       </div>
                       
                       <button onClick={() => removeProduct(p.id)} className="w-full py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all">
                         <Trash2 size={14} className="inline mr-1" /> {lang === 'bn' ? "পণ্যটি মুছে ফেলুন" : "Remove Product"}
                       </button>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* 5. Orders Management */}
          {activeTab === 'orders' && (
            <div className="space-y-8 animate-in fade-in">
               <h2 className="text-2xl font-black">{t.adminOrders}</h2>
               {(!formData.orders || formData.orders.length === 0) ? (
                 <div className="bg-white/5 rounded-[32px] p-20 border border-white/5 flex flex-col items-center justify-center text-center opacity-50">
                    <ListChecks size={48} className="mb-4" />
                    <p className="font-black uppercase tracking-widest text-xs">{lang === 'bn' ? "কোনো অর্ডার পাওয়া যায়নি" : "No orders found"}</p>
                 </div>
               ) : (
                 <div className="space-y-6">
                    {formData.orders.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(order => {
                      const statusInfo = ORDER_STATUS_OPTIONS.find(s => s.id === order.status);
                      return (
                        <div key={order.id} className="bg-white/5 rounded-[32px] p-6 border border-white/5 flex flex-col md:flex-row gap-8 hover:bg-white/[0.07] transition-all">
                           <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-900 shrink-0 border border-white/10">
                              <img src={order.productImage || 'https://picsum.photos/200'} className="w-full h-full object-cover" />
                           </div>
                           <div className="flex-1 space-y-4">
                              <div className="flex flex-wrap justify-between items-start gap-4">
                                 <div>
                                    <h4 className="font-black text-lg text-white">{order.productName}</h4>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{new Date(order.timestamp).toLocaleString()}</p>
                                 </div>
                                 <select 
                                   value={order.status} 
                                   onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                                   className="bg-slate-900 border-none rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none shadow-lg cursor-pointer"
                                   style={{ color: statusInfo?.color }}
                                 >
                                   {ORDER_STATUS_OPTIONS.map(opt => (
                                     <option key={opt.id} value={opt.id}>{lang === 'bn' ? opt.labelBn : opt.labelEn}</option>
                                   ))}
                                 </select>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4 border-t border-white/5">
                                 <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Customer</p>
                                    <p className="text-xs font-bold text-slate-300">{order.customerName}</p>
                                 </div>
                                 <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Contact</p>
                                    <p className="text-xs font-bold text-slate-300">{order.customerContact}</p>
                                 </div>
                                 <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Country</p>
                                    <p className="text-xs font-bold text-slate-300">{order.customerCountry}</p>
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-end justify-end">
                              <button onClick={() => removeOrder(order.id)} className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"><Trash2 size={16} /></button>
                           </div>
                        </div>
                      );
                    })}
                 </div>
               )}
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
                        notice: { text: e.target.value, updatedAt: new Date().toISOString() } 
                      }));
                      setHasUnsavedChanges(true);
                    }} 
                    className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-5 font-bold text-sm focus:border-cyan-500/50 outline-none h-44 resize-none" 
                    placeholder="Enter urgent update or welcome message..." 
                  />
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
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Long-form Bio (Professional Journey)</label>
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
                          <input 
                            value={post.title} 
                            onChange={(e) => updateBlogPost(post.id, 'title', e.target.value)} 
                            className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 font-black text-lg outline-none focus:border-cyan-500/30" 
                            placeholder="Post Title" 
                          />
                          <textarea 
                            value={post.description} 
                            onChange={(e) => updateBlogPost(post.id, 'description', e.target.value)} 
                            className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm min-h-[100px] outline-none focus:border-cyan-500/30 resize-none" 
                            placeholder="Description Content" 
                          />
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
                       <div className="p-4 flex gap-2">
                          <input 
                            value={item.title} 
                            onChange={(e) => updateGalleryItem(item.id, 'title', e.target.value)} 
                            className="flex-1 bg-slate-900 border border-white/5 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none" 
                            placeholder="Photo Tag" 
                          />
                          <button onClick={() => removeGalleryItem(item.id)} className="text-red-500/50 hover:text-red-500 p-2 transition-colors"><Trash2 size={16} /></button>
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
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                       <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">{t.contactSocialLabel}</h3>
                       <button onClick={addSocialLink} className="text-[9px] font-black text-cyan-400 uppercase tracking-widest hover:brightness-125 transition-all"><Plus size={14} className="inline mr-1" /> {lang === 'bn' ? "লিংক যোগ করুন" : "Add Link"}</button>
                    </div>
                    <div className="space-y-3">
                       {formData.socialLinks.map(link => (
                         <div key={link.id} className="bg-white/5 border border-white/5 rounded-[24px] p-4 flex gap-3 group/link hover:border-white/20 transition-all">
                            <select 
                              value={link.platform} 
                              onChange={(e) => updateSocialLink(link.id, 'platform', e.target.value)} 
                              className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-[9px] font-black uppercase tracking-widest text-white cursor-pointer outline-none"
                            >
                              {SOCIAL_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <input 
                              value={link.url} 
                              onChange={(e) => updateSocialLink(link.id, 'url', e.target.value)} 
                              className="flex-1 bg-slate-950 border border-white/5 rounded-xl px-5 py-2 text-xs font-mono outline-none focus:border-cyan-500/30" 
                              placeholder="https://" 
                            />
                            <button onClick={() => removeSocialLink(link.id)} className="text-red-500/50 hover:text-red-500 p-2 transition-all"><Trash2 size={16} /></button>
                         </div>
                       ))}
                    </div>
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
