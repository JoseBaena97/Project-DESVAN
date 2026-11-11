import { Outlet, Navigate } from "react-router-dom";
import ScrollToTop from "../../components/ScrollToTop";
import { Navbar } from "../../components/Navbar";
import { AccountSidebar } from "../../components/account/AccountSidebar";
import { PageTransition } from "../../components/PageTransition";
import "./account.css";

export const AccountLayout = () => {
	const token = localStorage.getItem('token');
	if (!token) {
		return <Navigate to="/login" replace />;
	}

	return (
		<ScrollToTop>
			<div className="account-page">
				<Navbar />
				<div className="container account-layout">
					<div className="row g-4 align-items-start">
						<div className="col-12 col-xl-auto">
							<AccountSidebar />
						</div>
						<div className="col-12 col-xl">
							<PageTransition>
								<main className="account-main">
									<Outlet />
								</main>
							</PageTransition>
						</div>
					</div>
				</div>
			</div>
		</ScrollToTop>
	);
};
