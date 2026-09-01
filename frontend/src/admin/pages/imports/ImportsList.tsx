import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ImageOff, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { listRecentImports, startJsonImport } from "@/admin/api/imports";
import { listCategories } from "@/admin/api/categories";
import { ApiError } from "@/admin/api/client";
import { ImportJobStatusBadge } from "@/admin/components/StatusBadge";
import type { Category, ImportJob } from "@/admin/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FlatCategory extends Category {
  depth: number;
}

function flatten(categories: Category[], depth = 0): FlatCategory[] {
  return categories.flatMap((cat) => [
    { ...cat, depth },
    ...flatten(cat.children ?? [], depth + 1),
  ]);
}

const ACTIVE_STATUSES: ImportJob["status"][] = [
  "pending",
  "crawling_links",
  "scraping_products",
  "downloading_images",
];

/**
 * Accepts either a flat array of product objects, a single product object,
 * or Microless's native export shape (an array of `{ category, products }`
 * groups). Embedded category info is always discarded — the admin's own
 * category selection in the form is what the import gets attached to.
 */
function extractProducts(parsed: unknown): unknown[] {
  if (!Array.isArray(parsed)) return [parsed];
  const isGrouped = parsed.every(
    (item) => item && typeof item === "object" && Array.isArray((item as { products?: unknown }).products),
  );
  if (isGrouped) {
    return parsed.flatMap((item) => (item as { products: unknown[] }).products);
  }
  return parsed;
}

interface PreviewRow {
  image: string | null;
  title: string;
  price: string | null;
  sku: string | null;
  url: string | null;
}

function toPreviewRow(raw: unknown): PreviewRow {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const activeOffer = obj.active_offer as Record<string, unknown> | undefined;
  const priceFormatted = activeOffer?.price_formatted;
  const priceRaw = activeOffer?.price ?? obj.price;

  return {
    image: (obj.cover_image_url as string) ?? (obj.image as string) ?? null,
    title: (obj.title as string) ?? (obj.name as string) ?? "Untitled product",
    price:
      typeof priceFormatted === "string" && priceFormatted
        ? priceFormatted
        : priceRaw != null
          ? `AED ${priceRaw}`
          : null,
    sku: (obj.SKU as string) ?? (obj.sku as string) ?? null,
    url: (obj.url as string) ?? (obj.product_url as string) ?? null,
  };
}

export default function ImportsList() {
  const [jobs, setJobs] = useState<ImportJob[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Guards against the 4s poll and an explicit post-import load() resolving
  // out of order — without this, a poll fired just before an import can
  // land just after it and clobber the fresh list with a stale one.
  const loadSeq = useRef(0);

  const [jsonLocalCategoryId, setJsonLocalCategoryId] = useState("");
  const [jsonText, setJsonText] = useState("");
  const [jsonBrandsStr, setJsonBrandsStr] = useState("");

  // Parsed client-side by "Preview" — nothing is sent to the server until
  // "Import" is pressed on the preview screen.
  const [previewProducts, setPreviewProducts] = useState<unknown[] | null>(null);

  function load() {
    const seq = ++loadSeq.current;
    listRecentImports()
      .then((data) => {
        if (seq === loadSeq.current) setJobs(data);
      })
      .catch(() => toast.error("Failed to load imports."));
  }

  useEffect(() => {
    load();
    listCategories().then(setCategories).catch(() => toast.error("Failed to load categories."));
  }, []);

  useEffect(() => {
    const hasActive = jobs?.some((j) => ACTIVE_STATUSES.includes(j.status));
    if (pollRef.current) clearInterval(pollRef.current);
    if (hasActive) {
      pollRef.current = setInterval(load, 4000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs]);

  const flatCategories = flatten(categories);

  function resetForm() {
    setPreviewProducts(null);
    setJsonText("");
    setJsonBrandsStr("");
    setJsonLocalCategoryId("");
  }

  function handleSheetOpenChange(open: boolean) {
    setSheetOpen(open);
    if (!open) resetForm();
  }

  function handlePreview(e: FormEvent) {
    e.preventDefault();
    if (!jsonLocalCategoryId) {
      toast.error("Select a category first.");
      return;
    }
    if (!jsonText.trim()) {
      toast.error("Paste some product JSON first.");
      return;
    }
    let products: unknown[];
    try {
      products = extractProducts(JSON.parse(jsonText));
    } catch {
      toast.error("That's not valid JSON.");
      return;
    }
    if (products.length === 0) {
      toast.error("No products found in that JSON.");
      return;
    }
    setPreviewProducts(products);
  }

  async function handleImport() {
    if (!previewProducts) return;
    setSubmitting(true);
    try {
      await startJsonImport({
        local_category_id: Number(jsonLocalCategoryId),
        products: previewProducts,
        category_brands_str: jsonBrandsStr || undefined,
      });
      toast.success(`Import started for ${previewProducts.length} product(s).`);
      setSheetOpen(false);
      resetForm();
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to start import.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Imports</h1>
          <p className="text-sm text-muted-foreground">
            Paste a Microless product JSON feed, preview it, then import.
          </p>
        </div>
        <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
          <SheetTrigger asChild>
            <Button>
              <Plus />
              New import
            </Button>
          </SheetTrigger>
          <SheetContent className="flex w-full flex-col gap-0 p-0 data-[side=right]:sm:max-w-2xl">
            <SheetHeader className="border-b">
              <SheetTitle>
                {previewProducts ? `Preview — ${previewProducts.length} product(s)` : "Import from JSON"}
              </SheetTitle>
            </SheetHeader>

            {!previewProducts && (
              <form
                onSubmit={handlePreview}
                className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4"
              >
                <div className="flex flex-col gap-1.5">
                  <Label>Local category</Label>
                  <Select value={jsonLocalCategoryId} onValueChange={setJsonLocalCategoryId}>
                    <SelectTrigger className="w-full">
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
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="json-brands">Brand names</Label>
                  <Input
                    id="json-brands"
                    value={jsonBrandsStr}
                    onChange={(e) => setJsonBrandsStr(e.target.value)}
                    placeholder="comma-separated, optional"
                  />
                </div>
                <div className="flex min-h-0 flex-1 flex-col gap-1.5">
                  <Label htmlFor="json-products">Products JSON</Label>
                  <Textarea
                    id="json-products"
                    required
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    placeholder='[{"title": "...", "active_offer": {"price": 0}}]'
                    className="h-72 resize-none overflow-y-auto font-mono text-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    Accepts a flat product array, a single product, or a Microless export
                    (category + products groups — category info is ignored, products are
                    flattened into the category selected above).
                  </p>
                </div>
                <SheetFooter className="flex-row justify-end gap-2 border-t px-0 py-3">
                  <Button type="button" variant="outline" onClick={() => setSheetOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Preview</Button>
                </SheetFooter>
              </form>
            )}

            {previewProducts && (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-14">Image</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewProducts.map((raw, idx) => {
                        const row = toPreviewRow(raw);
                        return (
                          <TableRow key={idx}>
                            <TableCell>
                              <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                                {row.image ? (
                                  <img
                                    src={row.image}
                                    alt=""
                                    className="size-full object-cover"
                                  />
                                ) : (
                                  <ImageOff className="size-4 text-muted-foreground" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[220px]">
                              <p className="truncate font-medium">{row.title}</p>
                              {row.url && (
                                <p className="truncate text-xs text-muted-foreground">{row.url}</p>
                              )}
                            </TableCell>
                            <TableCell className="max-w-[140px] truncate text-muted-foreground">
                              {row.sku ?? "—"}
                            </TableCell>
                            <TableCell className="text-right tabular-nums whitespace-nowrap">
                              {row.price ?? "—"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <SheetFooter className="flex-row justify-end gap-2 border-t px-4 py-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPreviewProducts(null)}
                    disabled={submitting}
                  >
                    Back
                  </Button>
                  <Button type="button" onClick={handleImport} disabled={submitting}>
                    {submitting && <Loader2 className="animate-spin" />}
                    Import {previewProducts.length} product(s)
                  </Button>
                </SheetFooter>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Progress</TableHead>
                <TableHead className="text-right">Failed</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs === null && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center">
                    <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              )}
              {jobs?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No imports yet.
                  </TableCell>
                </TableRow>
              )}
              {jobs?.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="max-w-xs truncate">
                    <Link to={`/admin/imports/${job.id}`} className="font-medium hover:underline">
                      {job.source_category_url}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {job.local_category?.name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <ImportJobStatusBadge status={job.status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {job.processed_count}/{job.total_found || "?"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {job.failed_count > 0 ? (
                      <span className="text-destructive">{job.failed_count}</span>
                    ) : (
                      0
                    )}
                  </TableCell>
                  <TableCell>
                    <Link to={`/admin/imports/${job.id}`}>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </Link>
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
