export interface Officer {
  officer_id: number;
  name: string;
  badge_number: string;
  rank: string;
  department: string;
  assigned_cases: number;
  created_at?: string;
}

export interface Criminal {
  criminal_id: number;
  name: string;
  dob: string;
  gender: string;
  nationality: string;
  crime_type: string;
  status: 'Wanted' | 'Arrested' | 'Released' | 'Under Trial';
  created_at?: string;
}

export interface FIRRecord {
  fir_id: number;
  fir_number: string;
  date_filed: string;
  location: string;
  description: string;
  criminal_id: number | null;
  officer_id: number | null;
  status: 'Open' | 'Under Investigation' | 'Closed';
  created_at?: string;
  criminals?: { name: string; crime_type: string } | null;
  officers?: { name: string; badge_number: string } | null;
}

export interface Case {
  case_id: number;
  case_number: string;
  fir_id: number | null;
  officer_id: number | null;
  start_date: string;
  court_date: string;
  verdict: string;
  status: 'Active' | 'Pending' | 'Closed' | 'Dismissed';
  created_at?: string;
  fir_records?: { fir_number: string } | null;
  officers?: { name: string; badge_number: string } | null;
}

export interface EvidenceDoc {
  id: string;
  case_id: number;
  type: 'Photo' | 'Video' | 'Document' | 'Weapon';
  description: string;
  submitted_by: string;
  date: string;
  created_at?: string;
}

export interface WitnessStatement {
  id: string;
  case_id: number;
  witness_name: string;
  statement: string;
  contact: string;
  date: string;
  created_at?: string;
}

export interface DashboardStats {
  criminals: number;
  openFirs: number;
  activeCases: number;
  officers: number;
}

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}
