import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, RotateCcw, Square } from "lucide-react";
import { toast } from "sonner";
import { getImportStatus, rerunFailedImport, stopImport } from "@/admin/api/imports";
import { ImportJobStatusBadge, ImportLogStatusBadge } from "@/admin/components/StatusBadge";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog";
import type { ImportJob, ImportLog } from "@/admin/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ACTIVE_STATUSES: ImportJob["status"][] = [
  "pending",
  "crawling_links",
  "scraping_products",
  "downloading_images",
];

export default function ImportDetail() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<ImportJob | null>(null);
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [percentage, setPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function load(showSpinner = false) {
    if (!id) return;
    if (showSpinner) setLoading(true);
    return getImportStatus(Number(id))
      .then((res) => {
        setJob(res.job);
        setLogs(res.logs);
        setPercentage(res.percentage);
      })
      .catch(() => toast.error("Failed to load import status."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (job && ACTIVE_STATUSES.includes(job.status)) {
      pollRef.current = setInterval(() => load(false), 2500);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job?.status]);

  async function handleStop() {
    if (!job) return;
    setBusy(true);
    try {
      const updated = await stopImport(job.id);
      setJob(updated);
      toast.success("Import stopped.");
    } catch {
      toast.error("Failed to stop import.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRerun() {
    if (!job) return;
    setBusy(true);
    try {
      await rerunFailedImport(job.id);
      toast.success("Re-running failed products.");
      load(false);
    } catch {
      toast.error("Failed to re-run failed products.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-muted-foreground">Import job not found.</p>
        <Button variant="outline" asChild>
          <Link to="/admin/imports">
            <ArrowLeft />
            Back to imports
          </Link>
        </Button>
      </div>
    );
  }

  const isActive = ACTIVE_STATUSES.includes(job.status);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link to="/admin/imports">
            <ArrowLeft />
          </Link>
        </Button>
        <div className="min-w-0">
          <h1 className="truncate font-heading text-2xl font-semibold">
            {job.local_category?.name ?? "Import"} #{job.id}
          </h1>
          <p className="truncate text-sm text-muted-foreground">{job.source_category_url}</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Progress</CardTitle>
          <div className="flex items-center gap-2">
            <ImportJobStatusBadge status={job.status} />
            {isActive && (
              <ConfirmDialog
                trigger={
                  <Button variant="outline" size="sm" disabled={busy}>
                    <Square />
                    Stop
                  </Button>
                }
                title="Stop this import?"
                description="Products already processed will be kept. The remaining queue will not be processed."
                confirmLabel="Stop import"
                onConfirm={handleStop}
              />
            )}
            {!isActive && job.failed_count > 0 && (
              <Button variant="outline" size="sm" onClick={handleRerun} disabled={busy}>
                {busy ? <Loader2 className="animate-spin" /> : <RotateCcw />}
                Re-run failed
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
            <span>
              <span className="font-medium text-foreground">{job.processed_count}</span> processed
            </span>
            <span>
              <span className="font-medium text-foreground">{job.total_found}</span> found
            </span>
            <span>
              <span className="font-medium text-destructive">{job.failed_count}</span> failed
            </span>
            <span>{percentage}%</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                    No activity yet.
                  </TableCell>
                </TableRow>
              )}
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                    {log.product_url ?? "—"}
                  </TableCell>
                  <TableCell>
                    <ImportLogStatusBadge status={log.status} />
                  </TableCell>
                  <TableCell className="max-w-sm truncate text-sm">{log.message ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
