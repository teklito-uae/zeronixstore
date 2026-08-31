// Microsoft Fluent Emoji, 3D style — MIT licensed, https://github.com/microsoft/fluentui-emoji
// Used instead of a paid icon pack. No 1:1 emoji exists for "GPU" or "monitor" specifically,
// so Components/Monitors use the closest reasonable stand-in (gear, television).
const iconsBySlug: Record<string, string> = {
  laptops: "/icons/3d/laptop.png",
  desktops: "/icons/3d/desktop-computer.png",
  components: "/icons/3d/gear.png",
  monitors: "/icons/3d/television.png",
  accessories: "/icons/3d/keyboard.png",
};

export function getCategory3DIcon(slug: string): string | null {
  return iconsBySlug[slug] ?? null;
}
