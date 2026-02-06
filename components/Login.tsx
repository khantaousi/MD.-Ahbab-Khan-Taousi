
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ADMIN_CREDENTIALS } from '../constants';
import { Lock, User, LogIn, ArrowLeft } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
  lang: string;
  t: any;
}

const Login: React.FC<LoginProps> = ({ onLogin, lang, t }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (id === ADMIN_CREDENTIALS.id && password === ADMIN_CREDENTIALS.password) {
      onLogin();
    } else {
      setError(lang === 'bn' ? 'ভুল আইডি বা পাসওয়ার্ড!' : 'Incorrect ID or Password!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="max-w-md w-full glass p-10 rounded-[40px] border border-white/5 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] hover:border-white/10 transition-all">
        <div className="text-center mb-10">
          <div className="bg-cyan-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-cyan-500/20 rotate-3 group hover:rotate-0 transition-transform duration-500 hover:scale-110">
            <Lock className="text-slate-950" size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">{t.loginHeader}</h1>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">{t.loginSub}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{t.loginIdLabel}</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400 transition-colors" size={20} />
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:border-cyan-500/50 focus:outline-none transition-all font-bold placeholder:text-slate-700 hover:bg-slate-900/80"
                placeholder="ID"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{t.loginPassLabel}</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400 transition-colors" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:border-cyan-500/50 focus:outline-none transition-all font-bold placeholder:text-slate-700 hover:bg-slate-900/80"
                placeholder="PASSWORD"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 py-3 rounded-xl animate-shake">
                <p className="text-red-400 text-xs font-bold text-center uppercase tracking-widest">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black py-4 rounded-2xl transition-all shadow-xl shadow-cyan-900/20 flex items-center justify-center gap-3 uppercase tracking-widest text-sm active:scale-[0.98] hover:scale-[1.03] hover:-translate-y-1"
          >
            {t.loginBtn} <LogIn size={20} />
          </button>
        </form>
        
        <div className="mt-12 pt-8 border-t border-white/5 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-cyan-400 transition-colors text-xs font-bold uppercase tracking-widest group hover:translate-x-[-2px] hover:scale-105 active:scale-95">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> {t.loginBack}
            </Link>
        </div>
      </div>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </div>
  );
};

export default Login;
