import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronDown, Loader2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { createProduct, getProduct, updateProduct } from "@/admin/api/products";
import { createVariant, deleteVariant, updateVariant } from "@/admin/api/variants";
import { listCategories } from "@/admin/api/categories";
import { ApiError } from "@/admin/api/client";
import { usePageActions } from "@/admin/components/AdminShell";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog";
import { RichTextEditor } from "@/admin/components/RichTextEditor";
import type { Category, Product, ProductFormValues, Variant, VariantFormValues } from "@/admin/types";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function Section({
  title,
  description,
  action,
  defaultOpen = true,
  columns = 2,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  defaultOpen?: boolean;
  columns?: 1 | 2;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
          <CardAction className="flex items-center gap-1">
            {action}
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={open ? `Collapse ${title}` : `Expand ${title}`}
              >
                <ChevronDown className={cn("transition-transform duration-200", open && "rotate-180")} />
              </Button>
            </CollapsibleTrigger>
          </CardAction>
        </CardHeader>
        <CollapsibleContent>
          <CardContent
            className={cn(
              "grid grid-cols-1 gap-4 pt-1",
              columns === 2 && "sm:grid-cols-2",
            )}
          >
            {children}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

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
  stock: "",
  badge: "",
  badge_color: "",
};

const emptyVariantForm: VariantFormValues = {
  sku: "",
  name: "",
  price: "",
  stock: "",
  attributes: [],
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
  const [product, setProduct] = useState<Product | null>(null);
  const [values, setValues] = useState<ProductFormValues>(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [variantValues, setVariantValues] = useState<VariantFormValues>(emptyVariantForm);
  const [variantSubmitting, setVariantSubmitting] = useState(false);

  useEffect(() => {
    listCategories().then(setCategories).catch(() => toast.error("Failed to load categories."));
  }, []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getProduct(Number(id))
      .then((loaded) => {
        if (cancelled) return;
        setProduct(loaded);
        setValues({
          name: loaded.name,
          category_id: String(loaded.category_id),
          price: loaded.price,
          sale_price: loaded.sale_price ?? "",
          description: loaded.description ?? "",
          brand: loaded.brand ?? "",
          cpu: loaded.cpu ?? "",
          gpu: loaded.gpu ?? "",
          ram: loaded.ram ?? "",
          storage: loaded.storage ?? "",
          featured: loaded.featured,
          status: loaded.status,
          stock: String(loaded.stock ?? 0),
          badge: loaded.badge ?? "",
          badge_color: loaded.badge_color ?? "",
        });
      })
      .catch(() => {
        if (cancelled) return;
        toast.error("Product not found.");
        navigate("/admin/products");
      })
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

  function openCreateVariant() {
    setEditingVariant(null);
    setVariantValues(emptyVariantForm);
    setVariantDialogOpen(true);
  }

  function openEditVariant(variant: Variant) {
    setEditingVariant(variant);
    setVariantValues({
      sku: variant.sku,
      name: variant.name,
      price: variant.price,
      stock: String(variant.stock),
      attributes: Object.entries(variant.attributes ?? {}).map(([key, value]) => ({ key, value })),
    });
    setVariantDialogOpen(true);
  }

  function updateVariantField<K extends keyof VariantFormValues>(key: K, value: VariantFormValues[K]) {
    setVariantValues((prev) => ({ ...prev, [key]: value }));
  }

  function addAttributeRow() {
    setVariantValues((prev) => ({ ...prev, attributes: [...prev.attributes, { key: "", value: "" }] }));
  }

  function updateAttributeRow(index: number, field: "key" | "value", value: string) {
    setVariantValues((prev) => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) => (i === index ? { ...attr, [field]: value } : attr)),
    }));
  }

  function removeAttributeRow(index: number) {
    setVariantValues((prev) => ({ ...prev, attributes: prev.attributes.filter((_, i) => i !== index) }));
  }

  async function handleVariantSubmit(e: FormEvent) {
    e.preventDefault();
    if (!product) return;
    setVariantSubmitting(true);
    try {
      if (editingVariant) {
        const updated = await updateVariant(product.id, editingVariant.id, variantValues);
        setProduct((prev) =>
          prev ? { ...prev, variants: (prev.variants ?? []).map((v) => (v.id === updated.id ? updated : v)) } : prev,
        );
        toast.success("Variant updated.");
      } else {
        const created = await createVariant(product.id, variantValues);
        setProduct((prev) => (prev ? { ...prev, variants: [...(prev.variants ?? []), created] } : prev));
        toast.success("Variant added.");
      }
      setVariantDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save variant.");
    } finally {
      setVariantSubmitting(false);
    }
  }

  async function handleDeleteVariant(variant: Variant) {
    if (!product) return;
    try {
      await deleteVariant(product.id, variant.id);
      setProduct((prev) => (prev ? { ...prev, variants: (prev.variants ?? []).filter((v) => v.id !== variant.id) } : prev));
      toast.success("Variant deleted.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete variant.");
    }
  }

  usePageActions(
    <>
      <Button type="button" variant="outline" onClick={() => navigate("/admin/products")}>
        Cancel
      </Button>
      <Button type="submit" form="product-form" disabled={submitting || loading}>
        {submitting ? <Loader2 className="animate-spin" /> : <Save />}
        {isEdit ? "Save changes" : "Create product"}
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

  const flatCategories = flattenCategories(categories);
  const fieldError = (field: string) => errors[field]?.[0];
  const variants = product?.variants ?? [];
  const hasVariants = variants.length > 0;

  return (
    <div className="flex w-full max-w-[1400px] flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        {isEdit ? "Update product details." : "Add a new product to the catalog."}
      </p>

      <form
        id="product-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start"
      >
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Section title="Basics">
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

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <RichTextEditor
                value={values.description}
                onChange={(html) => update("description", html)}
                placeholder="Describe the product, its features and what makes it great…"
                enableTables
                contentHeight="320px"
              />
              {fieldError("description") && (
                <p className="text-xs text-destructive">{fieldError("description")}</p>
              )}
            </div>
          </Section>

          <Section title="Pricing & inventory">
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

            {hasVariants ? (
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label>Stock</Label>
                <p className="text-sm text-muted-foreground">Stock is tracked per variant below.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  step="1"
                  min="0"
                  value={values.stock}
                  onChange={(e) => update("stock", e.target.value)}
                  className="sm:max-w-56"
                />
              </div>
            )}
          </Section>

          <Section title="Specifications" description="Shown on the storefront spec sheet when filled in.">
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
          </Section>

          {isEdit && product && (
            <Section
              title="Variants"
              columns={1}
              action={
                <Button type="button" size="sm" variant="outline" onClick={openCreateVariant}>
                  <Plus />
                  Add variant
                </Button>
              }
            >
              {variants.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No variants yet. Add options like RAM, Storage, Color, or OS — each variant gets
                  its own SKU, price, and stock, and customers pick between them on the storefront.
                </p>
              ) : (
                <ul className="flex flex-col divide-y">
                  {variants.map((variant) => (
                    <li key={variant.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium">
                          {variant.name}{" "}
                          <span className="font-normal text-muted-foreground">· {variant.sku}</span>
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {Object.entries(variant.attributes ?? {}).map(([key, value]) => (
                            <Badge key={key} variant="outline">
                              {key}: {value}
                            </Badge>
                          ))}
                          <span className="text-xs text-muted-foreground">
                            {formatPrice(variant.price)} · {variant.stock} in stock
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEditVariant(variant)}
                        >
                          <Pencil />
                        </Button>
                        <ConfirmDialog
                          trigger={
                            <Button type="button" variant="ghost" size="icon-sm" className="text-destructive">
                              <Trash2 />
                            </Button>
                          }
                          title={`Delete variant "${variant.name}"?`}
                          description="This will remove the variant from the storefront. This action cannot be undone."
                          onConfirm={() => handleDeleteVariant(variant)}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <Section title="Organization" columns={1}>
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
          </Section>

          <Section title="Status & visibility" columns={1}>
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

            <div className="flex items-center gap-2">
              <Switch
                id="featured"
                checked={values.featured}
                onCheckedChange={(v) => update("featured", v)}
              />
              <Label htmlFor="featured">Featured product</Label>
            </div>
          </Section>

          <Section
            title="Merchandising badge"
            description="Optional highlight badge shown on product cards."
            columns={1}
            defaultOpen={false}
          >
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
          </Section>
        </div>
      </form>

      <Dialog open={variantDialogOpen} onOpenChange={setVariantDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingVariant ? "Edit variant" : "Add variant"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleVariantSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="variant-sku">SKU</Label>
                <Input
                  id="variant-sku"
                  required
                  value={variantValues.sku}
                  onChange={(e) => updateVariantField("sku", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="variant-name">Name</Label>
                <Input
                  id="variant-name"
                  required
                  value={variantValues.name}
                  onChange={(e) => updateVariantField("name", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="variant-price">Price (AED)</Label>
                <Input
                  id="variant-price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={variantValues.price}
                  onChange={(e) => updateVariantField("price", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="variant-stock">Stock</Label>
                <Input
                  id="variant-stock"
                  type="number"
                  step="1"
                  min="0"
                  required
                  value={variantValues.stock}
                  onChange={(e) => updateVariantField("stock", e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label>Attributes</Label>
                <Button type="button" variant="outline" size="sm" onClick={addAttributeRow}>
                  <Plus />
                  Add attribute
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                e.g. RAM / 16GB, Storage / 512GB SSD, Color / Midnight Black — whatever options make
                sense for this product's category.
              </p>
              {variantValues.attributes.map((attr, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder="Attribute (e.g. RAM)"
                    value={attr.key}
                    onChange={(e) => updateAttributeRow(index, "key", e.target.value)}
                  />
                  <Input
                    placeholder="Value (e.g. 16GB)"
                    value={attr.value}
                    onChange={(e) => updateAttributeRow(index, "value", e.target.value)}
                  />
                  <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeAttributeRow(index)}>
                    <X />
                  </Button>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setVariantDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={variantSubmitting}>
                {variantSubmitting && <Loader2 className="animate-spin" />}
                {editingVariant ? "Save variant" : "Add variant"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
