import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  PlusCircle,
  X,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';

export default function Sidebar({ user, isOpen, onClose }) {
  const isAdmin = user?.role === 'admin';

  const studentLinks = [
    { name: 'Dashboard', to: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Assignments', to: '/student/assignments', icon: FileText },
    { name: 'My Group', to: '/student/group', icon: Users },
  ];

  const adminLinks = [
    { name: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Assignments', to: '/admin/assignments', icon: FileText },
    { name: 'New Assignment', to: '/admin/assignments/new', icon: PlusCircle },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    return (
      <NavLink
        to={item.to}
        onClick={onClose}
        className={({ isActive }) =>
          `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            isActive
              ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <Icon
              className={`h-4.5 w-4.5 transition-colors ${
                isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
              }`}
            />
            <span>{item.name}</span>
          </>
        )}
      </NavLink>
    );
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col justify-between py-5 px-4">
      <div className="space-y-6">
        {/* Role identifier badge */}
        <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
          {isAdmin ? (
            <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
              <ShieldCheck className="h-4 w-4" />
            </div>
          ) : (
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <GraduationCap className="h-4 w-4" />
            </div>
          )}
          <div>
            <p className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              {isAdmin ? 'Professor Portal' : 'Student Portal'}
            </p>
            <p className="text-[11px] text-slate-400 truncate max-w-[140px]">{user?.email}</p>
          </div>
        </div>

        {/* Navigation list */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Menu
          </p>
          {links.map((item) => (
            <NavItem key={item.to} item={item} />
          ))}
        </div>
      </div>

      {/* Sidebar Footer info */}
      <div className="px-3 py-3 rounded-xl bg-slate-50/80 border border-slate-100 text-[11px] text-slate-400">
        <p className="font-medium text-slate-600">JoinEazy Manager</p>
        <p className="mt-0.5">Role-based submissions</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Mobile Off-canvas Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
              J
            </div>
            <span className="font-bold text-slate-900">JoinEazy</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="h-[calc(100%-4rem)] overflow-y-auto">
          <SidebarContent />
        </div>
      </div>

      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 lg:border-r lg:border-slate-200 lg:bg-white min-h-[calc(100vh-4rem)]">
        <SidebarContent />
      </aside>
    </>
  );
}
