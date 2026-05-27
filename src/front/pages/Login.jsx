import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import authService from "../services/auth.service";
import "./Login.css";


export const Login = () => {
  const navigate = useNavigate();
  const { store, dispatch } = useGlobalReducer();

  // State to toggle between login and registration panels
  const [isRegister, setIsRegister] = useState(false);

  // Form inputs state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    type: "login",
  });

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const alertTimeoutRef = useRef(null);

  const showErrorAlert = (msg) => {
    setError(msg);
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
    }
    alertTimeoutRef.current = setTimeout(() => {
      setError(null);
    }, 8000);
  };

  // Handle changes in input fields
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim()) {
      showErrorAlert("Por favor, ingresa un correo electrónico.");
      return;
    }

    if (!formData.password.trim()) {
      showErrorAlert("Por favor, ingresa una contraseña.");
      return;
    }

    if (formData.type === "register" && !formData.username.trim()) {
      showErrorAlert("Por favor, ingresa un nombre de usuario.");
      return;
    }
    setError(null);
    setLoading(true);

    const payload = { ...formData, username: formData.username.trim() };

    authService.auth(payload).then((data) => {
      //Para register y autologin
      if (payload.type === 'register') {
        return authService.auth({ ...payload, type: 'login' })
      }
      return data;
    })
      .then(data => {

        dispatch({
          type: 'auth',
          payload: {
            user: data.data
          }
        });

        navigate('/explorar');
      })
      .catch((err) => {
        console.log(err);

        //Manejar errores específicos del backend
        if (err.response) {
          const status = err.response.status;
          const data = err.response.data;
          if (formData.type === "register") {
            if (status === 409 || (data && (data.msg === "Username already exists" || data.msg === "Username already taken"))) {
              showErrorAlert("Este nombre de usuario ya existe. Por favor, elige otro.");
              return;
            }
          if (status === 400 || (data && data.msg === "Missing username in request")) {
            showErrorAlert("Por favor, ingresa un nombre de usuario.");
              return;
            }
          if (status === 403 || (data && data.msg === "User already exists")) {
              showErrorAlert("Este correo electrónico ya está registrado.");
              return;
            }
        }else {
            if (status === 404 || status === 401 || (data && (data.msg === "User not found" || data.msg === "Invalid credentials"))) {
              showErrorAlert("El correo o las credenciales son inválidas.");
              return;
            }
            if (status === 403 && data && data.msg === "Esta cuenta ha sido desactivada") {
              showErrorAlert("Esta cuenta ha sido desactivada.");
              return;
            }
          }
        }

        showErrorAlert(err.message || "Error inesperado.");


      })
      .finally(() => {
        setLoading(false);
      });

  };



  useEffect(() => {
    if (localStorage.getItem('token')) {
      if (!store.user) {
        authService.getMe().then(data => dispatch({
          type: 'auth',
          payload: {
            user: data.data
          }
        })).catch(err => console.log(err));
      }
      navigate('/explorar');
    }
  }, [store.auth, navigate]);

  // Toggle state between Login and Register
  const handleToggleMode = () => {
    setIsRegister(!isRegister);
    setError(null);
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
    }
    setFormData({
      username: "",
      email: "",
      password: "",
      type: formData.type === "register" ? "login" : "register",
    });
  };

  return (
    <div className={`auth-page-container ${isRegister ? "register-mode" : ""}`}>

      {/* 1. DECORATIVE SIDEBAR (Sliding / Vintage Theme) */}
      <div className="auth-sidebar">
        {/* Background Paper Texture Overlay is handled in CSS */}

        {/* Vintage Postmark Stamp */}
        <div className="vintage-postmark">
          <div className="stamp-circle">
            <span className="stamp-text stamp-text-top">RECUERDOS</span>
            <i className="fa-solid fa-box-open stamp-icon"></i>
            <span className="stamp-text stamp-text-bottom">QUE IMPORTAN</span>
          </div>
          <div className="stamp-lines">
            <span className="wave-line"></span>
            <span className="wave-line"></span>
            <span className="wave-line"></span>
          </div>
        </div>

        {/* Dynamic Sidebar Content Container */}
        <div className="sidebar-content-wrapper">
          <div className={`sidebar-slide-content ${isRegister ? "slide-out" : "slide-in"}`}>
            {!isRegister ? (
              <>
                <h1 className="sidebar-title">Bienvenido al Desván</h1>
                <div className="vintage-divider"></div>
                <p className="sidebar-subtitle">Personas reales, tesoros auténticos.</p>
                <div className="mascot-container">
                  {/* 
                      MASCOT IMAGE: PLACE HERE /src/front/assets/img/caja06.png 
                      (Mascot waving cheerfully, standing on stone/brick shadow floor)
                  */}
                  <div className="mascot-image mascot-waving"></div>
                </div>
              </>
            ) : (
              <>
                <h1 className="sidebar-title">Hoy es un buen día para empezar</h1>
                <div className="vintage-divider"></div>
                <p className="sidebar-subtitle">Reconecta con lo auténtico.</p>
                <div className="mascot-container">
                  {/* 
                      MASCOT IMAGE: PLACE HERE /src/front/assets/img/caja05.png 
                      (Mascot reading the "OLD BOOK OF SECRETS" with glasses, standing on shadow floor)
                  */}
                  <div className="mascot-image mascot-reading"></div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Torn Paper Boundary Effect */}
        <div className="torn-paper-edge"></div>
      </div>

      {/* 2. FORM PANEL AREA (Holds the Floating Premium Form Card) */}
      <div className="auth-form-area">
        <div className="auth-card">

          {/* Brand Icon Header */}
          <div className="brand-header">
            <div className="brand-box-icon">
              <i className="fa-solid fa-cube"></i>
            </div>
            <h2 className="auth-card-title">
              {isRegister ? "REGÍSTRATE" : "INICIAR SESIÓN"}
            </h2>
            <p className="auth-card-subtitle">
              Presente sus credenciales para acceder a la sala de artefactos.
            </p>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className={`auth-alert ${error.includes("¡Registro completado!") ? "alert-success" : "alert-danger"}`}>
              <i className={error.includes("¡Registro completado!") ? "fa-solid fa-circle-check" : "fa-solid fa-circle-exclamation"}></i>
              <span>{error}</span>
            </div>
          )}

          {/* Authentication Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegister && (
              <div className="form-group">
                <label className="form-label" htmlFor="username">USERNAME</label>
                <div className="input-wrapper">
                  <i className="fa-regular fa-user input-icon"></i>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    
                    placeholder="Tu nombre de usuario"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="email">EMAIL</label>
              <div className="input-wrapper">
                <i className="fa-regular fa-envelope input-icon"></i>
                <input
                  type="email"
                  id="email"
                  name="email"
                  
                  placeholder="correo@ejemplo.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="label-row">
                <label className="form-label" htmlFor="password">CONTRASEÑA</label>
                {!isRegister && (
                  <Link to="/forgot-password" className="forgot-password-link">¿Olvidaste tu contraseña?</Link>
                )}
              </div>
              <div className="input-wrapper">
                <i className="fa-solid fa-lock input-icon"></i>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
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

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span> Procesando...
                </>
              ) : (
                <>
                  {isRegister ? "UNIRSE AL DESVÁN" : "ENTRAR AL DESVÁN"}{" "}
                  <i className="fa-solid fa-arrow-right"></i>
                </>
              )}
            </button>
          </form>

          {/* Form Switcher & Monospace Text Divider */}
          <div className="auth-switcher-divider">
            {!isRegister ? (
              <>
                <p className="monospace-text">o continúa con</p>
                <button type="button" className="auth-toggle-btn" onClick={handleToggleMode}>
                  <i className="fa-regular fa-user font-icon-left"></i>
                  ¿Eres nuevo? <strong className="highlight-link"><i className="fa-regular fa-pen-to-square font-icon-right"></i> Registrarse</strong>
                </button>
              </>
            ) : (
              <button type="button" className="auth-toggle-btn mt-4" onClick={handleToggleMode}>
                <i className="fa-regular fa-user font-icon-left"></i>
                ¿Ya tienes cuenta? <strong className="highlight-link"><i className="fa-regular fa-pen-to-square font-icon-right"></i> Iniciar Sesión</strong>
              </button>
            )}
          </div>

          {/* Footer Value Propositions inside the Card */}
          <div className="auth-card-footer">
            <div className="value-prop">
              <div className="value-prop-header">
                <i className="fa-solid fa-shield-halved val-icon"></i>
                <h4>Seguro</h4>
              </div>
              <p>Tus datos siempre protegidos</p>
            </div>

            <div className="value-prop">
              <div className="value-prop-header">
                <i className="fa-solid fa-cube val-icon"></i>
                <h4>Privado</h4>
              </div>
              <p>Solo tú tienes acceso a tus recuerdos</p>
            </div>

            <div className="value-prop">
              <div className="value-prop-header">
                <i className="fa-regular fa-heart val-icon"></i>
                <h4>Personal</h4>
              </div>
              <p>Hecho para guardar lo que más importa</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
