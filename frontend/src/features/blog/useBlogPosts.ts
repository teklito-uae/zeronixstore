import { useEffect, useState } from "react";
import { fetchBlogPosts } from "./api";
import type { BlogPost } from "./types";

/** Paginated fetch for the full Journal archive page (not lazy — the page itself is the destination). */
export function useBlogPosts(page: number, perPage = 12) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; total: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchBlogPosts({ page, perPage })
      .then((res) => {
        if (cancelled) return;
        setPosts(res.data);
        setMeta(res.meta ?? null);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, perPage]);

  return { posts, meta, loading };
}
