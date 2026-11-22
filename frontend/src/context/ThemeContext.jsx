import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext();

const STORAGE_KEY = 'assignhub_theme';

export function ThemeProvider({ children }) {
  // Mode can be 'light', 'dark', or 'system'
  const [mode, setModeState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    } catch (e) {}
    return 'system';
  });

  // Actual resolved theme ('light' | 'dark')
  const [resolvedTheme, setResolvedTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    const isDark = document.documentElement.classList.contains('dark');
    return isDark ? 'dark' : 'light';
  });

  // Helper to determine if system prefers dark
  const getSystemTheme = useCallback(() => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  // Apply class to <html> element
  const applyTheme = useCallback((targetTheme) => {
    const root = document.documentElement;
    if (targetTheme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    setResolvedTheme(targetTheme);
  }, []);

  // Update theme when mode changes or system changes
  useEffect(() => {
    const active = mode === 'system' ? getSystemTheme() : mode;
    applyTheme(active);

    try {
      localStorage.setItem(STORAGE_KEY, mode);
      localStorage.setItem('theme', mode);
    } catch (e) {}
  }, [mode, applyTheme, getSystemTheme]);

  // Listen to system preference changes when in 'system' mode
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (mode === 'system') {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [mode, applyTheme]);

  // Set mode directly
  const setMode = useCallback((newMode) => {
    setModeState(newMode);
  }, []);

  // Toggle between light & dark (or system), with View Transitions API circular reveal
  const toggleTheme = useCallback((event) => {
    const currentActual = resolvedTheme;
    const nextActual = currentActual === 'dark' ? 'light' : 'dark';
    const nextMode = nextActual;

    const hasViewTransition =
      typeof document !== 'undefined' &&
      'startViewTransition' in document &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!hasViewTransition) {
      setModeState(nextMode);
      return;
    }

    // Get click coordinates for circular ripple reveal
    const x = event?.clientX ?? window.innerWidth / 2;
    const y = event?.clientY ?? window.innerHeight / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      applyTheme(nextActual);
      setModeState(nextMode);
    });

    transition.ready.then(() => {
      const isExpandingDark = nextActual === 'dark';
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];

      document.documentElement.animate(
        {
          clipPath: isExpandingDark ? clipPath : [...clipPath].reverse(),
        },
        {
          duration: 400,
          easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
          pseudoElement: isExpandingDark
            ? '::view-transition-new(root)'
            : '::view-transition-old(root)',
        }
      );
    }).catch(() => {
      // Fallback if view transition fails
      applyTheme(nextActual);
      setModeState(nextMode);
    });
  }, [resolvedTheme, applyTheme]);

  return (
    <ThemeContext.Provider
      value={{
        mode,
        theme: resolvedTheme,
        isDark: resolvedTheme === 'dark',
        setMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
