import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';
import AnimatedBackground from '../ui/AnimatedBackground.jsx';

export default function DashboardLayout() {
  const { user, group, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-bg text-text flex flex-col transition-colors">
      {/* Background Animated Aurora & Constellation with Subtle Intensity for Dashboards */}
      <AnimatedBackground intensity="subtle" />

      <Navbar
        user={user}
        group={group}
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        onLogout={logout}
      />

      <div className="flex flex-1">
        <Sidebar
          user={user}
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
