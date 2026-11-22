import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';
import Button from '../components/ui/Button.jsx';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="h-14 w-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">404</h1>
        <h2 className="text-lg font-semibold text-slate-800 mt-2">Page not found</h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/">
          <Button className="w-full">
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
