import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Hash, Lock, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { register } from '../api/auth.js';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
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
        (!err.response ? 'Cannot connect to backend server. Please verify API URL.' : 'Registration failed');
      setErrors({ form: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-bg text-text flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-primary/20">
      {/* Background Hero Effect */}
      <AnimatedBackground intensity="hero" />

      {/* Theme Switcher Top-Right */}
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle size="md" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center mb-3">
          <Logo variant="mark-only" size={62} animated={true} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text">
          Join Assign<span className="bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">Hub</span>
        </h2>
        <p className="mt-2 text-sm text-text-muted">
          Create student account to collaborate on deliverables
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-surface/85 backdrop-blur-xl py-8 px-6 shadow-xl border border-border rounded-3xl sm:px-10 transition-colors">
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

            <Button
              type="submit"
              loading={loading}
              className="w-full mt-2 py-2.5 shadow-md shadow-primary/20"
              size="lg"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-text-muted border-t border-border-subtle pt-5">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-primary hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
