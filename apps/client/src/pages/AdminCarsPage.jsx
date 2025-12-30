import { useState } from "react";
import api from "../lib/api";

export default function AdminCarsPage() {
  const [form, setForm] = useState({
    brand: "",
    model: "",
    year: 2025,
    category: "Sedan",
    pricePerDay: 50,
    transmission: "Automatic",
    fuelType: "Petrol",
    seats: 5,
    isActive: true,
    imageUrl: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");

    try {
      setLoading(true);
      const res = await api.post("/api/cars", {
        ...form,
        year: Number(form.year),
        pricePerDay: Number(form.pricePerDay),
        seats: Number(form.seats),
      });

      setMsg(`✅ Car created: ${res.data.brand} ${res.data.model}`);
      // reset minimal fields for next insert
      setForm((f) => ({ ...f, brand: "", model: "", imageUrl: "" }));
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to create car");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Admin: Create Car</h2>
      <p style={{ color: "#555" }}>
        This page calls <code>POST /api/cars</code> (admin-only).
      </p>

      {msg && <p>{msg}</p>}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, maxWidth: 520 }}>
        <input
          placeholder="Brand (e.g., Toyota)"
          value={form.brand}
          onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
          required
        />

        <input
          placeholder="Model (e.g., Camry)"
          value={form.model}
          onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
          required
        />

        <input
          type="number"
          placeholder="Year"
          value={form.year}
          onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
          min={1990}
          max={2100}
        />

        <input
          placeholder="Category (e.g., Sedan, SUV)"
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
        />

        <input
          type="number"
          placeholder="Price Per Day"
          value={form.pricePerDay}
          onChange={(e) => setForm((f) => ({ ...f, pricePerDay: e.target.value }))}
          min={1}
        />

        <select
          value={form.transmission}
          onChange={(e) => setForm((f) => ({ ...f, transmission: e.target.value }))}
        >
          <option>Automatic</option>
          <option>Manual</option>
        </select>

        <select value={form.fuelType} onChange={(e) => setForm((f) => ({ ...f, fuelType: e.target.value }))}>
          <option>Petrol</option>
          <option>Diesel</option>
          <option>Electric</option>
          <option>Hybrid</option>
        </select>

        <input
          type="number"
          placeholder="Seats"
          value={form.seats}
          onChange={(e) => setForm((f) => ({ ...f, seats: e.target.value }))}
          min={1}
          max={12}
        />

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
          />
          Active (visible to users)
        </label>

        <input
          placeholder="Image URL (optional)"
          value={form.imageUrl}
          onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
        />

        <button disabled={loading}>{loading ? "Creating..." : "Create Car"}</button>
      </form>
    </div>
  );
}
