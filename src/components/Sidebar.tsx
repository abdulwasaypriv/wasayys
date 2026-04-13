import { useState } from 'react';
import { Menu, X, LayoutDashboard, Users, FileText, Briefcase, Shield, Image as ImageIcon, MessageSquare } from 'lucide-react';

export type Page = 'dashboard' | 'criminals' | 'fir' | 'cases' | 'officers' | 'evidence' | 'witnesses';

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

const menuItems: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { page: 'criminals', label: 'Criminals', icon: <Users size={18} /> },
  { page: 'fir', label: 'FIR Records', icon: <FileText size={18} /> },
  { page: 'cases', label: 'Cases', icon: <Briefcase size={18} /> },
  { page: 'officers', label: 'Officers', icon: <Shield size={18} /> },
  { page: 'evidence', label: 'Evidence', icon: <ImageIcon size={18} /> },
  { page: 'witnesses', label: 'Witnesses', icon: <MessageSquare size={18} /> },
];

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 hover:bg-bg-secondary rounded-lg transition-colors"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={24} className="text-text-dark" /> : <Menu size={24} className="text-text-dark" />}
      </button>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/30 z-40" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`fixed md:static left-0 top-0 h-screen w-64 bg-bg-dark text-white z-40 transform transition-transform duration-300 md:translate-x-0 flex flex-col ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-bg-secondary/50">
          <h1 className="font-heading text-2xl font-bold text-accent-blue">CRMS</h1>
          <p className="font-body text-xs text-gray-400 mt-1">Crime Records System</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map(item => (
            <button
              key={item.page}
              onClick={() => { onNavigate(item.page); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-body text-sm font-medium transition-all duration-200 ${
                activePage === item.page
                  ? 'bg-accent-blue text-white shadow-blue-glow-sm'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="opacity-80">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <p className="font-body text-xs text-gray-400">DUET — Batch 24F</p>
          <p className="font-body text-xs text-gray-500 mt-1">CS-2104 Database Course</p>
        </div>
      </aside>

      <div className="md:hidden h-16" />
    </>
  );
}
