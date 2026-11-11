import { useState, useEffect, useRef } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import notificacionIco from "../assets/img/notificacion.png";
import "./NotificationBell.css";

const BACKEND = import.meta.env.VITE_BACKEND_URL;

const TYPE_ICONS = {
    reservation_created: "fa-ticket",
    review_received: "fa-star",
    event_cancelled: "fa-circle-xmark",
    event_upcoming: "fa-clock",
};

function timeAgo(isoString) {
    if (!isoString) return "";
    const normalized = isoString.endsWith("Z") || isoString.includes("+") ? isoString : isoString + "Z";
    const date = new Date(normalized);
    const diff = Math.floor((Date.now() - date) / 1000);
    if (diff < 60) return "Ahora mismo";
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
    return new Intl.DateTimeFormat("es-ES", {
        timeZone: "Europe/Madrid",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

export const NotificationBell = ({ compact = false }) => {
    const { store, dispatch } = useGlobalReducer();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        const token = localStorage.getItem("token");
        if (!token || !store.user) return;
        try {
            const res = await fetch(`${BACKEND}api/notification/my`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                dispatch({ type: "setNotifications", payload: data.data });
            }
        } catch (e) {
            // silently fail — bell stays with last known state
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [store.user]);

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleOpen = async () => {
        const willOpen = !open;
        setOpen(willOpen);
        if (willOpen && unreadCount > 0) {
            const token = localStorage.getItem("token");
            try {
                await fetch(`${BACKEND}api/notification/read-all`, {
                    method: "PATCH",
                    headers: { Authorization: `Bearer ${token}` },
                });
                dispatch({ type: "markAllRead" });
            } catch (e) {
                // silently fail
            }
        }
    };

    const unreadCount = store.notifications?.filter((n) => !n.is_read).length ?? 0;
    const token = () => localStorage.getItem("token");

    const handleDelete = async (id) => {
        try {
            await fetch(`${BACKEND}api/notification/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token()}` },
            });
            dispatch({ type: "deleteNotification", payload: id });
        } catch (e) {
            // silently fail
        }
    };

    const handleClearAll = async () => {
        try {
            await fetch(`${BACKEND}api/notification/all`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token()}` },
            });
            dispatch({ type: "clearNotifications" });
        } catch (e) {
            // silently fail
        }
    };

    if (!store.user) return null;

    return (
        <div className="notification-bell" ref={dropdownRef}>
            <button className={`btn-secondary-custom notification-trigger${compact ? " notification-trigger--compact" : ""}`} onClick={handleOpen} aria-label="Notificaciones">
                <img src={notificacionIco} alt="Notificaciones" className="notification-ico" />
                {!compact && "Notificaciones"}
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
                )}
            </button>

            {open && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <span>Notificaciones</span>
                        {store.notifications?.length > 0 && (
                            <button className="notif-clear-all" onClick={handleClearAll}>
                                Borrar todo
                            </button>
                        )}
                    </div>
                    {!store.notifications || store.notifications.length === 0 ? (
                        <div className="notification-empty">
                            <i className="fa-regular fa-bell-slash"></i>
                            <span>No tienes notificaciones</span>
                        </div>
                    ) : (
                        <ul className="notification-list">
                            {store.notifications.map((n) => (
                                <li key={n.id} className={`notification-item ${n.is_read ? "read" : "unread"}`}>
                                    <span className="notification-type-icon">
                                        <i className={`fa-solid ${TYPE_ICONS[n.type] ?? "fa-bell"}`}></i>
                                    </span>
                                    <div className="notification-content">
                                        <span className="notification-message">{n.message}</span>
                                        <span className="notification-time">{timeAgo(n.created_at)}</span>
                                    </div>
                                    <button
                                        className="notif-delete-btn"
                                        onClick={() => handleDelete(n.id)}
                                        aria-label="Eliminar notificación"
                                    >
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};
