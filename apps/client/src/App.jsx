//import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { clearAuth, getUser, isAdmin } from "./lib/auth";

import CarsPage from "./pages/CarsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentCancelledPage from "./pages/PaymentCancelledPage";
import AdminAuditLogsPage from "./pages/AdminAuditLogsPage";
import AdminCarsPage from "./pages/AdminCarsPage";
import AdminCarsManagePage from "./pages/AdminCarsManagePage";
import Layout from "./components/Layout";  

function Protected({ children }) {
	const user = getUser();
	if (!user) return <Navigate to='/login' replace />;
	return children;
}

function AdminOnly({ children }) {
	if (!isAdmin()) return <Navigate to='/' replace />;
	return children;
}
export default function App() {
	const user = getUser();
	const navigate = useNavigate();

	function logout() {
		clearAuth();
		navigate("/login");
	}

	return (
  <Layout onLogout={logout}>
    <Routes>
      <Route path="/" element={<CarsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/my-bookings"
        element={
          <Protected>
            <MyBookingsPage />
          </Protected>
        }
      />

      <Route path="/payment-success" element={<PaymentSuccessPage />} />
      <Route path="/payment-cancelled" element={<PaymentCancelledPage />} />

      <Route
        path="/admin/audit-logs"
        element={
          <AdminOnly>
            <AdminAuditLogsPage />
          </AdminOnly>
        }
      />
      <Route
        path="/admin/cars"
        element={
          <AdminOnly>
            <AdminCarsPage />
          </AdminOnly>
        }
      />
      <Route
        path="/admin/manage-cars"
        element={
          <AdminOnly>
            <AdminCarsManagePage />
          </AdminOnly>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Layout>
);

}
