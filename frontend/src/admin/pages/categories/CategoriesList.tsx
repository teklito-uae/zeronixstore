import { useEffect, useRef, useState, type FormEvent } from "react";
import { Loader2, Pencil, Plus, Trash2, ImageOff } from "lucide-react";
import { toast } from "sonner";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
  type CategoryFormValues,
} from "@/admin/api/categories";
import { ApiError } from "@/admin/api/client";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog";
import type { Category } from "@/admin/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FlatCategory extends Category {
  depth: number;
}

function flatten(categories: Category[], depth = 0): FlatCategory[] {
  return categories.flatMap((cat) => [
    { ...cat, depth },
    ...flatten(cat.children ?? [], depth + 1),
  ]);
}

const emptyForm: CategoryFormValues = {
  name: "",
  description: "",
  parent_id: "",
  microless_category_id: "",
  image: null,
};

export default function CategoriesList() {
  const [tree, setTree] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [values, setValues] = useState<CategoryFormValues>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function load() {
    setLoading(true);
    listCategories()
      .then(setTree)
      .catch(() => toast.error("Failed to load categories."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const flat = flatten(tree);

  function openCreate() {
    setEditing(null);
    setValues(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setValues({
      name: category.name,
      description: category.description ?? "",
      parent_id: category.parent_id ? String(category.parent_id) : "",
      microless_category_id: category.microless_category_id ?? "",
      image: null,
    });
    setDialogOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await updateCategory(editing.id, values);
        toast.success("Category updated.");
      } else {
        await createCategory(values);
        toast.success("Category created.");
      }
      setDialogOpen(false);
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save category.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(category: Category) {
    try {
      await deleteCategory(category.id);
      toast.success(`Deleted "${category.name}".`);
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete category.");
    }
  }

  const parentOptions = flat.filter((c) => c.id !== editing?.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Categories</h1>
          <p className="text-sm text-muted-foreground">Organize the storefront's category tree.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus />
              New category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit category" : "New category"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cat-name">Name</Label>
                <Input
                  id="cat-name"
                  required
                  value={values.name}
                  onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Parent category</Label>
                <Select
                  value={values.parent_id || "none"}
                  onValueChange={(v) => setValues((s) => ({ ...s, parent_id: v === "none" ? "" : v }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="None (top-level)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (top-level)</SelectItem>
                    {parentOptions.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {"—".repeat(cat.depth)} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cat-description">Description</Label>
                <Textarea
                  id="cat-description"
                  rows={3}
                  value={values.description}
                  onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cat-microless-id">Microless category ID</Label>
                <Input
                  id="cat-microless-id"
                  value={values.microless_category_id}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, microless_category_id: e.target.value }))
                  }
                  placeholder="e.g. 1603"
                />
                <p className="text-xs text-muted-foreground">
                  Optional. When set, the scheduled Microless refresh (daily) pulls new products
                  into this category automatically.
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cat-image">Image {editing && "(leave empty to keep current)"}</Label>
                <Input
                  id="cat-image"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setValues((v) => ({ ...v, image: e.target.files?.[0] ?? null }))}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="animate-spin" />}
                  {editing ? "Save changes" : "Create category"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading && (
            <div className="flex justify-center py-10">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {!loading && flat.length === 0 && (
            <p className="py-10 text-center text-muted-foreground">No categories yet.</p>
          )}
          {!loading && flat.length > 0 && (
            <ul className="divide-y">
              {flat.map((cat) => (
                <li key={cat.id} className="flex items-center gap-3 px-4 py-3">
                  <div
                    className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted"
                    style={{ marginLeft: cat.depth * 20 }}
                  >
                    {cat.image_url ? (
                      <img src={cat.image_url} alt="" className="size-full object-cover" />
                    ) : (
                      <ImageOff className="size-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{cat.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {cat.total_products_count} product{cat.total_products_count === 1 ? "" : "s"}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon-sm" onClick={() => openEdit(cat)}>
                    <Pencil />
                  </Button>
                  <ConfirmDialog
                    trigger={
                      <Button variant="ghost" size="icon-sm" className="text-destructive">
                        <Trash2 />
                      </Button>
                    }
                    title={`Delete "${cat.name}"?`}
                    description="Products in this category won't be deleted, but they'll lose this category association."
                    onConfirm={() => handleDelete(cat)}
                  />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
