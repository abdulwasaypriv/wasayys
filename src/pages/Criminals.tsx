import { useEffect, useState } from 'react';
import { UserPlus, Search, Trash2, Users, Info } from 'lucide-react';
import { fetchCriminals, addCriminal, deleteCriminal } from '../lib/api';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { useToast } from '../context/ToastContext';
import type { Criminal } from '../types';

const STATUSES = ['Wanted', 'Arrested', 'Released', 'Under Trial'] as const;
const CRIME_TYPES = ['Armed Robbery', 'Drug Trafficking', 'Financial Fraud', 'Cybercrime', 'Kidnapping', 'Murder', 'Terrorism', 'Human Trafficking', 'Vehicle Theft', 'Extortion'];

export function Criminals() {
  const [criminals, setCriminals] = useState<Criminal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: '', dob: '', gender: '', nationality: 'Pakistani',
    crime_type: '', status: 'Wanted' as Criminal['status'],
  });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { setCriminals(await fetchCriminals()); }
    catch { showToast('error', 'Failed to load criminals'); }
    finally { setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.crime_type.trim()) {
      showToast('error', 'Name and Crime Type are required');
      return;
    }
    setSubmitting(true);
    try {
      const created = await addCriminal(form);
      setCriminals(prev => [created, ...prev]);
      setShowModal(false);
      setForm({ name: '', dob: '', gender: '', nationality: 'Pakistani', crime_type: '', status: 'Wanted' });
      showToast('success', `Criminal record for "${created.name}" added successfully`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to add criminal');
    } finally { setSubmitting(false); }
  }

  async function handleDelete(id: number, name: string) {
    try {
      await deleteCriminal(id);
      setCriminals(prev => prev.filter(c => c.criminal_id !== id));
      showToast('success', `Record for "${name}" deleted`);
    } catch (err: any) {
      showToast('error', err.message || 'Delete failed');
    }
  }

  const filtered = criminals.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.crime_type.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users size={18} className="text-accent-red" />
            <h1 className="section-title">CRIMINALS REGISTRY</h1>
          </div>
          <div className="flex items-center gap-2 ml-6">
            <Info size={11} className="text-text-muted" />
            <span className="font-mono text-[10px] text-text-muted">Table: criminals · 3NF Normalized · Index: idx_criminals_name · Foreign Keys enforced</span>
          </div>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
          <UserPlus size={14} />
          ADD CRIMINAL
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            className="input-field pl-9"
            placeholder="Search by name or crime type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="select-field sm:w-48" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">ALL STATUSES</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-bg-card border border-border-dim overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr>
                <th className="th-base">ID</th>
                <th className="th-base">Name</th>
                <th className="th-base">DOB</th>
                <th className="th-base">Gender</th>
                <th className="th-base">Nationality</th>
                <th className="th-base">Crime Type</th>
                <th className="th-base">Status</th>
                <th className="th-base">Registered</th>
                <th className="th-base">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={9} className="td-base text-center py-10 text-text-muted font-mono text-sm">LOADING RECORDS...</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={9} className="td-base text-center py-10 text-text-muted font-mono text-sm">NO RECORDS FOUND</td></tr>
              )}
              {filtered.map(c => (
                <tr key={c.criminal_id} className="table-row-base">
                  <td className="td-base"><span className="font-mono text-xs text-accent-blue/70">#{c.criminal_id}</span></td>
                  <td className="td-base"><span className="font-medium">{c.name}</span></td>
                  <td className="td-base"><span className="font-mono text-xs text-text-secondary">{c.dob || '—'}</span></td>
                  <td className="td-base text-text-secondary">{c.gender || '—'}</td>
                  <td className="td-base text-text-secondary">{c.nationality || '—'}</td>
                  <td className="td-base"><span className="font-mono text-xs text-text-secondary">{c.crime_type}</span></td>
                  <td className="td-base"><StatusBadge status={c.status} /></td>
                  <td className="td-base"><span className="font-mono text-xs text-text-muted">{c.created_at ? new Date(c.created_at).toLocaleDateString('en-PK') : '—'}</span></td>
                  <td className="td-base">
                    <button
                      onClick={() => handleDelete(c.criminal_id, c.name)}
                      className="text-text-muted hover:text-accent-red transition-colors p-1.5 hover:bg-red-950/20"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-border-dim bg-bg-card">
          <span className="font-mono text-[10px] text-text-muted">
            SHOWING {filtered.length} / {criminals.length} RECORDS · TABLE: criminals · INDEX: idx_criminals_name
          </span>
        </div>
      </div>

      {showModal && (
        <Modal title="ADD CRIMINAL RECORD" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Full Name *</label>
                <input className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Muhammad Arshad Khan" required />
              </div>
              <div>
                <label className="label">Date of Birth</label>
                <input type="date" className="input-field" value={form.dob} onChange={e => setForm(p => ({ ...p, dob: e.target.value }))} />
              </div>
              <div>
                <label className="label">Gender</label>
                <select className="select-field" value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}>
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="label">Nationality</label>
                <input className="input-field" value={form.nationality} onChange={e => setForm(p => ({ ...p, nationality: e.target.value }))} />
              </div>
              <div>
                <label className="label">Crime Type *</label>
                <select className="select-field" value={form.crime_type} onChange={e => setForm(p => ({ ...p, crime_type: e.target.value }))} required>
                  <option value="">Select Crime</option>
                  {CRIME_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="label">Status *</label>
                <div className="grid grid-cols-4 gap-2">
                  {STATUSES.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, status: s }))}
                      className={`py-2 font-mono text-xs border transition-all ${form.status === s
                        ? 'border-accent-blue bg-accent-blue/10 text-accent-blue'
                        : 'border-border-dim text-text-muted hover:border-border-bright'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex-1" disabled={submitting}>
                {submitting ? 'SUBMITTING...' : 'ADD RECORD'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>CANCEL</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
