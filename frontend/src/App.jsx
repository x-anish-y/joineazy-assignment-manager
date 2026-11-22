import React, { useState } from 'react';
import Navbar from './components/layout/Navbar.jsx';
import Sidebar from './components/layout/Sidebar.jsx';
import PageHeader from './components/layout/PageHeader.jsx';
import Card from './components/ui/Card.jsx';
import Button from './components/ui/Button.jsx';
import Badge from './components/ui/Badge.jsx';
import ProgressBar from './components/ui/ProgressBar.jsx';
import ToastProvider from './components/ui/Toast.jsx';

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mock user for UI preview in Step 1
  const mockUser = {
    name: 'Student Demo',
    email: 'stu1@joineazy.test',
    student_id: 'STU001',
    role: 'student',
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <ToastProvider />
      <Navbar
        user={mockUser}
        group={{ name: 'Alpha Team' }}
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        onLogout={() => console.log('Logout')}
      />

      <div className="flex flex-1">
        <Sidebar
          user={mockUser}
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <PageHeader
            title="Design System & UI Kit"
            subtitle="Explore components and responsive layout"
            actions={<Button>Primary Action</Button>}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card title="Status Badges" subtitle="Standard assignment states">
              <div className="flex flex-wrap gap-2">
                <Badge variant="pending">Pending</Badge>
                <Badge variant="submitted">Submitted</Badge>
                <Badge variant="overdue">Overdue</Badge>
                <Badge variant="leader">Leader</Badge>
                <Badge variant="member">Member</Badge>
              </div>
            </Card>

            <Card title="Progress Bars" subtitle="Custom height and colors">
              <div className="space-y-4">
                <ProgressBar value={65} showLabel colorScheme="indigo" />
                <ProgressBar value={100} showLabel colorScheme="emerald" />
              </div>
            </Card>

            <Card title="Buttons" subtitle="Variants and states">
              <div className="flex flex-wrap gap-2">
                <Button size="sm">Primary</Button>
                <Button size="sm" variant="secondary">Secondary</Button>
                <Button size="sm" variant="danger">Danger</Button>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
