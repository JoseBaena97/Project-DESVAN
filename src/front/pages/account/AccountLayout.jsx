import { Outlet } from "react-router-dom";
import ScrollToTop from "../../components/ScrollToTop";
import { Navbar } from "../../components/Navbar";
import { AccountSidebar } from "../../components/account/AccountSidebar";
import { PageTransition } from "../../components/PageTransition";
import "./account.css";

export const AccountLayout = () => {
	return (
		<ScrollToTop>
			<div className="account-page">
				<Navbar />
				<div className="container account-layout">
					<div className="row g-4 align-items-start">
						<div className="col-12 col-lg-auto">
							<AccountSidebar />
						</div>
						<div className="col-12 col-lg">
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
