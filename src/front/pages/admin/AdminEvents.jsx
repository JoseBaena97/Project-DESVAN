import { useState, useEffect, useMemo } from "react";
import adminService from "../../services/admin.service";

const STATUS_LABELS = {
    active: { label: "Activo", cls: "admin-badge--active" },
    finished: { label: "Finalizado", cls: "admin-badge--finished" },
    cancelled: { label: "Cancelado", cls: "admin-badge--suspended" },
};

const fmt = (iso) => iso ? new Date(iso).toLocaleDateString("es-ES") : "—";
const fmtTime = (iso) => iso ? new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : "—";

const SortIcon = ({ field, sort }) => {
    if (sort.field !== field) return <i className="bi bi-arrow-down-up admin-sort-icon admin-sort-icon--inactive"></i>;
    return sort.dir === "asc"
        ? <i className="bi bi-arrow-up admin-sort-icon"></i>
        : <i className="bi bi-arrow-down admin-sort-icon"></i>;
};

const Th = ({ field, sort, onSort, children }) => (
    <th className="admin-th-sortable" onClick={() => onSort(field)}>
        {children} <SortIcon field={field} sort={sort} />
    </th>
);

export const AdminEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState({ field: "id", dir: "asc" });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = () => {
        setLoading(true);
        adminService.getEvents()
            .then(data => setEvents(data.data))
            .catch(() => setError("No se pudieron cargar los eventos."))
            .finally(() => setLoading(false));
    };

    const handleCancel = async (eventId) => {
        if (!confirm("¿Cancelar este evento? Se notificará a todos los reservistas.")) return;
        setActionLoading(`cancel-${eventId}`);
        try {
            await adminService.cancelEvent(eventId);
            setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: "cancelled" } : e));
        } catch {
            alert("Error al cancelar el evento.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (eventId) => {
        if (!confirm("¿Eliminar este evento permanentemente? Esta acción no se puede deshacer.")) return;
        setActionLoading(`delete-${eventId}`);
        try {
            await adminService.deleteEvent(eventId);
            setEvents(prev => prev.filter(e => e.id !== eventId));
        } catch {
            alert("Error al eliminar el evento.");
        } finally {
            setActionLoading(null);
        }
    };

    const toggleSort = (field) => {
        setSort(prev =>
            prev.field === field
                ? { field, dir: prev.dir === "asc" ? "desc" : "asc" }
                : { field, dir: "asc" }
        );
    };

    const sorted = useMemo(() => {
        const filtered = events.filter(e =>
            e.title?.toLowerCase().includes(search.toLowerCase()) ||
            e.seller_username?.toLowerCase().includes(search.toLowerCase())
        );
        return [...filtered].sort((a, b) => {
            let valA = a[sort.field] ?? "";
            let valB = b[sort.field] ?? "";
            if (typeof valA === "string") valA = valA.toLowerCase();
            if (typeof valB === "string") valB = valB.toLowerCase();
            if (valA < valB) return sort.dir === "asc" ? -1 : 1;
            if (valA > valB) return sort.dir === "asc" ? 1 : -1;
            return 0;
        });
    }, [events, search, sort]);

    return (
        <div className="admin-section">
            <h2 className="admin-section-title">Eventos</h2>
            <p className="admin-section-subtitle">{events.length} eventos en la plataforma</p>

            <div className="admin-toolbar">
                <div className="admin-search">
                    <i className="bi bi-search"></i>
                    <input
                        type="text"
                        placeholder="Buscar por título o creador..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {loading && <p className="admin-loading">Cargando eventos...</p>}
            {error && <p className="admin-error">{error}</p>}

            {!loading && !error && (
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <Th field="id" sort={sort} onSort={toggleSort}>ID</Th>
                                <Th field="title" sort={sort} onSort={toggleSort}>Evento</Th>
                                <Th field="seller_username" sort={sort} onSort={toggleSort}>Creador</Th>
                                <Th field="event_type" sort={sort} onSort={toggleSort}>Tipo</Th>
                                <Th field="end_date" sort={sort} onSort={toggleSort}>Fecha fin</Th>
                                <Th field="start_time" sort={sort} onSort={toggleSort}>Horario</Th>
                                <th>Reservas</th>
                                <Th field="status" sort={sort} onSort={toggleSort}>Estado</Th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map(e => {
                                const statusInfo = STATUS_LABELS[e.status] ?? { label: e.status, cls: "" };
                                const coverUrl = e.image_url?.cover || null;
                                const confirmedReservations = (e.reservations || []).filter(r => r.status === "confirmed").length;
                                const totalReservations = (e.reservations || []).length;

                                return (
                                    <tr key={e.id}>
                                        <td className="admin-td-id">#{e.id}</td>
                                        <td className="admin-td-title">
                                            {coverUrl
                                                ? <img src={coverUrl} alt="" className="admin-event-thumb" />
                                                : <div className="admin-event-thumb admin-event-thumb--empty"><i className="bi bi-image"></i></div>
                                            }
                                            <span>{e.title}</span>
                                        </td>
                                        <td>{e.seller_username || `#${e.seller_id}`}</td>
                                        <td>
                                            {e.event_type === "privado"
                                                ? <span className="admin-badge admin-badge--private">Privado</span>
                                                : <span className="admin-badge admin-badge--public">Público</span>
                                            }
                                        </td>
                                        <td>{fmt(e.end_date || e.end_time)}</td>
                                        <td className="admin-td-time">
                                            <span>{fmtTime(e.start_time)}</span>
                                            <span className="admin-time-sep">→</span>
                                            <span>{fmtTime(e.end_time)}</span>
                                        </td>
                                        <td>
                                            {e.event_type === "privado"
                                                ? <span className="admin-badge admin-badge--user">{confirmedReservations} / {e.max_capacity || "∞"}</span>
                                                : <span className="admin-text-muted">{totalReservations}</span>
                                            }
                                        </td>
                                        <td>
                                            <span className={`admin-badge ${statusInfo.cls}`}>{statusInfo.label}</span>
                                        </td>
                                        <td className="admin-td-actions">
                                            {e.status !== "cancelled" && (
                                                <button
                                                    className="admin-btn admin-btn--warning"
                                                    onClick={() => handleCancel(e.id)}
                                                    disabled={actionLoading === `cancel-${e.id}`}
                                                >
                                                    {actionLoading === `cancel-${e.id}` ? <span className="spinner-sm"></span> : <><i className="bi bi-x-circle"></i> Cancelar</>}
                                                </button>
                                            )}
                                            <button
                                                className="admin-btn admin-btn--danger"
                                                onClick={() => handleDelete(e.id)}
                                                disabled={actionLoading === `delete-${e.id}`}
                                            >
                                                {actionLoading === `delete-${e.id}` ? <span className="spinner-sm"></span> : <><i className="bi bi-trash"></i> Eliminar</>}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {sorted.length === 0 && (
                                <tr><td colSpan={9} className="admin-empty">No se encontraron eventos.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
