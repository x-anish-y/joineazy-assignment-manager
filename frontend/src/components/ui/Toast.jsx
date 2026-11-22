import React from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext.jsx';

export const ToastProvider = () => {
  const { isDark } = useTheme();

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          background: isDark ? '#121a2c' : '#ffffff',
          color: isDark ? '#f8fafc' : '#0f172a',
          border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
          borderRadius: '0.875rem',
          padding: '10px 16px',
          fontSize: '0.875rem',
          boxShadow: isDark
            ? '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)'
            : '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
          backdropFilter: 'blur(8px)',
        },
        success: {
          iconTheme: {
            primary: isDark ? '#34d399' : '#10b981',
            secondary: isDark ? '#121a2c' : '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: isDark ? '#f87171' : '#ef4444',
            secondary: isDark ? '#121a2c' : '#ffffff',
          },
        },
      }}
    />
  );
};

export { toast };
export default ToastProvider;
