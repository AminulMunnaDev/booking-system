"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import useApi from "@/hooks/useApi";
import PageHeader from "@/components/common/PageHeader";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import DataTable from "@/components/admin/DataTable";
import BusFormDialog from "@/components/admin/BusFormDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminBusesPage() {
  const { data, loading, reload } = useApi("/admin/buses");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  async function confirmDelete() {
    setBusy(true);
    try {
      await api(`/admin/buses/${deleting.id}`, { method: "DELETE" });
      toast.success("Bus deleted");
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(null);
      setBusy(false);
    }
  }

  const columns = [
    { header: "Name", cell: (b) => b.name },
    { header: "Plate no", cell: (b) => b.plateNo },
    { header: "Type", cell: (b) => <Badge variant="outline">{b.type === "AC" ? "AC" : "Non-AC"}</Badge> },
    { header: "Seats", cell: (b) => b.totalSeats },
    { header: "Trips", cell: (b) => b._count.trips },
    {
      header: "Actions",
      className: "text-right",
      cell: (b) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditing(b);
              setFormOpen(true);
            }}
          >
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setDeleting(b)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Buses">
        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          Add bus
        </Button>
      </PageHeader>

      <DataTable columns={columns} rows={data?.data ?? []} loading={loading} emptyText="No buses yet. Add one." />

      <BusFormDialog open={formOpen} onOpenChange={setFormOpen} bus={editing} onSaved={reload} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete bus?"
        description={deleting ? `This will delete ${deleting.name}. A bus that has trips cannot be deleted.` : ""}
        confirmText="Delete"
        onConfirm={confirmDelete}
        loading={busy}
      />
    </div>
  );
}
