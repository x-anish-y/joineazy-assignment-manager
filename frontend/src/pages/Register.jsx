import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  User,
  Mail,
  Hash,
  Lock,
  UserPlus,
  Sparkles,
  GraduationCap,
  Users,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { register } from '../api/auth.js';
import Input from '../components/ui/Input.jsx';
import MagneticButton from '../components/ui/MagneticButton.jsx';
import ProgressRing from '../components/ui/ProgressRing.jsx';
import MemberAvatars from '../components/ui/MemberAvatars.jsx';
import Badge from '../components/ui/Badge.jsx';
import { toast } from '../components/ui/Toast.jsx';
import ThemeToggle from '../components/ui/ThemeToggle.jsx';
import Logo from '../components/brand/Logo.jsx';
import AnimatedBackground from '../components/ui/AnimatedBackground.jsx';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    student_id: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  // Mouse Parallax for Left Hero Floating Cards
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 120, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 20 });

  const card1X = useTransform(springX, [-300, 300], [-10, 10]);
  const card1Y = useTransform(springY, [-300, 300], [-12, 12]);
  const card2X = useTransform(springX, [-300, 300], [14, -14]);
  const card2Y = useTransform(springY, [-300, 300], [10, -10]);

  const handleHeroMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Enter a valid email address';
    }
    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
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
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        student_id: formData.student_id.trim() || undefined,
        password: formData.password,
      };

      const res = await register(payload);
      if (res.success && res.data) {
        loginUser(res.data.token, res.data.user);
        toast.success('Registration successful! Welcome to AssignHub.');
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        (!err.response
          ? 'Cannot connect to backend server. Please verify API URL.'
          : 'Registration failed');
      setErrors({ form: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const demoMembers = [
    { id: 1, name: 'Taylor Swift', email: 'taylor@uni.edu' },
    { id: 2, name: 'Jordan Lee', email: 'jordan@uni.edu' },
    { id: 3, name: 'Alex Wong', email: 'alex@uni.edu' },
    { id: 4, name: 'Sam Rivera', email: 'sam@uni.edu' },
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
              Create your account,{' '}
              <span className="bg-gradient-to-r from-indigo-500 via-primary to-cyan-400 bg-clip-text text-transparent">
                build strong teams.
              </span>
            </h1>
            <p className="text-sm text-text-muted leading-relaxed max-w-lg">
              Form student groups, submit deliverables together, and guarantee seamless confirmation across every team member.
            </p>
          </div>

          {/* Floating Parallax Mock Cards Container */}
          <div className="relative h-72 w-full max-w-lg">
            {/* Card 1: Team Roster Card */}
            <motion.div
              style={{ x: card1X, y: card1Y }}
              className="absolute top-0 left-0 w-76 p-4 rounded-2xl bg-surface/90 backdrop-blur-xl border border-border shadow-xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary-light text-primary">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-text text-xs">Team Theta</p>
                    <p className="text-[10px] text-text-muted">4 Active Members</p>
                  </div>
                </div>
                <Badge variant="leader" size="sm">
                  Active
                </Badge>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-border-subtle">
                <span className="text-[11px] text-text-muted">Group Roster</span>
                <MemberAvatars members={demoMembers} leaderId={1} size="sm" />
              </div>
            </motion.div>

            {/* Card 2: Progress Status Card */}
            <motion.div
              style={{ x: card2X, y: card2Y }}
              className="absolute bottom-4 right-4 w-64 p-4 rounded-2xl bg-surface/90 backdrop-blur-xl border border-border shadow-2xl flex items-center gap-4"
            >
              <ProgressRing percentage={100} size={58} strokeWidth={6} showPercentage={false} />
              <div>
                <span className="text-base font-extrabold text-text">100% Confirmed</span>
                <p className="text-[11px] text-success font-semibold flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> All members synced
                </p>
              </div>
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
                Join Assign<span className="bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">Hub</span>
              </h2>
              <p className="text-xs text-text-muted mt-1">Student &amp; Group Assignment Manager</p>
            </div>

            <div className="hidden lg:block mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-text">Create an account</h2>
              <p className="text-xs text-text-muted mt-1">Sign up to collaborate with your team</p>
            </div>

            {errors.form && (
              <div className="mb-5 p-3.5 rounded-2xl bg-danger-light border border-danger/30 text-xs text-danger font-medium leading-relaxed">
                {errors.form}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                label="Full Name"
                type="text"
                icon={User}
                required
                placeholder="e.g. Alex Morgan"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={errors.name}
                autoComplete="name"
              />

              <Input
                label="Email Address"
                type="email"
                icon={Mail}
                required
                placeholder="e.g. alex@university.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={errors.email}
                autoComplete="email"
              />

              <Input
                label="Student ID (Optional)"
                type="text"
                icon={Hash}
                placeholder="e.g. STU-10492"
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                error={errors.student_id}
                helperText="Used by group leaders to invite you to team groups"
              />

              <Input
                label="Password"
                type="password"
                icon={Lock}
                required
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={errors.password}
                autoComplete="new-password"
              />

              <MagneticButton
                type="submit"
                loading={loading}
                className="w-full mt-2 py-2.5 shadow-md shadow-primary/25"
                size="md"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Create Account
              </MagneticButton>
            </form>

            <div className="mt-6 text-center text-xs text-text-muted border-t border-border-subtle pt-5">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
