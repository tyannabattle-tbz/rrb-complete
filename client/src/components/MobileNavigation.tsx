import { useState } from 'react';
import { Menu, X, Home, Music, Users, Settings } from 'lucide-react';
import { Link } from 'wouter';

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed bottom-4 right-4 z-40 p-3 bg-primary text-primary-foreground rounded-full shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setIsOpen(false)}>
          <div className="fixed bottom-0 left-0 right-0 bg-background rounded-t-lg p-4 space-y-3 max-h-[80vh] overflow-y-auto">
            <Link href="/">
              <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent" onClick={() => setIsOpen(false)}>
                <Home size={20} /> Home
              </a>
            </Link>
            <Link href="/rrb/radio-station">
              <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent" onClick={() => setIsOpen(false)}>
                <Music size={20} /> Radio
              </a>
            </Link>
            <Link href="/community">
              <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent" onClick={() => setIsOpen(false)}>
                <Users size={20} /> Community
              </a>
            </Link>
            <Link href="/settings">
              <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent" onClick={() => setIsOpen(false)}>
                <Settings size={20} /> Settings
              </a>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
