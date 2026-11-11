import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import authService from "../services/auth.service";
import useGlobalReducer from "../hooks/useGlobalReducer";
import "./Login.css";

export const ResetPassword = () => {
  const { store, dispatch, showErrorAlert } = useGlobalReducer();
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get("token") || "";
    setToken(tokenParam);
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    showErrorAlert(null);
    setMessage("");

    if (!token) {
      showErrorAlert("Falta el token de recuperación.");
      return;
    }
    if (!password) {
      showErrorAlert("Por favor, ingresa una nueva contraseña.");
      return;
    }
    if (!confirmPassword) {
      showErrorAlert("Por favor, confirma tu nueva contraseña.");
      return;
    }
    if (password.length < 6) {
      showErrorAlert("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      showErrorAlert("Las contraseñas no coinciden.");
      return;
    }

    dispatch({ type: 'setLoading', payload: true });
    try {
      const data = await authService.resetPassword(token, password);
      setMessage(data?.msg || "Contraseña actualizada correctamente.");
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      showErrorAlert(err.message || "Error actualizando contraseña.");
    } finally {
      dispatch({ type: 'setLoading', payload: false });
    }
  };

  return (
    <div className="auth-page-container">

      {/* DECORATIVE SIDEBAR */}
      <div className="auth-sidebar">
        <div className="sidebar-content-wrapper">
          <div className="sidebar-slide-content slide-in">
            <h1 className="sidebar-title">Nueva contraseña</h1>
            <div className="vintage-divider"></div>
            <p className="sidebar-subtitle">Elige algo seguro y fácil de recordar.</p>
            <div className="mascot-container">
              <div className="mascot-image mascot-waving"></div>
            </div>
          </div>
        </div>
        <div className="torn-paper-edge"></div>
      </div>

      <div className="auth-form-area">
        <div className="auth-card auth-card-small">
          <div className="brand-header">
            <div className="brand-box-icon">
              <i className="fa-solid fa-lock-open"></i>
            </div>
            <h2 className="auth-card-title">Restablecer contraseña</h2>
            <p className="auth-card-subtitle">Crea una nueva contraseña para tu cuenta.</p>
          </div>

          {message && <div className="auth-alert alert-success"><i className="fa-solid fa-circle-check"></i><span>{message}</span></div>}
          {store.error && <div className="auth-alert alert-danger"><i className="fa-solid fa-circle-exclamation"></i><span>{store.error}</span></div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="password">NUEVA CONTRASEÑA</label>
              <div className="input-wrapper">
                <i className="fa-solid fa-lock input-icon"></i>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  <i className={showPassword ? "fa-regular fa-eye-slash" : "fa-regular fa-eye"}></i>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">CONFIRMAR CONTRASEÑA</label>
              <div className="input-wrapper">
                <i className="fa-solid fa-lock input-icon"></i>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Toggle confirm password visibility"
                >
                  <i className={showConfirmPassword ? "fa-regular fa-eye-slash" : "fa-regular fa-eye"}></i>
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={store.loading}>
              {store.loading ? "Actualizando..." : "Actualizar contraseña"}
            </button>
          </form>

          <div className="auth-switcher-divider">
            <Link to="/login" className="highlight-link">Volver a iniciar sesión</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
