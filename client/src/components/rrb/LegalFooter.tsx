import { Link } from 'wouter';
import { Scale, Lock, AlertCircle, DollarSign } from 'lucide-react';

export function LegalFooter() {
  return (
    <footer className="bg-background border-t border-border py-12">
      <div className="container max-w-6xl">
        {/* Legal Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Link href="/terms-of-service">
            <div className="flex items-center gap-3 cursor-pointer hover:text-accent transition-colors">
              <Scale className="w-5 h-5 text-accent" />
              <div>
                <p className="font-semibold text-sm text-foreground">Terms of Service</p>
                <p className="text-xs text-foreground/60">Subscription & usage terms</p>
              </div>
            </div>
          </Link>

          <Link href="/privacy-policy">
            <div className="flex items-center gap-3 cursor-pointer hover:text-accent transition-colors">
              <Lock className="w-5 h-5 text-accent" />
              <div>
                <p className="font-semibold text-sm text-foreground">Privacy Policy</p>
                <p className="text-xs text-foreground/60">Data protection & rights</p>
              </div>
            </div>
          </Link>

          <Link href="/disclaimer">
            <div className="flex items-center gap-3 cursor-pointer hover:text-accent transition-colors">
              <AlertCircle className="w-5 h-5 text-accent" />
              <div>
                <p className="font-semibold text-sm text-foreground">Disclaimer</p>
                <p className="text-xs text-foreground/60">Content & liability</p>
              </div>
            </div>
          </Link>

          <Link href="/refund-policy">
            <div className="flex items-center gap-3 cursor-pointer hover:text-accent transition-colors">
              <DollarSign className="w-5 h-5 text-accent" />
              <div>
                <p className="font-semibold text-sm text-foreground">Refund Policy</p>
                <p className="text-xs text-foreground/60">Cancellation & refunds</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Divider */}
        <div className="border-t border-border/50 pt-8 mt-8">
          {/* Copyright & Contact */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-foreground/60">
              <p>&copy; 2026 Rockin' Rockin' Boogie. All rights reserved.</p>
              <p>A production by Canryn Production and its subsidiaries.</p>
            </div>

            <div className="text-sm text-foreground/60 text-center md:text-right">
              <p>Questions? <Link href="/support"><span className="text-accent hover:underline cursor-pointer">Contact Support</span></Link></p>
              <p>Last updated: January 25, 2026</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
