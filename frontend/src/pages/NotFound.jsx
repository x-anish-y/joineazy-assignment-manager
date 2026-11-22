import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import AnimatedBackground from '../components/ui/AnimatedBackground.jsx';

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-bg text-text flex items-center justify-center p-4">
      <AnimatedBackground intensity="subtle" />
      <div className="max-w-md w-full text-center bg-surface/85 backdrop-blur-xl p-8 rounded-3xl border border-border shadow-xl">
        <div className="h-14 w-14 rounded-2xl bg-danger-light text-danger flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h1 className="text-4xl font-black text-text">404</h1>
        <h2 className="text-lg font-semibold text-text mt-2">Page not found</h2>
        <p className="text-sm text-text-muted mt-2 mb-6">
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
