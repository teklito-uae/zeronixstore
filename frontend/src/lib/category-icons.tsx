import {
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
  Monitor,
  Mouse,
  Package,
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
  monitors: Monitor,
  "gaming-monitors": Monitor,
  "4k-ultrawide-monitors": Monitor,
  "office-monitors": Monitor,
  storage: HardDrive,
  accessories: Keyboard,
  "keyboards-mice": Mouse,
  headsets: Headphones,
  "webcams-streaming": Video,
};

interface CategoryIconProps extends LucideProps {
  slug: string;
}

/** Modern lucide icon for a category — small, consistent stroke-based glyphs. */
export function CategoryIcon({ slug, ...props }: CategoryIconProps) {
  const Icon = iconsBySlug[slug] ?? Package;
  return <Icon {...props} />;
}
