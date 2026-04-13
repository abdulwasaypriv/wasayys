import { useEffect, useState } from 'react';
import { Shield, UserPlus, Info } from 'lucide-react';
import { fetchOfficers, addOfficer } from '../lib/api';
import { Modal } from '../components/Modal';
import { useToast } from '../context/ToastContext';
import type { Officer } from '../types';

const RANKS = ['Constable', 'Head Constable', 'ASI', 'SI', 'Inspector', 'DSP', 'SP', 'SSP', 'DIG', 'IG'];
const DEPARTMENTS = ['Crimes Investigation Department', 'Anti-Narcotics Force', 'Cyber Crime Wing', 'Counter Terrorism Department', 'Special Investigation Unit', 'Traffic Police', 'Anti-Corruption Establishment', 'Sindh Rangers'];

export function Officers() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const [form, setForm] = useState({ name: '', badge_number: '', rank: '', department: '', assigned_cases: 0 });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { setOfficers(await fetchOfficers()); }
    catch { showToast('error', 'Failed to load officers'); }
    finally { setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.badge_number.trim() || !form.rank || !form.department) {
      showToast('error', 'All fields are required');
      return;
    }
    setSubmitting(true);
    try {
      const created = await addOfficer(form);
      setOfficers(prev => [created, ...prev]);
      setShowModal(false);
      setForm({ name: '', badge_number: '', rank: '', department: '', assigned_cases: 0 });
      showToast('success', `Officer ${created.name} registered successfully`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to add officer');
    } finally { setSubmitting(false); }
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={18} className="text-accent-blue" />
            <h1 className="section-title">OFFICER MANAGEMENT</h1>
          </div>
          <div className="flex items-center gap-2 ml-6">
            <Info size={11} className="text-text-muted" />
            <span className="font-mono text-[10px] text-text-muted">Table: officers · 3NF Normalized · badge_number UNIQUE constraint</span>
          </div>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
          <UserPlus size={14} />
          REGISTER OFFICER
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
        {[
          { label: 'Total Officers', value: officers.length, color: 'text-accent-blue' },
          { label: 'Active Departments', value: new Set(officers.map(o => o.department)).size, color: 'text-accent-green' },
          { label: 'Total Cases Assigned', value: officers.reduce((a, o) => a + (o.assigned_cases ?? 0), 0), color: 'text-accent-amber' },
          { label: 'Avg Cases / Officer', value: officers.length ? Math.round(officers.reduce((a, o) => a + (o.assigned_cases ?? 0), 0) / officers.length) : 0, color: 'text-accent-red' },
        ].map(s => (
          <div key={s.label} className="bg-bg-card border border-border-dim p-4" style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>
            <div className={`font-heading text-3xl ${s.color} mb-1`}>{loading ? '--' : s.value}</div>
            <div className="font-mono text-[10px] text-text-muted tracking-wider">{s.label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      <div className="bg-bg-card border border-border-dim overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr>
                <th className="th-base">ID</th>
                <th className="th-base">Badge Number</th>
                <th className="th-base">Name</th>
                <th className="th-base">Rank</th>
                <th className="th-base">Department</th>
                <th className="th-base">Cases Assigned</th>
                <th className="th-base">Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className="td-base text-center py-10 text-text-muted font-mono text-sm">LOADING...</td></tr>
              )}
              {!loading && officers.length === 0 && (
                <tr><td colSpan={7} className="td-base text-center py-10 text-text-muted font-mono text-sm">NO OFFICERS REGISTERED</td></tr>
              )}
              {officers.map(o => (
                <tr key={o.officer_id} className="table-row-base">
                  <td className="td-base"><span className="font-mono text-xs text-accent-blue/70">#{o.officer_id}</span></td>
                  <td className="td-base"><span className="font-mono text-sm text-accent-blue">{o.badge_number}</span></td>
                  <td className="td-base"><span className="font-medium">{o.name}</span></td>
                  <td className="td-base">
                    <span className="font-mono text-xs px-2 py-0.5 border border-accent-blue/20 text-accent-blue/80 bg-accent-blue/5">
                      {o.rank}
                    </span>
                  </td>
                  <td className="td-base text-text-secondary text-xs">{o.department}</td>
                  <td className="td-base">
                    <span className={`font-mono text-sm font-bold ${o.assigned_cases > 3 ? 'text-accent-amber' : o.assigned_cases > 0 ? 'text-accent-blue' : 'text-text-muted'}`}>
                      {o.assigned_cases}
                    </span>
                  </td>
                  <td className="td-base"><span className="font-mono text-xs text-text-muted">{o.created_at ? new Date(o.created_at).toLocaleDateString('en-PK') : '—'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-border-dim bg-bg-card">
          <span className="font-mono text-[10px] text-text-muted">TOTAL: {officers.length} OFFICERS · assigned_cases auto-increments on CASE insert (Transaction)</span>
        </div>
      </div>

      {showModal && (
        <Modal title="REGISTER OFFICER" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Full Name *</label>
                <input className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Inspector Zulfiqar Ahmed" required />
              </div>
              <div>
                <label className="label">Badge Number *</label>
                <input className="input-field" value={form.badge_number} onChange={e => setForm(p => ({ ...p, badge_number: e.target.value }))} placeholder="e.g. KHI-4455" required />
              </div>
              <div>
                <label className="label">Rank *</label>
                <select className="select-field" value={form.rank} onChange={e => setForm(p => ({ ...p, rank: e.target.value }))} required>
                  <option value="">Select Rank</option>
                  {RANKS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="label">Department *</label>
                <select className="select-field" value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} required>
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex-1" disabled={submitting}>
                {submitting ? 'REGISTERING...' : 'REGISTER OFFICER'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>CANCEL</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
