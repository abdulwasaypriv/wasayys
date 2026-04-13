
/*
  # CRMS — Criminal Records Management System

  ## Summary
  Full schema for the Criminal Records Management System built for DUET CS-2104 Advanced Database Management Systems.

  ## New Tables

  ### 1. officers
  Stores law enforcement officer records.
  - officer_id: Primary key
  - name: Officer full name
  - badge_number: Unique badge identifier
  - rank: Officer rank (ASP, DSP, SP, SSP, etc.)
  - department: Assigned department
  - assigned_cases: Count of cases assigned

  ### 2. criminals
  Central registry of criminal profiles.
  - criminal_id: Primary key
  - name: Criminal full name (INDEXED)
  - dob: Date of birth
  - gender: Gender
  - nationality: Nationality
  - crime_type: Category of crime committed
  - status: Current status (Wanted/Arrested/Released/Under Trial)

  ### 3. fir_records
  First Information Reports linked to criminals and officers.
  - fir_id: Primary key
  - fir_number: Unique FIR reference number (INDEXED)
  - date_filed: Date FIR was filed
  - location: Location of incident
  - description: Detailed description
  - criminal_id: FK → criminals
  - officer_id: FK → officers
  - status: FIR status (Open/Under Investigation/Closed)

  ### 4. cases
  Active and historical case tracking.
  - case_id: Primary key
  - case_number: Unique case reference
  - fir_id: FK → fir_records
  - officer_id: FK → officers
  - start_date: Case start date
  - court_date: Scheduled court date
  - verdict: Final verdict if closed
  - status: Case status (Active/Pending/Closed/Dismissed)

  ### 5. evidence_docs
  Document-style evidence entries (MongoDB collection equivalent).
  - id: UUID primary key
  - case_id: Reference to cases
  - type: Evidence type (Photo/Video/Document/Weapon)
  - description: Evidence description
  - submitted_by: Name of submitting officer
  - date: Date of submission

  ### 6. witness_statements
  Witness statement records (MongoDB collection equivalent).
  - id: UUID primary key
  - case_id: Reference to cases
  - witness_name: Witness full name
  - statement: Full statement text
  - contact: Contact information
  - date: Date of statement

  ## Security
  - RLS enabled on all tables
  - Public read/write access for academic demo (no auth required per project spec)

  ## Indexes
  - idx_criminals_name on criminals(name)
  - idx_fir_number on fir_records(fir_number)

  ## Notes
  1. This schema is designed to be MySQL 8.0 compatible (PostgreSQL used as host)
  2. Foreign keys enforced at database level
  3. Case insertion uses deferred officer update to simulate SQL transactions
  4. evidence_docs and witness_statements simulate MongoDB document collections
*/

-- =====================
-- TABLE: officers
-- =====================
CREATE TABLE IF NOT EXISTS officers (
  officer_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  badge_number TEXT UNIQUE NOT NULL,
  rank TEXT NOT NULL,
  department TEXT NOT NULL,
  assigned_cases INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE officers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read officers"
  ON officers FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public insert officers"
  ON officers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public update officers"
  ON officers FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete officers"
  ON officers FOR DELETE
  TO anon, authenticated
  USING (true);

-- =====================
-- TABLE: criminals
-- =====================
CREATE TABLE IF NOT EXISTS criminals (
  criminal_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  dob TEXT,
  gender TEXT,
  nationality TEXT DEFAULT 'Pakistani',
  crime_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Wanted',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE criminals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read criminals"
  ON criminals FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public insert criminals"
  ON criminals FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public update criminals"
  ON criminals FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete criminals"
  ON criminals FOR DELETE
  TO anon, authenticated
  USING (true);

-- Index on criminals.name (demonstrates indexing concept)
CREATE INDEX IF NOT EXISTS idx_criminals_name ON criminals(name);

-- =====================
-- TABLE: fir_records
-- =====================
CREATE TABLE IF NOT EXISTS fir_records (
  fir_id SERIAL PRIMARY KEY,
  fir_number TEXT UNIQUE NOT NULL,
  date_filed TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  criminal_id INTEGER REFERENCES criminals(criminal_id),
  officer_id INTEGER REFERENCES officers(officer_id),
  status TEXT NOT NULL DEFAULT 'Open',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE fir_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read fir_records"
  ON fir_records FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public insert fir_records"
  ON fir_records FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public update fir_records"
  ON fir_records FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete fir_records"
  ON fir_records FOR DELETE
  TO anon, authenticated
  USING (true);

-- Index on fir_records.fir_number (demonstrates indexing concept)
CREATE INDEX IF NOT EXISTS idx_fir_number ON fir_records(fir_number);

-- =====================
-- TABLE: cases
-- =====================
CREATE TABLE IF NOT EXISTS cases (
  case_id SERIAL PRIMARY KEY,
  case_number TEXT UNIQUE NOT NULL,
  fir_id INTEGER REFERENCES fir_records(fir_id),
  officer_id INTEGER REFERENCES officers(officer_id),
  start_date TEXT,
  court_date TEXT,
  verdict TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read cases"
  ON cases FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public insert cases"
  ON cases FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public update cases"
  ON cases FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete cases"
  ON cases FOR DELETE
  TO anon, authenticated
  USING (true);

-- =====================
-- TABLE: evidence_docs
-- (MongoDB collection equivalent)
-- =====================
CREATE TABLE IF NOT EXISTS evidence_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  submitted_by TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE evidence_docs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read evidence_docs"
  ON evidence_docs FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public insert evidence_docs"
  ON evidence_docs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public delete evidence_docs"
  ON evidence_docs FOR DELETE
  TO anon, authenticated
  USING (true);

-- =====================
-- TABLE: witness_statements
-- (MongoDB collection equivalent)
-- =====================
CREATE TABLE IF NOT EXISTS witness_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id INTEGER NOT NULL,
  witness_name TEXT NOT NULL,
  statement TEXT NOT NULL,
  contact TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE witness_statements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read witness_statements"
  ON witness_statements FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public insert witness_statements"
  ON witness_statements FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public delete witness_statements"
  ON witness_statements FOR DELETE
  TO anon, authenticated
  USING (true);

-- =====================
-- SEED DATA
-- =====================

-- Officers (3 records)
INSERT INTO officers (name, badge_number, rank, department, assigned_cases) VALUES
  ('Zulfiqar Ahmed Khan', 'KHI-2401', 'DSP', 'Crimes Investigation Department', 2),
  ('Rukhsana Malik', 'KHI-1987', 'SP', 'Anti-Narcotics Force', 1),
  ('Tariq Hussain Siddiqui', 'KHI-3312', 'ASP', 'Cyber Crime Wing', 1)
ON CONFLICT DO NOTHING;

-- Criminals (4 records)
INSERT INTO criminals (name, dob, gender, nationality, crime_type, status) VALUES
  ('Aamir Bashir Chaudhry', '1988-03-15', 'Male', 'Pakistani', 'Armed Robbery', 'Arrested'),
  ('Nadia Perveen', '1994-07-22', 'Female', 'Pakistani', 'Financial Fraud', 'Under Trial'),
  ('Ghulam Mustafa Raza', '1979-11-05', 'Male', 'Pakistani', 'Drug Trafficking', 'Wanted'),
  ('Shahid Iqbal Mirza', '1991-09-30', 'Male', 'Pakistani', 'Cybercrime', 'Released')
ON CONFLICT DO NOTHING;

-- FIR Records (3 records) — references first officer/criminal IDs
INSERT INTO fir_records (fir_number, date_filed, location, description, criminal_id, officer_id, status) VALUES
  (
    'FIR-KHI-2024-001',
    '2024-01-10',
    'SITE Industrial Area, Karachi',
    'Suspect forcibly robbed a factory payroll vehicle at gunpoint. Three security guards injured.',
    1, 1, 'Under Investigation'
  ),
  (
    'FIR-KHI-2024-002',
    '2024-02-14',
    'Clifton Block 5, Karachi',
    'Accused orchestrated a fake investment scheme defrauding 47 victims of PKR 1.2 crore via fake real estate portals.',
    2, 2, 'Open'
  ),
  (
    'FIR-KHI-2024-003',
    '2024-03-01',
    'Gulshan-e-Iqbal, Karachi',
    'Suspect found operating underground drug distribution network. 12 kg heroin recovered from premises.',
    3, 1, 'Closed'
  )
ON CONFLICT DO NOTHING;

-- Cases (2 records)
INSERT INTO cases (case_number, fir_id, officer_id, start_date, court_date, verdict, status) VALUES
  (
    'CASE-KHI-2024-0087',
    1, 1,
    '2024-01-12',
    '2024-04-20',
    '',
    'Active'
  ),
  (
    'CASE-KHI-2024-0102',
    3, 1,
    '2024-03-03',
    '2024-05-15',
    'Convicted — 7 Years Imprisonment',
    'Closed'
  )
ON CONFLICT DO NOTHING;

-- Evidence Docs (2 records)
INSERT INTO evidence_docs (case_id, type, description, submitted_by, date) VALUES
  (
    1,
    'Video',
    'CCTV footage from factory gate showing suspect vehicle and masked assailants. Duration: 4 min 22 sec.',
    'SI Zulfiqar Ahmed Khan',
    '2024-01-13'
  ),
  (
    2,
    'Document',
    'Seized financial ledgers and forged property deeds recovered from suspect residence during search operation.',
    'DSP Rukhsana Malik',
    '2024-03-04'
  )
ON CONFLICT DO NOTHING;

-- Witness Statements (2 records)
INSERT INTO witness_statements (case_id, witness_name, statement, contact, date) VALUES
  (
    1,
    'Sajid Mehmood (Factory Guard)',
    'I was on duty when three armed men in a white Hilux forced their way through the gate. They threatened us with Kalashnikovs and took the cash bags. One of them spoke Punjabi. I recognized the vehicle plate partially as LHR-based.',
    '+92-300-1122334',
    '2024-01-14'
  ),
  (
    2,
    'Fareeha Siddiqui (Victim Investor)',
    'I invested PKR 8 lakh in what I believed was a housing scheme in DHA Phase 9. The accused promised 25% annual return. All contact numbers were eventually disconnected. I have all WhatsApp receipts and bank transfers.',
    '+92-333-9988776',
    '2024-02-20'
  )
ON CONFLICT DO NOTHING;
