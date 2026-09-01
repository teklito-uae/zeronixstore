import { useState } from "react";
import { Link } from "react-router-dom";
import { Newspaper } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { BlogCard, BlogCardSkeleton } from "@/components/blog/BlogCard";
import { ProductPaginationBar } from "@/components/product/ProductPaginationBar";
import { useBlogPosts } from "@/features/blog/useBlogPosts";

export default function Journal() {
  const [page, setPage] = useState(1);
  const { posts, meta, loading } = useBlogPosts(page, 12);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Zeronix Journal</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8 flex flex-col gap-2">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
          <Newspaper className="size-3.5" />
          Zeronix Journal
        </span>
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Tech news, guides &amp; buying advice</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Reviews, comparisons and how-tos from the Zeronix team, so you can buy the right gear the first time.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <BlogCardSkeleton key={i} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
          <Newspaper className="size-8 text-muted-foreground" strokeWidth={1.25} />
          <p className="text-sm font-medium text-foreground">No articles yet</p>
          <p className="text-sm text-muted-foreground">Check back soon for tech news and buying guides.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {meta && (
        <div className="mt-8">
          <ProductPaginationBar page={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
