import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ImageOff, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteBlogPost, listBlogPosts } from "@/admin/api/blog";
import { ApiError } from "@/admin/api/client";
import { usePageActions, usePageFooter } from "@/admin/components/AdminShell";
import { Pager } from "@/admin/components/Pager";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog";
import { BlogPostStatusBadge } from "@/admin/components/StatusBadge";
import type { BlogPost, Paginated } from "@/admin/types";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function BlogList() {
  const [result, setResult] = useState<Paginated<BlogPost> | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listBlogPosts(page, search)
      .then(setResult)
      .catch(() => toast.error("Failed to load articles."))
      .finally(() => setLoading(false));
  }, [page, search]);

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  async function handleDelete(post: BlogPost) {
    try {
      await deleteBlogPost(post.id);
      toast.success(`Deleted "${post.title}".`);
      setResult((prev) =>
        prev ? { ...prev, data: prev.data.filter((p) => p.id !== post.id) } : prev,
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete article.");
    }
  }

  usePageActions(
    <Button asChild>
      <Link to="/admin/blog/new">
        <Plus />
        New article
      </Link>
    </Button>,
  );

  usePageFooter(
    result && <Pager currentPage={result.current_page} lastPage={result.last_page} onPageChange={setPage} />,
  );

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        {result ? `${result.total} article${result.total === 1 ? "" : "s"}` : "Loading…"}
      </p>

      <form onSubmit={handleSearchSubmit} className="flex max-w-sm gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search articles…"
            className="pl-8"
          />
        </div>
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Article</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center">
                    <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              )}
              {!loading && result?.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    No articles found.
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                result?.data.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="max-w-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                          {post.cover_image_url ? (
                            <img src={post.cover_image_url} alt="" className="size-full object-cover" />
                          ) : (
                            <ImageOff className="size-4 text-muted-foreground" />
                          )}
                        </div>
                        <span className="truncate font-medium">{post.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{post.author_name}</TableCell>
                    <TableCell>
                      <BlogPostStatusBadge status={post.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {post.published_at ? formatDate(post.published_at) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon-sm" asChild>
                        <Link to={`/admin/blog/${post.id}/edit`}>
                          <Pencil />
                        </Link>
                      </Button>
                      <ConfirmDialog
                        trigger={
                          <Button variant="ghost" size="icon-sm" className="text-destructive">
                            <Trash2 />
                          </Button>
                        }
                        title={`Delete "${post.title}"?`}
                        description="This will remove the article from the storefront. This action cannot be undone."
                        onConfirm={() => handleDelete(post)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
