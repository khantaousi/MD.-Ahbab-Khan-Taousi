
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Portfolio from './components/Portfolio';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import { INITIAL_DATA, TRANSLATIONS } from './constants';
import { PortfolioData } from './types';
import { Loader2 } from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

const App: React.FC = () => {
  const [data, setData] = useState<PortfolioData>(INITIAL_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [syncError, setSyncError] = useState<boolean>(false);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const [lang, setLang] = useState<'en' | 'bn'>(() => {
    return (localStorage.getItem('app_lang') as 'en' | 'bn') || 'en';
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

    const docRef = doc(db, 'portfolio', 'global');
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const cloudData = docSnap.data() as PortfolioData;
        const mergedData = { ...INITIAL_DATA, ...cloudData };
        setData(mergedData);
        localStorage.setItem('portfolio_data', JSON.stringify(mergedData));
      } else {
        // If document doesn't exist, use initial data
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
        handleFirestoreError(error, OperationType.GET, 'portfolio/global');
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
        await setDoc(doc(db, 'portfolio', 'global'), newData);
      } catch (error) {
        try {
          handleFirestoreError(error, OperationType.WRITE, 'portfolio/global');
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
