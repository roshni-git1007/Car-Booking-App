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
		<div className='min-h-[80vh] flex items-center justify-center px-4'>
			<div className='w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-sm p-6 space-y-4'>
				<h1 className='text-2xl font-semibold text-gray-900'>Create Car</h1>
				{/* <p style={{ color: "#555" }}>
        This page calls <code>POST /api/cars</code> (admin-only).
      </p> */}

				{msg && (
  <div
    className={`mb-4 rounded-lg px-4 py-3 text-sm font-medium border
      ${msg.startsWith("✅")
        ? "bg-green-50 text-green-700 border-green-300"
        : "bg-red-50 text-red-700 border-red-300"}`}
  >
    {msg}
  </div>
)}


				<form onSubmit={onSubmit} className='max-w-5xl mx-auto'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
						{/* LEFT COLUMN */}
						<div className='space-y-4'>
							<div className='space-y-1'>
								<label className='text-sm font-medium text-gray-700'>
									Brand
								</label>
								<input
									className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10'
									placeholder='e.g., Toyota'
									value={form.brand}
									onChange={(e) =>
										setForm((f) => ({ ...f, brand: e.target.value }))
									}
									required
								/>
							</div>

							<div className='space-y-1'>
								<label className='text-sm font-medium text-gray-700'>
									Model
								</label>
								<input
									className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10'
									placeholder='e.g., Camry'
									value={form.model}
									onChange={(e) =>
										setForm((f) => ({ ...f, model: e.target.value }))
									}
									required
								/>
							</div>

							<div className='space-y-1'>
								<label className='text-sm font-medium text-gray-700'>
									Year
								</label>
								<input
									type='number'
									className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10'
									value={form.year}
									onChange={(e) =>
										setForm((f) => ({ ...f, year: e.target.value }))
									}
									min={1990}
									max={2100}
								/>
							</div>

							<div className='space-y-1'>
								<label className='text-sm font-medium text-gray-700'>
									Category
								</label>
								<input
									className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10'
									placeholder='e.g., Sedan, SUV'
									value={form.category}
									onChange={(e) =>
										setForm((f) => ({ ...f, category: e.target.value }))
									}
								/>
							</div>

							<div className='space-y-1'>
								<label className='text-sm font-medium text-gray-700'>
									Price Per Day ($)
								</label>
								<input
									type='number'
									className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10'
									value={form.pricePerDay}
									onChange={(e) =>
										setForm((f) => ({ ...f, pricePerDay: e.target.value }))
									}
									min={1}
								/>
							</div>
						</div>

						{/* RIGHT COLUMN */}
						<div className='space-y-4'>
							<div className='space-y-1'>
								<label className='text-sm font-medium text-gray-700'>
									Transmission
								</label>
								<select
									value={form.transmission}
									onChange={(e) =>
										setForm((f) => ({ ...f, transmission: e.target.value }))
									}
									className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10'>
									<option value='Automatic'>Automatic</option>
									<option value='Manual'>Manual</option>
								</select>
							</div>

							<div className='space-y-1'>
								<label className='text-sm font-medium text-gray-700'>
									Fuel Type
								</label>
								<select
									value={form.fuelType}
									onChange={(e) =>
										setForm((f) => ({ ...f, fuelType: e.target.value }))
									}
									className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10'>
									<option value='Petrol'>Petrol</option>
									<option value='Diesel'>Diesel</option>
									<option value='Electric'>Electric</option>
									<option value='Hybrid'>Hybrid</option>
									<option value='Gasoline'>Gasoline</option>
								</select>
							</div>

							<div className='space-y-1'>
								<label className='text-sm font-medium text-gray-700'>
									Seats
								</label>
								<input
									type='number'
									className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10'
									value={form.seats}
									onChange={(e) =>
										setForm((f) => ({ ...f, seats: e.target.value }))
									}
									min={1}
									max={12}
								/>
							</div>

							<div className='pt-2'>
								<label className='flex items-center gap-2 text-sm text-gray-700'>
									<input
										type='checkbox'
										checked={form.isActive}
										onChange={(e) =>
											setForm((f) => ({ ...f, isActive: e.target.checked }))
										}
										className='h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900'
									/>
									Active (visible to users)
								</label>
							</div>

							<button
								disabled={loading}
								className='w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50'>
								{loading ? "Creating..." : "Create Car"}
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}
