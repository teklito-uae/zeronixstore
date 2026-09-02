import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ImageOff, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { createBlogPost, listBlogPosts, updateBlogPost } from "@/admin/api/blog";
import { ApiError } from "@/admin/api/client";
import { usePageActions } from "@/admin/components/AdminShell";
import { RichTextEditor } from "@/admin/components/RichTextEditor";
import type { BlogPostFormValues } from "@/admin/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const emptyForm: BlogPostFormValues = {
  title: "",
  excerpt: "",
  content: "",
  author_name: "Zeronix Team",
  status: "draft",
  meta_title: "",
  meta_description: "",
};

export default function BlogForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [values, setValues] = useState<BlogPostFormValues>(emptyForm);
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    // No admin "show" endpoint exists — the article is located within the
    // paginated admin list instead of adding a new backend route.
    async function loadPost(postId: string) {
      for (let page = 1; page <= 50; page += 1) {
        const result = await listBlogPosts(page);
        const found = result.data.find((p) => String(p.id) === postId);
        if (found) return found;
        if (page >= result.last_page) break;
      }
      return null;
    }
    loadPost(id)
      .then((post) => {
        if (cancelled) return;
        if (!post) {
          toast.error("Article not found.");
          navigate("/admin/blog");
          return;
        }
        setValues({
          title: post.title,
          excerpt: post.excerpt ?? "",
          content: post.content,
          author_name: post.author_name,
          status: post.status,
          meta_title: post.meta_title ?? "",
          meta_description: post.meta_description ?? "",
        });
        setExistingCoverUrl(post.cover_image_url);
      })
      .catch(() => toast.error("Failed to load article."))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  function update<K extends keyof BlogPostFormValues>(key: K, value: BlogPostFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      if (isEdit && id) {
        await updateBlogPost(Number(id), values);
        toast.success("Article updated.");
      } else {
        await createBlogPost(values);
        toast.success("Article created.");
      }
      navigate("/admin/blog");
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setErrors(err.errors);
        toast.error("Please fix the highlighted fields.");
      } else {
        toast.error(err instanceof Error ? err.message : "Failed to save article.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const newCoverFile = values.cover_image ?? null;
  const newCoverPreview = useMemo(
    () => (newCoverFile ? URL.createObjectURL(newCoverFile) : null),
    [newCoverFile],
  );
  useEffect(() => {
    return () => {
      if (newCoverPreview) URL.revokeObjectURL(newCoverPreview);
    };
  }, [newCoverPreview]);

  usePageActions(
    <>
      <Button type="button" variant="outline" onClick={() => navigate("/admin/blog")}>
        Cancel
      </Button>
      <Button type="submit" form="blog-form" disabled={submitting || loading}>
        {submitting ? <Loader2 className="animate-spin" /> : <Save />}
        {isEdit ? "Save changes" : "Publish article"}
      </Button>
    </>,
  );

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const fieldError = (field: string) => errors[field]?.[0];
  const coverPreview = newCoverPreview ?? existingCoverUrl;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        {isEdit ? "Update this Zeronix Journal article." : "Publish a new article to the Zeronix Journal."}
      </p>

      <form id="blog-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basics</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                required
                value={values.title}
                onChange={(e) => update("title", e.target.value)}
                aria-invalid={Boolean(fieldError("title"))}
              />
              {fieldError("title") && <p className="text-xs text-destructive">{fieldError("title")}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="author_name">Author</Label>
              <Input
                id="author_name"
                value={values.author_name}
                onChange={(e) => update("author_name", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select value={values.status} onValueChange={(v) => update("status", v as BlogPostFormValues["status"])}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                rows={2}
                placeholder="Short summary shown on cards and previews"
                value={values.excerpt}
                onChange={(e) => update("excerpt", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="cover-image">
                Cover image {isEdit && "(leave empty to keep current)"}
              </Label>
              <div className="flex items-center gap-3">
                <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                  {coverPreview ? (
                    <img src={coverPreview} alt="" className="size-full object-cover" />
                  ) : (
                    <ImageOff className="size-5 text-muted-foreground" />
                  )}
                </div>
                <Input
                  id="cover-image"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => update("cover_image", e.target.files?.[0] ?? null)}
                  aria-invalid={Boolean(fieldError("cover_image"))}
                />
              </div>
              {fieldError("cover_image") && (
                <p className="text-xs text-destructive">{fieldError("cover_image")}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent>
            <RichTextEditor value={values.content} onChange={(html) => update("content", html)} />
            {fieldError("content") && (
              <p className="mt-2 text-xs text-destructive">{fieldError("content")}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SEO (optional)</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="meta_title">Meta title</Label>
              <Input
                id="meta_title"
                value={values.meta_title}
                onChange={(e) => update("meta_title", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="meta_description">Meta description</Label>
              <Textarea
                id="meta_description"
                rows={2}
                value={values.meta_description}
                onChange={(e) => update("meta_description", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
