import React from 'react';
import { Menu, LogOut, User as UserIcon, BookOpen, Users } from 'lucide-react';
import Badge from '../ui/Badge.jsx';

export default function Navbar({ user, group, onMenuToggle, onLogout }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile Menu Toggle & Brand */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 lg:hidden cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm font-bold text-lg">
            J
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-slate-900 text-base leading-tight">JoinEazy</span>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Assignment Manager</span>
          </div>
        </div>
      </div>

      {/* Right: User Information & Logout */}
      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-3">
            {/* Group badge for student */}
            {group?.name && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-700">
                <Users className="h-3.5 w-3.5 text-indigo-500" />
                <span className="font-medium truncate max-w-[120px]">{group.name}</span>
              </div>
            )}

            {/* User meta */}
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-800 leading-tight">{user.name}</span>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <Badge variant={user.role} size="sm">
                  {user.role}
                </Badge>
                {user.student_id && (
                  <span className="text-[11px] text-slate-400">#{user.student_id}</span>
                )}
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={onLogout}
              title="Log out"
              className="inline-flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
