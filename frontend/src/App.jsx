import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MotionConfig, AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import ToastProvider from './components/ui/Toast.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import RoleRoute from './routes/RoleRoute.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';
import BrandLoader from './components/brand/BrandLoader.jsx';
import { pageVariants } from './lib/motion.js';

// Lazy-loaded route pages for optimal Lighthouse performance & bundle splitting
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

const StudentDashboard = lazy(() => import('./pages/student/Dashboard.jsx'));
const StudentMyGroup = lazy(() => import('./pages/student/MyGroup.jsx'));
const StudentAssignmentList = lazy(() => import('./pages/student/AssignmentList.jsx'));
const StudentAssignmentDetail = lazy(() => import('./pages/student/AssignmentDetail.jsx'));

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard.jsx'));
const AdminAssignmentList = lazy(() => import('./pages/admin/AssignmentList.jsx'));
const AssignmentForm = lazy(() => import('./pages/admin/AssignmentForm.jsx'));
const AdminAssignmentDetail = lazy(() => import('./pages/admin/AssignmentDetail.jsx'));

// Page Transition Motion Wrapper
function AnimatedPage({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

// Root redirector based on auth and role
function RootRedirect() {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <Navigate
      to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
      replace
    />
  );
}

export default function App() {
  const location = useLocation();

  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        <AuthProvider>
          <ToastProvider />
          <Suspense fallback={<BrandLoader text="Loading AssignHub..." />}>
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                {/* Public auth routes */}
                <Route
                  path="/login"
                  element={
                    <AnimatedPage>
                      <Login />
                    </AnimatedPage>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <AnimatedPage>
                      <Register />
                    </AnimatedPage>
                  }
                />

                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<RootRedirect />} />

                  {/* Student routes */}
                  <Route element={<RoleRoute allowedRoles={['student']} />}>
                    <Route element={<DashboardLayout />}>
                      <Route
                        path="/student"
                        element={<Navigate to="/student/dashboard" replace />}
                      />
                      <Route
                        path="/student/dashboard"
                        element={
                          <AnimatedPage>
                            <StudentDashboard />
                          </AnimatedPage>
                        }
                      />
                      <Route
                        path="/student/assignments"
                        element={
                          <AnimatedPage>
                            <StudentAssignmentList />
                          </AnimatedPage>
                        }
                      />
                      <Route
                        path="/student/assignments/:id"
                        element={
                          <AnimatedPage>
                            <StudentAssignmentDetail />
                          </AnimatedPage>
                        }
                      />
                      <Route
                        path="/student/group"
                        element={
                          <AnimatedPage>
                            <StudentMyGroup />
                          </AnimatedPage>
                        }
                      />
                    </Route>
                  </Route>

                  {/* Admin routes */}
                  <Route element={<RoleRoute allowedRoles={['admin']} />}>
                    <Route element={<DashboardLayout />}>
                      <Route
                        path="/admin"
                        element={<Navigate to="/admin/dashboard" replace />}
                      />
                      <Route
                        path="/admin/dashboard"
                        element={
                          <AnimatedPage>
                            <AdminDashboard />
                          </AnimatedPage>
                        }
                      />
                      <Route
                        path="/admin/assignments"
                        element={
                          <AnimatedPage>
                            <AdminAssignmentList />
                          </AnimatedPage>
                        }
                      />
                      <Route
                        path="/admin/assignments/new"
                        element={
                          <AnimatedPage>
                            <AssignmentForm />
                          </AnimatedPage>
                        }
                      />
                      <Route
                        path="/admin/assignments/:id"
                        element={
                          <AnimatedPage>
                            <AdminAssignmentDetail />
                          </AnimatedPage>
                        }
                      />
                      <Route
                        path="/admin/assignments/:id/edit"
                        element={
                          <AnimatedPage>
                            <AssignmentForm />
                          </AnimatedPage>
                        }
                      />
                    </Route>
                  </Route>
                </Route>

                {/* 404 catch-all */}
                <Route
                  path="*"
                  element={
                    <AnimatedPage>
                      <NotFound />
                    </AnimatedPage>
                  }
                />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </AuthProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}
