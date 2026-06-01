import { useState, useEffect } from "react";
import adminService from "../../services/admin.service";

export const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        adminService.getStats()
            .then(data => setStats(data.data))
            .catch(() => setError("No se pudieron cargar las estadísticas."))
            .finally(() => setLoading(false));
    }, []);

    const cards = stats ? [
        { label: "Usuarios activos", value: stats.total_users, icon: "bi-people-fill", color: "admin-card--blue" },
        { label: "Suspendidos", value: stats.suspended_users, icon: "bi-person-slash", color: "admin-card--red" },
        { label: "Reportes abiertos", value: stats.open_reports ?? 0, icon: "bi-flag-fill", color: "admin-card--orange" },
        { label: "Eventos totales", value: stats.total_events, icon: "bi-calendar-event-fill", color: "admin-card--green" },
        { label: "Reservas", value: stats.total_reservations, icon: "bi-ticket-perforated-fill", color: "admin-card--yellow" },
        { label: "Valoraciones", value: stats.total_reviews, icon: "bi-star-fill", color: "admin-card--purple" },
    ] : [];

    return (
        <div className="admin-section">
            <h2 className="admin-section-title">Dashboard</h2>
            <p className="admin-section-subtitle">Resumen general de la plataforma</p>

            {loading && <p className="admin-loading">Cargando estadísticas...</p>}
            {error && <p className="admin-error">{error}</p>}

            {stats && (
                <div className="admin-stats-grid">
                    {cards.map(({ label, value, icon, color }) => (
                        <div key={label} className={`admin-stat-card ${color}`}>
                            <i className={`bi ${icon} admin-stat-icon`}></i>
                            <span className="admin-stat-value">{value}</span>
                            <span className="admin-stat-label">{label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
