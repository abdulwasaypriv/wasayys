import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import type { ToastType } from '../types';

const icons: Record<ToastType, JSX.Element> = {
  success: <CheckCircle size={18} className="text-success-green" />,
  error: <XCircle size={18} className="text-danger-red" />,
  info: <Info size={18} className="text-accent-blue" />,
};

const styles: Record<ToastType, { bg: string; border: string }> = {
  success: { bg: 'bg-green-50', border: 'border-success-green/30' },
  error: { bg: 'bg-red-50', border: 'border-danger-red/30' },
  info: { bg: 'bg-blue-50', border: 'border-accent-blue/30' },
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-start gap-3 p-4 ${styles[t.type].bg} border ${styles[t.type].border} rounded-lg shadow-medium animate-slide-in-right pointer-events-auto`}
        >
          <span className="mt-0.5 flex-shrink-0">{icons[t.type]}</span>
          <span className="font-body text-sm text-text-dark flex-1">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="text-text-muted hover:text-text-dark flex-shrink-0 transition-colors">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
