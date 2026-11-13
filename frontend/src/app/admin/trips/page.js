"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import useApi from "@/hooks/useApi";
import PageHeader from "@/components/common/PageHeader";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import DataTable from "@/components/admin/DataTable";
import Pagination from "@/components/admin/Pagination";
import TripFormDialog from "@/components/admin/TripFormDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminTripsPage() {
  const [page, setPage] = useState(1);
  const { data, loading, reload } = useApi(`/admin/trips?page=${page}&limit=10`);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  async function confirmDelete() {
    setBusy(true);
    try {
      await api(`/admin/trips/${deleting.id}`, { method: "DELETE" });
      toast.success("Trip deleted");
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(null);
      setBusy(false);
    }
  }

  const columns = [
    { header: "Route", cell: (t) => `${t.route.fromCity} to ${t.route.toCity}` },
    { header: "Bus", cell: (t) => t.bus.name },
    { header: "Date", cell: (t) => t.travelDate },
    { header: "Departure", cell: (t) => t.departureTime },
    { header: "Price", cell: (t) => `BDT ${t.price}` },
    { header: "Seats", cell: (t) => `${t.bookedSeats} / ${t.bus.totalSeats}` },
    {
      header: "Status",
      cell: (t) =>
        t.isActive ? (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            Active
          </Badge>
        ) : (
          <Badge variant="secondary">Inactive</Badge>
        ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (t) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditing(t);
              setFormOpen(true);
            }}
          >
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setDeleting(t)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Trips">
        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          Add trip
        </Button>
      </PageHeader>

      <DataTable columns={columns} rows={data?.data ?? []} loading={loading} emptyText="No trips yet. Add one." />
      <Pagination page={page} totalPages={data?.totalPages} onPage={setPage} />

      <TripFormDialog open={formOpen} onOpenChange={setFormOpen} trip={editing} onSaved={reload} />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete trip?"
        description="A trip that has bookings cannot be deleted. Set it to inactive instead (use Edit)."
        confirmText="Delete"
        onConfirm={confirmDelete}
        loading={busy}
      />
    </div>
  );
}
