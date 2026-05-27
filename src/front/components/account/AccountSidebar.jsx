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
	const [user, setUser] = useState(store.user);

	useEffect(() => {
		if (store.user) {
			setUser(store.user);
			return;
		}

		const loadUser = async () => {
			const token = localStorage.getItem("token");
			if (!token) return;

			const profile = await authService.getMe();
			const currentUser = profile?.data ?? profile;
			if (currentUser) {
				dispatch({ type: "auth", payload: { user: currentUser } });
				setUser(currentUser);
			}
		};

		loadUser();
	}, [store.user, dispatch]);


	useEffect(() => {
		const load = async () => {
			const resp = await authService.getMe();
			const u = resp?.data ?? resp;
			if (u) setUser(u);
		};
		load();
	}, []);

	const getJoinText = () => {
		if (!user || !user.created_at) return "";
		try {
			const d = new Date(user.created_at);
			const day = String(d.getDate()).padStart(2, '0');
			const month = String(d.getMonth() + 1).padStart(2, '0');
			const year = d.getFullYear();
			return `${day}/${month}/${year}`;
		} catch (e) {
			return "";
		}
	};

	const handleLogout = () => {
		authService.logout();
		dispatch({ type: "logout" });
		navigate("/");
	};

	return (
		<div className="account-sidebar-wrap">
		<aside className="account-sidebar">
			<div className="account-sidebar-profile">
				{/* TODO: Sustituye por tu foto de perfil del sidebar
				    <img src={rutaATuImagen} alt="Archibald Vance" className="account-sidebar-avatar" />
				*/}
				{user && (user.profile_picture_url || user.profile_picture) ? (
					<img
						src={user.profile_picture_url || user.profile_picture}
						alt={user.username || "avatar"}
						className="account-sidebar-avatar"
					/>
				) : (
					<div className="account-sidebar-avatar account-img-placeholder" aria-hidden="true" />
				)}

					<div className="account-sidebar-user">
						<strong>{user ? `${(user.profile && user.profile.firstname) || user.username} ${
							(user.profile && user.profile.lastname) || ""
						}`.trim() : "Usuario"}</strong>
						<span>{user ? `@${user.username}` : "@usuario"}</span>
						<span className="account-sidebar-since">{getJoinText()}</span>
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
				<button type="button" className="account-btn-logout" onClick={handleLogout}>
					<i className="fa-solid fa-right-from-bracket" />
					Cerrar sesión
				</button>
			</div>
		</aside>
		</div>
	);
};
