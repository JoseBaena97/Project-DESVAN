import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import authService from "../services/auth.service";
import "./Login.css";

export const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get("token") || "";
    setToken(tokenParam);
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Falta el token de recuperación.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const data = await authService.resetPassword(token, password);
      setMessage(data?.msg || "Contraseña actualizada correctamente.");
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      setError(err.message || "Error actualizando contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-form-area">
        <div className="auth-card auth-card-small">
          <div className="brand-header">
            <div className="brand-box-icon">
              <i className="fa-solid fa-lock-open"></i>
            </div>
            <h2 className="auth-card-title">Restablecer contraseña</h2>
            <p className="auth-card-subtitle">Crea una nueva contraseña para tu cuenta.</p>
          </div>

          {message && <div className="auth-alert alert-success"><span>{message}</span></div>}
          {error && <div className="auth-alert alert-danger"><span>{error}</span></div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="password">NUEVA CONTRASEÑA</label>
              <div className="input-wrapper">
                <i className="fa-solid fa-lock input-icon"></i>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">CONFIRMAR CONTRASEÑA</label>
              <div className="input-wrapper">
                <i className="fa-solid fa-lock input-icon"></i>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar contraseña"}
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
