"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import useApi from "@/hooks/useApi";
import PageHeader from "@/components/common/PageHeader";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import DataTable from "@/components/admin/DataTable";
import Pagination from "@/components/admin/Pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const [page, setPage] = useState(1);
  const { data, loading, reload } = useApi(`/admin/users?page=${page}&limit=10`);
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const newRole = target ? (target.role === "ADMIN" ? "USER" : "ADMIN") : null;

  async function confirmRoleChange() {
    setBusy(true);
    try {
      await api(`/admin/users/${target.id}/role`, { method: "PATCH", body: { role: newRole } });
      toast.success("Role updated");
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setTarget(null);
      setBusy(false);
    }
  }

  const columns = [
    { header: "ID", cell: (u) => u.id },
    { header: "Name", cell: (u) => u.name },
    { header: "Email", cell: (u) => u.email },
    { header: "Phone", cell: (u) => u.phone },
    {
      header: "Role",
      cell: (u) => (
        <Badge variant={u.role === "ADMIN" ? "default" : "outline"}>{u.role}</Badge>
      ),
    },
    { header: "Bookings", cell: (u) => u._count.bookings },
    { header: "Joined", cell: (u) => u.createdAt.slice(0, 10) },
    {
      header: "Actions",
      className: "text-right",
      cell: (u) => (
        <Button variant="outline" size="sm" disabled={u.id === me?.id} onClick={() => setTarget(u)}>
          {u.role === "ADMIN" ? "Make user" : "Make admin"}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Users" />

      <DataTable columns={columns} rows={data?.data ?? []} loading={loading} emptyText="No users found." />
      <Pagination page={page} totalPages={data?.totalPages} onPage={setPage} />

      <ConfirmDialog
        open={!!target}
        onOpenChange={(o) => !o && setTarget(null)}
        title="Change role?"
        description={target ? `Make ${target.name} ${newRole === "ADMIN" ? "an admin" : "a normal user"}?` : ""}
        confirmText="Change role"
        onConfirm={confirmRoleChange}
        loading={busy}
      />
    </div>
  );
}
