import React from 'react';
import { Moon, Star, PartyPopper, Sparkles, Zap } from 'lucide-react';
import { EventData } from '../types';

const EventSection: React.FC<EventData> = ({ title, subtitle, animationType, theme }) => {
  const getAnimationClass = () => {
    switch (animationType) {
      case 'float': return 'animate-float';
      case 'pulse': return 'animate-pulse';
      default: return '';
    }
  };

  const renderThemeIcon = () => {
    if (theme === 'islamic') {
      return (
        <div className="relative w-32 h-32 mb-4">
          <div className={`absolute inset-0 flex items-center justify-center ${getAnimationClass()}`}>
            <Moon size={80} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" fill="currentColor" />
          </div>
          <div className="absolute -top-2 -right-4 animate-bounce" style={{ animationDuration: '3s' }}>
            <Star size={24} className="text-yellow-200 drop-shadow-[0_0_10px_rgba(253,224,71,0.6)]" fill="currentColor" />
          </div>
          <div className="absolute bottom-0 -left-2 animate-bounce" style={{ animationDuration: '4s' }}>
            <Star size={16} className="text-yellow-100 drop-shadow-[0_0_8px_rgba(253,224,71,0.4)]" fill="currentColor" />
          </div>
        </div>
      );
    }
    
    if (theme === 'party') {
      return (
        <div className="relative w-32 h-32 mb-4">
          <div className={`absolute inset-0 flex items-center justify-center ${getAnimationClass()}`}>
            <PartyPopper size={80} className="text-pink-500 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]" />
          </div>
          <div className="absolute -top-4 -right-4 animate-bounce" style={{ animationDuration: '2s' }}>
            <Sparkles size={24} className="text-yellow-400" fill="currentColor" />
          </div>
          <div className="absolute bottom-0 -left-4 animate-bounce" style={{ animationDuration: '3s' }}>
            <Sparkles size={20} className="text-cyan-400" fill="currentColor" />
          </div>
        </div>
      );
    }

    if (theme === 'minimal') {
      return (
        <div className="relative w-24 h-24 mb-4">
           <div className={`absolute inset-0 flex items-center justify-center ${getAnimationClass()}`}>
             <Zap size={64} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" fill="currentColor" />
           </div>
        </div>
      );
    }

    // Auto theme logic based on keywords
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('eid') || lowerTitle.includes('ramadan') || lowerTitle.includes('mubarak')) {
      return (
        <div className="relative w-32 h-32 mb-4">
          <div className={`absolute inset-0 flex items-center justify-center ${getAnimationClass()}`}>
            <Moon size={80} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" fill="currentColor" />
          </div>
          <div className="absolute -top-2 -right-4 animate-bounce" style={{ animationDuration: '3s' }}>
            <Star size={24} className="text-yellow-200 drop-shadow-[0_0_10px_rgba(253,224,71,0.6)]" fill="currentColor" />
          </div>
        </div>
      );
    }

    // Default fallback (Party/Celebration)
    return (
      <div className="relative w-32 h-32 mb-4">
        <div className={`absolute inset-0 flex items-center justify-center ${getAnimationClass()}`}>
          <Sparkles size={80} className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
        </div>
      </div>
    );
  };

  return (
    <section className="py-24 relative overflow-hidden bg-slate-950 border-t border-white/5">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-2 h-2 bg-yellow-200 rounded-full animate-pulse shadow-[0_0_10px_rgba(253,224,71,0.5)]" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-20 right-20 w-1.5 h-1.5 bg-pink-200 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,114,182,0.4)]" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-cyan-200 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <div className="flex flex-col items-center justify-center gap-6">
          {/* Theme Icon */}
          {renderThemeIcon()}

          {/* Text Content */}
          <div className="space-y-4">
            <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 tracking-tighter drop-shadow-lg animate-shimmer bg-[length:200%_auto]">
              {title}
            </h2>
            <p className="text-slate-400 text-lg md:text-xl font-medium tracking-wide max-w-2xl mx-auto">
              {subtitle}
            </p>
          </div>

          {/* Decorative Line */}
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mt-8 opacity-50"></div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(-10deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .animate-shimmer {
          animation: shimmer 3s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default EventSection;
