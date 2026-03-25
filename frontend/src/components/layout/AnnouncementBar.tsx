import { X } from 'lucide-react';
import { useState } from 'react';

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative w-full h-10 bg-gradient-to-r from-blue-700 to-indigo-600 text-white overflow-hidden flex items-center z-[60]">
      <div className="flex-1 flex items-center">
        <div className="animate-marquee flex gap-12 text-[0.8rem] font-medium">
          <span className="flex items-center gap-2">🔥 Black Friday Sale <span className="font-bold">22% OFF</span> — Limited Time</span>
          <span className="flex items-center gap-2">⚡ New High Performance GPUs in Stock</span>
          <span className="flex items-center gap-2">🚀 Free Express Delivery on orders over $500</span>
          <span className="flex items-center gap-2">🔥 Black Friday Sale <span className="font-bold">22% OFF</span> — Limited Time</span>
          <span className="flex items-center gap-2">⚡ New High Performance GPUs in Stock</span>
          <span className="flex items-center gap-2">🚀 Free Express Delivery on orders over $500</span>
        </div>
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute right-4 p-1 hover:bg-white/10 rounded-full transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
