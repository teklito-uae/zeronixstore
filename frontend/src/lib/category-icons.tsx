import {
  Computer,
  CircuitBoard,
  Cpu,
  HardDrive,
  Keyboard,
  Laptop,
  type LucideProps,
  Monitor,
  Package,
} from "lucide-react";

const iconsBySlug: Record<string, typeof Package> = {
  laptops: Laptop,
  desktops: Computer,
  "graphics-cards": CircuitBoard,
  processors: Cpu,
  monitors: Monitor,
  storage: HardDrive,
  accessories: Keyboard,
};

interface CategoryIconProps extends LucideProps {
  slug: string;
}

/** Category-appropriate icon used as a stand-in for real product photography. */
export function CategoryIcon({ slug, ...props }: CategoryIconProps) {
  const Icon = iconsBySlug[slug] ?? Package;
  return <Icon {...props} />;
}
