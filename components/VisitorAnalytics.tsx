import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity, Users, Clock, Globe } from 'lucide-react';

interface Visit {
  id: string;
  timestamp: string;
  userAgent: string;
  path: string;
}

interface VisitorAnalyticsProps {
  currentThemeColor: string;
  lang: string;
}

const VisitorAnalytics: React.FC<VisitorAnalyticsProps> = ({ currentThemeColor, lang }) => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAndCleanupVisits = async () => {
      try {
        const now = new Date();
        // Calculate 7 days ago
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

        // 1. Fetch recent visits (last 1000)
        // We fetch the last 1000 and filter in-memory to avoid needing a composite index
        const q = query(
          collection(db, 'visits'), 
          orderBy('timestamp', 'desc'), 
          limit(1000)
        );
        const querySnapshot = await getDocs(q);
        const fetchedVisits: Visit[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.timestamp >= sevenDaysAgo) {
            fetchedVisits.push({ id: doc.id, ...data } as Visit);
          }
        });
        setVisits(fetchedVisits);

        // 2. Cleanup old visits (older than 7 days)
        // We do this asynchronously so it doesn't block the UI
        const oldQ = query(
          collection(db, 'visits'),
          where('timestamp', '<', sevenDaysAgo),
          limit(500) // limit to avoid massive batch operations at once
        );
        const oldSnapshot = await getDocs(oldQ);
        oldSnapshot.forEach((oldDoc) => {
          deleteDoc(doc(db, 'visits', oldDoc.id)).catch(console.error);
        });

      } catch (err: any) {
        console.error('Error fetching visits:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndCleanupVisits();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: currentThemeColor }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500">
        <p>Error loading analytics: {error}</p>
      </div>
    );
  }

  // Calculate metrics
  const totalVisits = visits.length;
  
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekStart = todayStart - 7 * 24 * 60 * 60 * 1000;

  const todayVisits = visits.filter(v => new Date(v.timestamp).getTime() >= todayStart).length;
  const weekVisits = visits.filter(v => new Date(v.timestamp).getTime() >= weekStart).length;

  // Prepare chart data (visits per day for the last 7 days)
  const chartDataMap = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    chartDataMap.set(dateStr, 0);
  }

  visits.forEach(v => {
    const d = new Date(v.timestamp);
    if (d.getTime() >= weekStart) {
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (chartDataMap.has(dateStr)) {
        chartDataMap.set(dateStr, chartDataMap.get(dateStr)! + 1);
      }
    }
  });

  const chartData = Array.from(chartDataMap.entries()).map(([date, count]) => ({
    date,
    visits: count
  }));

  const t = {
    total: lang === 'bn' ? 'মোট ভিজিটর' : 'Total Visitors',
    today: lang === 'bn' ? 'আজকের ভিজিটর' : 'Today\'s Visitors',
    week: lang === 'bn' ? 'এই সপ্তাহের ভিজিটর' : 'This Week',
    recent: lang === 'bn' ? 'সাম্প্রতিক ভিজিট' : 'Recent Visits',
    chartTitle: lang === 'bn' ? 'গত ৭ দিনের ভিজিটর' : 'Visitors Last 7 Days',
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <h2 className="text-2xl font-black">{lang === 'bn' ? 'ভিজিটর অ্যানালিটিক্স' : 'Visitor Analytics'}</h2>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-500/20 text-blue-400">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t.total}</p>
            <p className="text-3xl font-black">{totalVisits}</p>
          </div>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-500/20 text-emerald-400">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t.today}</p>
            <p className="text-3xl font-black">{todayVisits}</p>
          </div>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-500/20 text-purple-400">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t.week}</p>
            <p className="text-3xl font-black">{weekVisits}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
        <h3 className="text-sm font-black uppercase tracking-widest mb-6">{t.chartTitle}</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="date" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff20', borderRadius: '12px' }}
                itemStyle={{ color: currentThemeColor }}
              />
              <Line 
                type="monotone" 
                dataKey="visits" 
                stroke={currentThemeColor} 
                strokeWidth={3} 
                dot={{ fill: currentThemeColor, strokeWidth: 2, r: 4 }} 
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Visits Table */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 overflow-hidden">
        <h3 className="text-sm font-black uppercase tracking-widest mb-6">{t.recent}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-slate-500">
                <th className="pb-3 font-black">Time</th>
                <th className="pb-3 font-black">Path</th>
                <th className="pb-3 font-black">Device / Browser</th>
              </tr>
            </thead>
            <tbody>
              {visits.slice(0, 10).map((visit) => (
                <tr key={visit.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  <td className="py-4 text-xs font-mono">{new Date(visit.timestamp).toLocaleString()}</td>
                  <td className="py-4 text-sm font-medium">{visit.path}</td>
                  <td className="py-4 text-xs text-slate-400 max-w-[200px] truncate" title={visit.userAgent}>
                    {visit.userAgent}
                  </td>
                </tr>
              ))}
              {visits.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-500 text-sm">No visits recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VisitorAnalytics;
