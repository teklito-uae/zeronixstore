import { Newspaper } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import type { BlogPost } from "@/features/blog/types";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  const dateLabel = post.published_at ?? post.created_at;

  return (
    <Link
      to={`/journal/${post.slug}`}
      className="group flex h-full w-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-[transform,box-shadow] hover:shadow-md active:scale-[0.98]"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        {post.cover_image_url ? (
          <img
            src={post.cover_image_url}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-accent">
            <Newspaper className="size-10 text-primary/40" strokeWidth={1.25} />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {formatDate(dateLabel)}
        </span>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground sm:text-base">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {post.excerpt}
          </p>
        )}
      </div>
    </Link>
  );
}

export function BlogCardSkeleton() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border border-border">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
}
