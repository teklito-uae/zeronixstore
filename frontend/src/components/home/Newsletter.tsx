import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="dark bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-16">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-card px-6 py-8 text-center sm:px-16 sm:py-10">
          <span className="flex size-12 items-center justify-center rounded-full bg-accent text-primary">
            <Mail className="size-5" strokeWidth={1.5} />
          </span>
          <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
            Restock alerts, before the drop
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            We'll email you when a GPU restocks or a price actually moves — nothing else.
          </p>

          {submitted ? (
            <p className="text-sm font-medium text-primary">
              Thanks for subscribing — check your inbox soon.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-2 flex w-full max-w-sm flex-col gap-2 sm:flex-row"
            >
              <Input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background"
                aria-label="Email address"
              />
              <Button type="submit" className="shrink-0">
                Subscribe
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
