
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, User, LogIn, ArrowLeft, ShieldCheck, Mail, RefreshCw } from 'lucide-react';
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification } from '../firebase';

interface LoginProps {
  onLogin: () => void;
  lang: string;
  t: any;
}

const Login: React.FC<LoginProps> = ({ onLogin, lang, t }) => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      if (isSignUp) {
        // Only allow admin email to sign up
        if (email !== 'khantaousi@gmail.com') {
          setError(lang === 'bn' ? 'শুধুমাত্র এডমিন ইমেইল দিয়ে একাউন্ট খোলা যাবে।' : 'Only the admin email can create an account.');
          setLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        setSuccess(lang === 'bn' ? 'একাউন্ট তৈরি হয়েছে! অনুগ্রহ করে আপনার ইমেইল ভেরিফাই করুন।' : 'Account created! Please verify your email.');
        setIsSignUp(false);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        if (user.email === 'khantaousi@gmail.com') {
          if (!user.emailVerified) {
            setError(lang === 'bn' ? 'আপনার ইমেইল ভেরিফাই করা নেই। অনুগ্রহ করে আপনার ইনবক্স চেক করুন।' : 'Your email is not verified. Please check your inbox.');
            await sendEmailVerification(user);
            setLoading(false);
            return;
          }
          onLogin();
        } else {
          setError(lang === 'bn' ? 'আপনি এডমিন নন।' : 'You are not an admin.');
        }
      }
    } catch (err: any) {
      console.error("Auth Error Details:", err);
      let errorMessage = err.message;
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        errorMessage = lang === 'bn' ? 'ভুল ইমেইল বা পাসওয়ার্ড' : 'Invalid email or password';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = lang === 'bn' ? 'অনেক বেশি চেষ্টা করা হয়েছে। পরে চেষ্টা করুন।' : 'Too many attempts. Please try again later.';
      } else if (err.code === 'auth/email-already-in-use') {
        errorMessage = lang === 'bn' ? 'এই ইমেইলটি ইতিমধ্যে ব্যবহার করা হয়েছে।' : 'This email is already in use.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = lang === 'bn' ? 'পাসওয়ার্ডটি অন্তত ৬ অক্ষরের হতে হবে।' : 'Password should be at least 6 characters.';
      } else {
        errorMessage = lang === 'bn' ? `ব্যর্থ হয়েছে: ${err.message}` : `Failed: ${err.message}`;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError(lang === 'bn' ? 'অনুগ্রহ করে আপনার ইমেইল দিন' : 'Please enter your email');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(lang === 'bn' ? 'পাসওয়ার্ড রিসেট ইমেইল পাঠানো হয়েছে!' : 'Password reset email sent!');
      setShowReset(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
        <form onSubmit={handleAuthAction} className="space-y-8 animate-in slide-in-from-bottom-4 duration-700 delay-150">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 py-4 rounded-2xl animate-shake">
                <p className="text-red-400 text-[10px] font-black text-center uppercase tracking-widest px-4">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 py-4 rounded-2xl">
                <p className="text-emerald-400 text-[10px] font-black text-center uppercase tracking-widest px-4">{success}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                <Mail size={18} />
              </div>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 text-white pl-14 pr-6 py-5 rounded-2xl focus:border-cyan-500/50 outline-none transition-all font-bold"
                required
              />
            </div>
            
            {!showReset && (
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 text-white pl-14 pr-6 py-5 rounded-2xl focus:border-cyan-500/50 outline-none transition-all font-bold"
                  required
                />
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <button 
              type="button" 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-colors"
            >
              {isSignUp ? (lang === 'bn' ? 'লগইন করুন' : 'Already have an account?') : (lang === 'bn' ? 'একাউন্ট তৈরি করুন' : 'Create Admin Account')}
            </button>
            <button 
              type="button" 
              onClick={() => setShowReset(!showReset)}
              className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-colors"
            >
              {showReset ? (lang === 'bn' ? 'লগইন এ ফিরে যান' : 'Back to Login') : (lang === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?')}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            onClick={showReset ? (e) => { e.preventDefault(); handleResetPassword(); } : undefined}
            className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:hover:bg-cyan-600 text-slate-950 font-black py-6 rounded-2xl transition-all shadow-2xl flex items-center justify-center gap-4 uppercase tracking-[0.25em] text-sm active:scale-[0.97] hover:scale-[1.02]"
          >
            {loading ? (
              <RefreshCw className="animate-spin" size={20} />
            ) : (
              <>
                {showReset ? (lang === 'bn' ? 'রিসেট লিঙ্ক পাঠান' : 'Send Reset Link') : (isSignUp ? (lang === 'bn' ? 'একাউন্ট তৈরি করুন' : 'Sign Up') : (lang === 'bn' ? 'লগইন করুন' : 'Sign in'))} 
                <LogIn size={20} />
              </>
            )}
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
