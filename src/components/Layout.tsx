import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { ToastContainer } from './ToastContainer';
import type { Page } from './Sidebar';

interface LayoutProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  children: ReactNode;
}

export function Layout({ activePage, onNavigate, children }: LayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full flex flex-col">
          <div className="flex-1 p-6 md:p-8 pt-16 md:pt-8">
            {children}
          </div>
          <footer className="border-t border-border-light px-8 py-6 mt-auto bg-white/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-heading text-base font-bold text-text-dark">CRMS — Crime Records Management System</p>
                <p className="font-body text-xs text-text-muted mt-0.5">DUET | Batch 24F | CS-2104 Advanced Database Management Systems</p>
              </div>
              <div className="text-right">
                <p className="font-body text-xs text-text-muted">Built with Supabase · React · Three.js</p>
                <a href="#" className="font-body text-xs text-accent-blue hover:underline transition-colors">github.com/crms-duet</a>
              </div>
            </div>
          </footer>
        </div>
      </main>
      <ToastContainer />
    </div>
  );
}
