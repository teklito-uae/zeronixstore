import { Construction } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function ComingSoon() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-accent text-primary">
        <Construction className="size-6" strokeWidth={1.5} />
      </span>
      <h1 className="text-2xl font-semibold text-foreground">This page is coming soon</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        We're still building this part of the store. Check back soon.
      </p>
      <Button asChild>
        <Link to="/">Back to Home</Link>
      </Button>
    </div>
  );
}
