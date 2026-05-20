import { NavLink, Link } from "react-router-dom";

const NAV_ITEMS = [
	{ to: "/mis-eventos", label: "Mis Eventos", icon: "fa-solid fa-table-cells-large" },
	{ to: "/mis-reservas", label: "Mis Reservas", icon: "fa-solid fa-calendar-days" },
	{ to: "/favoritos", label: "Mis Favoritos", icon: "fa-solid fa-heart" },
	{ to: "/perfil", label: "Mi Perfil", icon: "fa-solid fa-user" },
];

export const AccountSidebar = () => {
	return (
		<div className="account-sidebar-wrap">
		<aside className="account-sidebar">
			<div className="account-sidebar-profile">
				{/* TODO: Sustituye por tu foto de perfil del sidebar
				    <img src={rutaATuImagen} alt="Archibald Vance" className="account-sidebar-avatar" />
				*/}
				<div className="account-sidebar-avatar account-img-placeholder" aria-hidden="true" />

				<div className="account-sidebar-user">
					<strong>Archibald Vance</strong>
					<span>En regla</span>
					<span className="account-sidebar-since">desde Junio 2023</span>
				</div>
			</div>

			<nav className="account-sidebar-nav">
				{NAV_ITEMS.map((item) => (
					<NavLink
						key={item.to}
						to={item.to}
						className={({ isActive }) =>
							`account-nav-link${isActive ? " account-nav-link--active" : ""}`
						}
					>
						<i className={item.icon} />
						{item.label}
					</NavLink>
				))}
			</nav>

			<div className="account-sidebar-footer">
				<Link to="/explorar" className="account-btn-explore">
					VOLVER A EXPLORAR
				</Link>
				<button type="button" className="account-btn-logout">
					<i className="fa-solid fa-right-from-bracket" />
					Cerrar sesión
				</button>
			</div>
		</aside>
		</div>
	);
};
