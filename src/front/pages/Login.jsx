import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import authService from "../services/auth.service";
import "./Login.css";

export const Login = () => {
  const navigate = useNavigate();
  const { dispatch } = useGlobalReducer();

  // State to toggle between login and registration panels
  const [isRegister, setIsRegister] = useState(false);

  // Form inputs state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    type:"login",
  });

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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

    setError(null);
    setLoading(true);

    authService.auth(formData).then((data)=>{
      //Para register y autologin
      if (formData.type === 'register'){
                return authService.auth({...formData, type:'login'})
            }
            return data;
        })
        .then(data=>{
            dispatch({
                type: 'auth',
                payload: {
                    user: data.data
                }
            });

            navigate('/explorar');
        })
        .catch((err)=> {
          console.log(err);

          setError( err.message || "Error inesperado.")

        })
        .finally(()=>{
          setLoading(false);
        });

      };
    

    // try {
    //   // Build payload for backend
    //   const payload = {
    //     email: formData.email,
    //     password: formData.password,
    //     type: isRegister ? "register" : "login",
    //   };

    //   if (isRegister) {
    //     payload.username = formData.username; // Required for backend registration
    //   }

    //   // Call central authentication service
    //   const data = await authService.auth(payload);

    //   if (isRegister) {
    //     // Registration successful
    //     // For convenience and smooth user flow, we can automatically switch to login form
    //     // or auto-login if the backend returns access_token.
    //     if (data.access_token) {
    //       // If the backend returns access_token on register, log in immediately
    //       dispatch({
    //         type: "register", // Action name from storeReducer that handles logged-in state
    //         payload: { user: data.data || { email: formData.email, username: formData.username } },
    //       });
    //       navigate("/explorar");
    //     } else {
    //       // Switch to login form with clean data and success feedback
    //       setIsRegister(false);
    //       setError("¡Registro completado! Por favor, inicia sesión con tus credenciales.");
    //       setFormData({
    //         username: "",
    //         email: formData.email,
    //         password: "",
    //       });
    //     }
    //   } else {
    //     // Login successful
    //     dispatch({
    //       type: "register", // In storeReducer, 'register' is used to set authenticated state
    //       payload: { user: data.data },
    //     });
    //     navigate("/explorar");
    //   }
    // } catch (err) {
    //   console.error(err);
    //   setError(err.message || "Ocurrió un error inesperado al procesar tu solicitud.");
    // } finally {
    //   setLoading(false);
    // }
 // };

  // Toggle state between Login and Register
  const handleToggleMode = () => {
    setIsRegister(!isRegister);
    setError(null);
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
                    required
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
                  required
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
                  <span className="forgot-password-link">¿Olvidaste tu contraseña?</span>
                )}
              </div>
              <div className="input-wrapper">
                <i className="fa-solid fa-lock input-icon"></i>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  required
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
