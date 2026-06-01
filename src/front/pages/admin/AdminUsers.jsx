import { useState, useEffect, useMemo } from "react";
import adminService from "../../services/admin.service";

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

export const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState({ field: "id", dir: "asc" });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        setLoading(true);
        adminService.getUsers()
            .then(data => setUsers(data.data))
            .catch(() => setError("No se pudieron cargar los usuarios."))
            .finally(() => setLoading(false));
    };

    const handleSuspend = async (userId) => {
        if (!confirm("¿Suspender este usuario? No podrá iniciar sesión.")) return;
        setActionLoading(userId);
        try {
            await adminService.suspendUser(userId);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_suspended: true } : u));
        } catch {
            alert("Error al suspender el usuario.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleRestore = async (userId) => {
        setActionLoading(userId);
        try {
            await adminService.restoreUser(userId);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_suspended: false } : u));
        } catch {
            alert("Error al restaurar el usuario.");
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
        const filtered = users.filter(u =>
            u.username?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase())
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
    }, [users, search, sort]);

    return (
        <div className="admin-section">
            <h2 className="admin-section-title">Usuarios</h2>
            <p className="admin-section-subtitle">{users.length} usuarios registrados</p>

            <div className="admin-toolbar">
                <div className="admin-search">
                    <i className="bi bi-search"></i>
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {loading && <p className="admin-loading">Cargando usuarios...</p>}
            {error && <p className="admin-error">{error}</p>}

            {!loading && !error && (
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <Th field="id" sort={sort} onSort={toggleSort}>ID</Th>
                                <Th field="username" sort={sort} onSort={toggleSort}>Usuario</Th>
                                <Th field="email" sort={sort} onSort={toggleSort}>Email</Th>
                                <Th field="open_reports" sort={sort} onSort={toggleSort}>Reportes</Th>
                                <Th field="is_admin" sort={sort} onSort={toggleSort}>Rol</Th>
                                <Th field="is_suspended" sort={sort} onSort={toggleSort}>Estado</Th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map(u => (
                                <tr key={u.id} className={u.is_suspended ? "admin-row--suspended" : ""}>
                                    <td className="admin-td-id">#{u.id}</td>
                                    <td>
                                        <div className="admin-user-cell">
                                            {u.profile_picture_url
                                                ? <img src={u.profile_picture_url} alt="" className="admin-avatar" />
                                                : <div className="admin-avatar admin-avatar--placeholder"><i className="bi bi-person"></i></div>
                                            }
                                            <span>{u.username || "—"}</span>
                                        </div>
                                    </td>
                                    <td>{u.email}</td>
                                    <td>
                                        {u.open_reports > 0
                                            ? <span className="admin-badge admin-badge--report">{u.open_reports} reporte{u.open_reports > 1 ? "s" : ""}</span>
                                            : <span className="admin-text-muted">—</span>
                                        }
                                    </td>
                                    <td>
                                        {u.is_admin
                                            ? <span className="admin-badge admin-badge--admin">Admin</span>
                                            : <span className="admin-badge admin-badge--user">Usuario</span>
                                        }
                                    </td>
                                    <td>
                                        {u.is_suspended
                                            ? <span className="admin-badge admin-badge--suspended">Suspendido</span>
                                            : <span className="admin-badge admin-badge--active">Activo</span>
                                        }
                                    </td>
                                    <td>
                                        {u.is_suspended ? (
                                            <button
                                                className="admin-btn admin-btn--restore"
                                                onClick={() => handleRestore(u.id)}
                                                disabled={actionLoading === u.id}
                                            >
                                                {actionLoading === u.id
                                                    ? <span className="spinner-sm"></span>
                                                    : <><i className="bi bi-arrow-counterclockwise"></i> Restaurar</>
                                                }
                                            </button>
                                        ) : (
                                            <button
                                                className="admin-btn admin-btn--danger"
                                                onClick={() => handleSuspend(u.id)}
                                                disabled={actionLoading === u.id || u.is_admin}
                                                title={u.is_admin ? "No se puede suspender a un admin" : ""}
                                            >
                                                {actionLoading === u.id
                                                    ? <span className="spinner-sm"></span>
                                                    : <><i className="bi bi-person-slash"></i> Suspender</>
                                                }
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {sorted.length === 0 && (
                                <tr><td colSpan={7} className="admin-empty">No se encontraron usuarios.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
