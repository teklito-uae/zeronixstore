import { ArrowRight, Newspaper } from "lucide-react";
import { Link } from "react-router-dom";
import { BlogCard, BlogCardSkeleton } from "@/components/blog/BlogCard";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useLazyBlogPosts } from "@/features/blog/useLazyBlogPosts";

export function BlogCarousel() {
  const { ref, posts, loading } = useLazyBlogPosts(10);

  if (!loading && posts.length === 0) return null;

  return (
    <section ref={ref} className="relative py-6 sm:py-10">
      <Carousel opts={{ align: "start" }} className="relative mx-auto max-w-7xl px-4">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <span className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              <Newspaper className="size-3.5" />
              Zeronix Journal
            </span>
            <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
              Tech news, guides &amp; buying advice
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Straight from the Zeronix team — reviews, comparisons and how-tos.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/journal">
                View all
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
            <div className="hidden items-center gap-1.5 sm:flex">
              <CarouselPrevious className="static size-8 translate-x-0 translate-y-0" />
              <CarouselNext className="static size-8 translate-x-0 translate-y-0" />
            </div>
          </div>
        </div>

        <CarouselContent className="-ml-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <CarouselItem key={i} className="basis-4/5 pl-4 sm:basis-1/2 lg:basis-1/4">
                  <BlogCardSkeleton />
                </CarouselItem>
              ))
            : posts.map((post) => (
                <CarouselItem key={post.id} className="basis-4/5 pl-4 sm:basis-1/2 lg:basis-1/4">
                  <BlogCard post={post} />
                </CarouselItem>
              ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
