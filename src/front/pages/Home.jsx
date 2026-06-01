import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import mascotSad from "../assets/img/caja05.png";
import mascotPointing from "../assets/img/caja06.png";

export const Home = () => {
	return (
		<div>
			{/* Hero Section */}
			<div className="hero-wrapper">
				<div className="container hero-section">
					<div className="hero-content">
						<div className="hero-tags">
							EXPLORA <span>•</span> CONECTA <span>•</span> REVIVE
						</div>
						<h1 className="hero-title">
							Entre cajas viejas<br />siempre aparece<br /><span className="highlight">algo increíble.</span>
						</h1>
						<p className="hero-subtitle">
							Desván es el lugar que reúne organizadores y exploradores en eventos donde objetos únicos encuentran una nueva historia.
						</p>
						<Link to="/explorar" className="no-underline-link">
							<button className="btn-explore">
								EXPLORA EVENTOS <i className="fa-solid fa-arrow-right"></i>
							</button>
						</Link>
					</div>
					<div className="hero-image-container">
						<div className="hero-box">
							<span className="tag-est">EST. 2026</span>
							<img src={mascotSad} alt="Sad Box Mascot" />
							<span className="tag-sell">Vende aquí</span>
						</div>
					</div>
				</div>
			</div>

			{/* Features Section */}
			<div className="features-section">
				<div className="container">
					<h2 className="features-title">El Método Desván</h2>
					<div className="features-grid">
						<div className="feature-card">
							<div className="feature-icon-wrapper">
								<i className="fa-solid fa-box-open"></i>
							</div>
							<h3>Organiza</h3>
							<p>Crea tu evento, elige fecha, lugar y añade tus objetos.</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon-wrapper">
								<i className="fa-regular fa-heart"></i>
							</div>
							<h3>Publica</h3>
							<p>Comparte tu evento y llega a personas cerca de ti.</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon-wrapper">
								<i className="fa-solid fa-magnifying-glass"></i>
							</div>
							<h3>Descubre</h3>
							<p>Explora eventos únicos y encuentra lo que buscas rápido.</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon-wrapper">
								<i className="fa-solid fa-shield-halved"></i>
							</div>
							<h3>Conserva</h3>
							<p>Da una nueva vida a objetos que merecen seguir teniendo historia.</p>
						</div>
					</div>
				</div>
			</div>

			{/* Banner Section */}
			<div className="banner-section">
				<div className="container">
					<div className="banner-card">
						<div className="banner-content">
							<h2>Nunca sabes qué vas a encontrar</h2>
							<p>
								Únete a Desván, explora eventos locales llenos de objetos únicos, historias y descubrimientos inesperados, o bien, créalos tú.
							</p>
							<div className="banner-actions">
								<Link to="/login" className="no-underline-link">
									<button className="btn-free-account">
										CREAR CUENTA GRATUITA <i className="fa-solid fa-arrow-right"></i>
									</button>
								</Link>
								<Link to="/login" className="login-link">
									¿Ya tienes cuenta? <span>Iniciar sesión</span>
								</Link>
							</div>
						</div>
						<div className="banner-image">
							<img src={mascotPointing} alt="Pointing Box Mascot" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};