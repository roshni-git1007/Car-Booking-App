import { useSearchParams, Link } from "react-router-dom";

export default function PaymentCancelledPage() {
  const [params] = useSearchParams();
  const bookingId = params.get("bookingId");

  return (
    <div>
      <h2>Payment Cancelled</h2>
      <p>BookingId: <code>{bookingId || "missing"}</code></p>
      <p>
        <Link to="/my-bookings">Back to My Bookings</Link>
      </p>
    </div>
  );
}