import { useEffect, useState } from 'react';
import { Briefcase, PlusCircle, Info } from 'lucide-react';
import { fetchCases, addCase, fetchFIRs, fetchOfficers } from '../lib/api';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { useToast } from '../context/ToastContext';
import type { Case, FIRRecord, Officer } from '../types';

const STATUSES = ['Active', 'Pending', 'Closed', 'Dismissed'] as const;

export function Cases() {
  const [cases, setCases] = useState<Case[]>([]);
  const [firs, setFirs] = useState<FIRRecord[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    case_number: '', fir_id: '' as string | number, officer_id: '' as string | number,
    start_date: '', court_date: '', verdict: '', status: 'Active' as Case['status'],
  });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [c, f, o] = await Promise.all([fetchCases(), fetchFIRs(), fetchOfficers()]);
      setCases(c); setFirs(f); setOfficers(o);
    } catch { showToast('error', 'Failed to load cases'); }
    finally { setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.case_number.trim()) { showToast('error', 'Case number is required'); return; }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        fir_id: form.fir_id ? Number(form.fir_id) : null,
        officer_id: form.officer_id ? Number(form.officer_id) : null,
      };
      await addCase(payload as any);
      await load();
      setShowModal(false);
      setForm({ case_number: '', fir_id: '', officer_id: '', start_date: '', court_date: '', verdict: '', status: 'Active' });
      showToast('success', `Case ${form.case_number} opened — Transaction executed: case INSERT + officer UPDATE`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to add case');
    } finally { setSubmitting(false); }
  }

  const filtered = cases.filter(c => !filterStatus || c.status === filterStatus);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Briefcase size={18} className="text-accent-green" />
            <h1 className="section-title">CASE TRACKING</h1>
          </div>
          <div className="flex items-center gap-2 ml-6">
            <Info size={11} className="text-text-muted" />
            <span className="font-mono text-[10px] text-text-muted">Table: cases · FK→fir_records · FK→officers · INSERT uses SQL TRANSACTION (case + officer update)</span>
          </div>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
          <PlusCircle size={14} />
          OPEN NEW CASE
        </button>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setFilterStatus('')} className={`font-mono text-xs px-3 py-1.5 border transition-all ${!filterStatus ? 'border-accent-blue text-accent-blue bg-accent-blue/10' : 'border-border-dim text-text-muted hover:border-border-bright'}`}>ALL</button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} className={`font-mono text-xs px-3 py-1.5 border transition-all ${filterStatus === s ? 'border-accent-blue text-accent-blue bg-accent-blue/10' : 'border-border-dim text-text-muted hover:border-border-bright'}`}>{s}</button>
        ))}
      </div>

      <div className="bg-bg-card border border-border-dim overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr>
                <th className="th-base">Case Number</th>
                <th className="th-base">Linked FIR</th>
                <th className="th-base">Assigned Officer</th>
                <th className="th-base">Start Date</th>
                <th className="th-base">Court Date</th>
                <th className="th-base">Verdict</th>
                <th className="th-base">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="td-base text-center py-10 text-text-muted font-mono text-sm">LOADING...</td></tr>}
              {!loading && filtered.length === 0 && <tr><td colSpan={7} className="td-base text-center py-10 text-text-muted font-mono text-sm">NO CASES FOUND</td></tr>}
              {filtered.map(c => (
                <tr key={c.case_id} className="table-row-base">
                  <td className="td-base"><span className="font-mono text-sm text-accent-green">{c.case_number}</span></td>
                  <td className="td-base">
                    {c.fir_records
                      ? <span className="font-mono text-xs text-accent-amber">{c.fir_records.fir_number}</span>
                      : <span className="text-text-muted text-xs">—</span>}
                  </td>
                  <td className="td-base">
                    {c.officers
                      ? <div><p className="text-sm">{c.officers.name}</p><p className="text-xs text-text-muted font-mono">{c.officers.badge_number}</p></div>
                      : <span className="text-text-muted text-xs">—</span>}
                  </td>
                  <td className="td-base"><span className="font-mono text-xs text-text-secondary">{c.start_date || '—'}</span></td>
                  <td className="td-base"><span className={`font-mono text-xs ${c.court_date ? 'text-accent-amber' : 'text-text-muted'}`}>{c.court_date || '—'}</span></td>
                  <td className="td-base max-w-[160px]"><span className="text-xs text-text-muted">{c.verdict || '—'}</span></td>
                  <td className="td-base"><StatusBadge status={c.status} type="case" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-border-dim">
          <span className="font-mono text-[10px] text-text-muted">SHOWING {filtered.length}/{cases.length} CASES · New case insert triggers officer assigned_cases++ via atomic transaction</span>
        </div>
      </div>

      {showModal && (
        <Modal title="OPEN NEW CASE" onClose={() => setShowModal(false)} width="max-w-2xl">
          <div className="mb-4 p-3 border border-accent-amber/30 bg-amber-950/10">
            <p className="font-mono text-xs text-accent-amber">TRANSACTION NOTE: Adding a case will atomically INSERT the case record AND UPDATE the assigned officer's case count.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Case Number *</label>
                <input className="input-field" value={form.case_number} onChange={e => setForm(p => ({ ...p, case_number: e.target.value }))} placeholder="e.g. CASE-KHI-2024-0150" required />
              </div>
              <div>
                <label className="label">Linked FIR (FK)</label>
                <select className="select-field" value={form.fir_id} onChange={e => setForm(p => ({ ...p, fir_id: e.target.value }))}>
                  <option value="">Select FIR</option>
                  {firs.map(f => <option key={f.fir_id} value={f.fir_id}>{f.fir_number} — {f.location}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Assigned Officer (FK)</label>
                <select className="select-field" value={form.officer_id} onChange={e => setForm(p => ({ ...p, officer_id: e.target.value }))}>
                  <option value="">Select Officer</option>
                  {officers.map(o => <option key={o.officer_id} value={o.officer_id}>{o.name} — {o.badge_number}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Start Date</label>
                <input type="date" className="input-field" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} />
              </div>
              <div>
                <label className="label">Court Date</label>
                <input type="date" className="input-field" value={form.court_date} onChange={e => setForm(p => ({ ...p, court_date: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="label">Verdict (if closed)</label>
                <input className="input-field" value={form.verdict} onChange={e => setForm(p => ({ ...p, verdict: e.target.value }))} placeholder="e.g. Convicted — 5 Years Imprisonment" />
              </div>
              <div className="col-span-2">
                <label className="label">Status *</label>
                <div className="grid grid-cols-4 gap-2">
                  {STATUSES.map(s => (
                    <button key={s} type="button" onClick={() => setForm(p => ({ ...p, status: s }))}
                      className={`py-2 font-mono text-xs border transition-all ${form.status === s ? 'border-accent-green bg-green-950/20 text-accent-green' : 'border-border-dim text-text-muted hover:border-border-bright'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex-1" disabled={submitting}>{submitting ? 'OPENING...' : 'OPEN CASE'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>CANCEL</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
