import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Wishlist() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping opacity-40" />
          <div className="relative h-20 w-20 bg-bg-surface border border-border-subtle rounded-full flex items-center justify-center mx-auto">
            <Heart className="h-8 w-8 text-text-muted/30" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-xl font-black text-text-primary tracking-tight">Your Wishlist is Empty</h1>
          <p className="text-sm text-text-muted max-w-xs mx-auto leading-relaxed">
            Save items you love and they'll appear here. Build your dream setup today.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/">
            <Button className="h-11 px-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-500/20">
              <ShoppingBag className="h-4 w-4" />
              Explore Collection
            </Button>
          </Link>
        </div>

        {/* Feature hint */}
        <p className="text-[10px] text-text-muted/50 uppercase tracking-widest font-bold pt-4">
          Wishlist feature coming soon
        </p>
      </div>
    </div>
  );
}
