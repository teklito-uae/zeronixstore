import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Twitter, MessageCircle, ChevronDown } from 'lucide-react';

const shopLinks = [
  { label: 'Networking', href: '/category/networking' },
  { label: 'Laptops', href: '/category/laptops' },
  { label: 'Gaming', href: '/category/gaming-zone' },
  { label: 'Cameras', href: '/category/cameras' },
  { label: 'Audio & Hi-Fi', href: '/category/audio' },
  { label: 'Promotions', href: '/deals' },
];

const supportLinks = [
  { label: 'Our Stores', href: '#' },
  { label: 'Contact Us', href: '#' },
  { label: 'Delivery & Returns', href: '#' },
  { label: 'FAQ', href: '#' },
];

// Accordion section for mobile
function FooterAccordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border-subtle/50 lg:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-4 lg:py-0 lg:cursor-default lg:pointer-events-none"
      >
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-primary">{title}</h3>
        <ChevronDown className={`h-4 w-4 text-text-muted lg:hidden transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 lg:max-h-none lg:opacity-100 lg:mt-3 ${
        open ? 'max-h-60 opacity-100 pb-4' : 'max-h-0 opacity-0 lg:max-h-none lg:opacity-100'
      }`}>
        {children}
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-bg-primary text-text-primary border-t border-border-subtle relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[160px] bg-emerald-500/4 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6 md:pt-20 md:pb-12 relative z-10">

        {/* ── 4-Column Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8">

          {/* Col 1: Brand + Tagline + Socials */}
          <div className="lg:col-span-4 space-y-4 pb-6 lg:pb-0 border-b border-border-subtle/50 lg:border-0">
            <Link to="/" className="inline-block">
              <img src="/zeronix-zero-logo.webp" alt="Zeronix" className="h-6 lg:h-7 w-auto object-contain" />
            </Link>
            <p className="text-text-muted text-xs leading-relaxed max-w-xs">
              Your trusted tech store in the UAE.
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

          {/* Col 2: Quick Shop */}
          <div className="lg:col-span-2">
            <FooterAccordion title="Quick Shop">
              <ul className="space-y-2">
                {shopLinks.map(item => (
                  <li key={item.label}>
                    <Link to={item.href} className="text-xs text-text-muted hover:text-text-primary transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </FooterAccordion>
          </div>

          {/* Col 3: Support */}
          <div className="lg:col-span-2">
            <FooterAccordion title="Support">
              <ul className="space-y-2">
                {supportLinks.map(item => (
                  <li key={item.label}>
                    <Link to={item.href} className="text-xs text-text-muted hover:text-text-primary transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </FooterAccordion>
          </div>

          {/* Col 4: WhatsApp CTA */}
          <div className="lg:col-span-4 pt-6 lg:pt-0">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-primary mb-3">Need Help?</h3>
            <p className="text-xs text-text-muted mb-4 max-w-xs leading-relaxed">
              Chat with our team for instant support on orders, products, and delivery.
            </p>
            <a
              href="https://wa.me/971500000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-[#25D366]/20 hover:shadow-[#25D366]/40 hover:-translate-y-0.5"
            >
              <MessageCircle className="h-4 w-4" />
              Chat on WhatsApp
            </a>
            <p className="text-[10px] text-text-muted mt-2.5">
              Available 9 AM – 10 PM (UAE Time)
            </p>
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
