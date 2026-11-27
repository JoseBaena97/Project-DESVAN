import { Navigate, Outlet } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import mascotafav from "../assets/img/caja03.png";

export const ProtectedRoute = () => {
    const { store } = useGlobalReducer();

    // Mientras se recupera la sesión (lectura del token + usuario desde el backend)
    // mostramos una pantalla de carga para evitar "flickering" o errores.
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

    // Si terminó de cargar y por algún motivo el usuario no se estableció (ej. token inválido),
    // redirigimos al login.
    if (!store.auth || !store.user) {
        return <Navigate to="/login" replace />;
    }

    // Si todo está correcto, renderizamos el contenido de la ruta protegida
    return <Outlet />;
};
