import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import api from "../lib/api";
import { saveAuth, getUser } from "../lib/auth";

const schema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
});

export default function LoginPage() {
	const navigate = useNavigate();
	const [form, setForm] = useState({ email: "", password: "" });
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [messageType, setMessageType] = useState("success");

  useEffect(() => {
  const user = getUser();
  if (user) {
    navigate("/");
  }
}, [navigate]);

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
			setMessage("✅ Login successful. Redirecting...");
			setMessageType("success");
			setTimeout(() => {
				navigate("/");
			}, 1500);
		} catch (err) {
			setError(err?.response?.data?.message || "Login failed");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className='min-h-[80vh] flex items-center justify-center px-4'>
			<div className='w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-sm p-6 space-y-4'>
				<h1 className='text-2xl font-semibold text-gray-900'>Login</h1>
				{message && (
					<div
						className={`rounded-lg px-4 py-2 text-sm font-medium ${
							messageType === "success"
								? "bg-green-100 text-green-700"
								: "bg-red-100 text-red-700"
						}`}>
						{message}
					</div>
				)}
				{error && <p className='text-sm text-red-600 mt-1'>{error}</p>}
				<form
					onSubmit={onSubmit}
					style={{ display: "grid", gap: 10, maxWidth: 420 }}>
					<input
						className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10'
						placeholder='Email'
						value={form.email}
						onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
					/>
					<input
						className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10'
						placeholder='Password'
						type='password'
						value={form.password}
						onChange={(e) =>
							setForm((f) => ({ ...f, password: e.target.value }))
						}
					/>
					<button
						className='w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50'
						disabled={loading}>
						{loading ? "Logging in..." : "Login"}
					</button>
				</form>
			</div>
		</div>
	);
}
