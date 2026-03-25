import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-bg-primary text-text-primary border-t border-border-subtle relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[160px] bg-emerald-500/4 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6 md:pt-20 md:pb-12 relative z-10">

        {/* ── Top grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8">

          {/* Brand — full width on mobile, 4/12 on desktop */}
          <div className="col-span-2 lg:col-span-4 space-y-4">
            <Link to="/" className="inline-block">
              <img src="/zeronix-zero-logo.webp" alt="Zeronix" className="h-6 lg:h-7 w-auto object-contain" />
            </Link>
            <p className="text-text-muted text-xs leading-relaxed max-w-xs">
              The premier destination for high-performance computing and enthusiast hardware in the Middle East.
            </p>
            <div className="flex items-center gap-2.5">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#"
                  className="h-8 w-8 flex items-center justify-center rounded-full border border-border-subtle text-text-muted hover:text-emerald-500 hover:border-emerald-500/40 transition-all">
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform links */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-primary">Platform</h3>
            <ul className="space-y-2">
              {['Browse Hardware', 'PC Builder', 'New Arrivals', 'Clearance', 'Deals'].map(item => (
                <li key={item}>
                  <Link to="#" className="text-xs text-text-muted hover:text-text-primary transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-primary">Company</h3>
            <ul className="space-y-2">
              {['About Us', 'Careers', 'Blog', 'Contact', 'Partners'].map(item => (
                <li key={item}>
                  <Link to="#" className="text-xs text-text-muted hover:text-text-primary transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact — spans remaining 4 cols on desktop, full width on mobile */}
          <div className="col-span-2 lg:col-span-4 space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-primary">Contact</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <MapPin className="h-3.5 w-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-text-primary font-medium">Computer Plaza, Al Ain Center</p>
                  <p className="text-xs text-text-muted">Mankhool, Dubai, UAE</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                <a href="tel:+97141234567" className="text-xs text-text-muted hover:text-text-primary transition-colors">
                  +971 4 123 4567
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                <a href="mailto:support@zeronix.ae" className="text-xs text-text-muted hover:text-text-primary transition-colors">
                  support@zeronix.ae
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-8 lg:mt-16 pt-5 border-t border-border-subtle/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-text-muted order-2 sm:order-1">
            © {new Date().getFullYear()} Zeronix. All rights reserved. Prices include 5% VAT.
          </p>
          <div className="flex items-center gap-4 text-[10px] text-text-muted order-1 sm:order-2">
            <Link to="#" className="hover:text-emerald-400 transition-colors">Privacy</Link>
            <Link to="#" className="hover:text-emerald-400 transition-colors">Terms</Link>
            <Link to="#" className="hover:text-emerald-400 transition-colors">Returns</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
