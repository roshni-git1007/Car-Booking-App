import { useEffect, useState } from "react";
import api from "../lib/api";

export default function AdminCarsManagePage() {
	const [items, setItems] = useState([]);
	const [msg, setMsg] = useState("");
	const [loading, setLoading] = useState(true);

	const [editingId, setEditingId] = useState(null);
	const [editForm, setEditForm] = useState({
		brand: "",
		model: "",
		year: "",
		category: "",
		pricePerDay: "",
		transmission: "",
		fuelType: "",
		seats: "",
		isActive: true,
		imageUrl: "",
	});

	async function load() {
		setLoading(true);
		setMsg("");
		try {
			const res = await api.get("/api/cars/admin/all?limit=50");
			setItems(res.data.items || []);
		} catch (err) {
			setMsg(err?.response?.data?.message || "Failed to load cars");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		load();
	}, []);

	function startEdit(car) {
		setEditingId(car._id);
		setEditForm({
			brand: car.brand || "",
			model: car.model || "",
			year: String(car.year ?? ""),
			category: car.category || "",
			pricePerDay: String(car.pricePerDay ?? ""),
			transmission: car.transmission || "Automatic",
			fuelType: car.fuelType || "Petrol",
			seats: String(car.seats ?? ""),
			isActive: !!car.isActive,
			imageUrl: car.imageUrl || "",
		});
	}

	function cancelEdit() {
		setEditingId(null);
	}

	async function saveEdit(carId) {
		setMsg("");
		try {
			const payload = {
				brand: editForm.brand,
				model: editForm.model,
				year: Number(editForm.year),
				category: editForm.category,
				pricePerDay: Number(editForm.pricePerDay),
				transmission: editForm.transmission,
				fuelType: editForm.fuelType,
				seats: Number(editForm.seats),
				isActive: editForm.isActive,
				imageUrl: editForm.imageUrl,
			};

			const res = await api.patch(`/api/cars/${carId}`, payload);
			const updated = res.data;

			setItems((prev) =>
				prev.map((c) => (c._id === updated._id ? updated : c))
			);
			setMsg(`✅ Updated: ${updated.brand} ${updated.model}`);
			setEditingId(null);
		} catch (err) {
			setMsg(err?.response?.data?.message || "Failed to update car");
		}
	}

	async function toggleActive(car) {
		setMsg("");
		try {
			const res = await api.patch(`/api/cars/${car._id}`, {
				isActive: !car.isActive,
			});
			const updated = res.data;

			setItems((prev) =>
				prev.map((c) => (c._id === updated._id ? updated : c))
			);

			setMsg(
				`✅ Updated: ${updated.brand} ${updated.model} isActive=${updated.isActive}`
			);
		} catch (err) {
			setMsg(err?.response?.data?.message || "Failed to update car");
		}
	}

	return (
		<div>
			<h2>Admin: Manage Cars</h2>
			<p style={{ color: "#555" }}>
				Uses <code>GET /api/cars/admin/all</code> +{" "}
				<code>PATCH /api/cars/:id</code>
			</p>

			{msg && <p>{msg}</p>}
			{loading ? <p>Loading...</p> : null}

			<div style={{ display: "grid", gap: 10 }}>
				{items.map((c) => (
					<div
						key={c._id}
						style={{
							border: "1px solid #ddd",
							borderRadius: 10,
							padding: 12,
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							gap: 12,
						}}>
						{editingId === c._id ? (
							<div style={{ width: "100%" }}>
								<div style={{ fontWeight: 700, marginBottom: 8 }}>Edit Car</div>

								<div
									style={{
										display: "grid",
										gap: 8,
										gridTemplateColumns: "1fr 1fr",
									}}>
									<input
										value={editForm.brand}
										onChange={(e) =>
											setEditForm((f) => ({ ...f, brand: e.target.value }))
										}
										placeholder='Brand'
									/>
									<input
										value={editForm.model}
										onChange={(e) =>
											setEditForm((f) => ({ ...f, model: e.target.value }))
										}
										placeholder='Model'
									/>

									<input
										type='number'
										value={editForm.year}
										onChange={(e) =>
											setEditForm((f) => ({ ...f, year: e.target.value }))
										}
										placeholder='Year'
									/>
									<input
										value={editForm.category}
										onChange={(e) =>
											setEditForm((f) => ({ ...f, category: e.target.value }))
										}
										placeholder='Category'
									/>

									<input
										type='number'
										value={editForm.pricePerDay}
										onChange={(e) =>
											setEditForm((f) => ({
												...f,
												pricePerDay: e.target.value,
											}))
										}
										placeholder='Price/Day'
									/>
									<input
										type='number'
										value={editForm.seats}
										onChange={(e) =>
											setEditForm((f) => ({ ...f, seats: e.target.value }))
										}
										placeholder='Seats'
									/>

									<select
										value={editForm.transmission}
										onChange={(e) =>
											setEditForm((f) => ({
												...f,
												transmission: e.target.value,
											}))
										}>
										<option>Automatic</option>
										<option>Manual</option>
									</select>

									<select
										value={editForm.fuelType}
										onChange={(e) =>
											setEditForm((f) => ({ ...f, fuelType: e.target.value }))
										}>
										<option>Petrol</option>
										<option>Diesel</option>
										<option>Electric</option>
										<option>Hybrid</option>
									</select>

									<input
										style={{ gridColumn: "1 / -1" }}
										value={editForm.imageUrl}
										onChange={(e) =>
											setEditForm((f) => ({ ...f, imageUrl: e.target.value }))
										}
										placeholder='Image URL (optional)'
									/>

									<label
										style={{
											gridColumn: "1 / -1",
											display: "flex",
											gap: 8,
											alignItems: "center",
										}}>
										<input
											type='checkbox'
											checked={editForm.isActive}
											onChange={(e) =>
												setEditForm((f) => ({
													...f,
													isActive: e.target.checked,
												}))
											}
										/>
										Active
									</label>
								</div>

								<div style={{ display: "flex", gap: 8, marginTop: 10 }}>
									<button onClick={() => saveEdit(c._id)}>Save</button>
									<button onClick={cancelEdit}>Cancel</button>
								</div>
							</div>
						) : (
							<>
								<div>
									<div style={{ fontWeight: 700 }}>
										{c.brand} {c.model} ({c.year})
									</div>
									<div>
										{c.category} • ${c.pricePerDay}/day • {c.fuelType} •{" "}
										{c.transmission} • Seats: {c.seats}
									</div>
									<div>
										Status:{" "}
										<b style={{ color: c.isActive ? "green" : "crimson" }}>
											{c.isActive ? "ACTIVE" : "INACTIVE"}
										</b>
									</div>
								</div>

								<div
									style={{ display: "flex", flexDirection: "column", gap: 8 }}>
									<button onClick={() => toggleActive(c)}>
										{c.isActive ? "Deactivate" : "Activate"}
									</button>
									<button onClick={() => startEdit(c)}>Edit</button>
								</div>
							</>
						)}
					</div>
				))}

				{!loading && items.length === 0 ? <p>No cars found.</p> : null}
			</div>

			<button style={{ marginTop: 12 }} onClick={load}>
				Refresh
			</button>
		</div>
	);
}
