
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, User, LogIn, ArrowLeft, ShieldCheck } from 'lucide-react';
import { auth, signInWithEmailAndPassword, sendPasswordResetEmail } from '../firebase';

interface LoginProps {
  onLogin: () => void;
  lang: string;
  t: any;
}

const Login: React.FC<LoginProps> = ({ onLogin, lang, t }) => {
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin();
    } catch (err: any) {
      console.error("Login Error Details:", err);
      setError(lang === 'bn' ? `লগইন ব্যর্থ হয়েছে: ${err.message}` : `Login failed: ${err.message}`);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError(lang === 'bn' ? 'দয়া করে ইমেইল দিন' : 'Please enter your email');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setError(lang === 'bn' ? 'পাসওয়ার্ড রিসেট ইমেইল পাঠানো হয়েছে' : 'Password reset email sent');
    } catch (err: any) {
      setError(lang === 'bn' ? `রিসেট ব্যর্থ: ${err.message}` : `Reset failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px]"></div>
      </div>

      <div className="max-w-md w-full glass p-10 lg:p-14 rounded-[48px] border border-white/5 shadow-3xl hover:border-white/10 transition-all relative z-10">
        
        {/* Welcome Header */}
        <div className="text-center mb-12 animate-in fade-in zoom-in duration-700">
          <div className="bg-cyan-600/20 w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-cyan-500/30 shadow-2xl shadow-cyan-500/10">
            <ShieldCheck className="text-cyan-400" size={48} />
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-3 text-white uppercase">{t.loginWelcome}</h1>
          <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.3em]">{t.loginHeader}</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleEmailLogin} className="space-y-8 animate-in slide-in-from-bottom-4 duration-700 delay-150">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 py-4 rounded-2xl animate-shake">
                <p className="text-red-400 text-xs font-bold text-center uppercase tracking-widest">{error}</p>
            </div>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 text-white p-4 rounded-2xl"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 text-white p-4 rounded-2xl"
          />

          <button
            type="submit"
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black py-6 rounded-2xl transition-all shadow-2xl flex items-center justify-center gap-4 uppercase tracking-[0.25em] text-sm active:scale-[0.97] hover:scale-[1.02] mt-4"
          >
            {lang === 'bn' ? 'লগইন করুন' : 'Sign in'} <LogIn size={20} />
          </button>
          <button
            type="button"
            onClick={handleForgotPassword}
            className="w-full text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-white"
          >
            {lang === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
          </button>
        </form>
        
        <div className="mt-12 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.2em] group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> {t.loginBack}
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
        .shadow-3xl { box-shadow: 0 50px 120px -30px rgba(0,0,0,0.8); }
        .glass { background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(24px); }
      `}</style>
    </div>
  );
};

export default Login;
