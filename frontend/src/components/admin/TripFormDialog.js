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

const empty = {
  routeId: "",
  busId: "",
  travelDate: "",
  departureTime: "",
  arrivalTime: "",
  price: "",
  isActive: true,
};

export default function TripFormDialog({ open, onOpenChange, trip, onSaved }) {
  const [form, setForm] = useState(empty);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const editing = !!trip;

  // Load the dropdown options each time the dialog opens
  useEffect(() => {
    if (!open) return;
    Promise.all([api("/admin/routes"), api("/admin/buses")])
      .then(([r, b]) => {
        setRoutes(r.data);
        setBuses(b.data);
      })
      .catch((err) => toast.error(err.message));
  }, [open]);

  useEffect(() => {
    if (open) {
      setForm(
        trip
          ? {
              routeId: String(trip.routeId),
              busId: String(trip.busId),
              travelDate: trip.travelDate,
              departureTime: trip.departureTime,
              arrivalTime: trip.arrivalTime ?? "",
              price: trip.price,
              isActive: trip.isActive,
            }
          : empty
      );
      setErrors({});
    }
  }, [open, trip]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const body = {
        routeId: Number(form.routeId),
        busId: Number(form.busId),
        travelDate: form.travelDate,
        departureTime: form.departureTime,
        arrivalTime: form.arrivalTime || null,
        price: Number(form.price),
        isActive: form.isActive,
      };
      if (editing) await api(`/admin/trips/${trip.id}`, { method: "PUT", body });
      else await api("/admin/trips", { method: "POST", body });
      toast.success(editing ? "Trip updated" : "Trip created");
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit trip" : "Add trip"}</DialogTitle>
          <DialogDescription>Pick a route and a bus, then set the date, time and price.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Route" htmlFor="trip-route" error={errors.routeId}>
            <select id="trip-route" className={selectClass} value={form.routeId} onChange={set("routeId")} required>
              <option value="">Select a route</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.fromCity} to {r.toCity}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Bus" htmlFor="trip-bus" error={errors.busId}>
            <select id="trip-bus" className={selectClass} value={form.busId} onChange={set("busId")} required>
              <option value="">Select a bus</option>
              {buses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.type === "AC" ? "AC" : "Non-AC"}, {b.totalSeats} seats)
                </option>
              ))}
            </select>
          </Field>

          <Field label="Travel date" htmlFor="trip-date" error={errors.travelDate}>
            <Input id="trip-date" type="date" value={form.travelDate} onChange={set("travelDate")} required />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Departure time" htmlFor="trip-dep" error={errors.departureTime}>
              <Input id="trip-dep" type="time" value={form.departureTime} onChange={set("departureTime")} required />
            </Field>
            <Field label="Arrival time (optional)" htmlFor="trip-arr" error={errors.arrivalTime}>
              <Input id="trip-arr" type="time" value={form.arrivalTime} onChange={set("arrivalTime")} />
            </Field>
          </div>

          <Field label="Price per seat (BDT)" htmlFor="trip-price" error={errors.price}>
            <Input id="trip-price" type="number" min="1" value={form.price} onChange={set("price")} required />
          </Field>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Active (visible in search)
          </label>

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
