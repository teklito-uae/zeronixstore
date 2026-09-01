import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteProduct, listProducts } from "@/admin/api/products";
import { ApiError } from "@/admin/api/client";
import { Pager } from "@/admin/components/Pager";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog";
import { ProductStatusBadge } from "@/admin/components/StatusBadge";
import type { Paginated, Product } from "@/admin/types";
import { formatPrice } from "@/lib/format";
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

export default function ProductsList() {
  const [result, setResult] = useState<Paginated<Product> | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listProducts(page, search)
      .then(setResult)
      .catch(() => toast.error("Failed to load products."))
      .finally(() => setLoading(false));
  }, [page, search]);

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  async function handleDelete(product: Product) {
    try {
      await deleteProduct(product.id);
      toast.success(`Deleted "${product.name}".`);
      setResult((prev) =>
        prev ? { ...prev, data: prev.data.filter((p) => p.id !== product.id) } : prev,
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete product.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Products</h1>
          <p className="text-sm text-muted-foreground">
            {result ? `${result.total} product${result.total === 1 ? "" : "s"}` : "Loading…"}
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/products/new">
            <Plus />
            New product
          </Link>
        </Button>
      </div>

      <form onSubmit={handleSearchSubmit} className="flex max-w-sm gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products or brands…"
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
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
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
                    No products found.
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                result?.data.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="max-w-xs truncate font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {product.category?.name ?? "—"}
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
                    <TableCell>
                      <ProductStatusBadge status={product.status} />
                    </TableCell>
                    <TableCell className="text-right">
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
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {result && (
        <Pager currentPage={result.current_page} lastPage={result.last_page} onPageChange={setPage} />
      )}
    </div>
  );
}
