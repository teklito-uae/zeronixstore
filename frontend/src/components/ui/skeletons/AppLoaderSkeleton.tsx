export function AppLoaderSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-bg-primary text-text-primary">
      {/* 1. Global Announcement Marquee Skeleton (hidden on mobile) */}
      <div className="hidden lg:block h-9 bg-emerald-600/50 animate-pulse" />

      {/* 2. Navbar Skeleton */}
      <header className="sticky top-0 z-50 bg-bg-surface/80 backdrop-blur-xl border-b border-border-subtle w-full h-[60px] lg:h-[72px]">
        <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
          {/* Mobile Menu Icon + Logo */}
          <div className="flex items-center gap-4">
            <div className="lg:hidden w-6 h-6 rounded bg-border-subtle/40 animate-pulse" />
            <div className="w-24 lg:w-32 h-6 lg:h-8 rounded bg-border-subtle/40 animate-pulse" />
          </div>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-20 h-4 rounded bg-border-subtle/40 animate-pulse" />
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="hidden lg:block w-48 h-10 rounded-full bg-border-subtle/40 animate-pulse" />
            <div className="w-8 h-8 rounded-full bg-border-subtle/40 animate-pulse" />
            <div className="w-8 h-8 rounded-full bg-border-subtle/40 animate-pulse" />
          </div>
        </div>
      </header>

      {/* 3. Main Content Area Structure */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Simulating a hero banner loading */}
        <div className="w-full h-[60vh] max-h-[500px] rounded-[32px] bg-bg-surface border border-border-subtle overflow-hidden relative mb-8">
           <div className="absolute inset-0 bg-gradient-to-tr from-border-subtle/20 to-transparent animate-pulse delay-75" />
        </div>

        {/* Simulating category/product row loading */}
        <div className="space-y-4">
           <div className="w-40 h-6 rounded bg-border-subtle/30 animate-pulse" />
           <div className="flex gap-4 overflow-hidden">
             {[1, 2, 3, 4, 5].map((i) => (
               <div key={i} className="flex-none lg:flex-1 w-40 min-w-[160px] aspect-square rounded-2xl bg-bg-surface border border-border-subtle flex flex-col items-center justify-center gap-3 p-4">
                 <div className="w-12 h-12 rounded-full bg-border-subtle/40 animate-pulse delay-100" />
                 <div className="w-20 h-3 rounded bg-border-subtle/30 animate-pulse" />
               </div>
             ))}
           </div>
        </div>
      </main>
    </div>
  );
}
