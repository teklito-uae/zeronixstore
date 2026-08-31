const stats = [
  { value: "500+", label: "Laptops & PCs in stock" },
  { value: "24h", label: "Delivery across the UAE" },
  { value: "1 Yr", label: "Warranty on every order" },
  { value: "4.8★", label: "Rated by 2,000+ customers" },
];

export function StatsBar() {
  return (
    <section className="dark bg-background px-4 py-4 text-foreground">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden rounded-2xl bg-border lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center justify-center gap-1 bg-background px-4 py-6 text-center sm:py-10"
          >
            <span className="text-3xl font-semibold text-primary sm:text-4xl">{stat.value}</span>
            <span className="text-xs text-muted-foreground sm:text-sm">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
