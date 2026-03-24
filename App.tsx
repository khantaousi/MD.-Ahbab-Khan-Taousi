
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Portfolio from './components/Portfolio';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import { INITIAL_DATA, TRANSLATIONS } from './constants';
import { PortfolioData } from './types';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, collection, writeBatch } from 'firebase/firestore';

const App: React.FC = () => {
  const [data, setData] = useState<PortfolioData>(INITIAL_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [syncError, setSyncError] = useState<boolean>(false);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const [lang, setLang] = useState<'en' | 'bn'>(() => {
    return (localStorage.getItem('app_lang') as 'en' | 'bn') || 'en';
  });
  const [isLightMode] = useState(() => {
    return localStorage.getItem('theme_mode') === 'light';
  });
  const [asyncError, setAsyncError] = useState<Error | null>(null);

  if (asyncError) {
    throw asyncError;
  }

  // Handle Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if the user is the admin based on email
        if (user.email === 'khantaousi@gmail.com' && user.emailVerified) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // Fetch data from Firestore
  useEffect(() => {
    if (!isAuthReady) return;

    const portfolioCollection = collection(db, 'portfolio');
    
    const unsubscribe = onSnapshot(portfolioCollection, (snapshot) => {
      if (!snapshot.empty) {
        const mergedData: any = { ...INITIAL_DATA };
        snapshot.forEach((docSnap) => {
          const docData = docSnap.data();
          Object.assign(mergedData, docData);
        });
        setData(mergedData as PortfolioData);
        localStorage.setItem('portfolio_data', JSON.stringify(mergedData));
      } else {
        // If no documents exist, use initial data
        const saved = localStorage.getItem('portfolio_data');
        if (saved) setData({ ...INITIAL_DATA, ...JSON.parse(saved) });
      }
      setIsLoading(false);
    }, (error) => {
      setSyncError(true);
      const saved = localStorage.getItem('portfolio_data');
      if (saved) setData({ ...INITIAL_DATA, ...JSON.parse(saved) });
      setIsLoading(false);
      try {
        handleFirestoreError(error, OperationType.GET, 'portfolio');
      } catch (e) {
        setAsyncError(e as Error);
      }
    });

    return () => unsubscribe();
  }, [isAuthReady]);

  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  const handleUpdateData = async (newData: PortfolioData) => {
    setData(newData);
    localStorage.setItem('portfolio_data', JSON.stringify(newData));
    
    // Save to Firestore if admin
    if (isLoggedIn) {
      try {
        const batch = writeBatch(db);
        
        // Split the data into multiple documents to stay under 1MB limit
        const { projects, gallery, jobExperiences, ...globalData } = newData;
        
        batch.set(doc(db, 'portfolio', 'global'), globalData);
        batch.set(doc(db, 'portfolio', 'projects'), { projects: projects || [] });
        batch.set(doc(db, 'portfolio', 'gallery'), { gallery: gallery || [] });
        batch.set(doc(db, 'portfolio', 'jobExperiences'), { jobExperiences: jobExperiences || [] });
        
        await batch.commit();
      } catch (error) {
        try {
          handleFirestoreError(error, OperationType.WRITE, 'portfolio');
        } catch (e) {
          setAsyncError(e as Error);
        }
      }
    }
  };

  const handleLogin = (status: boolean) => {
    setIsLoggedIn(status);
  };

  const t = TRANSLATIONS[lang];

  if (isLoading || !isAuthReady) {
    return (
      <div className={`min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-8 ${isLightMode ? 'theme-light' : ''}`}>
        <div className="relative flex items-center justify-center w-24 h-24">
          <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-cyan-400 rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-3 border-4 border-slate-800 rounded-full"></div>
          <div className="absolute inset-3 border-4 border-emerald-400 rounded-full border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          <div className="absolute inset-6 border-4 border-slate-800 rounded-full"></div>
          <div className="absolute inset-6 border-4 border-rose-400 rounded-full border-l-transparent animate-spin" style={{ animationDuration: '2s' }}></div>
        </div>
        <p className="font-black uppercase tracking-[0.4em] text-xs text-cyan-400 animate-pulse">
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
