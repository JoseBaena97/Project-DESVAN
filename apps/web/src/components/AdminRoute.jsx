import { Navigate, Outlet } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import mascotafav from "../assets/img/caja03.png";

export const AdminRoute = () => {
    const { store } = useGlobalReducer();
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (store.userLoading) {
        return (
            <div className="protected-route-container">
                <img src={mascotafav} alt="Cargando..." className="protected-route-logo" />
                <div className="protected-route-loading">
                    <span className="spinner"></span>
                    <p className="protected-route-text">Cargando tus datos...</p>
                </div>
            </div>
        );
    }

    if (!store.user) {
        return <Navigate to="/login" replace />;
    }

    if (!store.user.is_admin) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};
