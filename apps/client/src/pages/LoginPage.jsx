import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import api from "../lib/api";
import { saveAuth } from "../lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/api/auth/login", form);
      saveAuth({ accessToken: res.data.accessToken, user: res.data.user });
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, maxWidth: 420 }}>
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        />
        <button disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
      </form>
    </div>
  );
}