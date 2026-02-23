import { useEffect, useState } from "react";
import api from "../lib/api";

function StatusBadge({ status }) {
	const base =
		"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium";
	if (status === "paid")
		return <span className={`${base} bg-green-100 text-green-800`}>Paid</span>;
	if (status === "pending_payment")
		return (
			<span className={`${base} bg-yellow-100 text-yellow-800`}>
				Pending Payment
			</span>
		);
	return <span className={`${base} bg-gray-100 text-gray-800`}>{status}</span>;
}

function formatMoney(n) {
	return `$${Number(n || 0).toFixed(0)}`;
}

function formatRange(startISO, endISO) {
	try {
		const s = new Date(startISO).toLocaleString();
		const e = new Date(endISO).toLocaleString();
		return `${s} → ${e}`;
	} catch {
		return `${startISO} → ${endISO}`;
	}
}

export default function MyBookingsPage() {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState("");

	async function loadMyBookings() {
		setLoading(true);
		setMessage("");
		try {
			const res = await api.get("/api/bookings/me");
			setItems(res.data.items || []);
		} catch (err) {
			setMessage(err?.response?.data?.message || "Failed to load bookings");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		loadMyBookings();
	}, []);

	async function payNow(bookingId) {
		setMessage("");
		try {
			const res = await api.post("/api/payments/checkout", { bookingId });
			const url = res.data.checkoutUrl;
			if (!url) {
				setMessage("Checkout URL not returned by server.");
				return;
			}
			window.location.href = url;
		} catch (err) {
			setMessage(err?.response?.data?.message || "Failed to start payment");
		}
	}

	return (
		<div className='space-y-6'>
			<div className='flex items-start justify-between gap-4'>
				<div>
					<h1 className='text-2xl font-semibold text-gray-900'>My Bookings</h1>
					<p className='mt-1 text-sm text-gray-600'>
						View your bookings, payment status, and pay for pending ones.
					</p>
				</div>

				<button
					onClick={loadMyBookings}
					className='rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50'>
					Refresh
				</button>
			</div>

			{message ? (
				<div className='rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800'>
					{message}
				</div>
			) : null}

			{loading ? (
				<div className='rounded-2xl border border-gray-200 bg-white p-6'>
					<p className='text-sm text-gray-600'>Loading bookings…</p>
				</div>
			) : items.length === 0 ? (
				<div className='rounded-2xl border border-gray-200 bg-white p-6'>
					<p className='text-sm text-gray-600'>
						No bookings yet. Go to Cars and create one.
					</p>
				</div>
			) : (
				<div className='grid gap-4'>
					{items.map((b) => (
						<div
							key={b._id}
							className='rounded-2xl border border-gray-200 bg-white p-5 shadow-sm'>
							<div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
								<div className='space-y-1'>
									<div className='flex items-center gap-2'>
										<h3 className='text-base font-semibold text-gray-900'>
											{b.car?.brand} {b.car?.model}
										</h3>
										<span className='text-gray-500 font-normal'>
												({b.car?.year})
											</span>
										<StatusBadge status={b.status} />
									</div>
									<div className='mt-2 flex flex-wrap gap-2 text-xs'>
											<span className='px-2 py-1 bg-gray-100 rounded-md'>
												{b.car?.fuelType}
											</span>
											<span className='px-2 py-1 bg-gray-100 rounded-md'>
												{b.car?.transmission}
											</span>
											<span className='px-2 py-1 bg-gray-100 rounded-md'>
												{b.car?.seats} Seats
											</span>
										</div>
									<p className='text-sm text-gray-600'>{b.car?.category}</p>
									<p className='text-sm text-gray-700'>
										{formatRange(b.startDate, b.endDate)}
									</p>

									<div className='mt-2 text-sm text-gray-800'>
										<span className='font-medium'>Total:</span>{" "}
										<span className='font-semibold'>
											{formatMoney(b.totalAmount)}
										</span>
										<span className='text-gray-500'>
											{" "}
											({formatMoney(b.pricePerDaySnapshot)} / day)
										</span>
									</div>

									<p className='mt-2 text-xs text-gray-500'>
										Booking ID: <span className='font-mono'>{b._id}</span>
									</p>
								</div>

								<div className='flex flex-col justify-center gap-2 sm:min-w-[220px]'>
									{b.status === "pending_payment" ? (
										<button
											onClick={() => payNow(b._id)}
											className='rounded-lg bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-800'>
											Pay Now
										</button>
									) : null}
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
