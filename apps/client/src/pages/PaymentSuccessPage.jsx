import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../lib/api";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function StatusBadge({ status }) {
  const base = "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium";
  if (status === "paid") return <span className={`${base} bg-green-100 text-green-800`}>Paid</span>;
  if (status === "pending_payment") return <span className={`${base} bg-yellow-100 text-yellow-800`}>Pending Payment</span>;
  return <span className={`${base} bg-gray-100 text-gray-800`}>{status}</span>;
}

function formatMoney(n) {
  return `$${Number(n || 0).toFixed(0)}`;
}

export default function PaymentSuccessPage() {
  const query = useQuery();
  const navigate = useNavigate();
  const bookingId = query.get("bookingId") || "";

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [info, setInfo] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      if (!bookingId) {
        setLoading(false);
        setInfo("Missing bookingId in URL.");
        return;
      }

      setLoading(true);
      setInfo("Confirming payment…");

      const startedAt = Date.now();
      const timeoutMs = 12000; // 12s
      const intervalMs = 1000; // 1s

      while (!cancelled && Date.now() - startedAt < timeoutMs) {
        try {
          const res = await api.get(`/api/bookings/${bookingId}`);
          if (cancelled) return;

          setBooking(res.data);

          if (res.data.status === "paid") {
            setInfo("Payment confirmed ✅ Redirecting to My Bookings…");
            setLoading(false);

            // Redirect after a short pause so the user sees confirmation
            setTimeout(() => {
              if (!cancelled) navigate("/my-bookings");
            }, 3000);

            return;
          }

          // Still pending → keep polling
          setInfo("Payment is processing… (waiting for webhook)");
        } catch (err) {
          // If auth issue, or booking not found, stop polling with a message
          setLoading(false);
          setInfo(err?.response?.data?.message || "Could not verify booking yet.");
          return;
        }

        // wait
        await new Promise((r) => setTimeout(r, intervalMs));
      }

      if (!cancelled) {
        setLoading(false);
        setInfo("Still processing. Your payment may take a moment to confirm.");
      }
    }

    poll();

    return () => {
      cancelled = true;
    };
  }, [bookingId, navigate]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Payment Success ✅</h1>
            <p className="mt-1 text-sm text-gray-600">
              We’re confirming your booking status.
            </p>
          </div>

          {booking?.status ? <StatusBadge status={booking.status} /> : null}
        </div>

        <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800">
          {info || "Loading…"}
        </div>

        <div className="mt-6 space-y-2 text-sm text-gray-800">
          <div>
            <span className="text-gray-500">BookingId:</span>{" "}
            <span className="font-mono">{bookingId || "—"}</span>
          </div>

          {booking ? (
            <>
              <div>
                <span className="text-gray-500">Total:</span>{" "}
                <span className="font-semibold">{formatMoney(booking.totalAmount)}</span>
              </div>
              <div>
                <span className="text-gray-500">Car:</span>{" "}
                <span className="font-medium">
                  {booking.car?.brand} {booking.car?.model}
                </span>
              </div>
            </>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/my-bookings"
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Go to My Bookings
          </Link>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
          >
            Back to Cars
          </button>

          {/* Optional: allow manual retry if webhook is slow */}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
          >
            Re-check
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Note: In development, webhook confirmation depends on Stripe webhook delivery (Stripe CLI).
        In production, Stripe delivers webhooks directly to your server.
      </p>
    </div>
  );
}