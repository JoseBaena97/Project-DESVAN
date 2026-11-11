import { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import authService from "../../services/auth.service";

const NAV_ITEMS = [
	{ to: "/mis-eventos", label: "Mis Eventos", icon: "fa-solid fa-table-cells-large" },
	{ to: "/mis-reservas", label: "Mis Reservas", icon: "fa-solid fa-calendar-days" },
	{ to: "/favoritos", label: "Mis Favoritos", icon: "fa-solid fa-heart" },
	{ to: "/mis-valoraciones", label: "Mis Valoraciones", icon: "fa-solid fa-star" },
	{ to: "/perfil", label: "Mi Perfil", icon: "fa-solid fa-user" },
];

export const AccountSidebar = () => {
	const { store, dispatch } = useGlobalReducer();
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);

	const handleLogout = () => {
		authService.logout();
		dispatch({ type: "logout" });
		navigate("/");
	};

	return (
		<div className="account-sidebar-wrap">
		<aside className={`account-sidebar${open ? " account-sidebar--open" : ""}`}>
			<div className="account-sidebar-profile" onClick={() => setOpen(o => !o)}>
				{store.user?.profile_picture_url ? (
					<img src={store.user.profile_picture_url} alt={store.user.username || "Usuario"} className="account-sidebar-avatar" />
				) : (
					<div className="account-img-placeholder account-sidebar-avatar" aria-hidden="true" />
				)}

				<div className="account-sidebar-user">
					<strong>{store.user ? `${(store.user.profile && store.user.profile.firstname) || store.user.username} ${
						(store.user.profile && store.user.profile.lastname) || ""
					}`.trim() : "Usuario"}</strong>
					<span>{store.user ? `@${store.user.username}` : "@usuario"}</span>
					<span className="account-sidebar-since">
						{store.user?.created_at ? new Date(store.user.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }) : ""}
					</span>
				</div>

				<button className="account-sidebar-toggle" aria-label="Mostrar/ocultar menú">
					<i className={`fa-solid fa-chevron-${open ? "up" : "down"}`}></i>
				</button>
			</div>

			<div className="account-sidebar-body">
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
					<button type="button" className="account-btn-logout" onClick={handleLogout}>
						<i className="fa-solid fa-right-from-bracket" />
						Cerrar sesión
					</button>
				</div>
			</div>
		</aside>
		</div>
	);
};
