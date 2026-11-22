import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { login } from '../api/auth.js';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import { toast } from '../components/ui/Toast.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
        if (from && ((role === 'admin' && from.startsWith('/admin')) || (role === 'student' && from.startsWith('/student')))) {
          navigate(from, { replace: true });
        } else {
          navigate(role === 'admin' ? '/admin/dashboard' : '/student/dashboard', { replace: true });
        }
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Invalid email or password';
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-2xl shadow-md mb-4">
          J
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Sign in to JoinEazy
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Student, Group & Assignment Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/90 rounded-2xl sm:px-10">
          {errors.form && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />

            <Input
              label="Password"
              type="password"
              icon={Lock}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full mt-2"
              size="lg"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign in
            </Button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Quick fill demo accounts:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('prof@joineazy.test', 'Admin@123')}
                className="p-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-left border border-purple-200/60 font-medium transition-colors cursor-pointer"
              >
                🎓 Admin (Professor)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('stu1@joineazy.test', 'Student@123')}
                className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-left border border-blue-200/60 font-medium transition-colors cursor-pointer"
              >
                👑 Student Leader (stu1)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('stu2@joineazy.test', 'Student@123')}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-left border border-slate-200 font-medium transition-colors cursor-pointer"
              >
                👤 Student Member (stu2)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('stu4@joineazy.test', 'Student@123')}
                className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-left border border-emerald-200/60 font-medium transition-colors cursor-pointer"
              >
                👑 Beta Leader (stu4)
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline"
            >
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
