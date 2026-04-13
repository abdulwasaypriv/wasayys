import { useEffect, useState } from 'react';
import { FileText, PlusCircle, Info } from 'lucide-react';
import { fetchFIRs, addFIR, fetchCriminals, fetchOfficers } from '../lib/api';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { useToast } from '../context/ToastContext';
import type { FIRRecord, Criminal, Officer } from '../types';

const STATUSES = ['Open', 'Under Investigation', 'Closed'] as const;

export function FIRRecords() {
  const [firs, setFirs] = useState<FIRRecord[]>([]);
  const [criminals, setCriminals] = useState<Criminal[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    fir_number: '', date_filed: '', location: '', description: '',
    criminal_id: '' as string | number, officer_id: '' as string | number,
    status: 'Open' as FIRRecord['status'],
  });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [f, c, o] = await Promise.all([fetchFIRs(), fetchCriminals(), fetchOfficers()]);
      setFirs(f); setCriminals(c); setOfficers(o);
    } catch { showToast('error', 'Failed to load FIR records'); }
    finally { setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fir_number.trim() || !form.date_filed || !form.location.trim()) {
      showToast('error', 'FIR Number, Date, and Location are required');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        criminal_id: form.criminal_id ? Number(form.criminal_id) : null,
        officer_id: form.officer_id ? Number(form.officer_id) : null,
      };
      const created = await addFIR(payload as any);
      await load();
      setShowModal(false);
      setForm({ fir_number: '', date_filed: '', location: '', description: '', criminal_id: '', officer_id: '', status: 'Open' });
      showToast('success', `FIR ${created.fir_number} registered successfully`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to register FIR');
    } finally { setSubmitting(false); }
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText size={18} className="text-accent-amber" />
            <h1 className="section-title">FIR REGISTRATION</h1>
          </div>
          <div className="flex items-center gap-2 ml-6">
            <Info size={11} className="text-text-muted" />
            <span className="font-mono text-[10px] text-text-muted">Table: fir_records · FK→criminals · FK→officers · INDEX: idx_fir_number</span>
          </div>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
          <PlusCircle size={14} />
          FILE NEW FIR
        </button>
      </div>

      <div className="bg-bg-card border border-border-dim overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr>
                <th className="th-base">FIR Number</th>
                <th className="th-base">Date Filed</th>
                <th className="th-base">Location</th>
                <th className="th-base">Linked Criminal</th>
                <th className="th-base">Assigned Officer</th>
                <th className="th-base">Status</th>
                <th className="th-base">Description</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="td-base text-center py-10 text-text-muted font-mono text-sm">LOADING...</td></tr>}
              {!loading && firs.length === 0 && <tr><td colSpan={7} className="td-base text-center py-10 text-text-muted font-mono text-sm">NO FIR RECORDS FOUND</td></tr>}
              {firs.map(f => (
                <tr key={f.fir_id} className="table-row-base">
                  <td className="td-base"><span className="font-mono text-sm text-accent-amber">{f.fir_number}</span></td>
                  <td className="td-base"><span className="font-mono text-xs text-text-secondary">{f.date_filed}</span></td>
                  <td className="td-base text-text-secondary text-xs">{f.location}</td>
                  <td className="td-base">
                    {f.criminals
                      ? <div><p className="font-medium text-sm">{f.criminals.name}</p><p className="text-xs text-text-muted font-mono">{f.criminals.crime_type}</p></div>
                      : <span className="text-text-muted text-xs">—</span>}
                  </td>
                  <td className="td-base">
                    {f.officers
                      ? <div><p className="text-sm">{f.officers.name}</p><p className="text-xs text-text-muted font-mono">{f.officers.badge_number}</p></div>
                      : <span className="text-text-muted text-xs">—</span>}
                  </td>
                  <td className="td-base"><StatusBadge status={f.status} type="fir" /></td>
                  <td className="td-base max-w-xs"><p className="text-xs text-text-muted truncate">{f.description || '—'}</p></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-border-dim">
          <span className="font-mono text-[10px] text-text-muted">TOTAL: {firs.length} FIRs · UNIQUE constraint on fir_number · FK cascades enforced</span>
        </div>
      </div>

      {showModal && (
        <Modal title="FILE NEW FIR" onClose={() => setShowModal(false)} width="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">FIR Number *</label>
                <input className="input-field" value={form.fir_number} onChange={e => setForm(p => ({ ...p, fir_number: e.target.value }))} placeholder="e.g. FIR-KHI-2024-007" required />
              </div>
              <div>
                <label className="label">Date Filed *</label>
                <input type="date" className="input-field" value={form.date_filed} onChange={e => setForm(p => ({ ...p, date_filed: e.target.value }))} required />
              </div>
              <div className="col-span-2">
                <label className="label">Location *</label>
                <input className="input-field" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Saddar, Karachi" required />
              </div>
              <div className="col-span-2">
                <label className="label">Description</label>
                <textarea className="textarea-field" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Detailed account of the incident..." />
              </div>
              <div>
                <label className="label">Linked Criminal (FK)</label>
                <select className="select-field" value={form.criminal_id} onChange={e => setForm(p => ({ ...p, criminal_id: e.target.value }))}>
                  <option value="">Select Criminal</option>
                  {criminals.map(c => <option key={c.criminal_id} value={c.criminal_id}>{c.name} — {c.crime_type}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Assigned Officer (FK)</label>
                <select className="select-field" value={form.officer_id} onChange={e => setForm(p => ({ ...p, officer_id: e.target.value }))}>
                  <option value="">Select Officer</option>
                  {officers.map(o => <option key={o.officer_id} value={o.officer_id}>{o.name} — {o.badge_number}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="label">Status *</label>
                <div className="grid grid-cols-3 gap-2">
                  {STATUSES.map(s => (
                    <button key={s} type="button" onClick={() => setForm(p => ({ ...p, status: s }))}
                      className={`py-2 font-mono text-xs border transition-all ${form.status === s ? 'border-accent-amber bg-amber-950/20 text-accent-amber' : 'border-border-dim text-text-muted hover:border-border-bright'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex-1" disabled={submitting}>{submitting ? 'FILING...' : 'FILE FIR'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>CANCEL</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
