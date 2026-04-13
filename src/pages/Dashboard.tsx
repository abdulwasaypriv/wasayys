import { useEffect, useState } from 'react';
import { TrendingUp, Users, FileText, Briefcase } from 'lucide-react';
import { fetchStats, fetchRecentActivity, fetchCriminalStatusBreakdown } from '../lib/api';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { useToast } from '../context/ToastContext';

export function Dashboard() {
  const [stats, setStats] = useState({ criminals: 0, openFirs: 0, activeCases: 0, officers: 0 });
  const [recent, setRecent] = useState({ criminals: [], firs: [], cases: [] });
  const [breakdown, setBreakdown] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [s, r, b] = await Promise.all([fetchStats(), fetchRecentActivity(), fetchCriminalStatusBreakdown()]);
      setStats(s); setRecent(r); setBreakdown(b);
    } catch {
      showToast('error', 'Failed to load dashboard');
    } finally { setLoading(false); }
  }

  const cards = [
    { label: 'Total Criminals', value: stats.criminals, icon: <Users size={24} />, color: 'text-danger-red' },
    { label: 'Open FIRs', value: stats.openFirs, icon: <FileText size={24} />, color: 'text-warning-amber' },
    { label: 'Active Cases', value: stats.activeCases, icon: <Briefcase size={24} />, color: 'text-success-green' },
    { label: 'Officers', value: stats.officers, icon: <TrendingUp size={24} />, color: 'text-accent-blue' },
  ];

  const total = Object.values(breakdown).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="section-title mb-2">Dashboard</h1>
        <p className="text-text-secondary">System overview and recent activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, i) => (
          <div key={i} className="stat-card group">
            <div className={`${c.color} mb-3 opacity-70`}>{c.icon}</div>
            <div className="stat-value">{loading ? '—' : c.value}</div>
            <div className="stat-label">{c.label}</div>
            <div className="mt-4 h-1.5 bg-bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-accent-blue to-success-green group-hover:w-full transition-all duration-500" style={{ width: '65%' }} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h2 className="font-heading text-lg font-bold text-text-dark mb-6 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-accent-blue to-success-green rounded-full" />
            Criminal Status Distribution
          </h2>
          <div className="space-y-4">
            {!loading && Object.entries(breakdown).map(([status, count]) => (
              <div key={status}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-text-dark">{status}</span>
                  <span className="font-heading text-sm text-accent-blue font-bold">{count}</span>
                </div>
                <div className="h-3 bg-bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent-blue via-accent-blue-light to-success-green transition-all duration-700"
                    style={{ width: `${(count / total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="font-heading text-lg font-bold text-text-dark mb-6 flex items-center gap-2">
            <div className="w-1 h-6 bg-success-green rounded-full" />
            System Status
          </h2>
          <div className="space-y-3">
            <div className="pb-3 border-b border-border-light">
              <p className="text-xs text-text-muted uppercase tracking-wide font-semibold">Database</p>
              <p className="font-heading text-sm text-accent-blue mt-1">Supabase PostgreSQL</p>
            </div>
            <div className="pb-3 border-b border-border-light">
              <p className="text-xs text-text-muted uppercase tracking-wide font-semibold">Storage</p>
              <p className="font-heading text-sm text-accent-blue mt-1">Relational + NoSQL</p>
            </div>
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wide font-semibold">Health</p>
              <p className="font-heading text-sm text-success-green mt-1 flex items-center gap-2">
                <span className="w-2 h-2 bg-success-green rounded-full animate-pulse" /> Operational
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Recent Criminals', data: recent.criminals, fields: ['name', 'crime_type'] },
          { title: 'Recent FIRs', data: recent.firs, fields: ['fir_number', 'location'] },
          { title: 'Recent Cases', data: recent.cases, fields: ['case_number', 'status'] },
        ].map((sec, idx) => (
          <div key={idx} className="card">
            <h3 className="font-heading text-base font-bold text-text-dark mb-4">{sec.title}</h3>
            <div className="space-y-2">
              {loading && <p className="text-text-muted text-sm">Loading...</p>}
              {!loading && sec.data.length === 0 && <p className="text-text-muted text-sm">No records</p>}
              {sec.data.map((item: any, i) => (
                <div key={i} className="p-3 bg-bg-secondary/30 rounded-lg hover:bg-bg-secondary transition-colors">
                  <p className="text-sm font-medium text-text-dark">{item[sec.fields[0]]}</p>
                  <p className="text-xs text-text-muted mt-1">{item[sec.fields[1]]}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="card relative overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10 py-12 text-center">
          <h2 className="font-heading text-3xl font-bold text-text-dark mb-2">CRMS v2.0</h2>
          <p className="text-text-secondary mb-6">Professional Crime Records Management System</p>
          <div className="flex flex-wrap justify-center gap-3 text-xs font-body text-text-muted">
            <span className="px-3 py-1 bg-white/60 rounded-full">Supabase</span>
            <span className="px-3 py-1 bg-white/60 rounded-full">React</span>
            <span className="px-3 py-1 bg-white/60 rounded-full">Three.js</span>
            <span className="px-3 py-1 bg-white/60 rounded-full">TypeScript</span>
          </div>
        </div>
      </div>
    </div>
  );
}
