import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../lib/api";

export default function PaymentSuccessPage() {
  const [params] = useSearchParams();
  const bookingId = params.get("bookingId");

  const [booking, setBooking] = useState(null);
  const [message, setMessage] = useState("Confirming payment...");

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      if (!bookingId) {
        setMessage("Missing bookingId in URL.");
        return;
      }

      // try up to ~10 times (about 10 seconds)
      for (let i = 0; i < 10; i++) {
        try {
          const res = await api.get(`/api/bookings/${bookingId}`);
          if (cancelled) return;

          setBooking(res.data);

          if (res.data.status === "paid") {
            setMessage("Payment confirmed ✅");
            return;
          }

          setMessage(`Still processing... (status: ${res.data.status})`);
        } catch {
          // ignore transient errors
        }

        await new Promise((r) => setTimeout(r, 1000));
      }

      setMessage("Payment may still be processing. Check My Bookings in a moment.");
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  return (
    <div>
      <h2>Payment Success ✅</h2>
      <p>{message}</p>

      <p>
        BookingId: <code>{bookingId || "missing"}</code>
      </p>

      {booking && (
        <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
          <div>Status: <b>{booking.status}</b></div>
          <div>Total: ${booking.totalAmount}</div>
          <div>
            {new Date(booking.startDate).toLocaleString()} → {new Date(booking.endDate).toLocaleString()}
          </div>
        </div>
      )}

      <p style={{ marginTop: 12 }}>
        <Link to="/my-bookings">Go to My Bookings</Link>
      </p>
    </div>
  );
}
