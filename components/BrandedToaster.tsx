"use client";
import { Toaster, ToastBar, toast } from 'react-hot-toast';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import React from 'react';

const toastTypeStyles = {
  success: {
    bg: 'bg-green-600',
    icon: <CheckCircle className="text-white w-5 h-5" />,
  },
  error: {
    bg: 'bg-red-600',
    icon: <XCircle className="text-white w-5 h-5" />,
  },
  warning: {
    bg: 'bg-yellow-500',
    icon: <AlertTriangle className="text-white w-5 h-5" />,
  },
  loading: {
    bg: 'bg-blue-500',
    icon: <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>,
  },
  blank: {
    bg: 'bg-slate-800',
    icon: null,
  },
  
};

export default function BrandedToaster() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: '10px',
          fontFamily: 'Inter, sans-serif',
          boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
        },
      }}
    >
      {(t) => {
        // Map 'custom' to 'warning' if you use toast.custom for warnings
        const type = t.type === 'custom' ? 'warning' : t.type === 'blank' ? 'blank' : t.type;
        const { bg, icon } = toastTypeStyles[type] || toastTypeStyles.blank;
        return (
          <ToastBar toast={t}>
            {({ message }) => (
              <div
                className={`flex items-center gap-3 px-5 py-3 min-w-[220px] text-white ${bg} shadow-lg`}
                style={{
                  borderRadius: 10,
                  fontWeight: 500,
                  fontSize: 16,
                }}
              >
                {icon}
                <span>{message}</span>
                {t.type !== 'loading' && (
                  <button
                    className="ml-auto text-white/70 hover:text-white"
                    onClick={() => toast.dismiss(t.id)}
                  >
                    ×
                  </button>
                )}
              </div>
            )}
          </ToastBar>
        );
      }}
    </Toaster>
  );
} 