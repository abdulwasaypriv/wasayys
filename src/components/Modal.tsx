import { useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: string;
}

export function Modal({ title, onClose, children, width = 'max-w-xl' }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className={`relative w-full ${width} bg-bg-card border border-border-light rounded-2xl shadow-lg animate-fade-in`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
          <h2 className="font-heading text-2xl font-bold text-accent-blue">{title}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-danger-red transition-colors p-1">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          {children}
        </div>
      </div>
    </div>
  );
}
