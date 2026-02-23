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
		const delay = setTimeout(() => {
			load();
		}, 400); // 400ms debounce

		return () => clearTimeout(delay);
	}, [filters]);

	return (
		<div>
			<h2 className='text-xl font-semibold mb-4'>Admin: Audit Logs</h2>
			<div className='max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6 mt-6'>
				<h2 className='text-xl font-semibold mb-4'>Filters : </h2>

				<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
					<input
						className='border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
						placeholder='Action (e.g. BOOKING_CREATED)'
						value={filters.action}
						onChange={(e) =>
							setFilters((f) => ({ ...f, action: e.target.value }))
						}
					/>

					<input
						className='border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
						placeholder='Entity Type (e.g. Booking)'
						value={filters.entityType}
						onChange={(e) =>
							setFilters((f) => ({ ...f, entityType: e.target.value }))
						}
					/>

					<input
						className='border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
						placeholder='Entity ID'
						value={filters.entityId}
						onChange={(e) =>
							setFilters((f) => ({ ...f, entityId: e.target.value }))
						}
					/>
				</div>

				<div className='mt-4'></div>
			</div>

			<div className='mt-6 flex items-center justify-center gap-2 text-sm'>
				{/* Prev */}
				<button
					disabled={filters.page <= 1}
					onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
					className={[
						"px-4 py-2 rounded-lg border transition",
						filters.page <= 1
							? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
							: "bg-white text-gray-700 border-gray-300 hover:bg-gray-900 hover:text-white",
					].join(" ")}>
					← Prev
				</button>

				{/* Page Indicator */}
				<div className='px-4 py-2 rounded-lg bg-gray-900 text-white font-medium shadow-sm'>
					Page {filters.page}
				</div>

				{/* Next */}
				<button
					onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))} 
					className='px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-900 hover:text-white transition'>
					Next →
				</button>
			</div>

			<div className='mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm'>
				<table className='min-w-full text-sm text-gray-700'>
					<thead className='bg-gray-50 text-xs uppercase tracking-wider text-gray-600'>
						<tr>
							<th className='px-4 py-3 text-left'>Time</th>
							<th className='px-4 py-3 text-left'>Action</th>
							<th className='px-4 py-3 text-left'>Actor</th>
							<th className='px-4 py-3 text-left'>Entity</th>
							<th className='px-4 py-3 text-left'>Message</th>
						</tr>
					</thead>

					<tbody className='divide-y divide-gray-100'>
						{items.map((l) => (
							<tr key={l._id} className='hover:bg-gray-50 transition-colors'>
								<td className='px-4 py-3 whitespace-nowrap text-gray-500'>
									{new Date(l.createdAt).toLocaleString()}
								</td>

								<td className='px-4 py-3'>
									<span className='rounded-md bg-gray-100 px-2 py-1 font-mono text-xs text-gray-800'>
										{l.action}
									</span>
								</td>

								<td className='px-4 py-3'>
									{l.actorUser?.email || (
										<span className='text-gray-400 italic'>{l.actorRole}</span>
									)}
								</td>

								<td className='px-4 py-3 text-gray-600'>
									<span className='font-medium'>{l.entityType}</span>
									<span className='text-gray-400'> : {l.entityId}</span>
								</td>

								<td className='px-4 py-3'>{l.message}</td>
							</tr>
						))}

						{items.length === 0 && (
							<tr>
								<td colSpan='5' className='px-4 py-6 text-center text-gray-400'>
									No logs found.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
