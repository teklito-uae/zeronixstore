import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { createProduct, listProducts, updateProduct } from "@/admin/api/products";
import { listCategories } from "@/admin/api/categories";
import { ApiError } from "@/admin/api/client";
import type { Category, ProductFormValues } from "@/admin/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const emptyForm: ProductFormValues = {
  name: "",
  category_id: "",
  price: "",
  sale_price: "",
  description: "",
  brand: "",
  cpu: "",
  gpu: "",
  ram: "",
  storage: "",
  featured: false,
  status: "active",
  badge: "",
  badge_color: "",
};

function flattenCategories(categories: Category[], depth = 0): { id: number; name: string; depth: number }[] {
  return categories.flatMap((cat) => [
    { id: cat.id, name: cat.name, depth },
    ...flattenCategories(cat.children ?? [], depth + 1),
  ]);
}

export default function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [values, setValues] = useState<ProductFormValues>(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    listCategories().then(setCategories).catch(() => toast.error("Failed to load categories."));
  }, []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    // No admin "show" endpoint exists — the product is located within the
    // paginated admin list instead of adding a new backend route.
    async function loadProduct(productId: string) {
      for (let page = 1; page <= 50; page += 1) {
        const result = await listProducts(page);
        const found = result.data.find((p) => String(p.id) === productId);
        if (found) return found;
        if (page >= result.last_page) break;
      }
      return null;
    }
    loadProduct(id)
      .then((product) => {
        if (cancelled) return;
        if (!product) {
          toast.error("Product not found.");
          navigate("/admin/products");
          return;
        }
        setValues({
          name: product.name,
          category_id: String(product.category_id),
          price: product.price,
          sale_price: product.sale_price ?? "",
          description: product.description ?? "",
          brand: product.brand ?? "",
          cpu: product.cpu ?? "",
          gpu: product.gpu ?? "",
          ram: product.ram ?? "",
          storage: product.storage ?? "",
          featured: product.featured,
          status: product.status,
          badge: product.badge ?? "",
          badge_color: product.badge_color ?? "",
        });
      })
      .catch(() => toast.error("Failed to load product."))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  function update<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      if (isEdit && id) {
        await updateProduct(Number(id), values);
        toast.success("Product updated.");
      } else {
        await createProduct(values);
        toast.success("Product created.");
      }
      navigate("/admin/products");
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setErrors(err.errors);
        toast.error("Please fix the highlighted fields.");
      } else {
        toast.error(err instanceof Error ? err.message : "Failed to save product.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const flatCategories = flattenCategories(categories);
  const fieldError = (field: string) => errors[field]?.[0];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">
          {isEdit ? "Edit product" : "New product"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isEdit ? "Update product details." : "Add a new product to the catalog."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basics</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                required
                value={values.name}
                onChange={(e) => update("name", e.target.value)}
                aria-invalid={Boolean(fieldError("name"))}
              />
              {fieldError("name") && <p className="text-xs text-destructive">{fieldError("name")}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Category</Label>
              <Select value={values.category_id} onValueChange={(v) => update("category_id", v)}>
                <SelectTrigger className="w-full" aria-invalid={Boolean(fieldError("category_id"))}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {flatCategories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {"—".repeat(cat.depth)} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldError("category_id") && (
                <p className="text-xs text-destructive">{fieldError("category_id")}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" value={values.brand} onChange={(e) => update("brand", e.target.value)} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="price">Price (AED)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                required
                value={values.price}
                onChange={(e) => update("price", e.target.value)}
                aria-invalid={Boolean(fieldError("price"))}
              />
              {fieldError("price") && <p className="text-xs text-destructive">{fieldError("price")}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sale_price">Sale price (AED)</Label>
              <Input
                id="sale_price"
                type="number"
                step="0.01"
                min="0"
                value={values.sale_price}
                onChange={(e) => update("sale_price", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                value={values.description}
                onChange={(e) => update("description", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Specifications</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cpu">CPU</Label>
              <Input id="cpu" value={values.cpu} onChange={(e) => update("cpu", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="gpu">GPU</Label>
              <Input id="gpu" value={values.gpu} onChange={(e) => update("gpu", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ram">RAM</Label>
              <Input id="ram" value={values.ram} onChange={(e) => update("ram", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="storage">Storage</Label>
              <Input
                id="storage"
                value={values.storage}
                onChange={(e) => update("storage", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Merchandising</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select
                value={values.status}
                onValueChange={(v) => update("status", v as ProductFormValues["status"])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 self-end pb-1.5">
              <Switch
                id="featured"
                checked={values.featured}
                onCheckedChange={(v) => update("featured", v)}
              />
              <Label htmlFor="featured">Featured product</Label>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="badge">Badge text</Label>
              <Input
                id="badge"
                placeholder="e.g. New"
                value={values.badge}
                onChange={(e) => update("badge", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="badge_color">Badge color</Label>
              <Input
                id="badge_color"
                placeholder="e.g. emerald"
                value={values.badge_color}
                onChange={(e) => update("badge_color", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate("/admin/products")}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? <Loader2 className="animate-spin" /> : <Save />}
            {isEdit ? "Save changes" : "Create product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
