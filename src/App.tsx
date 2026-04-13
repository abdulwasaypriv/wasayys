import { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Criminals } from './pages/Criminals';
import { FIRRecords } from './pages/FIRRecords';
import { Cases } from './pages/Cases';
import { Officers } from './pages/Officers';
import { Evidence } from './pages/Evidence';
import { Witnesses } from './pages/Witnesses';
import type { Page } from './components/Sidebar';

function AppContent() {
  const [page, setPage] = useState<Page>('dashboard');

  const pages: Record<Page, JSX.Element> = {
    dashboard: <Dashboard />,
    criminals: <Criminals />,
    fir: <FIRRecords />,
    cases: <Cases />,
    officers: <Officers />,
    evidence: <Evidence />,
    witnesses: <Witnesses />,
  };

  return (
    <Layout activePage={page} onNavigate={setPage}>
      {pages[page]}
    </Layout>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
