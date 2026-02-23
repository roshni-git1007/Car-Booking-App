import { useEffect, useMemo, useState, useRef } from "react";
import api from "../lib/api";
import { getUser } from "../lib/auth";

function diffDays(startISO, endISO) {
	if (!startISO || !endISO) return 0;
	const start = new Date(startISO);
	const end = new Date(endISO);
	if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
	const ms = end.getTime() - start.getTime();
	if (ms <= 0) return 0;
	return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function formatMoney(n) {
	return `$${Number(n || 0).toFixed(0)}`;
}

export default function CarsPage() {
	const user = getUser();
	const isAdmin = user?.role === "admin";
	const [cars, setCars] = useState([]);
	const [loading, setLoading] = useState(true);

	const [booking, setBooking] = useState({
		carId: "",
		startDate: "",
		endDate: "",
	});

	const [message, setMessage] = useState("");
	const [checkoutUrl, setCheckoutUrl] = useState("");
	const [latestBooking, setLatestBooking] = useState(null);
	const bookingRef = useRef(null);
	const [errors, setErrors] = useState({});
	const [messageType, setMessageType] = useState("info"); // "info" | "error"
	const [submitting, setSubmitting] = useState(false);

	async function loadCars() {
		setLoading(true);
		const res = await api.get("/api/cars");
		setCars(res.data.items || []);
		setLoading(false);
	}

	useEffect(() => {
		loadCars();
	}, []);

	useEffect(() => {
		// show errors only after a car is selected (prevents noise)
		if (!booking.carId) {
			setErrors({});
			return;
		}
		const e = {};
		if (booking.startDate && booking.endDate) {
			const start = new Date(booking.startDate);
			const end = new Date(booking.endDate);
			if (
				!Number.isNaN(start.getTime()) &&
				!Number.isNaN(end.getTime()) &&
				start >= end
			) {
				e.dateRange = "End must be after start.";
			}
		}

		setErrors((prev) => ({ ...prev, ...e }));
	}, [booking.carId, booking.startDate, booking.endDate]);

	const selectedCar = useMemo(
		() => cars.find((c) => c._id === booking.carId),
		[cars, booking.carId],
	);

	const startISO = booking.startDate
		? new Date(booking.startDate).toISOString()
		: "";
	const endISO = booking.endDate ? new Date(booking.endDate).toISOString() : "";

	const days = diffDays(startISO, endISO);
	const pricePerDay = selectedCar?.pricePerDay || 0;
	const total = days > 0 ? days * pricePerDay : 0;

	function validateBooking() {
		const e = {};
		const now = new Date();

		if (!booking.carId) {
			e.carId = "Please select a car first.";
		}

		if (!booking.startDate) {
			e.startDate = "Start date/time is required.";
		}

		if (!booking.endDate) {
			e.endDate = "End date/time is required.";
		}

		if (booking.startDate) {
			const start = new Date(booking.startDate);
			if (Number.isNaN(start.getTime())) {
				e.startDate = "Invalid start date.";
			} else if (start < now) {
				e.startDate = "Start date cannot be in the past.";
			}
		}

		if (booking.startDate && booking.endDate) {
			const start = new Date(booking.startDate);
			const end = new Date(booking.endDate);

			if (Number.isNaN(end.getTime())) {
				e.endDate = "Invalid end date.";
			} else if (!Number.isNaN(start.getTime()) && end <= start) {
				e.dateRange = "End must be after start.";
			}
		}

		return e;
	}
	async function createBookingAndCheckout(e) {
		e.preventDefault();
		setSubmitting(true);
		setMessage("");
		setCheckoutUrl("");
		setErrors({});
		const eMap = validateBooking();
		if (Object.keys(eMap).length > 0) {
			setErrors(eMap);
			setMessage("Please fix the highlighted fields.");
			setMessageType("error");
			setSubmitting(false);
			return;
		}

		if (!user) {
			setMessage("Please login to create a booking.");
			setSubmitting(false);
			setMessageType("error");
			return;
		}
		if (!booking.carId || !booking.startDate || !booking.endDate) {
			setMessage("Please select car, start date, and end date.");
			setSubmitting(false);
			setMessageType("error");
			return;
		}
		if (days <= 0) {
			setMessage("Please select a valid date range.");
			setSubmitting(false);
			setMessageType("error");
			return;
		}

		try {
			const bRes = await api.post("/api/bookings", {
				carId: booking.carId,
				startDate: startISO,
				endDate: endISO,
			});

			const bookingId = bRes.data._id;
			setMessageType("info");
			setLatestBooking(bRes.data);

			const pRes = await api.post("/api/payments/checkout", { bookingId });
			setCheckoutUrl(pRes.data.checkoutUrl);

			setMessage("Checkout session created. Click Pay Now.");
		} catch (err) {
			const msg = err?.response?.data?.message || "Failed to book";
			setMessage(msg);
			setMessageType("error");
			setSubmitting(false);
		}
	}
	async function refreshBookingStatus() {
		if (!latestBooking?._id) return;
		try {
			const res = await api.get(`/api/bookings/${latestBooking._id}`);
			setLatestBooking(res.data);
			setMessage(`Booking status: ${res.data.status}`);
		} catch (err) {
			setMessage(err?.response?.data?.message || "Failed to refresh booking");
		}
	}
	function clearSelection() {
		setBooking({ carId: "", startDate: "", endDate: "" });
		setCheckoutUrl("");
		setLatestBooking(null);
		setErrors({});
		setMessage("");
		setMessageType("info");
		setSubmitting(false);
	}

	const nowLocal = new Date();
	nowLocal.setMinutes(nowLocal.getMinutes() - nowLocal.getTimezoneOffset());
	const minDateTime = nowLocal.toISOString().slice(0, 16);
	return (
		<div className='space-y-6'>
			{/* Page header */}
			<div className='flex items-start justify-between gap-4'>
				<div>
					<h1 className='text-2xl font-semibold text-gray-900'>Cars</h1>
					{isAdmin && (
						<div className='rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800'>
							Admin view: Cars are read-only. Bookings can only be created by
							customers.
						</div>
					)}
					{!isAdmin && (
						<p className='mt-1 text-sm text-gray-600'>
							Choose a car, select dates, then pay securely with Stripe.
						</p>
					)}
				</div>

				<button
					onClick={loadCars}
					className='rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50'>
					Refresh
				</button>
			</div>

			{/* Cars list */}
			{loading ? (
				<div className='rounded-2xl border border-gray-200 bg-white p-6'>
					<p className='text-sm text-gray-600'>Loading cars…</p>
				</div>
			) : cars.length === 0 ? (
				<div className='rounded-2xl border border-gray-200 bg-white p-6'>
					<p className='text-sm text-gray-600'>No cars found.</p>
				</div>
			) : (
				<div className='grid gap-4 sm:grid-cols-2'>
					{cars.map((c) => {
						const isSelected = booking.carId === c._id;
						return (
							<div
								key={c._id}
								className={[
									"rounded-2xl border p-4 shadow-sm transition",
									isSelected
										? "border-gray-900 ring-2 ring-gray-900/20 bg-gray-50"
										: "border-gray-200 bg-white hover:border-gray-300",
								].join(" ")}>
								<div className='flex items-start justify-between gap-3'>
									<div>
										{/* Title */}
										<h3 className='text-base font-semibold text-gray-900'>
											{c.brand} {c.model}{" "}
											<span className='text-gray-500 font-normal'>
												({c.year})
											</span>
										</h3>

										{/* Category */}
										<p className='text-sm text-gray-600 mt-1'>{c.category}</p>

										{/* Car Specs */}
										<div className='mt-2 flex flex-wrap gap-2 text-xs'>
											<span className='px-2 py-1 bg-gray-100 rounded-md'>
												{c.fuelType}
											</span>
											<span className='px-2 py-1 bg-gray-100 rounded-md'>
												{c.transmission}
											</span>
											<span className='px-2 py-1 bg-gray-100 rounded-md'>
												{c.seats} Seats
											</span>
										</div>

										{/* Price */}
										<p className='mt-3 text-sm font-semibold text-gray-900'>
											{formatMoney(c.pricePerDay)}
											<span className='text-gray-500 font-normal'> / day</span>
										</p>
									</div>
									<button
										disabled={isAdmin}
										onClick={() => {
											if (isAdmin) return;

											setBooking((b) => ({ ...b, carId: c._id }));
											setMessageType("info");
											setMessage(
												"✅ Car selected. Now pick start and end dates below.",
											);
											document.getElementById("booking-panel")?.scrollIntoView({
												behavior: "smooth",
												block: "start",
											});
										}}
										className={[
											"rounded-lg px-3 py-2 text-sm font-medium transition",
											isAdmin
												? "bg-gray-100 text-gray-400 cursor-not-allowed"
												: isSelected
													? "bg-gray-900 text-white hover:bg-gray-800"
													: "bg-gray-100 text-gray-900 hover:bg-gray-200",
										].join(" ")}>
										{isAdmin ? "View only" : isSelected ? "Selected" : "Select"}
									</button>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* Booking panel */}
			{!isAdmin && (
				<div className='rounded-2xl border border-gray-200 bg-white p-5 shadow-sm'>
					<div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
						<div
							id='booking-panel'
							className='rounded-2xl border border-gray-200 bg-white p-5 shadow-sm'>
							<h2 className='text-lg font-semibold text-gray-900'>
								Create Booking
							</h2>
							<p className='mt-1 text-sm text-gray-600'>
								Selected car:{" "}
								<span className='font-medium text-gray-900'>
									{selectedCar
										? `${selectedCar.brand} ${selectedCar.model}`
										: "none"}
								</span>
							</p>

							<div className='mt-3 text-sm text-gray-700'>
								{selectedCar ? (
									days > 0 ? (
										<p>
											Summary: <span className='font-semibold'>{days}</span>{" "}
											day(s) ×{" "}
											<span className='font-semibold'>
												{formatMoney(pricePerDay)}
											</span>{" "}
											={" "}
											<span className='font-semibold'>
												{formatMoney(total)}
											</span>
										</p>
									) : (
										<p className='text-gray-500'>
											Pick valid start & end date to see total.
										</p>
									)
								) : (
									<p className='text-gray-500'>
										Select a car to see pricing summary.
									</p>
								)}
							</div>
						</div>
						{!booking.carId ? (
							<div className='mb-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800'>
								👉 First select a car from the list above. Then choose start &
								end dates.
							</div>
						) : (
							<div className='mb-3 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800'>
								<span>✅ Car selected. Next: choose start & end dates.</span>
								<button
									type='button'
									onClick={clearSelection}
									className='rounded-lg bg-white px-2 py-1 text-xs font-medium text-gray-900 border border-gray-200 hover:bg-gray-100'>
									Clear
								</button>
							</div>
						)}

						<form
							onSubmit={createBookingAndCheckout}
							className='grid w-full gap-3 md:max-w-md'>
							<label className='grid gap-1 text-sm'>
								<span className='font-medium text-gray-900'>Start</span>
								<input
									type='datetime-local'
									min={minDateTime}
									value={booking.startDate}
									required
									disabled={!booking.carId || isAdmin}
									onChange={(e) => {
										const newStart = e.target.value;
										setBooking((b) => ({
											...b,
											startDate: newStart,
											endDate:
												b.endDate && b.endDate < newStart ? "" : b.endDate, //Auto-clear end date if start changes
										}));
										setErrors((prev) => ({
											...prev,
											startDate: undefined,
											dateRange: undefined,
										}));
									}}
									className={[
										"rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10",
										!booking.carId ? "opacity-50 cursor-not-allowed" : "",
										errors.startDate ? "border-red-500" : "border-gray-200",
									].join(" ")}
								/>
							</label>

							<label className='grid gap-1 text-sm'>
								<span className='font-medium text-gray-900'>End</span>
								<input
									type='datetime-local'
									min={booking.startDate || minDateTime} //prevent:1.Past datesDates 2.before selected start date
									value={booking.endDate}
									required
									disabled={!booking.carId || isAdmin}
									onChange={(e) => {
										setBooking((b) => ({ ...b, endDate: e.target.value }));
										setErrors((prev) => ({
											...prev,
											endDate: undefined,
											dateRange: undefined,
										}));
									}}
									className={[
										"rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10",
										!booking.carId ? "opacity-50 cursor-not-allowed" : "",
										errors.endDate || errors.dateRange
											? "border-red-500"
											: "border-gray-200",
									].join(" ")}
								/>
								{errors.dateRange ? (
									<p className='text-xs text-red-600'>{errors.dateRange}</p>
								) : null}
							</label>
							<button
								disabled={submitting || !booking.carId || days <= 0}
								className='mt-1 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50'>
								{submitting
									? "Preparing checkout…"
									: "Create booking & prepare payment"}
							</button>

							{checkoutUrl && latestBooking?.status === "pending_payment" ? (
								<button
									type='button'
									onClick={() => (window.location.href = checkoutUrl)}
									className='rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50'>
									Pay Now (Stripe Checkout)
								</button>
							) : null}

							{latestBooking ? (
								<button
									type='button'
									onClick={refreshBookingStatus}
									className='rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50'>
									Refresh booking status
								</button>
							) : null}
						</form>
					</div>

					{message ? (
						<div
							className={[
								"mt-4 rounded-lg px-3 py-2 text-sm",
								messageType === "error"
									? "bg-red-50 text-red-700 border border-red-200"
									: "bg-gray-50 text-gray-700 border border-gray-200",
							].join(" ")}>
							{message}
						</div>
					) : null}
				</div>
			)}
		</div>
	);
}
