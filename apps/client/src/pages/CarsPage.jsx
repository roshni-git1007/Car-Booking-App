import { useEffect, useState } from "react";
import api from "../lib/api";
import { getUser } from "../lib/auth";

export default function CarsPage() {
	const user = getUser();
	const [cars, setCars] = useState([]);
	const [loading, setLoading] = useState(true);

	const [booking, setBooking] = useState({
		carId: "",
		startDate: "",
		endDate: "",
	});

	const [message, setMessage] = useState("");
	const [checkoutUrl, setCheckoutUrl] = useState("");

	async function loadCars() {
		setLoading(true);
		const res = await api.get("/api/cars");
		setCars(res.data.items || []);
		setLoading(false);
	}

	useEffect(() => {
		loadCars();
	}, []);

	async function createBookingAndCheckout(e) {
		e.preventDefault();
		setMessage("");
		setCheckoutUrl("");

		if (!user) {
			setMessage("Please login to create a booking.");
			return;
		}
		if (!booking.carId || !booking.startDate || !booking.endDate) {
			setMessage("Please select car, start date, and end date.");
			return;
		}

		try {
			// Create booking
			const bRes = await api.post("/api/bookings", {
				carId: booking.carId,
				startDate: new Date(booking.startDate).toISOString(),
				endDate: new Date(booking.endDate).toISOString(),
			});

			const bookingId = bRes.data._id;

			// Create checkout session
			const pRes = await api.post("/api/payments/checkout", { bookingId });

			setCheckoutUrl(pRes.data.checkoutUrl);
			setMessage("Checkout session created. Click Pay Now.");
		} catch (err) {
			setMessage(err?.response?.data?.message || "Failed to book");
		}
	}

	return (
		<div>
			<h2>Cars</h2>
			{loading ? <p>Loading...</p> : null}

			{cars.length === 0 && !loading ? <p>No cars found.</p> : null}

			<div style={{ display: "grid", gap: 10 }}>
				{cars.map((c) => (
					<div
						key={c._id}
						style={{
							border: "1px solid #ddd",
							borderRadius: 10,
							padding: 12,
							display: "flex",
							justifyContent: "space-between",
							gap: 10,
						}}>
						<div>
							<div style={{ fontWeight: 700 }}>
								{c.brand} {c.model}
							</div>
							<div>{c.category}</div>
							<div>${c.pricePerDay} / day</div>
						</div>

						<button onClick={() => setBooking((b) => ({ ...b, carId: c._id }))}>
							Select
						</button>
					</div>
				))}
			</div>

			<hr style={{ margin: "18px 0" }} />

			<h3>Create Booking</h3>
			<p style={{ color: "#555" }}>
				Selected carId: <code>{booking.carId || "none"}</code>
			</p>

			<form
				onSubmit={createBookingAndCheckout}
				style={{ display: "grid", gap: 10, maxWidth: 420 }}>
				<label>
					Start Date/Time
					<input
						type='datetime-local'
						value={booking.startDate}
						onChange={(e) =>
							setBooking((b) => ({ ...b, startDate: e.target.value }))
						}
					/>
				</label>

				<label>
					End Date/Time
					<input
						type='datetime-local'
						value={booking.endDate}
						onChange={(e) =>
							setBooking((b) => ({ ...b, endDate: e.target.value }))
						}
					/>
				</label>

				<button>Create booking & prepare payment</button>
			</form>

			{message && <p style={{ marginTop: 12 }}>{message}</p>}

			{checkoutUrl && (
				<p style={{ marginTop: 8 }}>
					<button onClick={() => (window.location.href = checkoutUrl)}>
						Pay Now (Stripe Checkout)
					</button>
				</p>
			)}
		</div>
	);
}
