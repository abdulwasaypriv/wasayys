import { useEffect, useState } from 'react';
import { Camera, PlusCircle, Info, Database } from 'lucide-react';
import { fetchEvidence, addEvidence, fetchCases } from '../lib/api';
import { EvidenceBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { useToast } from '../context/ToastContext';
import type { EvidenceDoc, Case } from '../types';

const EVIDENCE_TYPES = ['Photo', 'Video', 'Document', 'Weapon'] as const;

export function Evidence() {
  const [evidence, setEvidence] = useState<EvidenceDoc[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterType, setFilterType] = useState('');
  const { showToast } = useToast();

  const [form, setForm] = useState({
    case_id: '' as string | number,
    type: 'Photo' as EvidenceDoc['type'],
    description: '',
    submitted_by: '',
    date: '',
  });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [ev, cs] = await Promise.all([fetchEvidence(), fetchCases()]);
      setEvidence(ev); setCases(cs);
    } catch { showToast('error', 'Failed to load evidence'); }
    finally { setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.case_id || !form.description.trim() || !form.submitted_by.trim() || !form.date) {
      showToast('error', 'All fields are required');
      return;
    }
    setSubmitting(true);
    try {
      const created = await addEvidence({ ...form, case_id: Number(form.case_id) });
      setEvidence(prev => [created, ...prev]);
      setShowModal(false);
      setForm({ case_id: '', type: 'Photo', description: '', submitted_by: '', date: '' });
      showToast('success', `Evidence document logged — ID: ${created.id.slice(0, 8)}...`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to log evidence');
    } finally { setSubmitting(false); }
  }

  const grouped: Record<number, EvidenceDoc[]> = {};
  const filtered = evidence.filter(e => !filterType || e.type === filterType);
  filtered.forEach(e => {
    if (!grouped[e.case_id]) grouped[e.case_id] = [];
    grouped[e.case_id].push(e);
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Camera size={18} className="text-accent-blue" />
            <h1 className="section-title">EVIDENCE LOGS</h1>
            <span className="font-mono text-[10px] text-accent-green border border-accent-green/30 bg-green-950/20 px-2 py-0.5 ml-1">MongoDB</span>
          </div>
          <div className="flex items-center gap-2 ml-6">
            <Info size={11} className="text-text-muted" />
            <span className="font-mono text-[10px] text-text-muted">Collection: evidence_docs · UUID primary key · Schema-less document store</span>
          </div>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
          <PlusCircle size={14} />
          LOG EVIDENCE
        </button>
      </div>

      <div className="bg-bg-card border border-accent-green/20 bg-green-950/5 p-3 flex items-start gap-3" style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>
        <Database size={14} className="text-accent-green mt-0.5 flex-shrink-0" />
        <p className="font-mono text-xs text-text-secondary">
          <span className="text-accent-green">MongoDB Collection: evidence_docs</span> — Each document uses a UUID _id field, references case_id from the relational database, and has no rigid schema constraints — simulating a real document database structure.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterType('')} className={`font-mono text-xs px-3 py-1.5 border transition-all ${!filterType ? 'border-accent-blue text-accent-blue bg-accent-blue/10' : 'border-border-dim text-text-muted hover:border-border-bright'}`}>ALL TYPES</button>
        {EVIDENCE_TYPES.map(t => (
          <button key={t} onClick={() => setFilterType(t)} className={`font-mono text-xs px-3 py-1.5 border transition-all ${filterType === t ? 'border-accent-blue text-accent-blue bg-accent-blue/10' : 'border-border-dim text-text-muted hover:border-border-bright'}`}>{t}</button>
        ))}
      </div>

      {loading && <div className="font-mono text-sm text-text-muted text-center py-12">QUERYING COLLECTION...</div>}

      {!loading && filtered.length === 0 && (
        <div className="font-mono text-sm text-text-muted text-center py-12 bg-bg-card border border-border-dim" style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
          NO EVIDENCE DOCUMENTS FOUND
        </div>
      )}

      {Object.entries(grouped).map(([caseId, docs]) => {
        const caseInfo = cases.find(c => c.case_id === Number(caseId));
        return (
          <div key={caseId} className="bg-bg-card border border-border-dim" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
            <div className="px-5 py-3 border-b border-border-dim flex items-center gap-3 bg-bg-card-hover">
              <span className="font-mono text-xs text-accent-green border border-accent-green/30 px-2 py-0.5">CASE</span>
              <span className="font-mono text-sm text-accent-green">{caseInfo?.case_number || `#${caseId}`}</span>
              <span className="font-mono text-xs text-text-muted ml-auto">{docs.length} DOCUMENT{docs.length !== 1 ? 'S' : ''}</span>
            </div>
            <div className="divide-y divide-border-dim">
              {docs.map(ev => (
                <div key={ev.id} className="px-5 py-4 hover:bg-bg-card-hover transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <EvidenceBadge type={ev.type} />
                        <span className="font-mono text-[10px] text-text-muted">ID: {ev.id.slice(0, 16)}...</span>
                      </div>
                      <p className="font-body text-sm text-text-primary mb-1">{ev.description}</p>
                      <div className="flex flex-wrap gap-4 mt-2">
                        <span className="font-mono text-xs text-text-muted">
                          <span className="text-accent-blue/60">submitted_by:</span> {ev.submitted_by}
                        </span>
                        <span className="font-mono text-xs text-text-muted">
                          <span className="text-accent-blue/60">date:</span> {ev.date}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {showModal && (
        <Modal title="LOG EVIDENCE DOCUMENT" onClose={() => setShowModal(false)}>
          <div className="mb-4 p-3 border border-accent-green/30 bg-green-950/10">
            <p className="font-mono text-xs text-accent-green">MongoDB INSERT: document will be stored with auto-generated UUID in evidence_docs collection</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Case ID *</label>
              <select className="select-field" value={form.case_id} onChange={e => setForm(p => ({ ...p, case_id: e.target.value }))} required>
                <option value="">Select Case</option>
                {cases.map(c => <option key={c.case_id} value={c.case_id}>{c.case_number}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Evidence Type *</label>
              <div className="grid grid-cols-4 gap-2">
                {EVIDENCE_TYPES.map(t => (
                  <button key={t} type="button" onClick={() => setForm(p => ({ ...p, type: t }))}
                    className={`py-2 font-mono text-xs border transition-all ${form.type === t ? 'border-accent-blue bg-accent-blue/10 text-accent-blue' : 'border-border-dim text-text-muted hover:border-border-bright'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Description *</label>
              <textarea className="textarea-field" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the evidence in detail..." required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Submitted By *</label>
                <input className="input-field" value={form.submitted_by} onChange={e => setForm(p => ({ ...p, submitted_by: e.target.value }))} placeholder="e.g. SI Zahid Khan" required />
              </div>
              <div>
                <label className="label">Submission Date *</label>
                <input type="date" className="input-field" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex-1" disabled={submitting}>{submitting ? 'LOGGING...' : 'LOG EVIDENCE'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>CANCEL</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
