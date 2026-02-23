import { Link, useLocation } from "react-router-dom";
import { getUser, isAdmin } from "../lib/auth";

function NavItem({ to, children }) {
	const { pathname } = useLocation();
	const active = pathname === to;

	return (
		<Link
			to={to}
			className={[
				"px-3 py-2 rounded-lg text-sm font-medium transition",
				active
					? "bg-gray-900 text-white"
					: "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
			].join(" ")}>
			{children}
		</Link>
	);
}

export default function Layout({ onLogout, children }) {
	const user = getUser();
	const loggedIn = !!user;

	return (
		<div className='min-h-screen bg-gray-50'>
			<header className='sticky top-0 z-10 border-b bg-white/80 backdrop-blur'>
				<div className='mx-auto max-w-5xl px-4 py-3 flex items-center gap-4'>
					<Link to='/' className='flex items-center gap-3'>
						<div className='h-9 w-9 rounded-xl bg-gray-900 text-white flex items-center justify-center font-bold'>
							CB
						</div>
						<div>
							<div className='text-sm text-gray-500 leading-none'>
								Car Booking
							</div>
							<div className='text-base font-semibold leading-none'>
								{user ? `Hi, ${user.name}` : "Welcome"}
							</div>
						</div>
					</Link>

					<nav className='ml-auto flex items-center gap-2'>
						{loggedIn && <NavItem to='/'>Cars</NavItem>}
						{user?.role !== "admin" && loggedIn && (
							<>
								<NavItem to='/my-bookings'>My Bookings</NavItem>
							</>
						)}

						{isAdmin() ? (
							<>
								<NavItem to='/admin/audit-logs'>Audit Logs</NavItem>
								<NavItem to='/admin/cars'>Add Cars</NavItem>
								<NavItem to='/admin/manage-cars'>Manage Cars</NavItem>
							</>
						) : null}

						{!loggedIn ? (
							<>
								<NavItem to='/login'>Login</NavItem>
								<NavItem to='/register'>Register</NavItem>
							</>
						) : (
							<button
								onClick={() => {
									if (window.confirm("Are you sure you want to logout?")) {
										onLogout();
									}
								}}
								className='ml-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition'>
								Logout
							</button>
						)}
					</nav>
				</div>
			</header>
			<main className='mx-auto max-w-5xl px-4 py-8'>{children}</main>
		</div>
	);
}
