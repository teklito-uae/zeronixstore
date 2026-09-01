import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import { Calendar, ChevronRight, Newspaper, User } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { BlogCard, BlogCardSkeleton } from "@/components/blog/BlogCard";
import { useBlogPost } from "@/features/blog/useBlogPost";
import { useLazyBlogPosts } from "@/features/blog/useLazyBlogPosts";
import { formatDate } from "@/lib/format";
import type { BlogPost } from "@/features/blog/types";

export default function JournalDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { post, loading, notFound } = useBlogPost(slug);

  if (loading) return <JournalDetailSkeleton />;
  if (notFound || !post) return <JournalNotFound />;

  return <JournalDetailView post={post} />;
}

function JournalDetailView({ post }: { post: BlogPost }) {
  const {
    ref: relatedRef,
    posts: related,
    loading: relatedLoading,
  } = useLazyBlogPosts({ perPage: 10, filter: (p) => p.id !== post.id, limit: 4 });

  const sanitizedContent = useMemo(
    () =>
      DOMPurify.sanitize(post.content, {
        ALLOWED_TAGS: [
          "p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "blockquote",
          "h1", "h2", "h3", "h4", "img", "a", "span", "div",
        ],
        ALLOWED_ATTR: ["href", "src", "alt", "title"],
      }),
    [post.content],
  );

  useEffect(() => {
    document.title = post.meta_title?.trim() || `${post.title} | Zeronix Journal`;
    const description =
      post.meta_description?.trim() || post.excerpt?.slice(0, 160) || `${post.title} — Zeronix Journal.`;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", description);
  }, [post]);

  const dateLabel = post.published_at ?? post.created_at;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-5 sm:pt-8">
      <Breadcrumb className="mb-5 overflow-hidden">
        <BreadcrumbList className="flex-nowrap">
          <BreadcrumbItem className="shrink-0">
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="shrink-0" />
          <BreadcrumbItem className="shrink-0">
            <BreadcrumbLink asChild>
              <Link to="/journal">Zeronix Journal</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="shrink-0" />
          <BreadcrumbItem className="min-w-0 flex-1">
            <BreadcrumbPage className="block truncate">{post.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-6 flex flex-col gap-3">
        <h1 className="text-2xl font-semibold leading-snug text-foreground sm:text-3xl">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <User className="size-3.5" />
            {post.author_name}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            {formatDate(dateLabel)}
          </span>
        </div>
      </div>

      {post.cover_image_url && (
        <div className="mb-8 aspect-[16/9] w-full overflow-hidden rounded-xl bg-muted">
          <img src={post.cover_image_url} alt={post.title} className="size-full object-cover" />
        </div>
      )}

      <div
        className="max-w-none text-sm leading-relaxed text-muted-foreground [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_h1]:mb-3 [&_h1]:mt-6 [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:text-foreground [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:font-semibold [&_h3]:text-foreground [&_img]:my-4 [&_img]:rounded-lg [&_li]:mb-1 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />

      {(relatedLoading || related.length > 0) && (
        <section ref={relatedRef} className="mt-12 border-t border-border pt-10">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">More from the Journal</h2>
            <Link
              to="/journal"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all
              <ChevronRight className="size-3.5" />
            </Link>
          </div>
          <Carousel opts={{ align: "start" }}>
            <CarouselContent className="-ml-4">
              {relatedLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <CarouselItem key={i} className="basis-4/5 pl-4 sm:basis-1/2">
                      <BlogCardSkeleton />
                    </CarouselItem>
                  ))
                : related.map((item) => (
                    <CarouselItem key={item.id} className="basis-4/5 pl-4 sm:basis-1/2">
                      <BlogCard post={item} />
                    </CarouselItem>
                  ))}
            </CarouselContent>
          </Carousel>
        </section>
      )}
    </div>
  );
}

function JournalDetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Skeleton className="mb-5 h-4 w-64" />
      <Skeleton className="mb-3 h-8 w-full" />
      <Skeleton className="mb-6 h-4 w-40" />
      <Skeleton className="mb-8 aspect-[16/9] w-full rounded-xl" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

function JournalNotFound() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-accent text-primary">
        <Newspaper className="size-6" strokeWidth={1.5} />
      </span>
      <h1 className="text-2xl font-semibold text-foreground">Article not found</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        This article may have been removed or is no longer available.
      </p>
      <Button asChild>
        <Link to="/journal">Back to Journal</Link>
      </Button>
    </div>
  );
}
