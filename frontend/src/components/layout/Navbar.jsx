import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { Menu, LogOut, Users, ChevronDown, User, ShieldCheck, GraduationCap } from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import ThemeToggle from '../ui/ThemeToggle.jsx';
import Logo from '../brand/Logo.jsx';

export default function Navbar({ user, group, onMenuToggle, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { scrollYProgress } = useScroll();

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [dropdownOpen]);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Subtle Scroll Progress Bar at the top of the viewport */}
      <motion.div
        style={{ scaleX: scrollYProgress, transformOrigin: '0%' }}
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-primary to-cyan-400 z-50 pointer-events-none"
      />

      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-surface/85 px-4 sm:px-6 backdrop-blur-md transition-colors">
        {/* Left: Mobile Menu Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className="inline-flex items-center justify-center rounded-xl p-2 text-text-muted hover:bg-surface-hover hover:text-text focus:outline-none focus:ring-2 focus:ring-primary lg:hidden cursor-pointer transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Logo variant="full" size={36} />
        </div>

        {/* Right: Theme Toggle, User Meta & Animated User Dropdown */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Animated Sun/Moon Theme Toggle */}
          <ThemeToggle size="md" />

          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-surface-hover border border-transparent hover:border-border transition-all cursor-pointer"
              >
                {/* Avatar with Initials */}
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-cyan-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {getInitials(user.name)}
                </div>

                {/* User Info (Desktop) */}
                <div className="hidden md:flex flex-col text-left mr-1">
                  <span className="text-xs font-semibold text-text leading-tight">{user.name}</span>
                  <span className="text-[10px] text-text-muted capitalize flex items-center gap-1">
                    {user.role === 'admin' ? 'Professor' : 'Student'}
                    {group?.name && ` • ${group.name}`}
                  </span>
                </div>

                <ChevronDown
                  className={`h-4 w-4 text-text-muted transition-transform duration-200 ${
                    dropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Animated Glass Dropdown Menu */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-surface/95 backdrop-blur-xl border border-border shadow-2xl p-2 z-50 space-y-1 text-xs"
                  >
                    {/* User Profile Header */}
                    <div className="p-3 bg-surface-hover/80 rounded-xl border border-border-subtle mb-1">
                      <p className="font-bold text-text text-sm truncate">{user.name}</p>
                      <p className="text-text-muted text-[11px] truncate mt-0.5">{user.email}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <Badge variant={user.role} size="sm">
                          {user.role === 'admin' ? 'Professor' : 'Student'}
                        </Badge>
                        {user.student_id && (
                          <span className="text-[10px] text-text-muted bg-surface border border-border px-1.5 py-0.5 rounded-md font-mono">
                            #{user.student_id}
                          </span>
                        )}
                      </div>
                    </div>

                    {group?.name && (
                      <div className="px-3 py-2 rounded-xl flex items-center justify-between text-text-muted bg-surface-hover/50">
                        <span className="flex items-center gap-1.5 text-[11px]">
                          <Users className="h-3.5 w-3.5 text-primary" />
                          Group:
                        </span>
                        <span className="font-semibold text-text truncate max-w-[120px]">
                          {group.name}
                        </span>
                      </div>
                    )}

                    <div className="pt-1 border-t border-border-subtle">
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          onLogout?.();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-danger hover:bg-danger/10 transition-colors cursor-pointer font-medium"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
