import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { LogOut, MapPin, Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/features/auth/AuthContext";
import { ApiError } from "@/features/auth/client";
import {
  createAddress,
  deleteAddress,
  fetchAddresses,
  fetchOrders,
  makeDefaultAddress,
  updateAddress,
  type AddressInput,
} from "@/features/auth/api";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Address, Order, OrderStatus } from "@/features/auth/types";

export default function Account() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Skeleton className="mb-4 h-8 w-40" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return user ? <AccountDashboard /> : <AuthGate />;
}

function AuthGate() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-10">
      <Tabs defaultValue="login">
        <TabsList className="mb-4 grid w-full grid-cols-2">
          <TabsTrigger value="login">Sign In</TabsTrigger>
          <TabsTrigger value="register">Create Account</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <LoginForm />
        </TabsContent>
        <TabsContent value="register">
          <RegisterForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success("Welcome back");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="login-email">Email</Label>
        <Input id="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="login-password">Password</Label>
        <Input
          id="login-password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={submitting} className="mt-1">
        {submitting ? "Signing in…" : "Sign In"}
      </Button>
    </form>
  );
}

function RegisterForm() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(name, email, password);
      toast.success("Account created");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="register-name">Full name</Label>
        <Input id="register-name" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="register-email">Email</Label>
        <Input
          id="register-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="register-password">Password</Label>
        <Input
          id="register-password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <span className="text-xs text-muted-foreground">At least 8 characters.</span>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={submitting} className="mt-1">
        {submitting ? "Creating account…" : "Create Account"}
      </Button>
    </form>
  );
}

function AccountDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-full bg-accent text-base font-semibold text-primary">
            {user!.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <h1 className="text-lg font-semibold text-foreground">{user!.name}</h1>
            <p className="text-sm text-muted-foreground">{user!.email}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => logout()}>
          <LogOut className="size-3.5" />
          Sign out
        </Button>
      </div>

      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
        </TabsList>
        <TabsContent value="orders" className="pt-5">
          <OrdersPanel />
        </TabsContent>
        <TabsContent value="addresses" className="pt-5">
          <AddressesPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

const orderStatusVariant: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

function OrdersPanel() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    fetchOrders()
      .then(setOrders)
      .catch(() => setOrders([]));
  }, []);

  if (orders === null) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-14 text-center">
        <Package className="size-8 text-muted-foreground" strokeWidth={1.5} />
        <p className="text-sm font-medium text-foreground">No orders yet</p>
        <p className="text-sm text-muted-foreground">Your order history will show up here.</p>
        <Button asChild size="sm" className="mt-2">
          <Link to="/">Start shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {orders.map((order) => (
        <div key={order.id} className="rounded-xl border border-border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-sm font-semibold text-foreground">{order.order_number}</span>
              <span className="ml-2 text-xs text-muted-foreground">
                {new Date(order.created_at).toLocaleDateString("en-AE", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
            <Badge className={cn("border-none", orderStatusVariant[order.status])}>
              {order.status[0].toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
          <Separator className="my-3" />
          <div className="flex flex-col gap-1.5">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="line-clamp-1 text-foreground">
                  {item.quantity} × {item.product?.name ?? "Product unavailable"}
                </span>
                <span className="shrink-0 text-muted-foreground">{formatPrice(item.total)}</span>
              </div>
            ))}
          </div>
          <Separator className="my-3" />
          <div className="flex justify-between text-sm font-semibold text-foreground">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function AddressesPanel() {
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);

  function load() {
    fetchAddresses()
      .then(setAddresses)
      .catch(() => setAddresses([]));
  }

  useEffect(load, []);

  function openNew() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(address: Address) {
    setEditing(address);
    setDialogOpen(true);
  }

  async function handleDelete(id: number) {
    await deleteAddress(id);
    toast.success("Address removed");
    load();
  }

  async function handleMakeDefault(id: number) {
    await makeDefaultAddress(id);
    load();
  }

  if (addresses === null) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {addresses.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-14 text-center">
          <MapPin className="size-8 text-muted-foreground" strokeWidth={1.5} />
          <p className="text-sm font-medium text-foreground">No saved addresses</p>
          <p className="text-sm text-muted-foreground">Add one to speed up checkout.</p>
        </div>
      ) : (
        addresses.map((address) => (
          <div key={address.id} className="flex flex-col gap-2 rounded-xl border border-border p-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {address.first_name} {address.last_name}
                </span>
                <Badge variant="outline" className="capitalize">{address.type}</Badge>
                {address.is_default && <Badge className="border-none">Default</Badge>}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {address.address_line1}
                {address.address_line2 ? `, ${address.address_line2}` : ""}, {address.city}, {address.state}{" "}
                {address.postal_code}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              {!address.is_default && (
                <Button variant="outline" size="sm" onClick={() => handleMakeDefault(address.id)}>
                  Set default
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => openEdit(address)}>
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    Remove
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove this address?</AlertDialogTitle>
                    <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(address.id)}>Remove</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-fit" onClick={openNew}>
            <Plus className="size-3.5" />
            Add address
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit address" : "Add address"}</DialogTitle>
          </DialogHeader>
          <AddressForm
            initial={editing}
            onSaved={() => {
              setDialogOpen(false);
              load();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AddressForm({ initial, onSaved }: { initial: Address | null; onSaved: () => void }) {
  const [form, setForm] = useState<AddressInput>({
    first_name: initial?.first_name ?? "",
    last_name: initial?.last_name ?? "",
    address_line1: initial?.address_line1 ?? "",
    address_line2: initial?.address_line2 ?? "",
    city: initial?.city ?? "",
    state: initial?.state ?? "Dubai",
    postal_code: initial?.postal_code ?? "00000",
    type: initial?.type ?? "home",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof AddressInput>(key: K, value: AddressInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (initial) {
        await updateAddress(initial.id, form);
      } else {
        await createAddress(form);
      }
      toast.success("Address saved");
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save this address.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="addr-first">First name</Label>
          <Input id="addr-first" required value={form.first_name} onChange={(e) => set("first_name", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="addr-last">Last name</Label>
          <Input id="addr-last" required value={form.last_name} onChange={(e) => set("last_name", e.target.value)} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="addr-line1">Address</Label>
        <Input id="addr-line1" required value={form.address_line1} onChange={(e) => set("address_line1", e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="addr-line2">Apartment, suite, etc. (optional)</Label>
        <Input id="addr-line2" value={form.address_line2 ?? ""} onChange={(e) => set("address_line2", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="addr-city">City</Label>
          <Input id="addr-city" required value={form.city} onChange={(e) => set("city", e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="addr-state">Emirate</Label>
          <Input id="addr-state" required value={form.state} onChange={(e) => set("state", e.target.value)} />
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <DialogFooter>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save address"}
        </Button>
      </DialogFooter>
    </form>
  );
}
