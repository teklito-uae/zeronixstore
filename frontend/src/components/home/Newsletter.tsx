import { useState } from "react";
import { Bell, Mail, Percent, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const perks = [
  { icon: Bell, label: "Restock alerts the moment stock lands" },
  { icon: Percent, label: "Price-drop pings on your wishlist" },
  { icon: ShieldCheck, label: "No spam — unsubscribe anytime" },
];

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="py-8 sm:py-14">
      <div className="mx-auto max-w-7xl px-4">
        <div className="dark relative overflow-hidden rounded-3xl bg-background text-foreground">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-32 size-[420px] rounded-full bg-primary/25 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-20 size-[320px] rounded-full bg-primary/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, currentColor 0, currentColor 1px, transparent 1px, transparent 18px)",
            }}
          />

          <div className="relative grid grid-cols-1 gap-8 px-6 py-10 sm:px-12 sm:py-14 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16 lg:px-16">
            <div className="flex flex-col gap-4">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Mail className="size-5" strokeWidth={1.5} />
              </span>
              <h2 className="max-w-md text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">
                Restock alerts, before the drop
              </h2>
              <p className="max-w-md text-sm text-white/70 sm:text-base">
                We'll email you when a GPU restocks or a price actually moves — nothing else, ever.
              </p>

              {submitted ? (
                <p className="mt-2 text-sm font-medium text-primary">
                  Thanks for subscribing — check your inbox soon.
                </p>
              ) : (
                <form onSubmit={handleSubmit} className="mt-2 flex w-full max-w-sm flex-col gap-2 sm:flex-row">
                  <Input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-white/15 bg-white/5 text-white placeholder:text-white/40"
                    aria-label="Email address"
                  />
                  <Button type="submit" className="shrink-0">
                    Subscribe
                  </Button>
                </form>
              )}
            </div>

            <ul className="flex flex-col gap-4 border-t border-white/10 pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
              {perks.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-primary">
                    <Icon className="size-4" strokeWidth={1.75} />
                  </span>
                  <span className="pt-1.5 text-sm text-white/80">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
