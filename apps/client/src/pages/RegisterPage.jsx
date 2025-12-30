import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import api from "../lib/api";
import { saveAuth } from "../lib/auth";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
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
      const res = await api.post("/api/auth/register", form);
      // If your backend returns tokens on register, store them.
      // If not, we login immediately.
      if (res.data?.accessToken) {
        saveAuth({ accessToken: res.data.accessToken, user: res.data.user });
        navigate("/");
        return;
      }

      const loginRes = await api.post("/api/auth/login", {
        email: form.email,
        password: form.password,
      });
      saveAuth({ accessToken: loginRes.data.accessToken, user: loginRes.data.user });
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Register</h2>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, maxWidth: 420 }}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
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
        <button disabled={loading}>{loading ? "Creating..." : "Create account"}</button>
      </form>
    </div>
  );
}