import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Users,
  PlusCircle,
  X,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';
import Logo from '../brand/Logo.jsx';
import AnimatedIcon from '../ui/AnimatedIcon.jsx';

export default function Sidebar({ user, isOpen, onClose }) {
  const isAdmin = user?.role === 'admin';
  const location = useLocation();

  // Desktop collapsible state stored in localStorage
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('assignhub_sidebar_collapsed') === 'true';
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('assignhub_sidebar_collapsed', String(next));
      return next;
    });
  };

  const studentLinks = [
    { name: 'Dashboard', to: '/student/dashboard', icon: LayoutDashboard, type: 'chart' },
    { name: 'Assignments', to: '/student/assignments', icon: FileText, type: 'link' },
    { name: 'My Group', to: '/student/group', icon: Users, type: 'bell' },
  ];

  const adminLinks = [
    { name: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard, type: 'chart' },
    { name: 'Assignments', to: '/admin/assignments', icon: FileText, type: 'link' },
    { name: 'New Assignment', to: '/admin/assignments/new', icon: PlusCircle, type: 'plus' },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  const NavItem = ({ item, collapsed = false }) => {
    const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);

    return (
      <NavLink
        to={item.to}
        onClick={onClose}
        className={`relative group flex items-center ${
          collapsed ? 'justify-center px-2 py-3' : 'gap-3 px-3.5 py-2.5'
        } rounded-xl text-sm font-medium transition-colors select-none`}
      >
        {/* Sliding Highlight Pill via layoutId */}
        {isActive && (
          <motion.div
            layoutId="sidebarActivePill"
            className="absolute inset-0 bg-primary-light dark:bg-primary/15 border border-primary/20 rounded-xl"
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          />
        )}

        <div className="relative z-10 flex items-center gap-3">
          <AnimatedIcon
            icon={item.icon}
            type={item.type}
            size={19}
            isActive={isActive}
            tooltip={collapsed ? item.name : ''}
            className={`transition-colors ${
              isActive
                ? 'text-primary dark:text-indigo-400'
                : 'text-text-muted group-hover:text-text'
            }`}
          />
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              className={`truncate ${
                isActive
                  ? 'text-primary dark:text-indigo-300 font-semibold'
                  : 'text-text-muted group-hover:text-text'
              }`}
            >
              {item.name}
            </motion.span>
          )}
        </div>
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-slate-950/60 dark:bg-black/75 backdrop-blur-xs lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Mobile Off-canvas Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-border transform transition-transform duration-250 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          <Logo variant="full" size={32} />
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted hover:bg-surface-hover hover:text-text cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="h-[calc(100%-4rem)] overflow-y-auto py-5 px-4 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="px-3 py-2.5 rounded-xl bg-surface-hover border border-border flex items-center gap-2.5">
              {isAdmin ? (
                <div className="p-1.5 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-300">
                  <ShieldCheck className="h-4 w-4" />
                </div>
              ) : (
                <div className="p-1.5 rounded-lg bg-primary-light text-primary">
                  <GraduationCap className="h-4 w-4" />
                </div>
              )}
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-text uppercase tracking-wider">
                  {isAdmin ? 'Professor Portal' : 'Student Portal'}
                </p>
                <p className="text-[11px] text-text-muted truncate max-w-[140px]">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="px-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
                Menu
              </p>
              {links.map((item) => (
                <NavItem key={item.to} item={item} collapsed={false} />
              ))}
            </div>
          </div>

          <div className="px-3.5 py-3 rounded-xl bg-surface-hover/80 border border-border text-[11px] text-text-muted">
            <p className="font-semibold text-text">AssignHub Manager</p>
            <p className="mt-0.5">Role-based submissions</p>
          </div>
        </div>
      </div>

      {/* Desktop Collapsible Animated Sidebar */}
      <motion.aside
        animate={{ width: isCollapsed ? 76 : 256 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="hidden lg:flex lg:flex-col lg:shrink-0 lg:border-r lg:border-border lg:bg-surface/85 lg:backdrop-blur-md min-h-[calc(100vh-4rem)] relative z-20"
      >
        <div className="flex h-full flex-col justify-between py-5 px-3">
          <div className="space-y-5">
            {/* User / Portal Info */}
            {!isCollapsed ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-3 py-2.5 rounded-xl bg-surface-hover border border-border flex items-center gap-2.5"
              >
                {isAdmin ? (
                  <div className="p-1.5 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-300">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                ) : (
                  <div className="p-1.5 rounded-lg bg-primary-light text-primary">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                )}
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-text uppercase tracking-wider truncate">
                    {isAdmin ? 'Professor Portal' : 'Student Portal'}
                  </p>
                  <p className="text-[11px] text-text-muted truncate max-w-[140px]">{user?.email}</p>
                </div>
              </motion.div>
            ) : (
              <div className="flex justify-center">
                <div
                  title={isAdmin ? 'Professor Portal' : 'Student Portal'}
                  className="p-2 rounded-xl bg-surface-hover border border-border text-primary"
                >
                  {isAdmin ? <ShieldCheck className="h-4 w-4 text-purple-500" /> : <GraduationCap className="h-4 w-4" />}
                </div>
              </div>
            )}

            {/* Nav list */}
            <div className="space-y-1.5">
              {!isCollapsed && (
                <p className="px-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
                  Navigation
                </p>
              )}
              {links.map((item) => (
                <NavItem key={item.to} item={item} collapsed={isCollapsed} />
              ))}
            </div>
          </div>

          {/* Bottom collapse toggle button */}
          <div className="pt-4 border-t border-border flex flex-col gap-2">
            <button
              type="button"
              onClick={toggleCollapse}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="flex items-center justify-center p-2 rounded-xl border border-border bg-surface-hover text-text-muted hover:text-text hover:bg-surface transition-colors cursor-pointer"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <div className="flex items-center gap-2 text-xs font-medium w-full px-2">
                  <ChevronLeft className="h-4 w-4" />
                  <span>Collapse Menu</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Bottom Tab Bar for Quick Access */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface/90 backdrop-blur-md border-t border-border px-3 py-2 flex items-center justify-around">
        {links.map((item) => {
          const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors ${
                isActive ? 'text-primary' : 'text-text-muted'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </>
  );
}
