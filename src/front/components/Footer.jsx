import desvanLogo from "../assets/img/desvanlogonav.png";
import { Link } from "react-router-dom";

export const Footer = () => (
	<footer className="custom-footer">
		<div className="container">
			<div className="footer-grid">
				<div className="footer-brand">
					<img src={desvanLogo} alt="Desván Logo" />
					<p>
						Desván es el mapa de los tesoros escondidos de tu ciudad. La plataforma definitiva para organizar tu propio rastro en casa, descubrir antigüedades y conectar con una comunidad.
					</p>
				</div>
				<div className="footer-col">
					<h4>EXPLORAR</h4>
					<ul>
						<li><Link to="/">Colecciones</Link></li>
						<li><Link to="/">Categorías</Link></li>
						<li><Link to="/">Novedades</Link></li>
					</ul>
				</div>
				<div className="footer-col">
					<h4>AYUDA</h4>
					<ul>
						<li><Link to="/">Centro de ayuda</Link></li>
						<li><Link to="/">Guías</Link></li>
						<li><Link to="/">Contacto</Link></li>
					</ul>
				</div>
				<div className="footer-col">
					<h4>LEGAL</h4>
					<ul>
						<li><Link to="/">Términos de uso</Link></li>
						<li><Link to="/">Privacidad</Link></li>
						<li><Link to="/">Cookies</Link></li>
					</ul>
				</div>
				<div className="footer-col">
					<h4>REDES</h4>
					<ul>
						<li><a href="#">Instagram</a></li>
						<li><a href="#">Facebook</a></li>
						<li><a href="#">LinkedIn</a></li>
					</ul>
				</div>
			</div>
			<div className="footer-bottom">
				&copy; 2026 DESVÁN.
			</div>
		</div>
	</footer>
);
