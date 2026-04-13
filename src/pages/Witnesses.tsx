import { useEffect, useState } from 'react';
import { MessageSquare, PlusCircle, Info, Database } from 'lucide-react';
import { fetchWitnesses, addWitness, fetchCases } from '../lib/api';
import { Modal } from '../components/Modal';
import { useToast } from '../context/ToastContext';
import type { WitnessStatement, Case } from '../types';

export function Witnesses() {
  const [witnesses, setWitnesses] = useState<WitnessStatement[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    case_id: '' as string | number,
    witness_name: '',
    statement: '',
    contact: '',
    date: '',
  });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [w, c] = await Promise.all([fetchWitnesses(), fetchCases()]);
      setWitnesses(w); setCases(c);
    } catch { showToast('error', 'Failed to load witness statements'); }
    finally { setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.case_id || !form.witness_name.trim() || !form.statement.trim() || !form.contact.trim() || !form.date) {
      showToast('error', 'All fields are required');
      return;
    }
    setSubmitting(true);
    try {
      const created = await addWitness({ ...form, case_id: Number(form.case_id) });
      setWitnesses(prev => [created, ...prev]);
      setShowModal(false);
      setForm({ case_id: '', witness_name: '', statement: '', contact: '', date: '' });
      showToast('success', `Witness statement from "${created.witness_name}" recorded`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to record witness statement');
    } finally { setSubmitting(false); }
  }

  const getCaseName = (id: number) => cases.find(c => c.case_id === id)?.case_number || `Case #${id}`;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare size={18} className="text-accent-green" />
            <h1 className="section-title">WITNESS STATEMENTS</h1>
            <span className="font-mono text-[10px] text-accent-green border border-accent-green/30 bg-green-950/20 px-2 py-0.5 ml-1">MongoDB</span>
          </div>
          <div className="flex items-center gap-2 ml-6">
            <Info size={11} className="text-text-muted" />
            <span className="font-mono text-[10px] text-text-muted">Collection: witness_statements · UUID primary key · Document store</span>
          </div>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
          <PlusCircle size={14} />
          RECORD STATEMENT
        </button>
      </div>

      <div className="bg-bg-card border border-accent-green/20 bg-green-950/5 p-3 flex items-start gap-3" style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>
        <Database size={14} className="text-accent-green mt-0.5 flex-shrink-0" />
        <p className="font-mono text-xs text-text-secondary">
          <span className="text-accent-green">MongoDB Collection: witness_statements</span> — Stored as flexible documents with auto-generated UUID. Linked to relational case data via case_id reference (cross-database join pattern).
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Statements', value: witnesses.length, color: 'text-accent-green' },
          { label: 'Unique Cases', value: new Set(witnesses.map(w => w.case_id)).size, color: 'text-accent-blue' },
          { label: 'This Month', value: witnesses.filter(w => w.date && new Date(w.date).getMonth() === new Date().getMonth()).length, color: 'text-accent-amber' },
        ].map(s => (
          <div key={s.label} className="bg-bg-card border border-border-dim p-4" style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}>
            <div className={`font-heading text-3xl ${s.color} mb-1`}>{loading ? '--' : s.value}</div>
            <div className="font-mono text-[10px] text-text-muted tracking-wider">{s.label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {loading && <div className="font-mono text-sm text-text-muted text-center py-12">QUERYING COLLECTION...</div>}

      {!loading && witnesses.length === 0 && (
        <div className="font-mono text-sm text-text-muted text-center py-12 bg-bg-card border border-border-dim" style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
          NO WITNESS STATEMENTS RECORDED
        </div>
      )}

      <div className="space-y-4">
        {witnesses.map(w => {
          const caseName = getCaseName(w.case_id);
          return (
            <div key={w.id} className="bg-bg-card border border-border-dim hover:border-border-bright transition-colors" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}>
              <div className="px-5 py-3 border-b border-border-dim flex items-center gap-3 bg-bg-card-hover flex-wrap">
                <span className="font-mono text-[10px] text-text-muted">DOC ID:</span>
                <span className="font-mono text-xs text-accent-green/70">{w.id.slice(0, 20)}...</span>
                <span className="font-mono text-xs text-accent-amber border border-accent-amber/30 px-2 py-0.5 ml-auto">{caseName}</span>
              </div>
              <div className="px-5 py-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="font-body font-semibold text-text-primary">{w.witness_name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="font-mono text-xs text-text-muted">
                        <span className="text-accent-blue/60">contact:</span> {w.contact}
                      </span>
                      <span className="font-mono text-xs text-text-muted">
                        <span className="text-accent-blue/60">date:</span> {w.date}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="border-l-2 border-accent-green/30 pl-4">
                  <p className="font-body text-sm text-text-secondary leading-relaxed italic">"{w.statement}"</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <Modal title="RECORD WITNESS STATEMENT" onClose={() => setShowModal(false)} width="max-w-2xl">
          <div className="mb-4 p-3 border border-accent-green/30 bg-green-950/10">
            <p className="font-mono text-xs text-accent-green">MongoDB INSERT: statement will be stored as a document with auto-generated UUID in witness_statements collection</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Related Case *</label>
              <select className="select-field" value={form.case_id} onChange={e => setForm(p => ({ ...p, case_id: e.target.value }))} required>
                <option value="">Select Case</option>
                {cases.map(c => <option key={c.case_id} value={c.case_id}>{c.case_number}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Witness Full Name *</label>
                <input className="input-field" value={form.witness_name} onChange={e => setForm(p => ({ ...p, witness_name: e.target.value }))} placeholder="e.g. Khalid Mahmood" required />
              </div>
              <div>
                <label className="label">Contact Number *</label>
                <input className="input-field" value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))} placeholder="e.g. +92-300-1234567" required />
              </div>
            </div>
            <div>
              <label className="label">Statement *</label>
              <textarea className="textarea-field" rows={5} value={form.statement} onChange={e => setForm(p => ({ ...p, statement: e.target.value }))} placeholder="Record the witness's statement in full..." required />
            </div>
            <div>
              <label className="label">Statement Date *</label>
              <input type="date" className="input-field" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex-1" disabled={submitting}>{submitting ? 'RECORDING...' : 'RECORD STATEMENT'}</button>
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>CANCEL</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
