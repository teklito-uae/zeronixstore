import { Link } from 'react-router-dom';
import { Settings, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Profile() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="h-16 w-16 bg-bg-surface border border-border-subtle rounded-full flex items-center justify-center mx-auto">
          <Settings className="h-7 w-7 text-text-muted/30" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-xl font-black text-text-primary tracking-tight">Account Settings</h1>
          <p className="text-sm text-text-muted max-w-xs mx-auto leading-relaxed">
            Manage your account from the dashboard. Update your profile, view orders, and manage addresses.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/dashboard">
            <Button className="h-11 px-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20">
              Go to Dashboard
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" className="h-11 px-6 rounded-xl font-bold text-xs uppercase tracking-widest border-border-subtle text-text-muted hover:text-text-primary flex items-center gap-2">
              <ArrowLeft className="h-3.5 w-3.5" /> Return to Store
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
