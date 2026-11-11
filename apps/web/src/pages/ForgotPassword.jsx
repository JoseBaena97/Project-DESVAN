import React, { useState } from "react";
import { Link } from "react-router-dom";
import authService from "../services/auth.service";
import useGlobalReducer from "../hooks/useGlobalReducer";
import "./Login.css";

export const ForgotPassword = () => {
  const { store, dispatch, showErrorAlert } = useGlobalReducer();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    showErrorAlert(null);
    setMessage("");

    if (!email.trim()) {
      showErrorAlert("Por favor, ingresa un correo electrónico.");
      return;
    }

    dispatch({ type: 'setLoading', payload: true });

    try {
      const data = await authService.forgotPassword(email);
      setMessage(data?.msg || "Si el email existe, recibirás un enlace para restablecer tu contraseña.");
    } catch (err) {
      showErrorAlert(err.message || "Error enviando el correo de recuperación.");
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
            <h1 className="sidebar-title">¿Olvidaste tu acceso?</h1>
            <div className="vintage-divider"></div>
            <p className="sidebar-subtitle">Te ayudamos a recuperarlo en un momento.</p>
            <div className="mascot-container">
              <div className="mascot-image mascot-forgot"></div>
            </div>
          </div>
        </div>
        <div className="torn-paper-edge"></div>
      </div>

      <div className="auth-form-area">
        <div className="auth-card auth-card-small">
          <div className="brand-header">
            <div className="brand-box-icon">
              <i className="fa-solid fa-envelope-open-text"></i>
            </div>
            <h2 className="auth-card-title">Recuperar contraseña</h2>
            <p className="auth-card-subtitle">Ingresa tu email para recibir el enlace de restablecimiento.</p>
          </div>

          {message && <div className="auth-alert alert-success"><i className="fa-solid fa-circle-check"></i><span>{message}</span></div>}
          {store.error && <div className="auth-alert alert-danger"><i className="fa-solid fa-circle-exclamation"></i><span>{store.error}</span></div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">EMAIL</label>
              <div className="input-wrapper">
                <i className="fa-regular fa-envelope input-icon"></i>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={store.loading}>
              {store.loading ? "Enviando..." : "Enviar enlace"}
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
