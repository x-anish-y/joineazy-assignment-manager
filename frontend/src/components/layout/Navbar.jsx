import React from 'react';
import { Menu, LogOut, Users } from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import ThemeToggle from '../ui/ThemeToggle.jsx';
import Logo from '../brand/Logo.jsx';

export default function Navbar({ user, group, onMenuToggle, onLogout }) {
  return (
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

      {/* Right: Theme Toggle, User Meta & Logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Animated Sun/Moon Theme Toggle */}
        <ThemeToggle size="md" />

        {user && (
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Group badge for student */}
            {group?.name && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-hover border border-border text-xs text-text">
                <Users className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium truncate max-w-[120px]">{group.name}</span>
              </div>
            )}

            {/* User meta */}
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-semibold text-text leading-tight">{user.name}</span>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <Badge variant={user.role} size="sm">
                  {user.role}
                </Badge>
                {user.student_id && (
                  <span className="text-[11px] text-text-muted">#{user.student_id}</span>
                )}
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={onLogout}
              title="Log out"
              className="inline-flex items-center justify-center rounded-xl p-2 text-text-muted hover:bg-danger/10 hover:text-danger transition-colors focus:outline-none focus:ring-2 focus:ring-danger cursor-pointer"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
