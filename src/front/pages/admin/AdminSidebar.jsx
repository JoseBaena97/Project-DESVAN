import { NavLink, useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import authService from "../../services/auth.service";

export const AdminSidebar = () => {
    const { dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const links = [
        { to: "/admin", label: "Dashboard", icon: "bi-speedometer2", end: true },
        { to: "/admin/usuarios", label: "Usuarios", icon: "bi-people" },
        { to: "/admin/reportes", label: "Reportes", icon: "bi-flag" },
        { to: "/admin/eventos", label: "Eventos", icon: "bi-calendar-event" },
        { to: "/admin/valoraciones", label: "Valoraciones", icon: "bi-star" },
    ];

    const handleLogout = () => {
        authService.logout();
        dispatch({ type: 'logout' });
        navigate('/login', { replace: true });
    };

    return (
        <aside className="admin-sidebar">
            <div className="admin-sidebar-brand">
                <div className="admin-sidebar-logo">
                    <i className="bi bi-shield-lock-fill"></i>
                </div>
                <div>
                    <span className="admin-sidebar-app">DESVAN</span>
                    <span className="admin-sidebar-role">Panel Admin</span>
                </div>
            </div>

            <nav className="admin-sidebar-nav">
                {links.map(({ to, label, icon, end }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={end}
                        className={({ isActive }) =>
                            "admin-sidebar-link" + (isActive ? " active" : "")
                        }
                    >
                        <i className={`bi ${icon}`}></i>
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="admin-sidebar-footer">
                <a href="/" className="admin-sidebar-link admin-sidebar-link--muted">
                    <i className="bi bi-arrow-left"></i>
                    <span>Ir a la web</span>
                </a>
                <button className="admin-sidebar-link admin-sidebar-link--logout" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right"></i>
                    <span>Cerrar sesión</span>
                </button>
            </div>
        </aside>
    );
};
