interface CategoryAccent {
  bg: string;
  fg: string;
  ring: string;
}

// Deliberately varied per category (not one accent repeated everywhere) so the
// category grid and product cards read as designed, not templated.
const accentsBySlug: Record<string, CategoryAccent> = {
  laptops: { bg: "bg-emerald-50", fg: "text-emerald-600", ring: "ring-emerald-600/10" },
  "gaming-laptops": { bg: "bg-emerald-50", fg: "text-emerald-600", ring: "ring-emerald-600/10" },
  desktops: { bg: "bg-blue-50", fg: "text-blue-600", ring: "ring-blue-600/10" },
  "gaming-pcs": { bg: "bg-blue-50", fg: "text-blue-600", ring: "ring-blue-600/10" },
  components: { bg: "bg-violet-50", fg: "text-violet-600", ring: "ring-violet-600/10" },
  "graphics-cards": { bg: "bg-violet-50", fg: "text-violet-600", ring: "ring-violet-600/10" },
  processors: { bg: "bg-amber-50", fg: "text-amber-600", ring: "ring-amber-600/10" },
  monitors: { bg: "bg-cyan-50", fg: "text-cyan-600", ring: "ring-cyan-600/10" },
  storage: { bg: "bg-rose-50", fg: "text-rose-600", ring: "ring-rose-600/10" },
  accessories: { bg: "bg-slate-100", fg: "text-slate-600", ring: "ring-slate-600/10" },
  "keyboards-mice": { bg: "bg-orange-50", fg: "text-orange-600", ring: "ring-orange-600/10" },
  headsets: { bg: "bg-pink-50", fg: "text-pink-600", ring: "ring-pink-600/10" },
  "webcams-streaming": { bg: "bg-indigo-50", fg: "text-indigo-600", ring: "ring-indigo-600/10" },
};

const fallbackAccent: CategoryAccent = {
  bg: "bg-muted",
  fg: "text-muted-foreground",
  ring: "ring-border",
};

export function getCategoryAccent(slug: string): CategoryAccent {
  return accentsBySlug[slug] ?? fallbackAccent;
}
