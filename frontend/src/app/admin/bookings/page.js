"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import useApi from "@/hooks/useApi";
import PageHeader from "@/components/common/PageHeader";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import StatusBadge from "@/components/common/StatusBadge";
import DataTable from "@/components/admin/DataTable";
import Pagination from "@/components/admin/Pagination";
import { selectClass } from "@/components/admin/FormField";
import { Button } from "@/components/ui/button";

export default function AdminBookingsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const query = `/admin/bookings?page=${page}&limit=10${status ? `&status=${status}` : ""}`;
  const { data, loading, reload } = useApi(query);
  const [cancelling, setCancelling] = useState(null);
  const [busy, setBusy] = useState(false);

  async function setBookingStatus(id, newStatus) {
    await api(`/admin/bookings/${id}/status`, { method: "PATCH", body: { status: newStatus } });
  }

  async function confirmBooking(b) {
    try {
      await setBookingStatus(b.id, "CONFIRMED");
      toast.success("Booking confirmed");
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function confirmCancel() {
    setBusy(true);
    try {
      await setBookingStatus(cancelling.id, "CANCELLED");
      toast.success("Booking cancelled");
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCancelling(null);
      setBusy(false);
    }
  }

  const columns = [
    { header: "ID", cell: (b) => `#${b.id}` },
    {
      header: "Customer",
      cell: (b) => (
        <div>
          <p className="font-medium">{b.user?.name}</p>
          <p className="text-xs text-slate-500">{b.user?.email}</p>
        </div>
      ),
    },
    {
      header: "Trip",
      cell: (b) => (
        <div>
          <p>
            {b.trip.route.fromCity} to {b.trip.route.toCity}
          </p>
          <p className="text-xs text-slate-500">
            {b.trip.travelDate} at {b.trip.departureTime}
          </p>
        </div>
      ),
    },
    { header: "Seats", cell: (b) => b.seats.map((s) => s.seatNumber).join(", ") || "-" },
    { header: "Amount", cell: (b) => `BDT ${b.totalAmount}` },
    { header: "Status", cell: (b) => <StatusBadge status={b.status} /> },
    {
      header: "Actions",
      className: "text-right",
      cell: (b) => (
        <div className="flex justify-end gap-2">
          {b.status === "PENDING" && (
            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => confirmBooking(b)}>
              Confirm
            </Button>
          )}
          {b.status !== "CANCELLED" && (
            <Button variant="destructive" size="sm" onClick={() => setCancelling(b)}>
              Cancel
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Bookings">
        <select
          className={`${selectClass} w-40`}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </PageHeader>

      <DataTable columns={columns} rows={data?.data ?? []} loading={loading} emptyText="No bookings found." />
      <Pagination page={page} totalPages={data?.totalPages} onPage={setPage} />

      <ConfirmDialog
        open={!!cancelling}
        onOpenChange={(o) => !o && setCancelling(null)}
        title="Cancel booking?"
        description="The seats will become available again. This cannot be undone."
        confirmText="Cancel booking"
        onConfirm={confirmCancel}
        loading={busy}
      />
    </div>
  );
}
