import { useEffect, useState } from "react";
import { fetchBlogPost, BlogPostNotFoundError } from "./api";
import type { BlogPost } from "./types";

interface BlogPostState {
  post: BlogPost | null;
  loading: boolean;
  notFound: boolean;
}

export function useBlogPost(slug: string | undefined) {
  const [state, setState] = useState<BlogPostState>({ post: null, loading: true, notFound: false });

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setState({ post: null, loading: true, notFound: false });

    fetchBlogPost(slug)
      .then((post) => {
        if (cancelled) return;
        setState({ post, loading: false, notFound: false });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ post: null, loading: false, notFound: err instanceof BlogPostNotFoundError });
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return state;
}
