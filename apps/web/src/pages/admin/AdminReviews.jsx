import { useState, useEffect, useMemo } from "react";
import adminService from "../../services/admin.service";

const Stars = ({ rating }) => {
    const num = Math.round(Number(rating) || 0);
    return (
        <span className="admin-stars">
            {[1, 2, 3, 4, 5].map(i => (
                <i key={i} className={`bi ${i <= num ? "bi-star-fill" : "bi-star"}`}></i>
            ))}
            <span className="admin-stars-value">{Number(rating).toFixed(1)}</span>
        </span>
    );
};

const ExpandableComment = ({ text }) => {
    const [expanded, setExpanded] = useState(false);
    if (!text) return <em className="admin-no-comment">Sin comentario</em>;
    const short = text.length > 80;
    return (
        <span>
            {expanded || !short ? text : `${text.slice(0, 80)}…`}
            {short && (
                <button
                    className="admin-expand-btn"
                    onClick={() => setExpanded(e => !e)}
                >
                    {expanded ? " Ver menos" : " Ver más"}
                </button>
            )}
        </span>
    );
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

export const AdminReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState({ field: "id", dir: "asc" });

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = () => {
        setLoading(true);
        adminService.getReviews()
            .then(data => setReviews(data.data))
            .catch(() => setError("No se pudieron cargar las valoraciones."))
            .finally(() => setLoading(false));
    };

    const handleDelete = async (reviewId) => {
        if (!confirm("¿Eliminar esta valoración? Esta acción no se puede deshacer.")) return;
        setActionLoading(reviewId);
        try {
            await adminService.deleteReview(reviewId);
            setReviews(prev => prev.filter(r => r.id !== reviewId));
        } catch {
            alert("Error al eliminar la valoración.");
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
        const filtered = reviews.filter(r =>
            r.reviewer_username?.toLowerCase().includes(search.toLowerCase()) ||
            r.reviewed_username?.toLowerCase().includes(search.toLowerCase()) ||
            r.comment?.toLowerCase().includes(search.toLowerCase())
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
    }, [reviews, search, sort]);

    return (
        <div className="admin-section">
            <h2 className="admin-section-title">Valoraciones</h2>
            <p className="admin-section-subtitle">{reviews.length} valoraciones en la plataforma</p>

            <div className="admin-toolbar">
                <div className="admin-search">
                    <i className="bi bi-search"></i>
                    <input
                        type="text"
                        placeholder="Buscar por usuario o comentario..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {loading && <p className="admin-loading">Cargando valoraciones...</p>}
            {error && <p className="admin-error">{error}</p>}

            {!loading && !error && (
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <Th field="id" sort={sort} onSort={toggleSort}>ID</Th>
                                <Th field="reviewer_username" sort={sort} onSort={toggleSort}>De</Th>
                                <Th field="reviewed_username" sort={sort} onSort={toggleSort}>Para</Th>
                                <Th field="rating" sort={sort} onSort={toggleSort}>Puntuación</Th>
                                <th>Comentario</th>
                                <Th field="created_at" sort={sort} onSort={toggleSort}>Fecha</Th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map(r => (
                                <tr key={r.id}>
                                    <td className="admin-td-id">#{r.id}</td>
                                    <td>{r.reviewer_username || r.reviewer?.username || `#${r.reviewer?.id}`}</td>
                                    <td>{r.reviewed_username || r.reviewed?.username || `#${r.reviewed?.id}`}</td>
                                    <td><Stars rating={r.rating} /></td>
                                    <td className="admin-td-comment-expand">
                                        <ExpandableComment text={r.comment} />
                                    </td>
                                    <td>{r.created_at ? new Date(r.created_at).toLocaleDateString("es-ES") : "—"}</td>
                                    <td>
                                        <button
                                            className="admin-btn admin-btn--danger"
                                            onClick={() => handleDelete(r.id)}
                                            disabled={actionLoading === r.id}
                                        >
                                            {actionLoading === r.id ? <span className="spinner-sm"></span> : <><i className="bi bi-trash"></i> Eliminar</>}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {sorted.length === 0 && (
                                <tr><td colSpan={7} className="admin-empty">No se encontraron valoraciones.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
