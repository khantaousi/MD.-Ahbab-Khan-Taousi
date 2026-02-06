
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Portfolio from './components/Portfolio';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import { INITIAL_DATA, TRANSLATIONS, CLOUD_SYNC_CONFIG } from './constants';
import { PortfolioData } from './types';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<PortfolioData>(INITIAL_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [syncError, setSyncError] = useState<boolean>(false);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('is_admin_logged_in') === 'true';
  });

  const [lang, setLang] = useState<'en' | 'bn'>(() => {
    return (localStorage.getItem('app_lang') as 'en' | 'bn') || 'en';
  });

  // Fetch data from cloud on load
  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        const response = await fetch(CLOUD_SYNC_CONFIG.API_URL);
        if (response.ok) {
          const cloudData = await response.json();
          if (cloudData && typeof cloudData === 'object') {
            // CRITICAL FIX: Merge cloud data with INITIAL_DATA to ensure all keys exist
            const mergedData = { ...INITIAL_DATA, ...cloudData };
            setData(mergedData);
            localStorage.setItem('portfolio_data', JSON.stringify(mergedData));
          }
        } else {
          const saved = localStorage.getItem('portfolio_data');
          if (saved) setData({ ...INITIAL_DATA, ...JSON.parse(saved) });
        }
      } catch (error) {
        console.error("Sync Error:", error);
        setSyncError(true);
        const saved = localStorage.getItem('portfolio_data');
        if (saved) setData({ ...INITIAL_DATA, ...JSON.parse(saved) });
      } finally {
        setIsLoading(false);
      }
    };

    fetchGlobalData();
  }, []);

  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  const handleUpdateData = (newData: PortfolioData) => {
    setData(newData);
    localStorage.setItem('portfolio_data', JSON.stringify(newData));
  };

  const handleLogin = (status: boolean) => {
    setIsLoggedIn(status);
    localStorage.setItem('is_admin_logged_in', status.toString());
  };

  const t = TRANSLATIONS[lang];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6 text-cyan-400">
        <Loader2 className="animate-spin" size={48} />
        <p className="font-black uppercase tracking-[0.3em] text-xs animate-pulse">
          {t.syncLoading}
        </p>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Portfolio data={data} lang={lang} setLang={setLang} t={t} onUpdate={handleUpdateData} />} />
        <Route 
          path="/login" 
          element={isLoggedIn ? <Navigate to="/admin" /> : <Login onLogin={() => handleLogin(true)} lang={lang} t={t} />} 
        />
        <Route 
          path="/admin" 
          element={
            isLoggedIn ? (
              <AdminDashboard data={data} onUpdate={handleUpdateData} onLogout={() => handleLogin(false)} lang={lang} t={t} />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
      </Routes>
    </HashRouter>
  );
};

export default App;
