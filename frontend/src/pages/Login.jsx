import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, Sparkles, Server, AlertTriangle, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { login } from '../api/auth.js';
import { getBaseURL } from '../api/client.js';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import { toast } from '../components/ui/Toast.jsx';
import ThemeToggle from '../components/ui/ThemeToggle.jsx';
import Logo from '../components/brand/Logo.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentApiUrl, setCurrentApiUrl] = useState(getBaseURL());
  const [showConfig, setShowConfig] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');

  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === '1') {
      toast.error('Session expired. Please sign in again.');
    }
  }, [location.search]);

  const validate = () => {
    const errs = {};
    if (!email) {
      errs.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Enter a valid email address';
    }
    if (!password) {
      errs.password = 'Password is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    try {
      const res = await login({ email, password });
      if (res.success && res.data) {
        loginUser(res.data.token, res.data.user);
        toast.success(`Welcome back, ${res.data.user.name}!`);

        const role = res.data.user.role;
        const from = location.state?.from?.pathname;
        if (
          from &&
          ((role === 'admin' && from.startsWith('/admin')) ||
            (role === 'student' && from.startsWith('/student')))
        ) {
          navigate(from, { replace: true });
        } else {
          navigate(role === 'admin' ? '/admin/dashboard' : '/student/dashboard', {
            replace: true,
          });
        }
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to connect to backend server. Please verify server status.';
      setErrors({ form: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrors({});
  };

  const handleSaveApiUrl = () => {
    if (!customUrlInput.trim()) {
      localStorage.removeItem('custom_api_url');
      setCurrentApiUrl(getBaseURL());
      toast.success('Reset API URL to default');
    } else {
      localStorage.setItem('custom_api_url', customUrlInput.trim());
      setCurrentApiUrl(getBaseURL());
      toast.success('API URL updated!');
    }
    setShowConfig(false);
    setErrors({});
  };

  const isRemote = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
  const isLocalApi = currentApiUrl.includes('localhost') || currentApiUrl.includes('127.0.0.1');

  return (
    <div className="relative min-h-screen bg-bg text-text flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-primary/20">
      {/* Theme Switcher Top-Right */}
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle size="md" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center mb-3">
          <Logo variant="mark-only" size={62} animated={true} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text">
          Sign in to Assign<span className="bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">Hub</span>
        </h2>
        <p className="mt-2 text-sm text-text-muted">
          Student, Group &amp; Assignment Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-surface/85 backdrop-blur-xl py-8 px-6 shadow-xl border border-border rounded-3xl sm:px-10 transition-colors">
          {/* Cloud warning if deployed on Vercel but API points to localhost */}
          {isRemote && isLocalApi && (
            <div className="mb-5 p-4 rounded-2xl bg-warning-light border border-warning/30 text-xs text-text space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Backend Connection Needed</span>
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">
                This app is running on Vercel but is currently configured to connect to{' '}
                <code className="bg-surface border border-border font-mono px-1 py-0.5 rounded text-text">
                  {currentApiUrl}
                </code>
                , which is your local computer and cannot be reached from the internet.
              </p>
              <div className="pt-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const renderUrl = 'https://joineazy-backend-9pam.onrender.com/api';
                    localStorage.setItem('custom_api_url', renderUrl);
                    setCurrentApiUrl(renderUrl);
                    toast.success('Connected to Live Render Backend!');
                    setErrors({});
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover shadow-xs cursor-pointer transition-colors"
                >
                  <Check className="h-3.5 w-3.5" />
                  Connect to Live Backend (Render)
                </button>
              </div>
            </div>
          )}

          {errors.form && (
            <div className="mb-5 p-3.5 rounded-2xl bg-danger-light border border-danger/30 text-xs text-danger font-medium leading-relaxed">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Email Address"
              type="email"
              required
              icon={Mail}
              placeholder="e.g. stu1@assignhub.test"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="username"
            />

            <Input
              label="Password"
              type="password"
              required
              icon={Lock}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full mt-2 py-2.5 shadow-md shadow-primary/20"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign in
            </Button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-6 pt-5 border-t border-border-subtle">
            <p className="text-xs font-semibold text-text-muted mb-2.5 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Quick fill demo accounts:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('prof@joineazy.test', 'Admin@123')}
                className="p-2.5 rounded-xl bg-surface-hover hover:bg-surface text-text text-left border border-border font-medium transition-colors cursor-pointer"
              >
                🎓 Admin (Professor)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('stu1@joineazy.test', 'Student@123')}
                className="p-2.5 rounded-xl bg-surface-hover hover:bg-surface text-text text-left border border-border font-medium transition-colors cursor-pointer"
              >
                👑 Student Leader (stu1)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('stu2@joineazy.test', 'Student@123')}
                className="p-2.5 rounded-xl bg-surface-hover hover:bg-surface text-text text-left border border-border font-medium transition-colors cursor-pointer"
              >
                👤 Student Member (stu2)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('stu4@joineazy.test', 'Student@123')}
                className="p-2.5 rounded-xl bg-surface-hover hover:bg-surface text-text text-left border border-border font-medium transition-colors cursor-pointer"
              >
                👑 Beta Leader (stu4)
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-text-muted">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-primary hover:underline"
            >
              Register here
            </Link>
          </div>

          {/* API Endpoint Config Toggle */}
          <div className="mt-5 pt-3 border-t border-border-subtle text-center">
            {!showConfig ? (
              <button
                type="button"
                onClick={() => {
                  setCustomUrlInput(localStorage.getItem('custom_api_url') || '');
                  setShowConfig(true);
                }}
                className="text-[11px] text-text-muted hover:text-text flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <Server className="h-3 w-3" />
                API Server: <span className="font-mono">{currentApiUrl}</span> (Edit)
              </button>
            ) : (
              <div className="p-3 bg-surface-hover rounded-2xl border border-border text-left space-y-2">
                <label className="block text-[11px] font-semibold text-text">
                  Configure API Server Endpoint:
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="url"
                    placeholder="https://joineazy-backend-9pam.onrender.com/api"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    className="flex-1 px-2.5 py-1 text-xs rounded-xl border border-border bg-surface text-text focus:outline-none focus:ring-1 focus:ring-primary font-mono text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={handleSaveApiUrl}
                    className="px-3 py-1 text-xs font-semibold bg-primary hover:bg-primary-hover text-white rounded-xl cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfig(false)}
                    className="px-2 py-1 text-xs text-text-muted hover:text-text cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
