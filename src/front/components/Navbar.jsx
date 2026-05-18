import { Link, useLocation } from "react-router-dom";
import desvanLogo from "../assets/img/desvanlogonav.png";
import create_ico from "../assets/img/create_ico.png";
import favorites_ico from "../assets/img/favorites_ico1.png";
import user_ico from "../assets/img/profile_ico+.png";

export const Navbar = () => {
	const location = useLocation();
	const isAuthenticated = !!localStorage.getItem("token");

	return (
		<nav className="custom-navbar">
			<div className="container-fluid">
				<div className="nav-brand">
					<Link to="/explorar">
						<img src={desvanLogo} alt="Desván Logo" className="nav-brand-img" />
					</Link>
				</div>
				<div className="nav-search">
					<i className="fa-solid fa-magnifying-glass"></i>
					<input type="text" placeholder="Buscar rastros, ferias, antigüedades..." />
				</div>
				<div className="nav-actions">
					<Link to={isAuthenticated ? "/favorites" : "/login"}>
						<img src={favorites_ico} alt="favorites" className="favorites_ico"/>
					</Link>
					<Link to={isAuthenticated ? "/profile" : "/login"}>
						<img src={user_ico} alt="user" className="user_ico"/>
					</Link>
					<Link to={isAuthenticated ? "/crear-evento" : "/login"} style={{ textDecoration: 'none' }}>
						<button className="btn-primary-custom">
							<img src={create_ico} alt="sdsdsd" className="ico_create"/> Crear evento
						</button>
					</Link>
				</div>
			</div>
		</nav>
	);
};