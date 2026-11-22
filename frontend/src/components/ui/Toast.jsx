import React from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext.jsx';

export const ToastProvider = () => {
  const { isDark } = useTheme();

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3800,
        style: {
          background: isDark ? 'rgba(18, 26, 44, 0.85)' : 'rgba(255, 255, 255, 0.92)',
          color: isDark ? '#f8fafc' : '#0f172a',
          border: isDark ? '1px solid rgba(51, 65, 85, 0.5)' : '1px solid rgba(226, 232, 240, 0.8)',
          borderRadius: '1rem',
          padding: '12px 18px',
          fontSize: '0.875rem',
          boxShadow: isDark
            ? '0 16px 36px -6px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)'
            : '0 16px 36px -6px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.03)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
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
