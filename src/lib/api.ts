import { supabase } from './supabase';
import type {
  Criminal, Officer, FIRRecord, Case,
  EvidenceDoc, WitnessStatement, DashboardStats
} from '../types';

const log = (label: string, sql: string) => {
  console.log(`%c[CRMS SQL] %c${label}`, 'color: #00b4ff; font-weight: bold', 'color: #7a8fa6', '\n' + sql);
};

export async function fetchStats(): Promise<DashboardStats> {
  log('DASHBOARD STATS', 'SELECT COUNT(*) FROM criminals; SELECT COUNT(*) FROM fir_records WHERE status != \'Closed\'; SELECT COUNT(*) FROM cases WHERE status = \'Active\'; SELECT COUNT(*) FROM officers;');
  const [c, f, cs, o] = await Promise.all([
    supabase.from('criminals').select('*', { count: 'exact', head: true }),
    supabase.from('fir_records').select('*', { count: 'exact', head: true }).neq('status', 'Closed'),
    supabase.from('cases').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
    supabase.from('officers').select('*', { count: 'exact', head: true }),
  ]);
  return {
    criminals: c.count ?? 0,
    openFirs: f.count ?? 0,
    activeCases: cs.count ?? 0,
    officers: o.count ?? 0,
  };
}

export async function fetchRecentActivity() {
  log('RECENT ACTIVITY', 'SELECT * FROM criminals ORDER BY created_at DESC LIMIT 5; SELECT * FROM fir_records ORDER BY created_at DESC LIMIT 5; SELECT * FROM cases ORDER BY created_at DESC LIMIT 5;');
  const [criminals, firs, cases] = await Promise.all([
    supabase.from('criminals').select('criminal_id, name, crime_type, created_at').order('created_at', { ascending: false }).limit(3),
    supabase.from('fir_records').select('fir_id, fir_number, location, created_at').order('created_at', { ascending: false }).limit(3),
    supabase.from('cases').select('case_id, case_number, status, created_at').order('created_at', { ascending: false }).limit(3),
  ]);
  return { criminals: criminals.data ?? [], firs: firs.data ?? [], cases: cases.data ?? [] };
}

export async function fetchCriminalStatusBreakdown() {
  log('STATUS BREAKDOWN', 'SELECT status, COUNT(*) as count FROM criminals GROUP BY status;');
  const { data } = await supabase.from('criminals').select('status');
  const counts: Record<string, number> = { Wanted: 0, Arrested: 0, Released: 0, 'Under Trial': 0 };
  (data ?? []).forEach((r: { status: string }) => { counts[r.status] = (counts[r.status] ?? 0) + 1; });
  return counts;
}

export async function fetchCriminals(): Promise<Criminal[]> {
  log('SELECT CRIMINALS', 'SELECT * FROM criminals ORDER BY created_at DESC; -- INDEX: idx_criminals_name');
  const { data, error } = await supabase.from('criminals').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addCriminal(criminal: Omit<Criminal, 'criminal_id' | 'created_at'>): Promise<Criminal> {
  log('INSERT CRIMINAL', `INSERT INTO criminals (name, dob, gender, nationality, crime_type, status) VALUES ('${criminal.name}', '${criminal.dob}', '${criminal.gender}', '${criminal.nationality}', '${criminal.crime_type}', '${criminal.status}');`);
  const { data, error } = await supabase.from('criminals').insert(criminal).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCriminal(id: number): Promise<void> {
  log('DELETE CRIMINAL', `DELETE FROM criminals WHERE criminal_id = ${id};`);
  const { error } = await supabase.from('criminals').delete().eq('criminal_id', id);
  if (error) throw error;
}

export async function fetchOfficers(): Promise<Officer[]> {
  log('SELECT OFFICERS', 'SELECT * FROM officers ORDER BY created_at DESC;');
  const { data, error } = await supabase.from('officers').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addOfficer(officer: Omit<Officer, 'officer_id' | 'created_at'>): Promise<Officer> {
  log('INSERT OFFICER', `INSERT INTO officers (name, badge_number, rank, department, assigned_cases) VALUES ('${officer.name}', '${officer.badge_number}', '${officer.rank}', '${officer.department}', 0);`);
  const { data, error } = await supabase.from('officers').insert(officer).select().single();
  if (error) throw error;
  return data;
}

export async function fetchFIRs(): Promise<FIRRecord[]> {
  log('SELECT FIR RECORDS', 'SELECT f.*, c.name as criminal_name, o.name as officer_name FROM fir_records f LEFT JOIN criminals c ON f.criminal_id = c.criminal_id LEFT JOIN officers o ON f.officer_id = o.officer_id; -- INDEX: idx_fir_number');
  const { data, error } = await supabase
    .from('fir_records')
    .select('*, criminals(name, crime_type), officers(name, badge_number)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addFIR(fir: Omit<FIRRecord, 'fir_id' | 'created_at' | 'criminals' | 'officers'>): Promise<FIRRecord> {
  log('INSERT FIR', `INSERT INTO fir_records (fir_number, date_filed, location, description, criminal_id, officer_id, status) VALUES ('${fir.fir_number}', '${fir.date_filed}', '${fir.location}', '${fir.description}', ${fir.criminal_id}, ${fir.officer_id}, '${fir.status}');`);
  const { data, error } = await supabase.from('fir_records').insert(fir).select().single();
  if (error) throw error;
  return data;
}

export async function fetchCases(): Promise<Case[]> {
  log('SELECT CASES', 'SELECT cs.*, f.fir_number, o.name as officer_name FROM cases cs LEFT JOIN fir_records f ON cs.fir_id = f.fir_id LEFT JOIN officers o ON cs.officer_id = o.officer_id ORDER BY created_at DESC;');
  const { data, error } = await supabase
    .from('cases')
    .select('*, fir_records(fir_number), officers(name, badge_number)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addCase(caseData: Omit<Case, 'case_id' | 'created_at' | 'fir_records' | 'officers'>): Promise<Case> {
  log('TRANSACTION: INSERT CASE + UPDATE OFFICER',
    `BEGIN;\n  INSERT INTO cases (case_number, fir_id, officer_id, start_date, court_date, verdict, status)\n  VALUES ('${caseData.case_number}', ${caseData.fir_id}, ${caseData.officer_id}, '${caseData.start_date}', '${caseData.court_date}', '${caseData.verdict}', '${caseData.status}');\n  UPDATE officers SET assigned_cases = assigned_cases + 1 WHERE officer_id = ${caseData.officer_id};\nCOMMIT;`
  );
  const { data, error } = await supabase.from('cases').insert(caseData).select().single();
  if (error) throw error;
  if (caseData.officer_id) {
    await supabase.rpc('increment_officer_cases', { oid: caseData.officer_id }).then(() => {
      supabase.from('officers').select('assigned_cases').eq('officer_id', caseData.officer_id).single().then(({ data: od }) => {
        if (od) {
          supabase.from('officers').update({ assigned_cases: (od.assigned_cases ?? 0) + 1 }).eq('officer_id', caseData.officer_id);
        }
      });
    }).catch(() => {
      supabase.from('officers').select('assigned_cases').eq('officer_id', caseData.officer_id!).single().then(({ data: od }) => {
        if (od) {
          supabase.from('officers').update({ assigned_cases: (od.assigned_cases ?? 0) + 1 }).eq('officer_id', caseData.officer_id!);
        }
      });
    });
  }
  return data;
}

export async function fetchEvidence(): Promise<EvidenceDoc[]> {
  log('SELECT EVIDENCE [MongoDB Collection: evidence_docs]', 'db.evidence_docs.find({}).sort({ created_at: -1 })');
  const { data, error } = await supabase.from('evidence_docs').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addEvidence(ev: Omit<EvidenceDoc, 'id' | 'created_at'>): Promise<EvidenceDoc> {
  log('INSERT EVIDENCE [MongoDB Collection: evidence_docs]', `db.evidence_docs.insertOne({ case_id: ${ev.case_id}, type: '${ev.type}', description: '${ev.description}', submitted_by: '${ev.submitted_by}', date: '${ev.date}' })`);
  const { data, error } = await supabase.from('evidence_docs').insert(ev).select().single();
  if (error) throw error;
  return data;
}

export async function fetchWitnesses(): Promise<WitnessStatement[]> {
  log('SELECT WITNESSES [MongoDB Collection: witness_statements]', 'db.witness_statements.find({}).sort({ created_at: -1 })');
  const { data, error } = await supabase.from('witness_statements').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addWitness(w: Omit<WitnessStatement, 'id' | 'created_at'>): Promise<WitnessStatement> {
  log('INSERT WITNESS [MongoDB Collection: witness_statements]', `db.witness_statements.insertOne({ case_id: ${w.case_id}, witness_name: '${w.witness_name}', statement: '...', contact: '${w.contact}', date: '${w.date}' })`);
  const { data, error } = await supabase.from('witness_statements').insert(w).select().single();
  if (error) throw error;
  return data;
}
