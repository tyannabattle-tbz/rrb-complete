import React, { useState } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface NewsletterSignupProps {
  onSuccess?: () => void;
  variant?: 'inline' | 'modal' | 'card';
}

export default function NewsletterSignup({ onSuccess, variant = 'card' }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Store email in localStorage
      const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
      if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem('newsletter_subscribers', JSON.stringify(subscribers));
      }

      setStatus('success');
      setMessage('Welcome! Check your email for confirmation.');
      setEmail('');

      if (onSuccess) {
        onSuccess();
      }

      // Reset after 3 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  if (variant === 'inline') {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'loading'}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
        </Button>
      </form>
    );
  }

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="bg-slate-800 border-purple-500 w-full max-w-md p-8">
          <div className="text-center mb-6">
            <Mail className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Stay Updated</h2>
            <p className="text-purple-300">Get the latest news from RockinRockinBoogie</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading'}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            />

            <Button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe to Newsletter'}
            </Button>

            {status === 'success' && (
              <div className="flex items-center gap-2 text-green-400 bg-green-900/20 p-3 rounded">
                <CheckCircle className="w-5 h-5" />
                <span>{message}</span>
              </div>
            )}

            {status === 'error' && (
              <div className="flex items-center gap-2 text-red-400 bg-red-900/20 p-3 rounded">
                <AlertCircle className="w-5 h-5" />
                <span>{message}</span>
              </div>
            )}
          </form>

          <p className="text-slate-400 text-xs text-center mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </Card>
      </div>
    );
  }

  // Default card variant
  return (
    <Card className="bg-gradient-to-r from-purple-900 to-slate-800 border-purple-500 p-8">
      <div className="flex items-center gap-4 mb-6">
        <Mail className="w-8 h-8 text-purple-400" />
        <div>
          <h3 className="text-xl font-bold text-white">Stay Connected</h3>
          <p className="text-purple-300 text-sm">Get updates on new episodes and live events</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'loading'}
            className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
          />
          <Button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="bg-purple-600 hover:bg-purple-700 px-6"
          >
            {status === 'loading' ? 'Loading...' : 'Subscribe'}
          </Button>
        </div>

        {status === 'success' && (
          <div className="flex items-center gap-2 text-green-400 bg-green-900/20 p-3 rounded">
            <CheckCircle className="w-5 h-5" />
            <span>{message}</span>
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-center gap-2 text-red-400 bg-red-900/20 p-3 rounded">
            <AlertCircle className="w-5 h-5" />
            <span>{message}</span>
          </div>
        )}
      </form>
    </Card>
  );
}
