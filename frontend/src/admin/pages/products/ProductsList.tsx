import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ImageOff, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { bulkDeleteProducts, deleteProduct, listProducts } from "@/admin/api/products";
import { ApiError } from "@/admin/api/client";
import { usePageActions, usePageFooter } from "@/admin/components/AdminShell";
import { Pager } from "@/admin/components/Pager";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog";
import { ProductStatusBadge } from "@/admin/components/StatusBadge";
import type { Paginated, Product } from "@/admin/types";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const LOW_STOCK_THRESHOLD = 10;

function getStockStatus(stock: number): { label: string; className: string } {
  if (stock <= 0) return { label: "Out of stock", className: "text-red-600 dark:text-red-400" };
  if (stock < LOW_STOCK_THRESHOLD) return { label: "Low stock", className: "text-amber-600 dark:text-amber-400" };
  return { label: "In stock", className: "text-emerald-600 dark:text-emerald-400" };
}

function effectiveStock(product: Product): number {
  return product.variants_sum_stock !== null ? product.variants_sum_stock : product.stock;
}

type Tab = "all" | "draft" | "promoted";
type StatusFilter = "" | "active" | "draft";

interface Filters {
  search: string;
  date: string;
  status: StatusFilter;
}

const emptyFilters: Filters = { search: "", date: "", status: "" };

export default function ProductsList() {
  const [result, setResult] = useState<Paginated<Product> | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [tab, setTab] = useState<Tab>("all");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [searchInput, setSearchInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [statusInput, setStatusInput] = useState<StatusFilter>("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    listProducts({ page, perPage, tab, search: filters.search, status: filters.status, date: filters.date })
      .then(setResult)
      .catch(() => toast.error("Failed to load products."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [page, perPage, tab, filters]);

  const rows = result?.data ?? [];
  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.has(r.id));
  const someSelected = rows.some((r) => selectedIds.has(r.id));
  const headerChecked: boolean | "indeterminate" = allSelected ? true : someSelected ? "indeterminate" : false;

  function handleTabChange(value: string) {
    setTab(value as Tab);
    setPage(1);
    setSelectedIds(new Set());
  }

  function handleApplyFilters(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    setFilters({ search: searchInput.trim(), date: dateInput, status: statusInput });
  }

  function handleClearFilters() {
    setSearchInput("");
    setDateInput("");
    setStatusInput("");
    setPage(1);
    setFilters(emptyFilters);
  }

  function toggleRow(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        rows.forEach((r) => next.delete(r.id));
      } else {
        rows.forEach((r) => next.add(r.id));
      }
      return next;
    });
  }

  async function handleDelete(product: Product) {
    try {
      await deleteProduct(product.id);
      toast.success(`Deleted "${product.name}".`);
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete product.");
    }
  }

  async function handleBulkDelete() {
    const ids = Array.from(selectedIds);
    try {
      await bulkDeleteProducts(ids);
      toast.success(`Deleted ${ids.length} product${ids.length === 1 ? "" : "s"}.`);
      setSelectedIds(new Set());
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete products.");
    }
  }

  usePageActions(
    <Button asChild>
      <Link to="/admin/products/new">
        <Plus />
        New product
      </Link>
    </Button>,
  );

  usePageFooter(
    result && (
      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        <Pager currentPage={result.current_page} lastPage={result.last_page} onPageChange={setPage} />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Show</span>
          <Select
            value={String(perPage)}
            onValueChange={(v) => {
              setPerPage(Number(v));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    ),
  );

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        {result ? `${result.total} product${result.total === 1 ? "" : "s"}` : "Loading…"}
      </p>

      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList variant="line">
          <TabsTrigger value="all">All products</TabsTrigger>
          <TabsTrigger value="draft">Draft products</TabsTrigger>
          <TabsTrigger value="promoted">Promoted</TabsTrigger>
        </TabsList>
      </Tabs>

      <form onSubmit={handleApplyFilters} className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products or brands…"
            className="pl-8"
          />
        </div>
        <Input
          type="date"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          className="w-auto"
          aria-label="Filter by date created"
        />
        <Select
          value={statusInput || "all"}
          onValueChange={(v) => setStatusInput(v === "all" ? "" : (v as StatusFilter))}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" variant="secondary">
          Apply filter
        </Button>
        <Button type="button" variant="ghost" onClick={handleClearFilters}>
          Clear filter
        </Button>
      </form>

      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between rounded-md border bg-muted/50 px-4 py-2">
          <p className="text-sm text-muted-foreground">
            {selectedIds.size} selected
          </p>
          <ConfirmDialog
            trigger={
              <Button variant="destructive" size="sm">
                <Trash2 />
                Delete selected
              </Button>
            }
            title={`Delete ${selectedIds.size} product${selectedIds.size === 1 ? "" : "s"}?`}
            description="This will remove the selected products from the storefront. This action cannot be undone."
            onConfirm={handleBulkDelete}
          />
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox checked={headerChecked} onCheckedChange={toggleAll} aria-label="Select all" />
                </TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>In stock</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Control</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center">
                    <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              )}
              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No products found.
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                rows.map((product) => {
                  const stock = effectiveStock(product);
                  const stockStatus = getStockStatus(stock);
                  return (
                    <TableRow key={product.id} data-state={selectedIds.has(product.id) ? "selected" : undefined}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(product.id)}
                          onCheckedChange={() => toggleRow(product.id)}
                          aria-label={`Select ${product.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                            {product.primary_image_url ? (
                              <img src={product.primary_image_url} alt="" className="size-full object-cover" />
                            ) : (
                              <ImageOff className="size-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="max-w-xs truncate font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground">#{product.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <ProductStatusBadge status={product.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{stock} in stock</span>
                          <span className={`text-xs ${stockStatus.className}`}>{stockStatus.label}</span>
                        </div>
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {product.sale_price ? (
                          <span className="flex items-center gap-2">
                            <span>{formatPrice(product.sale_price)}</span>
                            <span className="text-xs text-muted-foreground line-through">
                              {formatPrice(product.price)}
                            </span>
                          </span>
                        ) : (
                          formatPrice(product.price)
                        )}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/admin/products/${product.id}/edit`}>Details</Link>
                        </Button>
                        <Button variant="ghost" size="icon-sm" asChild>
                          <Link to={`/admin/products/${product.id}/edit`}>
                            <Pencil />
                          </Link>
                        </Button>
                        <ConfirmDialog
                          trigger={
                            <Button variant="ghost" size="icon-sm" className="text-destructive">
                              <Trash2 />
                            </Button>
                          }
                          title={`Delete "${product.name}"?`}
                          description="This will remove the product from the storefront. This action cannot be undone."
                          onConfirm={() => handleDelete(product)}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
