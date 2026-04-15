import React, { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, query, orderBy, limit, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity, Users, Clock, Calendar, Filter, ChevronDown } from 'lucide-react';

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

type DateRange = '7d' | '30d' | '90d' | 'custom';

const VisitorAnalytics: React.FC<VisitorAnalyticsProps> = ({ currentThemeColor, lang }) => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    const fetchAndCleanupVisits = async () => {
      try {
        const now = new Date();
        // Calculate 90 days ago for cleanup (keep more data now)
        const cleanupThreshold = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();

        // 1. Fetch recent visits (last 2000 to support longer ranges)
        const q = query(
          collection(db, 'visits'), 
          orderBy('timestamp', 'desc'), 
          limit(2000)
        );
        const querySnapshot = await getDocs(q);
        const fetchedVisits: Visit[] = [];
        querySnapshot.forEach((doc) => {
          fetchedVisits.push({ id: doc.id, ...doc.data() } as Visit);
        });
        setVisits(fetchedVisits);

        // 2. Cleanup old visits (older than 90 days)
        const oldQ = query(
          collection(db, 'visits'),
          where('timestamp', '<', cleanupThreshold),
          limit(500)
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

  const filteredVisits = useMemo(() => {
    const now = new Date();
    let startTimestamp = 0;

    if (dateRange === '7d') {
      startTimestamp = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    } else if (dateRange === '30d') {
      startTimestamp = now.getTime() - 30 * 24 * 60 * 60 * 1000;
    } else if (dateRange === '90d') {
      startTimestamp = now.getTime() - 90 * 24 * 60 * 60 * 1000;
    } else if (dateRange === 'custom' && customStartDate) {
      startTimestamp = new Date(customStartDate).getTime();
    }

    let endTimestamp = Infinity;
    if (dateRange === 'custom' && customEndDate) {
      // Set to end of the day
      const end = new Date(customEndDate);
      end.setHours(23, 59, 59, 999);
      endTimestamp = end.getTime();
    }

    return visits.filter(v => {
      const ts = new Date(v.timestamp).getTime();
      return ts >= startTimestamp && ts <= endTimestamp;
    });
  }, [visits, dateRange, customStartDate, customEndDate]);

  // Prepare chart data based on filtered visits
  const chartData = useMemo(() => {
    const dataMap = new Map<string, number>();
    
    if (filteredVisits.length === 0) return [];

    // Determine the range of days to show in the chart
    const timestamps = filteredVisits.map(v => new Date(v.timestamp).getTime());
    const minTs = Math.min(...timestamps);
    const maxTs = Math.max(...timestamps);
    
    // Create entries for all days in range
    const start = new Date(minTs);
    start.setHours(0, 0, 0, 0);
    const end = new Date(maxTs);
    end.setHours(0, 0, 0, 0);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dataMap.set(dateStr, 0);
    }

    filteredVisits.forEach(v => {
      const dateStr = new Date(v.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (dataMap.has(dateStr)) {
        dataMap.set(dateStr, dataMap.get(dateStr)! + 1);
      }
    });

    return Array.from(dataMap.entries()).map(([date, count]) => ({
      date,
      visits: count
    }));
  }, [filteredVisits]);

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

  const totalVisits = filteredVisits.length;
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayVisits = filteredVisits.filter(v => new Date(v.timestamp).getTime() >= todayStart).length;

  const t = {
    total: lang === 'bn' ? 'মোট ভিজিটর' : 'Total Visitors',
    today: lang === 'bn' ? 'আজকের ভিজিটর' : 'Today\'s Visitors',
    range: lang === 'bn' ? 'সময়কাল' : 'Date Range',
    recent: lang === 'bn' ? 'সাম্প্রতিক ভিজিট' : 'Recent Visits',
    chartTitle: lang === 'bn' ? 'ভিজিটর ট্রেন্ড' : 'Visitor Trend',
    last7: lang === 'bn' ? 'গত ৭ দিন' : 'Last 7 Days',
    last30: lang === 'bn' ? 'গত ৩০ দিন' : 'Last 30 Days',
    last90: lang === 'bn' ? 'গত ৯০ দিন' : 'Last 90 Days',
    custom: lang === 'bn' ? 'কাস্টম' : 'Custom Range',
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-black">{lang === 'bn' ? 'ভিজিটর অ্যানালিটিক্স' : 'Visitor Analytics'}</h2>
          <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-full flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: currentThemeColor }}></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {lang === 'bn' ? 'সর্বমোট:' : 'Total:'} <span className="text-white">{visits.length}{visits.length >= 2000 ? '+' : ''}</span>
            </span>
          </div>
        </div>
        
        {/* Date Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <Filter size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              className="bg-slate-900 border border-white/10 rounded-2xl pl-10 pr-10 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:border-white/30 appearance-none cursor-pointer text-white"
            >
              <option value="7d" className="bg-slate-900 text-white">{t.last7}</option>
              <option value="30d" className="bg-slate-900 text-white">{t.last30}</option>
              <option value="90d" className="bg-slate-900 text-white">{t.last90}</option>
              <option value="custom" className="bg-slate-900 text-white">{t.custom}</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>

          {dateRange === 'custom' && (
            <div className="flex items-center gap-2 animate-in slide-in-from-right-4 fade-in">
              <input 
                type="date" 
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold outline-none focus:border-white/30 text-white"
              />
              <span className="text-slate-500 text-[10px] font-black">TO</span>
              <input 
                type="date" 
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold outline-none focus:border-white/30 text-white"
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-500/20 text-blue-400">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t.total} ({dateRange === 'custom' ? 'Selected' : dateRange})</p>
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
      </div>

      {/* Chart */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
        <h3 className="text-sm font-black uppercase tracking-widest mb-6">{t.chartTitle}</h3>
        <div className="h-72 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="date" stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff20', borderRadius: '12px' }}
                  itemStyle={{ color: currentThemeColor }}
                />
                <Line 
                  type="monotone" 
                  dataKey="visits" 
                  stroke={currentThemeColor} 
                  strokeWidth={3} 
                  dot={{ fill: currentThemeColor, strokeWidth: 2, r: 3 }} 
                  activeDot={{ r: 5 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm italic">
              No data available for the selected range.
            </div>
          )}
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
              {filteredVisits.slice(0, 15).map((visit) => (
                <tr key={visit.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  <td className="py-4 text-[10px] font-mono whitespace-nowrap">{new Date(visit.timestamp).toLocaleString()}</td>
                  <td className="py-4 text-xs font-medium">{visit.path}</td>
                  <td className="py-4 text-[10px] text-slate-400 max-w-[200px] truncate" title={visit.userAgent}>
                    {visit.userAgent}
                  </td>
                </tr>
              ))}
              {filteredVisits.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-500 text-sm">No visits recorded in this period.</td>
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
