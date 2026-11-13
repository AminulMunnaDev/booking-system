"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, fieldErrors } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Field from "@/components/admin/FormField";

const empty = { fromCity: "", toCity: "", distanceKm: "" };

export default function RouteFormDialog({ open, onOpenChange, route, onSaved }) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const editing = !!route;

  useEffect(() => {
    if (open) {
      setForm(
        route
          ? { fromCity: route.fromCity, toCity: route.toCity, distanceKm: route.distanceKm ?? "" }
          : empty
      );
      setErrors({});
    }
  }, [open, route]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const body = {
        fromCity: form.fromCity,
        toCity: form.toCity,
        distanceKm: form.distanceKm === "" ? null : Number(form.distanceKm),
      };
      if (editing) await api(`/admin/routes/${route.id}`, { method: "PUT", body });
      else await api("/admin/routes", { method: "POST", body });
      toast.success(editing ? "Route updated" : "Route created");
      onOpenChange(false);
      onSaved();
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit route" : "Add route"}</DialogTitle>
          <DialogDescription>A route connects two cities.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="From city" htmlFor="route-from" error={errors.fromCity}>
              <Input id="route-from" value={form.fromCity} onChange={set("fromCity")} required />
            </Field>
            <Field label="To city" htmlFor="route-to" error={errors.toCity}>
              <Input id="route-to" value={form.toCity} onChange={set("toCity")} required />
            </Field>
          </div>
          <Field label="Distance (km, optional)" htmlFor="route-km" error={errors.distanceKm}>
            <Input id="route-km" type="number" min="1" value={form.distanceKm} onChange={set("distanceKm")} />
          </Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-green-600 hover:bg-green-700">
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
