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
import Field, { selectClass } from "@/components/admin/FormField";

const empty = { name: "", plateNo: "", type: "AC", totalSeats: 40 };

// bus = null means "add new", bus = {...} means "edit"
export default function BusFormDialog({ open, onOpenChange, bus, onSaved }) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const editing = !!bus;

  useEffect(() => {
    if (open) {
      setForm(
        bus ? { name: bus.name, plateNo: bus.plateNo, type: bus.type, totalSeats: bus.totalSeats } : empty
      );
      setErrors({});
    }
  }, [open, bus]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const body = { ...form, totalSeats: Number(form.totalSeats) };
      if (editing) await api(`/admin/buses/${bus.id}`, { method: "PUT", body });
      else await api("/admin/buses", { method: "POST", body });
      toast.success(editing ? "Bus updated" : "Bus created");
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
          <DialogTitle>{editing ? "Edit bus" : "Add bus"}</DialogTitle>
          <DialogDescription>Bus details used when creating trips.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Bus name" htmlFor="bus-name" error={errors.name}>
            <Input id="bus-name" value={form.name} onChange={set("name")} required />
          </Field>
          <Field label="Plate number" htmlFor="bus-plate" error={errors.plateNo}>
            <Input id="bus-plate" value={form.plateNo} onChange={set("plateNo")} required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type" htmlFor="bus-type" error={errors.type}>
              <select id="bus-type" className={selectClass} value={form.type} onChange={set("type")}>
                <option value="AC">AC</option>
                <option value="NON_AC">Non-AC</option>
              </select>
            </Field>
            <Field label="Total seats" htmlFor="bus-seats" error={errors.totalSeats}>
              <Input id="bus-seats" type="number" min="1" max="60" value={form.totalSeats} onChange={set("totalSeats")} required />
            </Field>
          </div>

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
