import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import ToastProvider from './components/ui/Toast.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import RoleRoute from './routes/RoleRoute.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import NotFound from './pages/NotFound.jsx';

import StudentDashboard from './pages/student/Dashboard.jsx';
import StudentMyGroup from './pages/student/MyGroup.jsx';
import StudentAssignmentList from './pages/student/AssignmentList.jsx';
import StudentAssignmentDetail from './pages/student/AssignmentDetail.jsx';

import AdminDashboard from './pages/admin/Dashboard.jsx';
import AdminAssignmentList from './pages/admin/AssignmentList.jsx';
import AssignmentForm from './pages/admin/AssignmentForm.jsx';
import AdminAssignmentDetail from './pages/admin/AssignmentDetail.jsx';

// Root redirector based on auth and role
function RootRedirect() {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        <AuthProvider>
          <ToastProvider />
          <Routes>
            {/* Public auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<RootRedirect />} />

              {/* Student routes */}
              <Route element={<RoleRoute allowedRoles={['student']} />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
                  <Route path="/student/dashboard" element={<StudentDashboard />} />
                  <Route path="/student/assignments" element={<StudentAssignmentList />} />
                  <Route path="/student/assignments/:id" element={<StudentAssignmentDetail />} />
                  <Route path="/student/group" element={<StudentMyGroup />} />
                </Route>
              </Route>

              {/* Admin routes */}
              <Route element={<RoleRoute allowedRoles={['admin']} />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/assignments" element={<AdminAssignmentList />} />
                  <Route path="/admin/assignments/new" element={<AssignmentForm />} />
                  <Route path="/admin/assignments/:id" element={<AdminAssignmentDetail />} />
                  <Route path="/admin/assignments/:id/edit" element={<AssignmentForm />} />
                </Route>
              </Route>
            </Route>

            {/* 404 catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}
