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
        <div className="mb-3 flex items-end justify-between gap-3 sm:mb-5 sm:gap-4">
          <div>
            <span className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary sm:px-3 sm:py-1 sm:text-xs">
              <Newspaper className="size-3" />
              Zeronix Journal
            </span>
            <h2 className="text-base font-semibold text-foreground sm:text-2xl">
              Tech news, guides &amp; buying advice
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground sm:mt-1 sm:text-sm">
              Straight from the Zeronix team — reviews, comparisons and how-tos.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm">
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

        <CarouselContent className="-ml-2.5 sm:-ml-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <CarouselItem key={i} className="basis-1/2 pl-2.5 sm:basis-1/2 sm:pl-4 lg:basis-1/4">
                  <BlogCardSkeleton />
                </CarouselItem>
              ))
            : posts.map((post) => (
                <CarouselItem key={post.id} className="basis-1/2 pl-2.5 sm:basis-1/2 sm:pl-4 lg:basis-1/4">
                  <BlogCard post={post} />
                </CarouselItem>
              ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
