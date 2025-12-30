import { useEffect, useState } from "react";
import api from "../lib/api";

export default function AdminAuditLogsPage() {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({
    action: "",
    entityType: "",
    entityId: "",
    page: 1,
    limit: 20,
  });
  const [error, setError] = useState("");

  async function load() {
    setError("");
    const params = new URLSearchParams();
    if (filters.action) params.set("action", filters.action);
    if (filters.entityType) params.set("entityType", filters.entityType);
    if (filters.entityId) params.set("entityId", filters.entityId);
    params.set("page", String(filters.page));
    params.set("limit", String(filters.limit));

    try {
      const res = await api.get(`/api/audit-logs?${params.toString()}`);
      setItems(res.data.items || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load audit logs");
    }
  }

  useEffect(() => {
    load();
  }, [filters.page]);

  return (
    <div>
      <h2>Admin: Audit Logs</h2>

      <div style={{ display: "grid", gap: 8, maxWidth: 520 }}>
        <input
          placeholder="action (e.g. BOOKING_CREATED)"
          value={filters.action}
          onChange={(e) => setFilters((f) => ({ ...f, action: e.target.value }))}
        />
        <input
          placeholder="entityType (e.g. Booking)"
          value={filters.entityType}
          onChange={(e) => setFilters((f) => ({ ...f, entityType: e.target.value }))}
        />
        <input
          placeholder="entityId"
          value={filters.entityId}
          onChange={(e) => setFilters((f) => ({ ...f, entityId: e.target.value }))}
        />

        <button onClick={() => setFilters((f) => ({ ...f, page: 1 })) && load()}>
          Apply Filters
        </button>

        {error && <p style={{ color: "crimson" }}>{error}</p>}
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button
          disabled={filters.page <= 1}
          onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
        >
          Prev
        </button>
        <span>Page {filters.page}</span>
        <button onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}>Next</button>
      </div>

      <div style={{ marginTop: 12, overflowX: "auto" }}>
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>Time</th>
              <th>Action</th>
              <th>Actor</th>
              <th>Entity</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {items.map((l) => (
              <tr key={l._id}>
                <td>{new Date(l.createdAt).toLocaleString()}</td>
                <td><code>{l.action}</code></td>
                <td>{l.actorUser?.email || l.actorRole}</td>
                <td>
                  {l.entityType}:{l.entityId}
                </td>
                <td>{l.message}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="5">No logs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}