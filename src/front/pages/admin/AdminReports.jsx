import { useState, useEffect, useMemo } from "react";
import adminService from "../../services/admin.service";

const REASON_LABELS = {
    spam: "Spam",
    inappropriate_content: "Contenido inapropiado",
    harassment: "Acoso",
    fraud: "Fraude",
    other: "Otro",
};

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

export const AdminReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [filter, setFilter] = useState("open");
    const [sort, setSort] = useState({ field: "id", dir: "desc" });

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = () => {
        setLoading(true);
        adminService.getReports()
            .then(data => setReports(data.data))
            .catch(() => setError("No se pudieron cargar los reportes."))
            .finally(() => setLoading(false));
    };

    const handleResolve = async (reportId) => {
        setActionLoading(`resolve-${reportId}`);
        try {
            await adminService.resolveReport(reportId);
            setReports(prev => prev.map(r => r.id === reportId ? { ...r, is_resolved: true } : r));
        } catch {
            alert("Error al resolver el reporte.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (reportId) => {
        if (!confirm("¿Eliminar este reporte?")) return;
        setActionLoading(`delete-${reportId}`);
        try {
            await adminService.deleteReport(reportId);
            setReports(prev => prev.filter(r => r.id !== reportId));
        } catch {
            alert("Error al eliminar el reporte.");
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

    const getSortValue = (r, field) => {
        if (field === "reported") return r.reported?.username ?? "";
        if (field === "reporter") return r.reporter?.username ?? "";
        return r[field] ?? "";
    };

    const sorted = useMemo(() => {
        const base = filter === "open"
            ? reports.filter(r => !r.is_resolved)
            : filter === "resolved"
                ? reports.filter(r => r.is_resolved)
                : reports;
        return [...base].sort((a, b) => {
            let valA = getSortValue(a, sort.field);
            let valB = getSortValue(b, sort.field);
            if (typeof valA === "string") valA = valA.toLowerCase();
            if (typeof valB === "string") valB = valB.toLowerCase();
            if (valA < valB) return sort.dir === "asc" ? -1 : 1;
            if (valA > valB) return sort.dir === "asc" ? 1 : -1;
            return 0;
        });
    }, [reports, filter, sort]);

    const openCount = reports.filter(r => !r.is_resolved).length;

    return (
        <div className="admin-section">
            <h2 className="admin-section-title">Reportes</h2>
            <p className="admin-section-subtitle">
                {openCount} reporte{openCount !== 1 ? "s" : ""} abierto{openCount !== 1 ? "s" : ""}
            </p>

            <div className="admin-toolbar">
                <div className="admin-filter-tabs">
                    {[["open", "Abiertos"], ["resolved", "Resueltos"], ["all", "Todos"]].map(([val, label]) => (
                        <button
                            key={val}
                            className={`admin-filter-tab${filter === val ? " active" : ""}`}
                            onClick={() => setFilter(val)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {loading && <p className="admin-loading">Cargando reportes...</p>}
            {error && <p className="admin-error">{error}</p>}

            {!loading && !error && (
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <Th field="id" sort={sort} onSort={toggleSort}>ID</Th>
                                <Th field="reported" sort={sort} onSort={toggleSort}>Reportado</Th>
                                <Th field="reporter" sort={sort} onSort={toggleSort}>Reportado por</Th>
                                <Th field="reason" sort={sort} onSort={toggleSort}>Motivo</Th>
                                <th>Mensaje</th>
                                <Th field="created_at" sort={sort} onSort={toggleSort}>Fecha</Th>
                                <Th field="is_resolved" sort={sort} onSort={toggleSort}>Estado</Th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map(r => (
                                <tr key={r.id} className={r.is_resolved ? "admin-row--resolved" : ""}>
                                    <td className="admin-td-id">#{r.id}</td>
                                    <td><strong>@{r.reported?.username || `#${r.reported?.id}`}</strong></td>
                                    <td>@{r.reporter?.username || `#${r.reporter?.id}`}</td>
                                    <td>
                                        <span className="admin-badge admin-badge--reason">
                                            {REASON_LABELS[r.reason] || r.reason}
                                        </span>
                                    </td>
                                    <td className="admin-td-comment">
                                        {r.message || <em className="admin-no-comment">Sin mensaje</em>}
                                    </td>
                                    <td>{r.created_at ? new Date(r.created_at).toLocaleDateString("es-ES") : "—"}</td>
                                    <td>
                                        {r.is_resolved
                                            ? <span className="admin-badge admin-badge--active">Resuelto</span>
                                            : <span className="admin-badge admin-badge--report">Abierto</span>
                                        }
                                    </td>
                                    <td className="admin-td-actions">
                                        {!r.is_resolved && (
                                            <button
                                                className="admin-btn admin-btn--restore"
                                                onClick={() => handleResolve(r.id)}
                                                disabled={actionLoading === `resolve-${r.id}`}
                                            >
                                                {actionLoading === `resolve-${r.id}`
                                                    ? <span className="spinner-sm"></span>
                                                    : <><i className="bi bi-check-circle"></i> Resolver</>
                                                }
                                            </button>
                                        )}
                                        <button
                                            className="admin-btn admin-btn--danger"
                                            onClick={() => handleDelete(r.id)}
                                            disabled={actionLoading === `delete-${r.id}`}
                                        >
                                            {actionLoading === `delete-${r.id}`
                                                ? <span className="spinner-sm"></span>
                                                : <><i className="bi bi-trash"></i> Eliminar</>
                                            }
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {sorted.length === 0 && (
                                <tr><td colSpan={8} className="admin-empty">No hay reportes en esta categoría.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
