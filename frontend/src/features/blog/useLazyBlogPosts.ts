import { useEffect, useState } from "react";
import { useInView } from "@/lib/useInView";
import { fetchBlogPosts } from "./api";
import type { BlogPost } from "./types";

interface LazyBlogPostsOptions {
  perPage?: number;
  /** Client-side filter applied after fetch, e.g. excluding the current post on its detail page. */
  filter?: (post: BlogPost) => boolean;
  limit?: number;
}

/**
 * Mirrors useLazyProducts: fetches only once the section scrolls near the
 * viewport instead of firing on mount alongside every other home section.
 */
export function useLazyBlogPosts(perPageOrOptions: number | LazyBlogPostsOptions = 10) {
  const { perPage = 10, filter, limit } =
    typeof perPageOrOptions === "number" ? { perPage: perPageOrOptions } : perPageOrOptions;
  const { ref, inView } = useInView<HTMLElement>();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!inView) return;
    let cancelled = false;

    fetchBlogPosts({ perPage })
      .then((res) => {
        if (cancelled) return;
        const data = filter ? res.data.filter(filter) : res.data;
        setPosts(limit ? data.slice(0, limit) : data);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return { ref, posts, loading };
}
