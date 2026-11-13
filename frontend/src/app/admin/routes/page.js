"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import useApi from "@/hooks/useApi";
import PageHeader from "@/components/common/PageHeader";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import DataTable from "@/components/admin/DataTable";
import RouteFormDialog from "@/components/admin/RouteFormDialog";
import { Button } from "@/components/ui/button";

export default function AdminRoutesPage() {
  const { data, loading, reload } = useApi("/admin/routes");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  async function confirmDelete() {
    setBusy(true);
    try {
      await api(`/admin/routes/${deleting.id}`, { method: "DELETE" });
      toast.success("Route deleted");
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(null);
      setBusy(false);
    }
  }

  const columns = [
    { header: "From", cell: (r) => r.fromCity },
    { header: "To", cell: (r) => r.toCity },
    { header: "Distance", cell: (r) => (r.distanceKm ? `${r.distanceKm} km` : "-") },
    { header: "Trips", cell: (r) => r._count.trips },
    {
      header: "Actions",
      className: "text-right",
      cell: (r) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditing(r);
              setFormOpen(true);
            }}
          >
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setDeleting(r)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Routes">
        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          Add route
        </Button>
      </PageHeader>

      <DataTable columns={columns} rows={data?.data ?? []} loading={loading} emptyText="No routes yet. Add one." />

      <RouteFormDialog open={formOpen} onOpenChange={setFormOpen} route={editing} onSaved={reload} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete route?"
        description={
          deleting
            ? `This will delete ${deleting.fromCity} to ${deleting.toCity}. A route that has trips cannot be deleted.`
            : ""
        }
        confirmText="Delete"
        onConfirm={confirmDelete}
        loading={busy}
      />
    </div>
  );
}
