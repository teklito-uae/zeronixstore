import {
  Armchair,
  CircuitBoard,
  Computer,
  Cpu,
  Gamepad2,
  HardDrive,
  Headphones,
  Joystick,
  Keyboard,
  Laptop,
  type LucideProps,
  MemoryStick,
  Microchip,
  Monitor,
  Mouse,
  Package,
  Printer,
  Router,
  Video,
} from "lucide-react";

const iconsBySlug: Record<string, typeof Package> = {
  laptops: Laptop,
  "gaming-laptops": Gamepad2,
  "business-laptops": Laptop,
  "2-in-1-laptops": Laptop,
  desktops: Computer,
  "gaming-pcs": Joystick,
  "prebuilt-desktops": Computer,
  "mini-pcs": Computer,
  components: CircuitBoard,
  "graphics-cards": CircuitBoard,
  processors: Cpu,
  motherboards: Microchip,
  "memory-ram": MemoryStick,
  monitors: Monitor,
  "gaming-monitors": Monitor,
  "4k-ultrawide-monitors": Monitor,
  "office-monitors": Monitor,
  storage: HardDrive,
  accessories: Keyboard,
  "keyboards-mice": Mouse,
  headsets: Headphones,
  "webcams-streaming": Video,
  networking: Router,
  routers: Router,
  "network-adapters": Router,
  "printers-scanners": Printer,
  "laser-printers": Printer,
  "all-in-one-printers": Printer,
  "gaming-chairs-desks": Armchair,
  "gaming-chairs": Armchair,
  "gaming-desks": Armchair,
};

interface CategoryIconProps extends LucideProps {
  slug: string;
}

/** Modern lucide icon for a category — small, consistent stroke-based glyphs. */
export function CategoryIcon({ slug, ...props }: CategoryIconProps) {
  const Icon = iconsBySlug[slug] ?? Package;
  return <Icon {...props} />;
}
