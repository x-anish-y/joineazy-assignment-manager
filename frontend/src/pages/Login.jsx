import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  Mail,
  Lock,
  LogIn,
  Sparkles,
  Server,
  AlertTriangle,
  Check,
  GraduationCap,
  ShieldCheck,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { login } from '../api/auth.js';
import { getBaseURL } from '../api/client.js';
import Input from '../components/ui/Input.jsx';
import MagneticButton from '../components/ui/MagneticButton.jsx';
import ProgressRing from '../components/ui/ProgressRing.jsx';
import MemberAvatars from '../components/ui/MemberAvatars.jsx';
import Badge from '../components/ui/Badge.jsx';
import { toast } from '../components/ui/Toast.jsx';
import ThemeToggle from '../components/ui/ThemeToggle.jsx';
import Logo from '../components/brand/Logo.jsx';
import AnimatedBackground from '../components/ui/AnimatedBackground.jsx';

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

  // Mouse Parallax for Left Hero Floating Cards
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 120, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 20 });

  const card1X = useTransform(springX, [-300, 300], [-12, 12]);
  const card1Y = useTransform(springY, [-300, 300], [-10, 10]);
  const card2X = useTransform(springX, [-300, 300], [15, -15]);
  const card2Y = useTransform(springY, [-300, 300], [12, -12]);
  const card3X = useTransform(springX, [-300, 300], [-8, 8]);
  const card3Y = useTransform(springY, [-300, 300], [14, -14]);

  const handleHeroMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

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
    e?.preventDefault();
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
        err.response?.data?.error?.message ||
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

  const isRemote =
    window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
  const isLocalApi = currentApiUrl.includes('localhost') || currentApiUrl.includes('127.0.0.1');

  const demoMembers = [
    { id: 1, name: 'stu1', email: 'stu1@joineazy.test' },
    { id: 2, name: 'stu2', email: 'stu2@joineazy.test' },
    { id: 3, name: 'stu3', email: 'stu3@joineazy.test' },
  ];

  return (
    <div className="relative min-h-screen bg-bg text-text flex items-center justify-center p-4 sm:p-6 lg:p-8 selection:bg-primary/20 overflow-x-hidden">
      {/* Background Hero Aurora & Constellation */}
      <AnimatedBackground intensity="hero" />

      {/* Theme Switcher Top-Right */}
      <div className="absolute top-5 right-5 z-30">
        <ThemeToggle size="md" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Hero Showcase & Floating Parallax Mock Cards */}
        <div
          onMouseMove={handleHeroMouseMove}
          className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-8 py-6 select-none"
        >
          <div className="space-y-4">
            <div className="inline-block">
              <Logo variant="full" size={44} animated={true} />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-text leading-tight">
              Collaborative assignments,{' '}
              <span className="bg-gradient-to-r from-indigo-500 via-primary to-cyan-400 bg-clip-text text-transparent">
                simplified &amp; synchronized.
              </span>
            </h1>
            <p className="text-sm text-text-muted leading-relaxed max-w-lg">
              Manage student groups, confirm milestone submissions in lockstep, and track real-time class progress with zero friction.
            </p>
          </div>

          {/* Floating Parallax Mock Cards Container */}
          <div className="relative h-72 w-full max-w-lg">
            {/* Card 1: Mini Assignment Card */}
            <motion.div
              style={{ x: card1X, y: card1Y }}
              className="absolute top-0 left-0 w-72 p-4 rounded-2xl bg-surface/90 backdrop-blur-xl border border-border shadow-xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <Badge variant="leader" size="sm">
                  Alpha Team
                </Badge>
                <span className="text-[11px] font-medium text-text-muted flex items-center gap-1">
                  <Clock className="h-3 w-3 text-warning" />
                  Due in 2 days
                </span>
              </div>
              <div>
                <p className="font-bold text-text text-xs">Distributed Systems: Milestone 2</p>
                <p className="text-[11px] text-text-muted mt-0.5">Raft Consensus Algorithm</p>
              </div>
              <div className="flex items-center justify-between pt-1">
                <MemberAvatars members={demoMembers} leaderId={1} size="sm" />
                <Badge variant="pending" size="sm">
                  Pending Submission
                </Badge>
              </div>
            </motion.div>

            {/* Card 2: Progress Ring Hero Card */}
            <motion.div
              style={{ x: card2X, y: card2Y }}
              className="absolute bottom-2 right-4 w-60 p-4 rounded-2xl bg-surface/90 backdrop-blur-xl border border-border shadow-2xl flex items-center gap-4"
            >
              <ProgressRing percentage={85} size={64} strokeWidth={6} showPercentage={false} />
              <div>
                <span className="text-lg font-extrabold text-text">85%</span>
                <p className="text-[11px] font-semibold text-text">Completion Rate</p>
                <p className="text-[10px] text-success font-medium flex items-center gap-0.5 mt-0.5">
                  <CheckCircle2 className="h-3 w-3" /> On Track
                </p>
              </div>
            </motion.div>

            {/* Card 3: Mini Stat Pill */}
            <motion.div
              style={{ x: card3X, y: card3Y }}
              className="absolute top-28 right-8 px-3.5 py-2 rounded-xl bg-surface/85 backdrop-blur-md border border-border shadow-lg flex items-center gap-2"
            >
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-semibold text-text">Live Confirmation Sync</span>
            </motion.div>
          </div>
        </div>

        {/* Right Column: Glass Form Card */}
        <div className="w-full lg:col-span-6 max-w-md mx-auto">
          <div className="bg-surface/85 backdrop-blur-2xl py-8 px-6 sm:px-9 shadow-2xl border border-border rounded-3xl transition-all">
            {/* Mobile Header Logo */}
            <div className="lg:hidden text-center mb-6">
              <div className="inline-flex justify-center mb-2">
                <Logo variant="mark-only" size={54} animated={true} />
              </div>
              <h2 className="text-2xl font-extrabold text-text tracking-tight">
                Sign in to Assign<span className="bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">Hub</span>
              </h2>
              <p className="text-xs text-text-muted mt-1">Student &amp; Group Assignment Manager</p>
            </div>

            <div className="hidden lg:block mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-text">Welcome back</h2>
              <p className="text-xs text-text-muted mt-1">Enter your credentials to access your dashboard</p>
            </div>

            {/* Prominent Quick Demo Login Buttons */}
            <div className="mb-6 p-3.5 rounded-2xl bg-bg-subtle/80 border border-border space-y-2">
              <p className="text-xs font-semibold text-text-muted flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Try demo with 1-click:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('stu1@joineazy.test', 'Student@123')}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-surface hover:bg-surface-hover text-text text-xs font-semibold border border-border shadow-2xs hover:border-primary/50 cursor-pointer transition-all active:scale-98"
                >
                  <GraduationCap className="h-3.5 w-3.5 text-primary" />
                  <span>Student Demo</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('prof@joineazy.test', 'Admin@123')}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-surface hover:bg-surface-hover text-text text-xs font-semibold border border-border shadow-2xs hover:border-purple-500/50 cursor-pointer transition-all active:scale-98"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Professor Demo</span>
                </button>
              </div>
            </div>

            {/* Cloud warning if deployed on Vercel but API points to localhost */}
            {isRemote && isLocalApi && (
              <div className="mb-5 p-3.5 rounded-2xl bg-warning-light border border-warning/30 text-xs text-text space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Backend Connection Needed</span>
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Currently pointing to <code className="font-mono text-text">{currentApiUrl}</code>. Connect to live cloud backend:
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const renderUrl = 'https://joineazy-backend-9pam.onrender.com/api';
                    localStorage.setItem('custom_api_url', renderUrl);
                    setCurrentApiUrl(renderUrl);
                    toast.success('Connected to Live Render Backend!');
                    setErrors({});
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover shadow-xs cursor-pointer transition-colors"
                >
                  <Check className="h-3.5 w-3.5" />
                  Connect to Live Render
                </button>
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
                placeholder="e.g. stu1@joineazy.test"
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

              <MagneticButton
                type="submit"
                loading={loading}
                className="w-full mt-2 py-2.5 shadow-md shadow-primary/25"
                size="md"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </MagneticButton>
            </form>

            <div className="mt-6 text-center text-xs text-text-muted">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-primary hover:underline">
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
    </div>
  );
}
