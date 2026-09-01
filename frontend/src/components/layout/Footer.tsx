import { ArrowUp, BadgeCheck, CreditCard, Mail, MapPin, Phone, ShieldCheck, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

const footerColumns = [
  {
    heading: "Shop",
    links: [
      { label: "Laptops", href: "/category/laptops" },
      { label: "Desktops", href: "/category/desktops" },
      { label: "Graphics Cards", href: "/category/graphics-cards" },
      { label: "Monitors", href: "/category/monitors" },
      { label: "Accessories", href: "/category/accessories" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Zeronix", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Track Order", href: "/orders" },
      { label: "Shipping & Delivery", href: "/shipping" },
      { label: "Returns & Warranty", href: "/returns" },
      { label: "FAQs", href: "/faq" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];

const trustBadges = [
  { icon: Truck, label: "Fast UAE delivery" },
  { icon: ShieldCheck, label: "Secure checkout" },
  { icon: BadgeCheck, label: "100% authentic parts" },
  { icon: CreditCard, label: "Card, Tabby & COD" },
];

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function Footer() {
  return (
    <footer className="dark border-t border-border bg-background pb-16 text-foreground lg:pb-0">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 gap-4 border-b border-border py-6 sm:grid-cols-4">
          {trustBadges.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
                <Icon className="size-4" strokeWidth={1.75} />
              </span>
              <span className="text-xs font-medium text-muted-foreground sm:text-sm">{label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-8 py-12 sm:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2 flex flex-col items-start gap-4 lg:col-span-2">
            <img src="/zeronix-logo.webp" alt="Zeronix" className="h-6 w-auto self-start rounded bg-white p-1" />
            <p className="max-w-xs text-sm text-muted-foreground">
              Your trusted destination for laptops, desktops, components and accessories across the UAE.
            </p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0" /> Dubai, United Arab Emirates
              </span>
              <a href="tel:+97140000000" className="flex items-center gap-2 hover:text-foreground">
                <Phone className="size-4 shrink-0" /> +971 4 000 0000
              </a>
              <a href="mailto:support@zeronix.ae" className="flex items-center gap-2 hover:text-foreground">
                <Mail className="size-4 shrink-0" /> support@zeronix.ae
              </a>
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.heading} className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-foreground">{column.heading}</h3>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator />

        <div className="flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Zeronix UAE. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {["Facebook", "Instagram", "X"].map((label) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex size-8 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  {label[0]}
                </a>
              ))}
            </div>
            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Back to top"
              className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <ArrowUp className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
