import { useEffect, useState } from "react";
import api from "../lib/api";

export default function MyBookingsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await api.get("/api/bookings/me");
    setItems(res.data.items || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h2>My Bookings</h2>
      {loading ? <p>Loading...</p> : null}

      <div style={{ display: "grid", gap: 10 }}>
        {items.map((b) => (
          <div key={b._id} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
            <div style={{ fontWeight: 700 }}>
              {b.car?.brand} {b.car?.model}
            </div>
            <div>Status: <b>{b.status}</b></div>
            <div>
              {new Date(b.startDate).toLocaleString()} → {new Date(b.endDate).toLocaleString()}
            </div>
            <div>Total: ${b.totalAmount}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
