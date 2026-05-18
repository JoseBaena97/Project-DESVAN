import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

// Mascots from local assets
import boxMascot from "../assets/img/caja04.png"; // Used for Login page mascot (existing box character)
import bookMascot from "../assets/img/caja05.png"; // Used for Register page mascot (existing box character, place your book mascot here if desired!)

export const Login = () => {
  const navigate = useNavigate();

  // State to manage toggle between login (false) and register (true)
  const [isRegister, setIsRegister] = useState(false);

  // Form input states
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI interaction states
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" }); // type: 'error' | 'success'

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setMessage({ text: "", type: "" });
    setFirstname("");
    setLastname("");
    setUsername("");
    setEmail("");
    setPassword("");
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (isRegister && (!firstname || !lastname || !username))) {
      setMessage({ text: "Por favor, rellena todos los campos requeridos.", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          password: password,
          firstname: isRegister ? firstname : undefined,
          lastname: isRegister ? lastname : undefined,
          username: isRegister ? username : undefined,
          type: isRegister ? "register" : "login",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || data.message || "Ha ocurrido un error en la autenticación.");
      }

      if (isRegister) {
        setMessage({ text: "¡Cuenta creada con éxito! Ya puedes iniciar sesión.", type: "success" });
        // Smoothly slide back to login after 2 seconds
        setTimeout(() => {
          setIsRegister(false);
          setMessage({ text: "", type: "" });
          setPassword("");
        }, 2000);
      } else {
        // Save JWT session
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.data));

        setMessage({ text: "¡Acceso concedido! Redirigiendo...", type: "success" });
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate("/explorar");
        }, 1200);
      }
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // SVGs for high fidelity and clean rendering (inline to prevent resource delay)
  
  const CubeLogo = () => (
    <svg className="auth-logo-svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
      <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
  );

  const LeafOrnament = () => (
    <svg className="leaf-ornament" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 50 C 30 40, 60 40, 90 20" stroke="#8C7A72" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M30 46 C 25 35, 15 35, 20 45 C 22 47, 26 48, 30 46 Z" fill="#8C7A72" opacity="0.6"/>
      <path d="M45 42 C 40 30, 30 30, 35 40 C 37 42, 41 43, 45 42 Z" fill="#8C7A72" opacity="0.6"/>
      <path d="M60 37 C 55 25, 45 25, 50 35 C 52 37, 56 38, 60 37 Z" fill="#8C7A72" opacity="0.6"/>
      <path d="M75 30 C 70 18, 60 18, 65 28 C 67 30, 71 31, 75 30 Z" fill="#8C7A72" opacity="0.6"/>
      <path d="M32 46 C 36 38, 46 38, 42 46 C 40 48, 36 48, 32 46 Z" fill="#8C7A72" opacity="0.6"/>
      <path d="M48 42 C 52 34, 62 34, 58 42 C 56 44, 52 44, 48 42 Z" fill="#8C7A72" opacity="0.6"/>
      <path d="M64 36 C 68 28, 78 28, 74 36 C 72 38, 68 38, 64 36 Z" fill="#8C7A72" opacity="0.6"/>
    </svg>
  );

  const PostmarkStamp = () => (
    <svg className="postmark-stamp" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Circle Path for curved text */}
      <path id="circle-path" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="none" stroke="none"/>
      
      {/* Outer circular borders */}
      <circle cx="50" cy="50" r="46" fill="none" stroke="#8C7A72" strokeWidth="1" strokeOpacity="0.5"/>
      <circle cx="50" cy="50" r="40" fill="none" stroke="#8C7A72" strokeWidth="1" strokeDasharray="3,2" strokeOpacity="0.6"/>
      <circle cx="50" cy="50" r="28" fill="none" stroke="#8C7A72" strokeWidth="0.8" strokeOpacity="0.4"/>
      
      {/* Curved text */}
      <text fontFamily="'Space Grotesk', sans-serif" fontSize="6.8" fontWeight="600" fill="#8C7A72" fillOpacity="0.75" letterSpacing="1">
        <textPath href="#circle-path" startOffset="0%">
          RECUERDOS QUE IMPORTAN ✦ RECUERDOS QUE IMPORTAN ✦
        </textPath>
      </text>

      {/* Tiny box logo in stamp center */}
      <path d="M 45 47 L 50 44 L 55 47 L 55 53 L 50 56 L 45 53 Z M 45 47 L 50 50.5 L 55 47 M 50 50.5 L 50 56" fill="none" stroke="#8C7A72" strokeWidth="0.8" strokeOpacity="0.6"/>
      
      {/* Vintage wavy postal lines */}
      <path d="M 12 40 Q 20 38 28 40 T 44 40 T 60 40 T 76 40 T 88 40" fill="none" stroke="#8C7A72" strokeWidth="0.5" strokeOpacity="0.25"/>
      <path d="M 10 45 Q 18 43 26 45 T 42 45 T 58 45 T 74 45 T 90 45" fill="none" stroke="#8C7A72" strokeWidth="0.5" strokeOpacity="0.25"/>
      <path d="M 12 50 Q 20 48 28 50 T 44 50 T 60 50 T 76 50 T 88 50" fill="none" stroke="#8C7A72" strokeWidth="0.5" strokeOpacity="0.25"/>
    </svg>
  );

  const RippedPaperEdge = ({ isLeft }) => (
    <svg 
      className={`ripped-paper-edge ${isLeft ? "edge-left" : "edge-right"}`}
      viewBox="0 0 24 1000" 
      preserveAspectRatio="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: "drop-shadow(2px 0 3px rgba(61, 39, 29, 0.08))" }}
    >
      {/* 
        This is a vertical torn/ripped paper path filled with the vintage paper color #E6D5BE.
        Stretching dynamically, it creates a gorgeous jagged edge on desktop.
      */}
      <path 
        d="M 0,0 
           Q 6,15 2,30 T 4,60 T 1,90 T 5,120 T 2,150 T 6,180 T 1,210 T 5,240 T 3,270 T 7,300 T 2,330 T 6,360 T 1,390 T 5,420 T 3,450 T 8,480 T 2,510 T 6,540 T 1,570 T 5,600 T 2,630 T 7,660 T 3,690 T 6,720 T 1,750 T 5,780 T 2,810 T 7,840 T 3,870 T 6,900 T 1,930 T 5,960 T 2,990 Q 6,995 4,1000 
           L 0,1000 Z" 
        fill="#E6D5BE"
        transform={isLeft ? "scale(-1, 1) translate(-24, 0)" : ""}
      />
    </svg>
  );

  return (
    <div className="auth-page-wrapper">
      <div className={`auth-split-container ${isRegister ? "mode-register" : "mode-login"}`}>
        
        {/* ========================================================
            SLIDING DECORATIVE SIDEBAR (MASCOTS & BRAND MESSAGE)
            ======================================================== */}
        <div className="auth-sidebar">
          
          {/* Background Ripped Edges on both sides, toggled dynamically */}
          <RippedPaperEdge isLeft={true} />
          <RippedPaperEdge isLeft={false} />

          {/* 1. LOGIN MODE SIDEBAR CONTENT */}
          <div className="sidebar-content-wrapper sidebar-content-login">
            <LeafOrnament />
            <div className="leaf-top-right"><LeafOrnament /></div>
            <div className="postmark-stamp stamp-top-left"><PostmarkStamp /></div>
            
            <div className="sidebar-text-container">
              <h2 className="sidebar-title">Bienvenido al Desván</h2>
              <div className="sidebar-accent-line"></div>
              <p className="sidebar-subtitle">Personas reales, tesoros auténticos.</p>
            </div>

            <div className="mascot-container">
              {/* NOTE: You can place your custom Login Mascot image at src/front/assets/img/caja04.png */}
              <img src={boxMascot} alt="Caja Mascota de Bienvenida" className="mascot-image" />
            </div>
          </div>

          {/* 2. REGISTER MODE SIDEBAR CONTENT */}
          <div className="sidebar-content-wrapper sidebar-content-register">
            <div className="leaf-top-left"><LeafOrnament /></div>
            <LeafOrnament />
            <div className="postmark-stamp stamp-top-right"><PostmarkStamp /></div>

            <div className="sidebar-text-container">
              <h2 className="sidebar-title">Hoy es un buen día para empezar</h2>
              <div className="sidebar-accent-line"></div>
              <p className="sidebar-subtitle">Reconecta con lo auténtico.</p>
            </div>

            <div className="mascot-container">
              {/* NOTE: You can place your custom Register Mascot image at src/front/assets/img/book_mascot.png */}
              <img src={bookMascot} alt="Libro Mascota de Registro" className="mascot-image" />
            </div>
          </div>

        </div>

        {/* ========================================================
            FORM PANEL: LOGIN FORM WRAPPER (RIGHT SIDE)
            ======================================================== */}
        <div className="auth-form-container login-form-wrapper">
          <div className="auth-card">
            <CubeLogo />
            <h1 className="auth-title">Iniciar Sesión</h1>
            <p className="auth-subtitle">Presente sus credenciales para acceder a la sala de artefactos.</p>

            {message.text && message.type === "error" && !isRegister && (
              <div className="auth-message error">
                <i className="fa-solid fa-triangle-exclamation"></i>
                <span>{message.text}</span>
              </div>
            )}
            {message.text && message.type === "success" && !isRegister && (
              <div className="auth-message success">
                <i className="fa-solid fa-circle-check"></i>
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} style={{ width: "100%" }}>
              {/* Email Input */}
              <div className="form-group">
                <div className="form-label-line">
                  <label className="form-label">Email</label>
                </div>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <i className="fa-regular fa-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="form-group">
                <div className="form-label-line">
                  <label className="form-label">Contraseña</label>
                  <Link to="/forgot-password" className="forgot-password-link">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <i className="fa-solid fa-lock"></i>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    placeholder="........"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    <i className={showPassword ? "fa-regular fa-eye-slash" : "fa-regular fa-eye"}></i>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn-auth-submit" disabled={loading}>
                {loading ? "PROCESANDO..." : "ENTRAR AL DESVÁN"}
                {!loading && <span className="btn-arrow">→</span>}
              </button>
            </form>

            <span className="divider-text">o continúa con</span>

            {/* Toggle to Registration Link */}
            <p className="auth-nav-text">
              <i className="fa-regular fa-user" style={{ color: "#A08D84" }}></i>
              ¿Eres nuevo? 
              <span className="auth-nav-link" onClick={toggleMode}>
                Registrarse <i className="fa-regular fa-pen-to-square"></i>
              </span>
            </p>

            {/* Footer Badges */}
            <div className="auth-card-footer">
              <div className="footer-feature-item">
                <span className="feature-icon"><i className="fa-regular fa-shield-halved"></i></span>
                <span className="feature-title">Seguro</span>
                <p className="feature-desc">Tus datos siempre protegidos</p>
              </div>
              <div className="footer-feature-item">
                <span className="feature-icon"><i className="fa-solid fa-box"></i></span>
                <span className="feature-title">Privado</span>
                <p className="feature-desc">Solo tú tienes acceso</p>
              </div>
              <div className="footer-feature-item">
                <span className="feature-icon"><i className="fa-regular fa-heart"></i></span>
                <span className="feature-title">Personal</span>
                <p className="feature-desc">Guardamos tus recuerdos</p>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================
            FORM PANEL: REGISTER FORM WRAPPER (LEFT SIDE)
            ======================================================== */}
        <div className="auth-form-container register-form-wrapper">
          <div className="auth-card">
            <CubeLogo />
            <h1 className="auth-title">Regístrate</h1>
            <p className="auth-subtitle">Presente sus credenciales para acceder a la sala de artefactos.</p>

            {message.text && message.type === "error" && isRegister && (
              <div className="auth-message error">
                <i className="fa-solid fa-triangle-exclamation"></i>
                <span>{message.text}</span>
              </div>
            )}
            {message.text && message.type === "success" && isRegister && (
              <div className="auth-message success">
                <i className="fa-solid fa-circle-check"></i>
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} style={{ width: "100%" }}>
              {/* First Name & Last Name Input Row */}
              <div className="form-row">
                <div className="form-group">
                  <div className="form-label-line">
                    <label className="form-label">Nombre</label>
                  </div>
                  <div className="input-wrapper">
                    <span className="input-icon">
                      <i className="fa-regular fa-user"></i>
                    </span>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Tu nombre"
                      value={firstname}
                      onChange={(e) => setFirstname(e.target.value)}
                      required={isRegister}
                      autoComplete="given-name"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="form-label-line">
                    <label className="form-label">Apellidos</label>
                  </div>
                  <div className="input-wrapper">
                    <span className="input-icon">
                      <i className="fa-regular fa-user"></i>
                    </span>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Tus apellidos"
                      value={lastname}
                      onChange={(e) => setLastname(e.target.value)}
                      required={isRegister}
                      autoComplete="family-name"
                    />
                  </div>
                </div>
              </div>

              {/* Username Input */}
              <div className="form-group">
                <div className="form-label-line">
                  <label className="form-label">Nombre de usuario</label>
                </div>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <i className="fa-solid fa-at"></i>
                  </span>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="usuario123"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required={isRegister}
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="form-group">
                <div className="form-label-line">
                  <label className="form-label">Email</label>
                </div>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <i className="fa-regular fa-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="form-group">
                <div className="form-label-line">
                  <label className="form-label">Contraseña</label>
                </div>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <i className="fa-solid fa-lock"></i>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    placeholder="........"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    <i className={showPassword ? "fa-regular fa-eye-slash" : "fa-regular fa-eye"}></i>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn-auth-submit" disabled={loading}>
                {loading ? "CREANDO CUENTA..." : "UNIRSE AL DESVÁN"}
                {!loading && <span className="btn-arrow">→</span>}
              </button>
            </form>

            {/* Toggle to Login Link */}
            <p className="auth-nav-text">
              <i className="fa-regular fa-user" style={{ color: "#A08D84" }}></i>
              ¿Ya tienes cuenta? 
              <span className="auth-nav-link" onClick={toggleMode}>
                Iniciar Sesión <i className="fa-regular fa-pen-to-square"></i>
              </span>
            </p>

            {/* Footer Badges */}
            <div className="auth-card-footer">
              <div className="footer-feature-item">
                <span className="feature-icon"><i className="fa-regular fa-shield-halved"></i></span>
                <span className="feature-title">Seguro</span>
                <p className="feature-desc">Tus datos siempre protegidos</p>
              </div>
              <div className="footer-feature-item">
                <span className="feature-icon"><i className="fa-solid fa-box"></i></span>
                <span className="feature-title">Privado</span>
                <p className="feature-desc">Solo tú tienes acceso</p>
              </div>
              <div className="footer-feature-item">
                <span className="feature-icon"><i className="fa-regular fa-heart"></i></span>
                <span className="feature-title">Personal</span>
                <p className="feature-desc">Guardamos tus recuerdos</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
