import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-black/5 dark:bg-white/5 border border-border-subtle/50", className)}
      {...props}
    />
  )
}

export { Skeleton }
