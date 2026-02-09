import React from 'react';
import { useLocation } from 'wouter';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface ComingSoonProps {
  title?: string;
  description?: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  const [location] = useLocation();
  
  // Generate a nice title from the route if not provided
  const generateTitle = () => {
    if (title) return title;
    
    const path = location.replace(/^\//, '').replace(/-/g, ' ');
    return path.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <Sparkles className="w-16 h-16 text-accent animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Coming Soon
        </h1>

        {/* Page Title */}
        <h2 className="text-2xl font-semibold text-accent mb-4">
          {generateTitle()}
        </h2>

        {/* Description */}
        <p className="text-foreground/70 mb-8 leading-relaxed">
          {description || 'This page is currently under development. We\'re working hard to bring you this content soon!'}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3">
          <Link href="/">
            <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          
          <Link href="/rrb/contact">
            <Button variant="outline" className="w-full border-accent text-accent hover:bg-accent/10">
              Get Notified
            </Button>
          </Link>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-foreground/50 mt-8">
          Check back soon for updates!
        </p>
      </div>
    </main>
  );
}
