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
        duration: 3000,
        style: {
          borderRadius: '10px',
          fontFamily: 'Inter, sans-serif',
          boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
          background: 'white',
          color: 'black',
          padding: '0',
          minWidth: 'unset',
        },
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <div
              className="flex items-center gap-2 px-4 py-3"
              style={{
                background: 'white',
                borderRadius: 10,
                fontWeight: 500,
                fontSize: 16,
                color: 'black',
                boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
              }}
            >
              {t.type === 'success' ? (
                <CheckCircle className="text-green-500 w-5 h-5" />
              ) : t.type === 'error' ? (
                <XCircle className="text-red-500 w-5 h-5" />
              ) : (
                icon
              )}
              <span>{message}</span>
            </div>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
} 